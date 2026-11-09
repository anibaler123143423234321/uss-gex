import * as XLSX from 'xlsx';
import type { EstudianteGEX } from '../types/estudiante';
import type { PlanOpcion } from '../data/planesComputacion';
import type { Adjunto } from './solicitudesService';

/**
 * Configuración oficial de la carpeta de Google Drive:
 * Compartido conmigo > CINF GEX > BDSolicitudes-Gex
 */
export const GEX_DRIVE_FOLDER_ID = '13ga9IRDc3CHvSZ1IXnlHtv8w_k9GBryp';
export const GEX_DRIVE_FOLDER_NAME = 'BDSolicitudes-Gex';
export const GEX_DRIVE_FOLDER_PATH = 'Compartido conmigo > CINF GEX > BDSolicitudes-Gex';
export const GEX_DRIVE_FOLDER_URL = `https://drive.google.com/drive/u/1/folders/${GEX_DRIVE_FOLDER_ID}`;
export const GEX_SHEET_NAME = 'USS_CINF_Solicitudes_GEX';

const STORAGE_KEY = 'gex_solicitudes_acumuladas';

export interface FilaSolicitudGEX {
  'Marca temporal': string;
  'Código Universitario': string;
  'Apellidos y Nombres': string;
  'Escuela Profesional': string;
  'Correo Institucional': string;
  'Celular': string;
  'Correo Personal': string;
  'Plan Seleccionado': string;
  'ID Plan': string;
  'Tipo de Trámite': string;
  'Costo / Inversión': string;
  'Condición de Estudio': string;
  'Campus': string;
  'Modalidad': string;
  'Ciclo': string | number;
  'Archivo Adjunto': string;
  'Ruta Archivo': string;
  'Autoriza Datos': string;
  'Declaración Requisitos': string;
  'Estado Solicitud': string;
  'Carpeta Drive Destino': string;
}

/** Formatea fecha y hora en formato estándar peruano DD/MM/AAAA HH:mm:ss */
export function formatearFechaPeru(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const d = pad(date.getDate());
  const m = pad(date.getMonth() + 1);
  const y = date.getFullYear();
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${d}/${m}/${y} ${h}:${min}:${s}`;
}

/**
 * Construye la fila tipada con todos los atributos requeridos de la solicitud
 */
export function construirFilaSolicitud({
  alumno,
  plan,
  celular,
  correoPersonal,
  esExamen,
  adjunto,
  declaracion,
}: {
  alumno: EstudianteGEX;
  plan: PlanOpcion;
  celular: string;
  correoPersonal?: string;
  esExamen: boolean;
  adjunto?: Adjunto;
  declaracion?: string;
}): FilaSolicitudGEX {
  return {
    'Marca temporal': formatearFechaPeru(),
    'Código Universitario': alumno.codUniv,
    'Apellidos y Nombres': alumno.nombres,
    'Escuela Profesional': alumno.escuela || '—',
    'Correo Institucional': alumno.correoInstitucional || '—',
    'Celular': celular.trim(),
    'Correo Personal': correoPersonal?.trim() || '—',
    'Plan Seleccionado': plan.nombre,
    'ID Plan': plan.id,
    'Tipo de Trámite': esExamen ? 'Examen' : 'Convalidación',
    'Costo / Inversión': `${plan.precio} (${plan.precioNota || 'Tarifa oficial'})`,
    'Condición de Estudio': alumno.condicionEstudio || 'Gente con Experiencia',
    'Campus': alumno.campus || 'Chiclayo',
    'Modalidad': alumno.modalidad || 'Virtual',
    'Ciclo': alumno.nCicCodigo || '—',
    'Archivo Adjunto': adjunto?.nombre || (esExamen ? 'N/A - Examen' : 'Sin archivo'),
    'Ruta Archivo': adjunto?.path || '—',
    'Autoriza Datos': 'Sí - Autorizado por el estudiante',
    'Declaración Requisitos': declaracion || 'Aceptado',
    'Estado Solicitud': 'Registrado',
    'Carpeta Drive Destino': `${GEX_DRIVE_FOLDER_NAME} [ID: ${GEX_DRIVE_FOLDER_ID}]`,
  };
}

/**
 * Crea un libro de trabajo Excel (.xlsx) con anchos de columna optimizados
 */
export function crearWorkbookSolicitudes(filas: FilaSolicitudGEX[], nombreHoja = 'Solicitudes_GEX'): XLSX.WorkBook {
  const ws = XLSX.utils.json_to_sheet(filas);

  // Anchos de columna institucionales para lectura cómoda
  ws['!cols'] = [
    { wch: 20 }, // Marca temporal
    { wch: 16 }, // Código Universitario
    { wch: 36 }, // Apellidos y Nombres
    { wch: 26 }, // Escuela Profesional
    { wch: 32 }, // Correo Institucional
    { wch: 15 }, // Celular
    { wch: 28 }, // Correo Personal
    { wch: 24 }, // Plan Seleccionado
    { wch: 12 }, // ID Plan
    { wch: 16 }, // Tipo de Trámite
    { wch: 25 }, // Costo / Inversión
    { wch: 24 }, // Condición de Estudio
    { wch: 15 }, // Campus
    { wch: 15 }, // Modalidad
    { wch: 10 }, // Ciclo
    { wch: 32 }, // Archivo Adjunto
    { wch: 35 }, // Ruta Archivo
    { wch: 18 }, // Autoriza Datos
    { wch: 32 }, // Declaración Requisitos
    { wch: 18 }, // Estado Solicitud
    { wch: 40 }, // Carpeta Drive Destino
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
  return wb;
}

/**
 * Descarga el archivo Excel binario de la solicitud (.xlsx)
 */
export function descargarExcelSolicitud(fila: FilaSolicitudGEX): void {
  const wb = crearWorkbookSolicitudes([fila], 'Solicitud_GEX');
  const filename = `BDSolicitudes_GEX_${fila['Código Universitario']}_${fila['ID Plan']}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Descarga el consolidado acumulado de todas las solicitudes registradas
 */
export function descargarExcelConsolidado(filas: FilaSolicitudGEX[]): void {
  const wb = crearWorkbookSolicitudes(filas, 'BDSolicitudes_GEX');
  const filename = 'USS_CINF_BDSolicitudes_GEX_Consolidado.xlsx';
  XLSX.writeFile(wb, filename);
}

/**
 * Guarda y acumula la solicitud en localStorage para respaldo y consolidado
 */
export function guardarSolicitudEnHistorial(fila: FilaSolicitudGEX): FilaSolicitudGEX[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const lista: FilaSolicitudGEX[] = raw ? JSON.parse(raw) : [];
    // Filtrar si ya existe este código con la misma marca de tiempo
    const filtrada = lista.filter(
      (item) =>
        !(
          item['Código Universitario'] === fila['Código Universitario'] &&
          item['ID Plan'] === fila['ID Plan'] &&
          item['Marca temporal'] === fila['Marca temporal']
        )
    );
    filtrada.unshift(fila);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrada));
    return filtrada;
  } catch (err) {
    console.warn('[DriveService] Error al guardar en localStorage:', err);
    return [fila];
  }
}

/**
 * Obtiene la lista acumulada de solicitudes
 */
export function obtenerSolicitudesGuardadas(): FilaSolicitudGEX[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Envía la fila al Webhook de Google Apps Script vinculado a la carpeta BDSolicitudes-Gex
 * Si no está configurada la URL del Webhook, reporta con elegancia sin romper el flujo.
 */
export async function sincronizarSolicitudConGoogleDrive(
  fila: FilaSolicitudGEX
): Promise<{ ok: boolean; mensaje: string }> {
  const webhookUrl = (import.meta.env.VITE_GEX_APPS_SCRIPT_URL as string | undefined)?.trim();

  if (!webhookUrl) {
    return {
      ok: true,
      mensaje: 'Guardado en Excel y base de datos. Para envío en tiempo real a Google Sheets, vincula el script de Drive.',
    };
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(fila),
      mode: 'no-cors',
    });

    return { ok: true, mensaje: 'Sincronizado con Google Drive (BDSolicitudes-Gex)' };
  } catch (error) {
    console.warn('[DriveService] No se pudo enviar al Webhook de Google Apps Script:', error);
    return { ok: false, mensaje: 'Guardado localmente. La sincronización remota con Drive no respondió.' };
  }
}
