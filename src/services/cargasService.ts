import { supabase } from './supabaseClient';
import { parseExcelBuffer, base64ToArrayBuffer } from './excelService';
import type { EstudianteGEX } from '../types/estudiante';

export interface CargaExcelGEX {
  id: string;
  version: number;
  nombre_archivo: string;
  archivo_url?: string;
  drive_file_id?: string;
  archivo_base64?: string; // El archivo Excel binario real (.xlsx)
  total_registros: number;
  es_vigente: boolean;
  created_at: string;
  cargado_por?: string;
}

/**
 * Obtiene la versión vigente del Excel almacenada en Supabase
 * y reconstruye los estudiantes directamente desde el archivo binario original (.xlsx)
 */
export async function getCargaExcelVigente(): Promise<{ carga: CargaExcelGEX | null; estudiantes: EstudianteGEX[] }> {
  try {
    const { data, error } = await supabase
      .from('tbl_gex_cargas')
      .select('*')
      .eq('es_vigente', true)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('[CargasService] Error al consultar carga vigente en Supabase:', error.message);
      return { carga: null, estudiantes: [] };
    }

    if (!data) {
      return { carga: null, estudiantes: [] };
    }

    const carga = data as CargaExcelGEX;
    let estudiantes: EstudianteGEX[] = [];

    // Si el archivo binario (.xlsx) está guardado en Base64 en la base de datos
    if (carga.archivo_base64) {
      const buffer = base64ToArrayBuffer(carga.archivo_base64);
      estudiantes = parseExcelBuffer(buffer);
    } else if (carga.archivo_url && carga.archivo_url.startsWith('http')) {
      // Si tiene URL de descarga directa, obtener el binario
      try {
        const res = await fetch(carga.archivo_url);
        if (res.ok) {
          const buffer = await res.arrayBuffer();
          estudiantes = parseExcelBuffer(buffer);
        }
      } catch (e) {
        console.warn('[CargasService] No se pudo descargar desde la URL directa:', e);
      }
    }

    return { carga, estudiantes };
  } catch (err) {
    console.warn('[CargasService] Excepción al conectar con Supabase:', err);
    return { carga: null, estudiantes: [] };
  }
}

/**
 * Registra y guarda el archivo Excel binario (.xlsx) en Supabase
 * SIN transformar la data a JSON intermedio
 */
export async function registrarNuevaVersionExcel(
  nombreArchivo: string,
  totalRegistros: number,
  archivoBase64: string,
  archivoUrl?: string
): Promise<CargaExcelGEX | null> {
  try {
    // 1. Desactivar versiones previas
    await supabase
      .from('tbl_gex_cargas')
      .update({ es_vigente: false })
      .eq('es_vigente', true);

    // 2. Guardar el archivo Excel binario (.xlsx) real en la base de datos
    const { data, error } = await supabase
      .from('tbl_gex_cargas')
      .insert({
        nombre_archivo: nombreArchivo,
        archivo_base64: archivoBase64,
        archivo_url: archivoUrl || '',
        total_registros: totalRegistros,
        es_vigente: true,
        cargado_por: 'Portal GEX USS',
      })
      .select()
      .single();

    if (error) {
      console.error('[CargasService] Error al guardar versión de Excel:', error.message);
      return null;
    }

    return data as CargaExcelGEX;
  } catch (err) {
    console.error('[CargasService] Excepción al registrar archivo Excel:', err);
    return null;
  }
}

// =========================================================================
// Candado y Control de Concurrencia (Evita que se guarde múltiples veces)
// =========================================================================
let isSyncing = false;
let lastSavedBase64: string | null = null;
let lastSyncTime = 0;

/**
 * Compara el archivo Excel de Drive con la versión vigente en Supabase.
 * Solo guarda UNA SOLA VEZ cuando detecta un cambio real en el archivo.
 */
export async function sincronizarAutomaticoDriveASupabase(
  totalRegistros: number,
  base64Xlsx: string
): Promise<void> {
  // 1. Candado en memoria: si ya hay una petición guardando, salir de inmediato
  if (isSyncing) return;

  // 2. Si este archivo ya se guardó en esta sesión, no hacer nada
  if (lastSavedBase64 && lastSavedBase64 === base64Xlsx) return;

  // 3. Throttling de seguridad (mínimo 10 segundos entre intentos)
  const now = Date.now();
  if (now - lastSyncTime < 10000) return;

  isSyncing = true;
  lastSyncTime = now;

  try {
    const { carga } = await getCargaExcelVigente();

    // Si Supabase ya tiene este archivo exacto, marcamos la memoria y salimos
    if (carga && carga.archivo_base64 === base64Xlsx) {
      lastSavedBase64 = base64Xlsx;
      return;
    }

    // Solo si el contenido cambió de verdad, creamos la nueva versión:
    await registrarNuevaVersionExcel(
      'USS_CINF_GEX_BD_Estudiantes_Oficial.xlsx',
      totalRegistros,
      base64Xlsx
    );
    lastSavedBase64 = base64Xlsx;
  } catch (err) {
    console.warn('[Supabase Auto-Sync] Error al archivar en Supabase:', err);
  } finally {
    isSyncing = false;
  }
}
