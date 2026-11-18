import type { EstudianteGEX } from '../types/estudiante';

export interface CodigoEnviado {
  referencia: string;
  correo: string;
  minutos: number;
}

export class ErrorAcceso extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

const getApiBase = () => {
  const url = import.meta.env.VITE_API_URL || '';
  return String(url).replace(/\/+$/, '');
};

export const accesoService = {
  async solicitarCodigo(identificador: string): Promise<CodigoEnviado> {
    const base = getApiBase();
    const res = await fetch(`${base}/api/gex/acceso/solicitar-codigo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identificador }),
    });
    const json = await res.json().catch(() => ({ success: false, message: 'Error de conexión' }));
    if (!res.ok || !json.success) {
      throw new ErrorAcceso(json.message || 'No se pudo enviar el código.', res.status);
    }
    return json.data;
  },

  async validarCodigo(referencia: string, codigo: string): Promise<EstudianteGEX> {
    const base = getApiBase();
    const res = await fetch(`${base}/api/gex/acceso/validar-codigo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referencia, codigo }),
    });
    const json = await res.json().catch(() => ({ success: false, message: 'Error de conexión' }));
    if (!res.ok || !json.success) {
      throw new ErrorAcceso(json.message || 'Código inválido o vencido.', res.status);
    }
    return json.data;
  },

  async estudiante(): Promise<EstudianteGEX> {
    const base = getApiBase();
    const res = await fetch(`${base}/api/gex/acceso/estudiante`);
    const json = await res.json().catch(() => ({ success: false }));
    if (!res.ok || !json.success) {
      throw new ErrorAcceso(json.message || 'Sesión no válida.', res.status);
    }
    return json.data;
  },

  async solicitudes<T = unknown>(): Promise<T[]> {
    const base = getApiBase();
    const res = await fetch(`${base}/api/gex/acceso/solicitudes`);
    const json = await res.json().catch(() => ({ success: false, data: [] }));
    if (!res.ok || !json.success) return [];
    return json.data || [];
  },
};

export const haySesion = (): boolean => {
  return document.cookie.includes('gex_sesion') || Boolean(sessionStorage.getItem('gex.sesion.activa'));
};

export const cerrarSesion = (): void => {
  sessionStorage.removeItem('gex.sesion.activa');
  sessionStorage.removeItem('gex.acceso.pendiente');
};

export function identificadorValido(valor: string): boolean {
  const v = valor.trim().toLowerCase();
  if (/^\d{8,12}$/.test(v)) return true;
  if (/^[a-zA-Z0-9._%+-]+@uss\.edu\.pe$/.test(v)) return true;
  return false;
}
