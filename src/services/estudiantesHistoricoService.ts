import { supabase } from './supabaseClient';
import type { EstudianteGEX } from '../types/estudiante';

export interface EstudianteDBRow {
  cod_univ: string;
  nombres: string;
  escuela: string | null;
  campus: string | null;
  modalidad: string | null;
  condicion_estudio: string | null;
  seuss: string | null;
  n_cic_codigo: number | null;
  ingreso: string | null;
  egreso: string | null;
  correo_institucional: string | null;
  correo_personal: string | null;
  telefono_tipo: string | null;
  telefono: string | null;
  estado: string | null;
  computacion_i: number | null;
  computacion_ii: number | null;
  computacion_iii: number | null;
  generico: number | null;
  especifico: number | null;
  taller: number | null;
  activo_en_hoja_actual: boolean;
  primera_version_numero: number | null;
  ultima_version_numero: number | null;
  ultima_fecha_registro: string | null;
}

export function mapRowToEstudianteGEX(r: EstudianteDBRow, idx = 0): EstudianteGEX {
  return {
    item: idx + 1,
    codUniv: String(r.cod_univ || '').trim(),
    nombres: String(r.nombres || '').trim(),
    escuela: r.escuela || '',
    campus: r.campus || 'Chiclayo',
    modalidad: r.modalidad || '',
    condicionEstudio: r.condicion_estudio || 'Alumno',
    seuss: r.seuss || '',
    nCicCodigo: r.n_cic_codigo || 0,
    ingreso: r.ingreso || '',
    egreso: r.egreso || '',
    correoInstitucional: r.correo_institucional || '',
    correoPersonal: r.correo_personal || '',
    telefonoTipo: r.telefono_tipo || '',
    telefono: r.telefono || '',
    estado: r.estado || '',
    computacionI: r.computacion_i || 0,
    computacionII: r.computacion_ii || 0,
    computacionIII: r.computacion_iii || 0,
    generico: r.generico || 0,
    especifico: r.especifico || 0,
    taller: r.taller || 0,
    activoEnHojaActual: r.activo_en_hoja_actual ?? true,
    esHistorico: !r.activo_en_hoja_actual,
    ultimaVersionNumero: r.ultima_version_numero || 1,
    ultimaFechaRegistro: r.ultima_fecha_registro || undefined,
  };
}

export const estudiantesHistoricoService = {
  /**
   * Sincroniza la nómina de la hoja actual con la tabla maestra de Supabase.
   * Guarda de forma acumulativa y marca como históricos a los estudiantes retirados.
   */
  async sincronizarConTablaMaestra(
    estudiantes: EstudianteGEX[],
    versionNumero = 1
  ): Promise<void> {
    if (!estudiantes || estudiantes.length === 0) return;

    try {
      // 1. Intentar la función RPC atómica
      const { data: rpcRes, error: rpcErr } = await supabase.rpc(
        'fn_sincronizar_gex_estudiantes',
        {
          p_estudiantes: estudiantes,
          p_version_numero: versionNumero,
        }
      );

      if (!rpcErr && rpcRes?.ok) {
        return;
      }

      // 2. Fallback: Upsert directo con Supabase JS
      const filasParaUpsert = estudiantes
        .filter((e) => e.codUniv && e.codUniv.trim())
        .map((e) => ({
          cod_univ: e.codUniv.trim(),
          nombres: e.nombres || 'SIN NOMBRE',
          escuela: e.escuela || null,
          campus: e.campus || 'Chiclayo',
          modalidad: e.modalidad || null,
          condicion_estudio: e.condicionEstudio || null,
          seuss: e.seuss || null,
          n_cic_codigo: e.nCicCodigo || 0,
          ingreso: e.ingreso || null,
          egreso: e.egreso || null,
          correo_institucional: e.correoInstitucional || null,
          correo_personal: e.correoPersonal || null,
          telefono_tipo: e.telefonoTipo || null,
          telefono: e.telefono || null,
          estado: e.estado || null,
          computacion_i: e.computacionI || 0,
          computacion_ii: e.computacionII || 0,
          computacion_iii: e.computacionIII || 0,
          generico: e.generico || 0,
          especifico: e.especifico || 0,
          taller: e.taller || 0,
          activo_en_hoja_actual: true,
          ultima_version_numero: versionNumero,
          ultima_fecha_registro: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

      // Lotes de 100 para no sobrecargar el payload
      for (let i = 0; i < filasParaUpsert.length; i += 100) {
        const chunk = filasParaUpsert.slice(i, i + 100);
        await supabase
          .from('tbl_gex_estudiantes')
          .upsert(chunk, { onConflict: 'cod_univ' });
      }

      // Desactivar en hoja actual a los que no llegaron en esta lista
      const codigosActuales = new Set(filasParaUpsert.map((f) => f.cod_univ));
      const { data: todosEnDb } = await supabase
        .from('tbl_gex_estudiantes')
        .select('cod_univ')
        .eq('activo_en_hoja_actual', true);

      if (todosEnDb && todosEnDb.length > 0) {
        const codigosParaDesactivar = todosEnDb
          .map((r) => r.cod_univ)
          .filter((c) => !codigosActuales.has(c));

        if (codigosParaDesactivar.length > 0) {
          await supabase
            .from('tbl_gex_estudiantes')
            .update({ activo_en_hoja_actual: false, updated_at: new Date().toISOString() })
            .in('cod_univ', codigosParaDesactivar);
        }
      }
    } catch (e) {
      console.warn('[HistoricoService] Advertencia en sincronización acumulativa:', e);
    }
  },

  /**
   * Obtiene todos los estudiantes históricos que ya no están en la hoja activa actual.
   * Permite que sigan existiendo en las búsquedas del portal.
   */
  async obtenerHistoricosNoPresentes(
    codigosPresentes: Set<string>
  ): Promise<EstudianteGEX[]> {
    try {
      const { data, error } = await supabase
        .from('tbl_gex_estudiantes')
        .select('*')
        .eq('activo_en_hoja_actual', false);

      if (error || !data) return [];

      return (data as EstudianteDBRow[])
        .filter((r) => !codigosPresentes.has(String(r.cod_univ).trim()))
        .map((r, idx) => mapRowToEstudianteGEX(r, idx));
    } catch (e) {
      console.warn('[HistoricoService] No se pudieron cargar los históricos:', e);
      return [];
    }
  },

  /**
   * Busca directamente un estudiante por código universitario en la base histórica.
   * Si alguien escribe un código que no estaba precargado en memoria, lo encuentra.
   */
  async buscarPorCodigo(codUniv: string): Promise<EstudianteGEX | null> {
    const codLimpio = (codUniv || '').trim();
    if (!codLimpio) return null;

    try {
      const { data, error } = await supabase
        .from('tbl_gex_estudiantes')
        .select('*')
        .eq('cod_univ', codLimpio)
        .maybeSingle();

      if (error || !data) return null;
      return mapRowToEstudianteGEX(data as EstudianteDBRow);
    } catch (e) {
      console.warn('[HistoricoService] Error al buscar código histórico:', e);
      return null;
    }
  },
};
