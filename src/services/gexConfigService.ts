import { supabase } from './supabaseClient';
import { PLANES_COMPUTACION, mezclarPlanes, type PlanOpcion } from '../data/planesComputacion';

export interface GexPortalConfig {
  titulo: string;
  palabraDestacada: string;
  subtitulo: string;
  badge: string;
  menuTitulo: string;
  menuSubtitulo: string;
  planes: PlanOpcion[];
  searchByEmail: boolean;
  searchByCode: boolean;
  searchByName: boolean;
  searchPriority: ('email' | 'code' | 'name')[];
}

export const DEFAULT_GEX_CONFIG: GexPortalConfig = {
  titulo: 'Gente con',
  palabraDestacada: 'Experiencia',
  subtitulo: 'Portal oficial de consulta y verificación de estudiantes GEX — Universidad Señor de Sipán',
  badge: 'Centro de Informática • USS',
  menuTitulo: 'Elige cómo acreditar Computación',
  menuSubtitulo: 'Formas oficiales del Centro de Informática para el Programa Gente con Experiencia.',
  planes: PLANES_COMPUTACION,
  searchByEmail: true,
  searchByCode: true,
  searchByName: true,
  searchPriority: ['email', 'code', 'name'],
};

const STORAGE_KEY = 'uss_gex_portal_config';
const FILA = 'portal_config';

const mezclar = (parcial: Partial<GexPortalConfig> | null | undefined): GexPortalConfig => ({
  ...DEFAULT_GEX_CONFIG,
  ...(parcial ?? {}),
  planes: mezclarPlanes(parcial?.planes),
});

function guardarCopia(config: GexPortalConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Sin copia local solo se pierde el respaldo sin conexión
  }
}

function leerCopia(): GexPortalConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? mezclar(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

/**
 * La configuración la edita el panel (vía su backend, con service_role) en la fila
 * 'portal_config' de tbl_gex_config. La portada solo la lee: la tabla es de lectura
 * pública. Antes se pedía a localhost:4000, que en producción no existe y en
 * desarrollo solo respondía si el backend estaba levantado.
 */
export const gexConfigService = {
  async getConfig(): Promise<GexPortalConfig> {
    try {
      const { data, error } = await supabase
        .from('tbl_gex_config')
        .select('config')
        .eq('id', FILA)
        .maybeSingle();

      if (!error && data?.config) {
        const config = mezclar(data.config as Partial<GexPortalConfig>);
        guardarCopia(config);
        return config;
      }
    } catch {
      // Sin conexión: se usa la última copia conocida
    }
    return leerCopia() ?? DEFAULT_GEX_CONFIG;
  },

  /**
   * Avisa en cuanto el panel guarda. Necesita tbl_gex_config en la publicación
   * supabase_realtime (migración v22); sin ella no llega nada y quedan los
   * respaldos de App (al volver a la pestaña y cada 30 s).
   */
  suscribirse(onCambio: (config: GexPortalConfig) => void): () => void {
    const canal = supabase
      .channel('gex-portal-config')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tbl_gex_config', filter: `id=eq.${FILA}` },
        (payload) => {
          const fila = payload.new as { config?: Partial<GexPortalConfig> } | null;
          if (!fila?.config) return;
          const config = mezclar(fila.config);
          guardarCopia(config);
          onCambio(config);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  },
};
