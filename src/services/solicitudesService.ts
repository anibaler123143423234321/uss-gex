import { supabase } from './supabaseClient';
import type { PlanOpcionId } from '../data/planesComputacion';

// Límites del bucket gex-solicitudes (migración v23): se revisan antes de subir
// para dar un mensaje claro en lugar del error del servidor.
export const TIPOS_ADJUNTO = ['application/pdf', 'image/jpeg', 'image/png'];
export const MAX_ADJUNTO = 5 * 1024 * 1024;

export interface Adjunto {
  path: string;
  nombre: string;
  tipo: string;
  tamano: number;
}

export interface NuevaSolicitud {
  codUniv: string;
  nombres: string;
  escuela: string;
  correoInstitucional: string;
  celular: string;
  plan: PlanOpcionId;
  /** Respuestas propias de cada plan (declaraciones, correo personal…) */
  datos: Record<string, string | boolean>;
  adjunto?: Adjunto;
}

/** Valida el archivo antes de subirlo. Devuelve el problema o '' si está bien. */
export function revisarAdjunto(archivo: File): string {
  if (!TIPOS_ADJUNTO.includes(archivo.type)) return 'El archivo debe ser PDF, JPG o PNG.';
  if (archivo.size > MAX_ADJUNTO) return 'El archivo pesa más de 5 MB.';
  if (archivo.size === 0) return 'El archivo está vacío.';
  return '';
}

/**
 * Sube el archivo de convalidación al bucket privado. Con la anon key solo se puede
 * subir a convalidacion/: nadie puede listarlo ni descargarlo desde la portada.
 */
export async function subirAdjunto(codUniv: string, archivo: File): Promise<Adjunto> {
  const extension = archivo.type === 'application/pdf' ? 'pdf' : archivo.type === 'image/png' ? 'png' : 'jpg';
  // Nombre propio: el del estudiante podría repetirse o traer caracteres que Storage rechaza
  const path = `convalidacion/${codUniv}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

  const { error } = await supabase.storage
    .from('gex-solicitudes')
    .upload(path, archivo, { contentType: archivo.type, upsert: false });

  if (error) throw new Error('No se pudo subir el archivo.');
  return { path, nombre: archivo.name.slice(0, 200), tipo: archivo.type, tamano: archivo.size };
}

/**
 * Registra la solicitud en tbl_gex_solicitudes (v21 y v23). Nace en el paso 1
 * ("solicitada"); el Centro de Informática la atiende, la asigna y la resuelve.
 * La anon key solo puede insertar: nadie puede leer las solicitudes desde la portada.
 */
export async function registrarSolicitud(s: NuevaSolicitud): Promise<void> {
  const { error } = await supabase.from('tbl_gex_solicitudes').insert({
    cod_univ: s.codUniv,
    nombres: s.nombres,
    escuela: s.escuela || null,
    correo_institucional: s.correoInstitucional || null,
    celular: s.celular,
    plan: s.plan,
    datos: s.datos,
    archivo_path: s.adjunto?.path ?? null,
    archivo_nombre: s.adjunto?.nombre ?? null,
    archivo_tipo: s.adjunto?.tipo ?? null,
    archivo_tamano: s.adjunto?.tamano ?? null,
  });

  if (error) {
    // PGRST205 o 42703: falta ejecutar la migración de la tabla o de sus columnas
    throw new Error(
      error.code === 'PGRST205' || error.code === '42703' || error.code === 'PGRST204'
        ? 'El registro todavía no está habilitado.'
        : 'No se pudo registrar la solicitud.'
    );
  }
}
