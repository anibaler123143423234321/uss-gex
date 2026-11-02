import * as XLSX from 'xlsx';
import type { EstudianteGEX } from '../types/estudiante';

export const GOOGLE_SHEET_ID = '17T_sFAnsSzzO4nDkqfCSlyrmU2kzJSZTyw2rTgUmbFE';

// URL oficial publicada por el usuario en Google Drive
export const GOOGLE_SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRiENG2D1bKgoB5idcDxxa1xQwKNLwDnKnrV93Dmpb3c7lg_yRSKQlZtDmDj9D3B8edY2UoTIyrbPWs/pub?output=csv';

/**
 * Mapea una fila cruda de la hoja de cálculo al modelo EstudianteGEX
 */
export function mapRawRowToEstudiante(row: Record<string, unknown>, idx: number): EstudianteGEX {
  const get = (key: string): string => {
    // 1. Coincidencia exacta insensible a mayúsculas
    const exact = Object.keys(row).find((k) => k.trim().toLowerCase() === key.toLowerCase());
    if (exact && row[exact] !== undefined && row[exact] !== null) {
      return String(row[exact]).trim();
    }
    // 2. Coincidencia normalizada sin espacios ni guiones bajos
    const cleanKey = key.toLowerCase().replace(/[\s_-]/g, '');
    const found = Object.keys(row).find((k) => k.toLowerCase().replace(/[\s_-]/g, '') === cleanKey);
    if (found && row[found] !== undefined && row[found] !== null) {
      return String(row[found]).trim();
    }
    return '';
  };

  const getNum = (key: string): number => {
    const val = get(key);
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  };

  return {
    item: getNum('item') || idx + 1,
    condicionEstudio: get('cndestudio') || get('condicion'),
    campus: get('campus') || 'Chiclayo',
    escuela: get('escuela'),
    seuss: get('seuss'),
    codUniv: get('coduniv') || get('codigo'),
    nombres: get('nombres') || get('estudiante'),
    nCicCodigo: getNum('nciccodigo') || getNum('ciclo') || 0,
    ingreso: get('ingreso'),
    egreso: get('egreso'),
    modalidad: get('modalidad'),
    computacionI: getNum('computacion_i') || getNum('computacion1') || getNum('computacion i'),
    computacionII: getNum('computacion_ii') || getNum('computacion2') || getNum('computacion ii'),
    computacionIII: getNum('computacion_iii') || getNum('computacion3') || getNum('computacion iii'),
    generico: getNum('generico'),
    especifico: getNum('especifico'),
    taller: getNum('taller'),
    correoInstitucional:
      get('correo_institucional') ||
      get('correoinstitucional') ||
      get('correo'),
    correoPersonal: get('correo_personal_1') || get('correo_personal'),
    telefonoTipo: get('tlf_1_tip'),
    telefono: get('tlf_1_num') || get('telefono'),
    estado: get('estado'),
  };
}

/**
 * Obtiene la data en vivo directamente desde el Google Sheet publicado en Drive
 * y genera el archivo Excel binario (.xlsx) en Base64 para respaldo
 */
export async function fetchExcelFromDrive(): Promise<{
  estudiantes: EstudianteGEX[];
  base64Xlsx?: string;
  error?: string;
}> {
  const urls = [
    GOOGLE_SHEET_CSV_URL,
    '/api/gex-csv',
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;

      const text = await res.text();
      if (!text || text.includes('<!DOCTYPE html')) {
        continue;
      }

      // 1. Parsear con SheetJS
      const workbook = XLSX.read(text, { type: 'string', raw: false });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(firstSheet, {
        defval: '',
        raw: false,
      });

      // 2. Generar el archivo binario nativo .xlsx en Base64
      const base64Xlsx = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

      // 3. Mapear estudiantes
      const estudiantes: EstudianteGEX[] = rawRows
        .map((row, idx) => mapRawRowToEstudiante(row, idx))
        .filter((e) => e.codUniv || e.nombres);

      if (estudiantes.length > 0) {
        return { estudiantes, base64Xlsx };
      }
    } catch (e) {
      console.warn('[DriveService] Intento fallido con URL:', url, e);
    }
  }

  return {
    estudiantes: [],
    error: 'No se pudo conectar con el Google Sheet de Drive.',
  };
}
