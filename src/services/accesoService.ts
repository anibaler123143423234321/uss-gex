import type { EstudianteGEX } from '../types/estudiante';

/**
 * Acceso del estudiante por la API del Centro de Informática (/api/gex/acceso).
 * El portal no descarga la nómina: pide el código al correo de la ficha y, con él,
 * recibe un token de 2 horas. Sin ese token no se ve una ficha ni se registra nada.
 */

const CLAVE_ACCESO = 'gex.acceso';

/** Dónde está la API: VITE_API_URL si se fijó; si no, según desde dónde se abrió el portal. */
function baseApi(): string {
  const fija = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (fija) return fija.replace(/\/+$/, '');
  // Desplegado aparte: la API vive en el dominio del ecosistema (CORS lo permite)
  if (window.location.hostname === 'uss-gex.vercel.app') return 'https://informatica-uss.vercel.app';
  // informatica-uss.vercel.app/gex en producción, o el proxy /api de Vite en desarrollo
  return '';
}

export class ErrorAcceso extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly data?: { intentosRestantes?: number }
  ) {
    super(message);
  }
}

interface Sesion {
  token: string;
  expiraEn: string;
}

function leerSesion(): Sesion | null {
  try {
    const sesion = JSON.parse(sessionStorage.getItem(CLAVE_ACCESO) || 'null') as Sesion | null;
    return sesion?.token && Date.parse(sesion.expiraEn) > Date.now() ? sesion : null;
  } catch {
    return null;
  }
}

function guardarSesion(sesion: Sesion | null): void {
  try {
    if (sesion) sessionStorage.setItem(CLAVE_ACCESO, JSON.stringify(sesion));
    else sessionStorage.removeItem(CLAVE_ACCESO);
  } catch {
    // Sin sessionStorage la sesión dura hasta recargar la página
  }
}

let sesionEnMemoria: Sesion | null = leerSesion();

async function pedir<T>(ruta: string, init: { body?: unknown; conSesion?: boolean } = {}): Promise<T> {
  const token = init.conSesion ? sesionEnMemoria?.token : undefined;
  if (init.conSesion && !token) throw new ErrorAcceso('Verifica tu correo para continuar.', 401);

  let res: Response;
  try {
    res = await fetch(`${baseApi()}/api/gex/acceso${ruta}`, {
      method: init.body === undefined ? 'GET' : 'POST',
      headers: {
        ...(init.body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch {
    throw new ErrorAcceso('No hay conexión con el Centro de Informática. Revisa tu internet e inténtalo de nuevo.', 0);
  }

  const json = (await res.json().catch(() => null)) as { success?: boolean; message?: string; data?: unknown } | null;
  if (!res.ok || !json?.success) {
    // Token vencido o de otra sesión: se olvida para que el portal vuelva a pedir el código
    if (res.status === 401 && init.conSesion) cerrarSesion();
    throw new ErrorAcceso(
      json?.message || 'No pudimos completar la consulta. Inténtalo de nuevo.',
      res.status,
      json?.data as { intentosRestantes?: number } | undefined
    );
  }
  return json.data as T;
}

export function haySesion(): boolean {
  return Boolean(sesionEnMemoria);
}

export function cerrarSesion(): void {
  sesionEnMemoria = null;
  guardarSesion(null);
}

/** Solo un código universitario (números) o un correo @uss.edu.pe completos, como pide la API. */
export function identificadorValido(texto: string): boolean {
  const valor = texto.trim().toLowerCase();
  return /^\d{6,12}$/.test(valor) || /^[a-z0-9._+-]+@uss\.edu\.pe$/.test(valor);
}

export interface CodigoEnviado {
  referencia: string;
  /** Correo enmascarado: «ca********es@uss.edu.pe» */
  correo: string;
  minutos: number;
}

export const accesoService = {
  /** Cuántos estudiantes tiene GEX: la cifra de la portada, sin datos de nadie. */
  resumen: () => pedir<{ total: number }>('/resumen'),

  solicitarCodigo: (identificador: string) =>
    pedir<CodigoEnviado>('/solicitar-codigo', { body: { identificador: identificador.trim() } }),

  async validarCodigo(referencia: string, codigo: string): Promise<EstudianteGEX> {
    const data = await pedir<{ token: string; expiraEn: string; estudiante: EstudianteGEX }>('/validar-codigo', {
      body: { referencia, codigo },
    });
    sesionEnMemoria = { token: data.token, expiraEn: data.expiraEn };
    guardarSesion(sesionEnMemoria);
    return data.estudiante;
  },

  /** La ficha del estudiante de la sesión (al recargar la página). */
  estudiante: () => pedir<EstudianteGEX>('/estudiante', { conSesion: true }),

  solicitudes: <T>() => pedir<T[]>('/solicitudes', { conSesion: true }),

  prepararAdjunto: (tipo: string, tamano: number) =>
    pedir<{ path: string; token: string }>('/adjuntos', { body: { tipo, tamano }, conSesion: true }),

  registrarSolicitud: (cuerpo: unknown) => pedir<unknown>('/solicitudes', { body: cuerpo, conSesion: true }),
};
