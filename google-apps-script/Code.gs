/**
 * ============================================================================
 * UNIVERSIDAD SEÑOR DE SIPÁN - CENTRO DE INFORMÁTICA (CINF)
 * GOOGLE APPS SCRIPT: SINCRONIZACIÓN DE SOLICITUDES GEX EN GOOGLE DRIVE
 * ============================================================================
 * 
 * Carpeta Destino: Compartido conmigo > CINF GEX > BDSolicitudes-Gex
 * ID de Carpeta: 13ga9IRDc3CHvSZ1IXnlHtv8w_k9GBryp
 * Hoja de Cálculo: USS_CINF_Solicitudes_GEX
 */

const FOLDER_ID = '13ga9IRDc3CHvSZ1IXnlHtv8w_k9GBryp';
const SHEET_NAME = 'USS_CINF_Solicitudes_GEX';

/**
 * Encabezados oficiales institucionales USS CINF (9 columnas humanas y operativas)
 */
const HEADERS = [
  'Fecha y Hora',
  'Código Universitario',
  'Estudiante',
  'Escuela',
  'Celular / WhatsApp',
  'Correo',
  'Trámite / Plan',
  'Documento Adjunto',
  'Estado',
];

/**
 * Endpoint POST que recibe la solicitud desde el Portal GEX USS (uss-gex)
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: 'error', message: 'No se recibieron datos en el cuerpo' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const data = JSON.parse(e.postData.contents);
    // Dos inscripciones a la vez no deben pisarse la fila ni crear dos hojas
    const candado = LockService.getScriptLock();
    candado.waitLock(20000);
    const ss = getOrCreateSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    // Cabeceras oficiales institucionales si la hoja está recién creada o vacía
    if (sheet.getLastRow() === 0) {
      inicializarCabeceras(sheet);
    } else if (sheet.getRange(1, 1).getValue() === 'Marca temporal') {
      // Migración automática: limpia los 21 encabezados anteriores y deja las 9 columnas oficiales
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      const maxCol = sheet.getMaxColumns();
      if (maxCol > HEADERS.length) {
        sheet.getRange(1, HEADERS.length + 1, Math.max(sheet.getLastRow(), 1), maxCol - HEADERS.length).clear();
      }
      formatearCabeceras(sheet);
    }

    // Insertar la fila limpia admitiendo tanto las nuevas claves como las anteriores
    const fechaHora = data['Fecha y Hora'] || data['Marca temporal'] || new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });
    const codUniv = data['Código Universitario'] || '';
    const estudiante = data['Estudiante'] || data['Apellidos y Nombres'] || '';
    const escuela = data['Escuela'] || data['Escuela Profesional'] || '—';
    const celular = data['Celular / WhatsApp'] || data['Celular'] || '';
    const correo = data['Correo'] || data['Correo Institucional'] || '';
    const tramite = data['Trámite / Plan'] || data['Plan Seleccionado'] || '';
    const adjunto = data['Documento Adjunto'] || data['Archivo Adjunto'] || '';
    const estado = data['Estado'] || data['Estado Solicitud'] || 'Registrado';

    // 1. Guardar archivos adjuntos en la carpeta de Google Drive:
    // Junto a la hoja > Adjuntos - Solicitudes GEX > [codUniv] - [estudiante]
    const resultadoAdjuntos = procesarArchivosAdjuntosEnDrive(data, codUniv, estudiante, ss);
    const textoAdjunto = resultadoAdjuntos ? resultadoAdjuntos.texto : adjunto;

    sheet.appendRow([
      fechaHora,
      codUniv,
      estudiante,
      escuela,
      celular,
      correo,
      tramite,
      textoAdjunto,
      estado,
    ]);

    const filaInsertada = sheet.getLastRow();

    // 2. Establecer hipervínculo clickeable a Drive en la columna 8 (Documento Adjunto)
    if (resultadoAdjuntos && resultadoAdjuntos.formula) {
      try {
        sheet.getRange(filaInsertada, 8).setFormula(resultadoAdjuntos.formula);
      } catch (errFormula) {
        console.warn('No se pudo aplicar setFormula:', errFormula);
      }
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'success',
        message: 'Solicitud agregada correctamente a BDSolicitudes-Gex en Drive',
        hoja: ss.getUrl(),
        fila: filaInsertada,
        columnas: HEADERS.length,
        adjuntos: resultadoAdjuntos ? { guardados: true, url: resultadoAdjuntos.url } : null,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Guarda los archivos adjuntos en una subcarpeta dedicada en Google Drive:
 * BDSolicitudes-Gex > Adjuntos - Solicitudes GEX > [codUniv] - [estudiante]
 * Devuelve la fórmula HYPERLINK para la celda de Sheets y el enlace de acceso.
 */
function procesarArchivosAdjuntosEnDrive(data, codUniv, estudiante, ss) {
  if (!data || !Array.isArray(data.archivos) || data.archivos.length === 0) {
    return null;
  }

  const carpetaBase = carpetaDestino(ss);
  if (!carpetaBase) {
    return null;
  }

  try {
    // 1. Obtener o crear carpeta contenedora: "Adjuntos - Solicitudes GEX"
    let carpetaAdjuntos;
    const itAdj = carpetaBase.getFoldersByName('Adjuntos - Solicitudes GEX');
    if (itAdj.hasNext()) {
      carpetaAdjuntos = itAdj.next();
    } else {
      carpetaAdjuntos = carpetaBase.createFolder('Adjuntos - Solicitudes GEX');
    }

    // 2. Obtener o crear subcarpeta del estudiante: "[codUniv] - [estudiante]"
    const nombreCarpetaEstudiante = (`${codUniv} - ${estudiante}`).trim() || codUniv || 'Estudiante';
    let carpetaEstudiante;
    const itEst = carpetaAdjuntos.getFoldersByName(nombreCarpetaEstudiante);
    if (itEst.hasNext()) {
      carpetaEstudiante = itEst.next();
    } else {
      carpetaEstudiante = carpetaAdjuntos.createFolder(nombreCarpetaEstudiante);
    }

    const urlCarpetaEstudiante = carpetaEstudiante.getUrl();
    const guardados = [];

    // 3. Decodificar y crear cada archivo en la subcarpeta
    for (let i = 0; i < data.archivos.length; i++) {
      const arch = data.archivos[i];
      if (!arch || !arch.base64) continue;

      try {
        const bytes = Utilities.base64Decode(arch.base64);
        const mime = arch.tipo || 'application/octet-stream';
        const prefijo = arch.etiqueta ? `${arch.etiqueta} - ` : '';
        const nombreArchivo = `${prefijo}${arch.nombre || 'documento'}`;
        const blob = Utilities.newBlob(bytes, mime, nombreArchivo);
        const archivoCreado = carpetaEstudiante.createFile(blob);

        guardados.push({
          nombre: arch.etiqueta ? `${arch.etiqueta} (${arch.nombre})` : arch.nombre || 'Documento',
          url: archivoCreado.getUrl(),
        });
      } catch (errArchivo) {
        console.warn('Error al guardar archivo en Drive:', errArchivo);
      }
    }

    // 4. Si se guardaron archivos, generar fórmula HYPERLINK para la celda
    if (guardados.length === 1) {
      const g = guardados[0];
      const etiquetaSegura = g.nombre.replace(/"/g, '""');
      return {
        formula: `=HYPERLINK("${g.url}", "📄 ${etiquetaSegura}")`,
        texto: `${g.nombre} (Drive)`,
        url: g.url,
      };
    } else if (guardados.length > 1) {
      const etiquetaSegura = `📁 Ver ${guardados.length} archivos (${nombreCarpetaEstudiante})`.replace(/"/g, '""');
      return {
        formula: `=HYPERLINK("${urlCarpetaEstudiante}", "${etiquetaSegura}")`,
        texto: `Ver ${guardados.length} archivos en carpeta Drive`,
        url: urlCarpetaEstudiante,
      };
    }
  } catch (errGeneral) {
    console.warn('Error en procesarArchivosAdjuntosEnDrive:', errGeneral);
  }

  return null;
}

/** Formato institucional USS: Azul #073299 con texto blanco y negrita */
function formatearCabeceras(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setBackground('#073299');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
}

function inicializarCabeceras(sheet) {
  sheet.appendRow(HEADERS);
  formatearCabeceras(sheet);
}

/**
 * Endpoint GET para verificar que el Webhook responde
 */
function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: 'online',
      proyecto: 'USS CINF GEX - Webhook Google Drive',
      carpeta: FOLDER_ID,
      // false = la cuenta que publicó el script no puede abrir la carpeta; la hoja irá a su "Mi unidad"
      carpetaAccesible: carpetaDestino() !== null,
      hoja: SHEET_NAME,
      columnas: HEADERS.length,
      timestamp: new Date().toISOString(),
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Devuelve la hoja de cálculo donde se guardan las solicitudes. Antes dependía solo de abrir la
 * carpeta por su ID: si la cuenta que publica el script no es editora de esa carpeta, Drive
 * responde "No se pudo encontrar ningún elemento con el ID señalado" y no se guardaba nada.
 * Ahora prueba, en orden:
 *   1. La hoja a la que está vinculado el script (Extensiones > Apps Script desde la hoja).
 *   2. La hoja que este script ya creó antes (su ID queda en las propiedades del script).
 *   3. La hoja USS_CINF_Solicitudes_GEX dentro de la carpeta BDSolicitudes-Gex, si hay acceso.
 *   4. Una hoja nueva: en la carpeta si hay acceso; si no, en "Mi unidad" de quien publicó.
 */
function getOrCreateSpreadsheet() {
  const activa = SpreadsheetApp.getActiveSpreadsheet();
  if (activa) return activa;

  const props = PropertiesService.getScriptProperties();
  const guardada = props.getProperty('SPREADSHEET_ID');
  if (guardada) {
    try {
      return SpreadsheetApp.openById(guardada);
    } catch (e) {
      // La borraron o se perdió el acceso: se busca o se crea otra
    }
  }

  const carpeta = carpetaDestino();
  if (carpeta) {
    const files = carpeta.getFilesByName(SHEET_NAME);
    if (files.hasNext()) {
      const existente = SpreadsheetApp.open(files.next());
      props.setProperty('SPREADSHEET_ID', existente.getId());
      return existente;
    }
  }

  const ss = SpreadsheetApp.create(SHEET_NAME);
  if (carpeta) {
    try {
      DriveApp.getFileById(ss.getId()).moveTo(carpeta);
    } catch (e) {
      // Sin permiso de edición en la carpeta: la hoja queda en "Mi unidad"
    }
  }
  props.setProperty('SPREADSHEET_ID', ss.getId());
  return ss;
}

/**
 * Obtiene la carpeta de destino para la hoja y los adjuntos:
 * 1. La carpeta oficial FOLDER_ID (si esta cuenta tiene acceso directo)
 * 2. La carpeta donde vive la hoja de cálculo activa
 * 3. Mi unidad como último recurso
 */
function carpetaDestino(ss) {
  try {
    const f = DriveApp.getFolderById(FOLDER_ID);
    if (f) return f;
  } catch (e) {}

  if (ss) {
    try {
      const archivoHoja = DriveApp.getFileById(ss.getId());
      const padres = archivoHoja.getParents();
      if (padres.hasNext()) {
        return padres.next();
      }
    } catch (e) {}
  }

  try {
    const activa = SpreadsheetApp.getActiveSpreadsheet();
    if (activa) {
      const archivoHoja = DriveApp.getFileById(activa.getId());
      const padres = archivoHoja.getParents();
      if (padres.hasNext()) {
        return padres.next();
      }
    }
  } catch (e) {}

  try {
    return DriveApp.getRootFolder();
  } catch (e) {
    return null;
  }
}
