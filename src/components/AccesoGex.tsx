import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AlertCircle, ArrowLeft, Loader2, MailCheck, RotateCw } from 'lucide-react';
import type { EstudianteGEX } from '../types/estudiante';
import type { GexPortalConfig } from '../services/gexConfigService';
import { accesoService, identificadorValido, ErrorAcceso, type CodigoEnviado } from '../services/accesoService';

/** El código pedido sobrevive a un F5 o a que el celular descarte la pestaña al abrir el correo. */
const CLAVE_PENDIENTE = 'gex.acceso.pendiente';
const ESPERA_REENVIO_S = 30;

interface Pendiente extends CodigoEnviado {
  identificador: string;
  venceEn: number;
}

function leerPendiente(): Pendiente | null {
  try {
    const p = JSON.parse(sessionStorage.getItem(CLAVE_PENDIENTE) || 'null') as Pendiente | null;
    return p && p.venceEn > Date.now() ? p : null;
  } catch {
    return null;
  }
}

function guardarPendiente(p: Pendiente | null): void {
  try {
    if (p) sessionStorage.setItem(CLAVE_PENDIENTE, JSON.stringify(p));
    else sessionStorage.removeItem(CLAVE_PENDIENTE);
  } catch {
    // Sin sessionStorage solo se pierde el paso al recargar
  }
}

interface Props {
  /** «portada»: sobre el azul del hero. «clara»: dentro del formulario de registro. */
  variante: 'portada' | 'clara';
  onEntrar: (estudiante: EstudianteGEX) => void;
  config?: GexPortalConfig;
  inputId?: string;
}

/**
 * Entrada al portal en dos pasos: el código universitario o el correo institucional exactos,
 * y luego el código de 6 dígitos que llega al correo de la ficha. No hay lista de coincidencias:
 * nadie ve datos de otro estudiante, y la ficha solo llega después de verificar el correo.
 */
export default function AccesoGex({ variante, onEntrar, config, inputId = 'gex-identificador' }: Props) {
  const [pendiente, setPendiente] = useState<Pendiente | null>(leerPendiente);
  const [identificador, setIdentificador] = useState(() => pendiente?.identificador ?? '');
  const [codigo, setCodigo] = useState('');
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState('');
  const [espera, setEspera] = useState(0);
  const campoCodigo = useRef<HTMLInputElement>(null);
  const enPortada = variante === 'portada';

  // Si el panel apaga una de las dos formas, el campo pide solo la otra (con las dos apagadas, ambas)
  const porCodigo = config?.searchByCode !== false || config?.searchByEmail === false;
  const porCorreo = config?.searchByEmail !== false || config?.searchByCode === false;
  const queEscribir =
    porCodigo && porCorreo ? 'tu código universitario o tu correo institucional' : porCodigo ? 'tu código universitario' : 'tu correo institucional';

  useEffect(() => {
    if (espera <= 0) return;
    const t = window.setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [espera]);

  useEffect(() => {
    if (pendiente) campoCodigo.current?.focus();
  }, [pendiente]);

  const pedirCodigo = async (valor: string) => {
    const limpio = valor.trim().toLowerCase();
    const esCorreo = limpio.includes('@');
    if (!identificadorValido(limpio) || (esCorreo && !porCorreo) || (!esCorreo && !porCodigo)) {
      setError(
        esCorreo
          ? 'Escribe tu correo institucional completo, el que termina en @uss.edu.pe.'
          : `Escribe ${queEscribir} completo${porCodigo ? '. El código son solo números, como 2251804844' : ''}.`
      );
      return;
    }
    setTrabajando(true);
    setError('');
    try {
      const enviado = await accesoService.solicitarCodigo(limpio);
      const nuevo = { ...enviado, identificador: limpio, venceEn: Date.now() + enviado.minutos * 60_000 };
      guardarPendiente(nuevo);
      setPendiente(nuevo);
      setCodigo('');
      setEspera(ESPERA_REENVIO_S);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setTrabajando(false);
    }
  };

  const entrar = async (valor: string) => {
    if (!pendiente || trabajando) return;
    if (!/^\d{6}$/.test(valor)) {
      setError('El código tiene 6 dígitos.');
      return;
    }
    setTrabajando(true);
    setError('');
    try {
      const estudiante = await accesoService.validarCodigo(pendiente.referencia, valor);
      guardarPendiente(null);
      onEntrar(estudiante);
    } catch (e) {
      setError((e as Error).message);
      setCodigo('');
      // Código vencido o intentos agotados: se puede pedir otro de inmediato
      if (e instanceof ErrorAcceso && (e.status === 429 || /venci|ya se us/i.test(e.message))) setEspera(0);
      campoCodigo.current?.focus();
    } finally {
      setTrabajando(false);
    }
  };

  const cambiar = () => {
    guardarPendiente(null);
    setPendiente(null);
    setCodigo('');
    setError('');
  };

  const estilos = enPortada
    ? {
        etiqueta: 'block text-sm font-semibold text-white mb-2',
        input:
          'w-full h-14 sm:h-16 px-4 rounded-xl border-2 border-white bg-white text-base text-slate-900 placeholder:text-slate-500 focus:border-uss-blue focus:ring-4 focus:ring-[#ffc53d] outline-none transition-[box-shadow,border-color]',
        boton:
          'gex-btn shrink-0 h-14 sm:h-16 px-6 rounded-xl bg-[#ffc53d] hover:bg-[#ffd36b] text-[#0b1630] text-base font-bold cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait',
        texto: 'text-sm text-blue-100',
        fuerte: 'font-semibold text-white',
        enlace: 'text-white underline underline-offset-4 decoration-white/40 hover:decoration-white',
        error: 'text-amber-200',
      }
    : {
        etiqueta: 'block text-sm font-semibold text-slate-800 mb-1',
        input:
          'w-full h-11 rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-uss-blue focus:ring-2 focus:ring-uss-blue/20',
        boton:
          'gex-btn shrink-0 h-11 px-4 rounded-xl bg-uss-blue hover:bg-[#062a80] text-white text-sm font-bold cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait',
        texto: 'text-sm text-slate-600',
        fuerte: 'font-semibold text-slate-900',
        enlace: 'text-uss-blue underline underline-offset-4 decoration-uss-blue/30 hover:decoration-uss-blue',
        error: 'text-red-700',
      };

  const avisoError = error && (
    <p role="alert" className={`mt-2.5 flex items-start gap-1.5 text-sm font-medium ${estilos.error}`}>
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
      <span>{error}</span>
    </p>
  );

  if (!pendiente) {
    return (
      <form
        noValidate
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          pedirCodigo(identificador);
        }}
        className="w-full"
      >
        <label htmlFor={inputId} className={estilos.etiqueta}>
          {enPortada
            ? config?.labelAcceso || 'Entra con tu código o tu correo institucional'
            : 'Verifica que eres tú para registrar'}
        </label>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            id={inputId}
            type="text"
            value={identificador}
            onChange={(e) => {
              setIdentificador(e.target.value.replace(/\s/g, ''));
              if (error) setError('');
            }}
            placeholder={porCodigo && porCorreo ? 'Código o correo @uss.edu.pe' : porCodigo ? 'Código universitario' : 'Correo @uss.edu.pe'}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={80}
            aria-invalid={Boolean(error)}
            className={`flex-1 min-w-0 ${estilos.input}`}
          />
          <button type="submit" disabled={trabajando} className={estilos.boton}>
            {trabajando && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            {trabajando ? 'Enviando…' : 'Enviar código'}
          </button>
        </div>
        {avisoError || (
          <p className={`mt-2.5 ${estilos.texto}`}>Te enviamos un código de 6 dígitos al correo de tu ficha GEX.</p>
        )}
      </form>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        entrar(codigo);
      }}
      className="w-full"
    >
      <p className={`flex items-start gap-2 mb-3 ${estilos.texto}`}>
        <MailCheck className={`w-5 h-5 shrink-0 ${enPortada ? 'text-[#ffc53d]' : 'text-uss-blue'}`} aria-hidden="true" />
        <span>
          Enviamos un código a <span className={estilos.fuerte}>{pendiente.correo}</span>. Vence en {pendiente.minutos}{' '}
          minutos; si no lo ves, revisa la carpeta de spam.
        </span>
      </p>
      <label htmlFor={`${inputId}-codigo`} className={estilos.etiqueta}>
        Código de 6 dígitos
      </label>
      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          ref={campoCodigo}
          id={`${inputId}-codigo`}
          type="text"
          value={codigo}
          onChange={(e) => {
            const solo = e.target.value.replace(/\D/g, '').slice(0, 6);
            setCodigo(solo);
            if (error) setError('');
            // Al completar los 6 dígitos (o pegarlos del correo) entra sin otro clic
            if (solo.length === 6) entrar(solo);
          }}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          maxLength={6}
          aria-invalid={Boolean(error)}
          className={`flex-1 min-w-0 font-mono text-center tracking-[0.5em] text-lg font-bold placeholder:font-normal ${estilos.input}`}
        />
        <button type="submit" disabled={trabajando} className={estilos.boton}>
          {trabajando && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
          {trabajando ? 'Verificando…' : 'Entrar'}
        </button>
      </div>
      {avisoError}
      <div className={`mt-3 flex flex-wrap items-center justify-between gap-x-5 gap-y-1 ${estilos.texto}`}>
        <button type="button" onClick={cambiar} className={`inline-flex items-center gap-1.5 min-h-11 cursor-pointer ${estilos.enlace}`}>
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Cambiar código o correo
        </button>
        <button
          type="button"
          onClick={() => pedirCodigo(pendiente.identificador)}
          disabled={espera > 0 || trabajando}
          className={`inline-flex items-center gap-1.5 min-h-11 cursor-pointer disabled:cursor-default disabled:no-underline disabled:opacity-70 ${estilos.enlace}`}
        >
          <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
          {espera > 0 ? `Reenviar código en ${espera} s` : 'Reenviar código'}
        </button>
      </div>
    </form>
  );
}
