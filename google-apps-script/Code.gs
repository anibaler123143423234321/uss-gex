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
    const ss = getOrCreateSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    // Cabeceras oficiales institucionales si la hoja está recién creada o vacía
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Marca temporal',
        'Código Universitario',
        'Apellidos y Nombres',
        'Escuela Profesional',
        'Correo Institucional',
        'Celular',
        'Correo Personal',
        'Plan Seleccionado',
        'ID Plan',
        'Tipo de Trámite',
        'Costo / Inversión',
        'Condición de Estudio',
        'Campus',
        'Modalidad',
        'Ciclo',
        'Archivo Adjunto',
        'Ruta Archivo',
        'Autoriza Datos',
        'Declaración Requisitos',
        'Estado Solicitud',
        'Carpeta Drive Destino',
      ];
      sheet.appendRow(headers);

      // Estilo institucional USS: Azul #073299 con texto blanco y negrita
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#073299');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    }

    // Insertar la nueva fila con los atributos del estudiante
    sheet.appendRow([
      data['Marca temporal'] || new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' }),
      data['Código Universitario'] || '',
      data['Apellidos y Nombres'] || '',
      data['Escuela Profesional'] || '',
      data['Correo Institucional'] || '',
      data['Celular'] || '',
      data['Correo Personal'] || '',
      data['Plan Seleccionado'] || '',
      data['ID Plan'] || '',
      data['Tipo de Trámite'] || '',
      data['Costo / Inversión'] || '',
      data['Condición de Estudio'] || '',
      data['Campus'] || '',
      data['Modalidad'] || '',
      data['Ciclo'] || '',
      data['Archivo Adjunto'] || '',
      data['Ruta Archivo'] || '',
      data['Autoriza Datos'] || '',
      data['Declaración Requisitos'] || '',
      data['Estado Solicitud'] || 'Registrado',
      data['Carpeta Drive Destino'] || FOLDER_ID,
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'success',
        message: 'Solicitud agregada correctamente a BDSolicitudes-Gex en Drive',
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
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
      hoja: SHEET_NAME,
      timestamp: new Date().toISOString(),
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Abre o crea la hoja de cálculo dentro de la carpeta BDSolicitudes-Gex
 */
function getOrCreateSpreadsheet() {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files = folder.getFilesByName(SHEET_NAME);

  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }

  // Si no existe, crear la hoja y colocarla dentro de la carpeta de Drive
  const ss = SpreadsheetApp.create(SHEET_NAME);
  const file = DriveApp.getFileById(ss.getId());
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);
  return ss;
}
