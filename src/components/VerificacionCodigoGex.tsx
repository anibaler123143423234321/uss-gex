import { useState, useRef, useEffect, type FormEvent } from 'react';
import { MailCheck, ArrowLeft, Loader2, RotateCw, AlertCircle } from 'lucide-react';
import type { EstudianteGEX } from '../types/estudiante';
import { accesoService, ErrorAcceso, type CodigoEnviado } from '../services/accesoService';

export interface PendienteVerificacion extends CodigoEnviado {
  identificador: string;
  estudiante?: EstudianteGEX;
}

interface Props {
  pendiente: PendienteVerificacion;
  onVerificado: (estudiante: EstudianteGEX) => void;
  onVolver: () => void;
}

const ESPERA_REENVIO_S = 30;

export default function VerificacionCodigoGex({ pendiente, onVerificado, onVolver }: Props) {
  const [codigo, setCodigo] = useState('');
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState('');
  const [espera, setEspera] = useState(ESPERA_REENVIO_S);
  const [datosPendiente, setDatosPendiente] = useState<PendienteVerificacion>(pendiente);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (espera <= 0) return;
    const t = window.setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [espera]);

  const validar = async (valor: string) => {
    const limpio = valor.replace(/\s/g, '');
    if (!/^\d{6}$/.test(limpio)) {
      setError('El código debe tener 6 dígitos.');
      return;
    }

    setTrabajando(true);
    setError('');

    try {
      const estudiante = await accesoService.validarCodigo(datosPendiente.referencia, limpio);
      onVerificado(estudiante || datosPendiente.estudiante);
    } catch (e) {
      setError((e as Error).message || 'Código incorrecto o vencido.');
      setCodigo('');
      if (e instanceof ErrorAcceso && (e.status === 429 || /venci|usado/i.test(e.message))) {
        setEspera(0);
      }
      inputRef.current?.focus();
    } finally {
      setTrabajando(false);
    }
  };

  const reenviar = async () => {
    if (espera > 0 || trabajando) return;
    setTrabajando(true);
    setError('');
    try {
      const nuevo = await accesoService.solicitarCodigo(datosPendiente.identificador);
      setDatosPendiente({
        ...datosPendiente,
        referencia: nuevo.referencia,
        correo: nuevo.correo,
        minutos: nuevo.minutos,
      });
      setCodigo('');
      setEspera(ESPERA_REENVIO_S);
      inputRef.current?.focus();
    } catch (e) {
      setError((e as Error).message || 'No se pudo reenviar el código.');
    } finally {
      setTrabajando(false);
    }
  };

  return (
    <form
      noValidate
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        validar(codigo);
      }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="flex items-start gap-2.5 mb-3 text-sm text-blue-100">
        <MailCheck className="w-5 h-5 shrink-0 text-[#ffc53d] mt-0.5" aria-hidden="true" />
        <span>
          Enviamos un código de 6 dígitos a <strong className="font-semibold text-white">{datosPendiente.correo}</strong>.
          Vence en {datosPendiente.minutos} minutos; si no lo ves, revisa la carpeta de spam.
        </span>
      </div>

      <label htmlFor="codigo-verificacion-gex" className="block text-sm font-semibold text-white mb-2">
        Código de 6 dígitos
      </label>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          ref={inputRef}
          id="codigo-verificacion-gex"
          type="text"
          value={codigo}
          onChange={(e) => {
            const solo = e.target.value.replace(/\D/g, '').slice(0, 6);
            setCodigo(solo);
            if (error) setError('');
            if (solo.length === 6) validar(solo);
          }}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          maxLength={6}
          aria-invalid={Boolean(error)}
          className="w-full sm:flex-1 h-14 sm:h-16 px-4 rounded-xl border-2 border-white bg-white font-mono text-center tracking-[0.45em] sm:tracking-[0.6em] text-xl font-bold text-slate-900 placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-normal focus:border-uss-blue focus:ring-4 focus:ring-[#ffc53d] focus-visible:outline-none outline-none transition-[box-shadow,border-color]"
        />

        <button
          type="submit"
          disabled={trabajando}
          className="gex-btn shrink-0 h-14 sm:h-16 px-7 rounded-xl bg-[#ffc53d] hover:bg-[#ffd36b] text-[#0b1630] text-base font-bold cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait transition"
        >
          {trabajando && <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />}
          <span>{trabajando ? 'Verificando...' : 'Entrar'}</span>
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-2.5 flex items-start gap-1.5 text-sm font-medium text-amber-200">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-sm text-blue-100">
        <button
          type="button"
          onClick={onVolver}
          className="inline-flex items-center gap-1.5 text-white underline underline-offset-4 decoration-white/40 hover:decoration-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cambiar código o correo</span>
        </button>

        {espera > 0 ? (
          <span className="text-blue-200">Reenviar en {espera}s</span>
        ) : (
          <button
            type="button"
            onClick={reenviar}
            disabled={trabajando}
            className="inline-flex items-center gap-1.5 text-white underline underline-offset-4 decoration-white/40 hover:decoration-white transition cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Reenviar código</span>
          </button>
        )}
      </div>
    </form>
  );
}
