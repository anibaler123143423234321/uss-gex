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

/**
 * La portada solo llega a Drive por el webhook de Apps Script (google-apps-script/). Sin su URL la
 * solicitud queda en Supabase y en el Excel descargado, pero NO en la hoja de Drive: la pantalla de
 * confirmación lo usa para no afirmar algo que no pasó.
 */
const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyQrDM0Bzti21eruxHKqG-bL0PtNLWTla6snVApWxFQSrTD56pBN3vOdMhS0IV4qjcp/exec';

export const GEX_DRIVE_CONFIGURADO = !!(
  (import.meta.env.VITE_GEX_APPS_SCRIPT_URL as string | undefined)?.trim() || DEFAULT_APPS_SCRIPT_URL
);

export interface ArchivoAdjuntoDrive {
  clave?: string;
  etiqueta?: string;
  nombre: string;
  tipo: string;
  tamano: number;
  base64: string;
}

export interface FilaSolicitudGEX {
  'Fecha y Hora': string;
  'Código Universitario': string;
  'Estudiante': string;
  'Escuela': string;
  'Celular / WhatsApp': string;
  'Correo': string;
  'Trámite / Plan': string;
  'Documento Adjunto': string;
  'Estado': string;
  /** Lista de adjuntos en Base64 para guardar en la carpeta de Google Drive */
  archivos?: ArchivoAdjuntoDrive[];
}

/** Convierte un objeto File del navegador a cadena Base64 para enviarlo a Drive */
export function archivoABase64(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const resultado = reader.result as string;
      const base64 = resultado.includes(',') ? resultado.split(',')[1] : resultado;
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(archivo);
  });
}

/** Formatea fecha y hora en formato estándar peruano DD/MM/AAAA HH:mm */
export function formatearFechaPeru(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const d = pad(date.getDate());
  const m = pad(date.getMonth() + 1);
  const y = date.getFullYear();
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${d}/${m}/${y} ${h}:${min}`;
}

/**
 * Construye la fila limpia y optimizada para la hoja de Google Sheets (9 columnas esenciales)
 */
export function construirFilaSolicitud({
  alumno,
  plan,
  celular,
  correoPersonal,
  esExamen,
  adjunto,
  archivos,
  turno,
  fechaEntrevista,
}: {
  alumno: EstudianteGEX;
  plan: PlanOpcion;
  celular: string;
  correoPersonal?: string;
  esExamen: boolean;
  adjunto?: Adjunto;
  declaracion?: string;
  archivos?: ArchivoAdjuntoDrive[];
  turno?: string;
  fechaEntrevista?: string;
}): FilaSolicitudGEX {
  const correoInst = alumno.correoInstitucional?.trim() || '';
  const correoPers = correoPersonal?.trim() || '';
  const correo =
    correoInst && correoPers && correoInst !== correoPers
      ? `${correoInst} (${correoPers})`
      : correoInst || correoPers || '—';

  let tramite =
    plan.id === 'convalidacion'
      ? 'Convalidación de Cursos'
      : `${plan.nombre.replace(/\n+/g, ' ')} (${esExamen ? 'Examen' : 'Convalidación'})`;

  if (fechaEntrevista) {
    tramite += ` · Entrevista: ${fechaEntrevista}${turno ? ` (${turno})` : ''}`;
  }

  return {
    'Fecha y Hora': formatearFechaPeru(),
    'Código Universitario': alumno.codUniv,
    'Estudiante': alumno.nombres,
    'Escuela': alumno.escuela || '—',
    'Celular / WhatsApp': celular.trim(),
    'Correo': correo,
    'Trámite / Plan': tramite,
    'Documento Adjunto': adjunto?.nombre || (esExamen ? 'N/A - Examen' : 'Sin archivo'),
    'Estado': 'Registrado',
    ...(archivos && archivos.length > 0 ? { archivos } : {}),
  };
}

/**
 * Envía la fila al webhook de Apps Script, que la agrega a la hoja de Drive del Centro de Informática.
 * El registro vive en Drive y en Supabase: al estudiante no se le descarga ningún Excel ni se guardan
 * sus datos en el navegador. Se lee la respuesta (el webhook admite CORS con text/plain) porque con
 * 'no-cors' un error del script, como no tener acceso a la carpeta, pasaba por éxito sin dejar rastro.
 */
export async function sincronizarSolicitudConGoogleDrive(
  fila: FilaSolicitudGEX
): Promise<{ ok: boolean; mensaje: string }> {
  const webhookUrl =
    (import.meta.env.VITE_GEX_APPS_SCRIPT_URL as string | undefined)?.trim() || DEFAULT_APPS_SCRIPT_URL;
  if (!webhookUrl) return { ok: false, mensaje: 'Falta VITE_GEX_APPS_SCRIPT_URL: la solicitud no se envió a Drive.' };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(fila),
    });
    const json = (await res.json()) as { status?: string; error?: string; message?: string };
    if (json.status !== 'success') return { ok: false, mensaje: json.error || json.message || 'El script de Drive respondió con error.' };
    return { ok: true, mensaje: 'Guardado en la hoja de Drive.' };
  } catch (error) {
    return { ok: false, mensaje: `El script de Drive no respondió: ${(error as Error).message}` };
  }
}
