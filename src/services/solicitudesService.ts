import { supabase } from './supabaseClient';
import { accesoService } from './accesoService';
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

export interface AdjuntoSolicitud extends Adjunto {
  clave: string;
  etiqueta: string;
}

export interface NuevaSolicitud {
  plan: PlanOpcionId;
  celular: string;
  /** Respuestas propias de cada plan (declaraciones, correo personal…) */
  datos: Record<string, unknown>;
  /** Archivos ya subidos; el servidor guarda el primero en columnas y la lista en datos.adjuntos */
  adjuntos: AdjuntoSolicitud[];
}

/** Valida el archivo antes de subirlo. Devuelve el problema o '' si está bien. */
export function revisarAdjunto(archivo: File): string {
  if (!TIPOS_ADJUNTO.includes(archivo.type)) return 'El archivo debe ser PDF, JPG o PNG.';
  if (archivo.size > MAX_ADJUNTO) return 'El archivo pesa más de 5 MB.';
  if (archivo.size === 0) return 'El archivo está vacío.';
  return '';
}

/**
 * Sube el archivo al bucket privado con una URL firmada por el backend: la ruta la elige el
 * servidor dentro de la carpeta del estudiante verificado. La anon key ya no puede subir nada (v34).
 */
export async function subirAdjunto(archivo: File): Promise<Adjunto> {
  const { path, token } = await accesoService.prepararAdjunto(archivo.type, archivo.size);
  const { error } = await supabase.storage
    .from('gex-solicitudes')
    .uploadToSignedUrl(path, token, archivo, { contentType: archivo.type });

  if (error) throw new Error('No se pudo subir el archivo.');
  return { path, nombre: archivo.name.slice(0, 80), tipo: archivo.type, tamano: archivo.size };
}

/**
 * Registra la solicitud por la API. El código, los nombres, la escuela y el correo los pone
 * el servidor desde la nómina del estudiante verificado: el navegador no puede cambiarlos.
 */
export async function registrarSolicitud(s: NuevaSolicitud): Promise<void> {
  await accesoService.registrarSolicitud({ plan: s.plan, celular: s.celular, datos: s.datos, adjuntos: s.adjuntos });
}

export type EstadoSolicitudGex = 'solicitada' | 'en_atencion' | 'asignada' | 'aprobada' | 'rechazada';

export interface SolicitudEstadoEstudiante {
  id: number;
  cod_univ: string;
  plan: PlanOpcionId;
  estado: EstadoSolicitudGex;
  paso: number;
  comentario: string | null;
  created_at: string;
  actualizado_en: string;
}

/**
 * Estado en vivo de las solicitudes del estudiante verificado (la API solo devuelve las suyas).
 * Sin conexión, muestra lo que el estudiante envió en esta pestaña.
 */
export async function consultarSolicitudesEstudiante(codUniv: string): Promise<SolicitudEstadoEstudiante[]> {
  const codigo = codUniv.trim();
  if (!codigo) return [];

  try {
    return await accesoService.solicitudes<SolicitudEstadoEstudiante>();
  } catch (err) {
    console.warn('[solicitudesService] No se pudo consultar el estado:', (err as Error).message);
  }

  // Respaldo: lo que se envió en esta pestaña
  try {
    const cacheDetalle = sessionStorage.getItem(`gex.solicitud_detalle.${codigo}`);
    if (cacheDetalle) {
      const parsed = JSON.parse(cacheDetalle) as SolicitudEstadoEstudiante;
      if (parsed && parsed.cod_univ === codigo) {
        return [parsed];
      }
    }

    const planesIds: PlanOpcionId[] = ['gex', 'protech', 'validacion', 'convalidacion'];
    for (const pid of planesIds) {
      const sesionKey = `gex.solicitud.${codigo}.${pid}`;
      const fechaEnvio = sessionStorage.getItem(sesionKey);
      if (fechaEnvio) {
        return [
          {
            id: 0,
            cod_univ: codigo,
            plan: pid,
            estado: 'solicitada',
            paso: 1,
            comentario: 'Tu solicitud ha sido recibida con éxito y está en espera de revisión.',
            created_at: fechaEnvio,
            actualizado_en: fechaEnvio,
          },
        ];
      }
    }
  } catch {
    // ignore
  }

  return [];
}
