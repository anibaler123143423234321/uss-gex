import * as XLSX from 'xlsx';
import type { EstudianteGEX } from '../types/estudiante';
import { mapRawRowToEstudiante } from './driveSheetService';

/**
 * Parsea un ArrayBuffer de un archivo Excel (.xlsx / .xls / .csv)
 * preservando tipos nativos de Excel y ceros a la izquierda (ej. códigos universitarios)
 */
export function parseExcelBuffer(buffer: ArrayBuffer): EstudianteGEX[] {
  const workbook = XLSX.read(buffer, { type: 'array', raw: false });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convertir a objetos manteniendo strings para evitar pérdida de ceros a la izquierda
  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    raw: false, // Forzar strings para preservar textos como "000470928"
  });

  return rawRows
    .map((row, idx) => mapRawRowToEstudiante(row, idx))
    .filter((e) => e.codUniv || e.nombres);
}

/**
 * Parsea un archivo File de Excel directamente desde el navegador
 */
export async function parseExcelFile(file: File): Promise<{ estudiantes: EstudianteGEX[]; base64: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const estudiantes = parseExcelBuffer(buffer);

        // Convertir el buffer a Base64 para guardarlo como archivo binario original en Supabase
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);

        resolve({ estudiantes, base64 });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo Excel'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Convierte una cadena Base64 a ArrayBuffer para procesar el Excel binario
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Descarga el archivo Excel binario original (.xlsx) guardado en Base64
 */
export function downloadOriginalExcelFromBase64(base64: string, filename = 'USS_GEX_BD_Estudiantes.xlsx') {
  const buffer = base64ToArrayBuffer(base64);
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Descarga una lista de estudiantes como archivo Excel (.xlsx)
 */
export function downloadStudentsAsExcel(estudiantes: EstudianteGEX[], filename = 'USS_GEX_BD_Estudiantes.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(estudiantes);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Estudiantes');
  XLSX.writeFile(workbook, filename);
}
