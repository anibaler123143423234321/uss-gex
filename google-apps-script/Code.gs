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

    sheet.appendRow([
      fechaHora,
      codUniv,
      estudiante,
      escuela,
      celular,
      correo,
      tramite,
      adjunto,
      estado,
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'success',
        message: 'Solicitud agregada correctamente a BDSolicitudes-Gex en Drive',
        hoja: ss.getUrl(),
        fila: sheet.getLastRow(),
        columnas: HEADERS.length,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
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

/** La carpeta BDSolicitudes-Gex, o null si esta cuenta no puede abrirla */
function carpetaDestino() {
  try {
    return DriveApp.getFolderById(FOLDER_ID);
  } catch (e) {
    return null;
  }
}
