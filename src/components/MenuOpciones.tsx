import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Award, Check, CheckCircle2, Loader2, Monitor, AlertCircle, CalendarClock, Paperclip, X, PenLine } from 'lucide-react';
import {
  NOTA_COSTOS,
  iconoPlan,
  type PlanOpcion,
  type PlanOpcionId,
} from '../data/planesComputacion';
import { registrarSolicitud, revisarAdjunto, subirAdjunto } from '../services/solicitudesService';
import type { EstudianteGEX } from '../types/estudiante';

interface Props {
  /** Textos editables desde el panel (config del portal) */
  titulo: string;
  subtitulo: string;
  planes: PlanOpcion[];
  estudiante: EstudianteGEX | null;
  estudiantes: EstudianteGEX[];
  plan: PlanOpcionId | null;
  onPlan: (plan: PlanOpcionId | null) => void;
}

/** Pantalla "Menú de opciones": los planes para acreditar Computación y el registro del elegido */
export default function MenuOpciones({ titulo, subtitulo, planes, estudiante, estudiantes, plan, onPlan }: Props) {
  const elegido = planes.find((p) => p.id === plan) ?? null;

  // Al pasar de la lista al registro (o volver) se empieza desde arriba
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [plan]);

  if (elegido) {
    return (
      <RegistroPlan
        key={elegido.id}
        plan={elegido}
        estudiante={estudiante}
        estudiantes={estudiantes}
        onVolver={() => onPlan(null)}
      />
    );
  }

  const nombre = estudiante ? primerNombre(estudiante.nombres) : '';

  return (
    // En laptop (xl) la lista ocupa justo el alto de la ventana: App fija la altura y aquí
    // las tarjetas se reparten el espacio que deja el encabezado.
    <div className="flex flex-col gap-8 sm:gap-10 xl:gap-4 xl:flex-1 xl:min-h-0">
      <div className="text-center max-w-2xl mx-auto shrink-0">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 ring-1 ring-blue-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-uss-blue">
            <Monitor className="w-3.5 h-3.5" />
            Acreditación en Computación
          </span>
          {/* El saludo va aparte: el título lo escribe el panel y no siempre admite anteponer un nombre */}
          {nombre && <span className="text-sm font-semibold text-uss-blue">Hola, {nombre}</span>}
        </div>
        <h2 className="mt-3 xl:mt-2 text-[1.75rem] leading-tight sm:text-4xl xl:text-3xl font-extrabold tracking-tight text-slate-900">
          {titulo || 'Elige cómo acreditar Computación'}
        </h2>
        {subtitulo && <p className="mt-2 xl:mt-1 text-sm sm:text-base xl:text-sm text-slate-500">{subtitulo}</p>}
      </div>

      {/* xl: 5 filas compartidas (encabezado, precio, botón, detalle y documento) con subgrid, para
          que las partes de las 4 tarjetas queden alineadas aunque un texto ocupe más líneas */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:grid-rows-[auto_auto_auto_minmax(0,1fr)_auto] xl:gap-x-4 xl:gap-y-0 items-stretch pt-2 xl:pt-3 xl:flex-1 xl:min-h-0">
        {planes.map((p) => (
          <TarjetaPlan key={p.id} plan={p} onElegir={() => onPlan(p.id)} />
        ))}
      </div>

      <p className="text-center text-xs text-slate-400 shrink-0">{NOTA_COSTOS}</p>
    </div>
  );
}

/** Tarjeta de un plan al estilo de una página de precios. Sin onElegir sirve de resumen del plan elegido. */
function TarjetaPlan({ plan, onElegir }: { plan: PlanOpcion; onElegir?: () => void }) {
  const Icon = iconoPlan(plan.icono);
  const destacado = !!plan.insignia && !!onElegir;

  // En la lista (xl) la tarjeta ocupa 5 filas del subgrid; como resumen del plan elegido es una columna normal
  const enLista = !!onElegir;
  const conExamen = plan.id !== 'convalidacion';

  return (
    <article
      className={`relative flex flex-col rounded-3xl bg-white p-5 sm:p-6 ring-1 ring-slate-200 shadow-sm ${
        enLista ? 'xl:row-span-5 xl:grid xl:grid-rows-subgrid xl:p-4' : ''
      }`}
      style={destacado ? { boxShadow: `0 0 0 2px ${plan.acento}, 0 10px 30px -12px ${plan.acento}55` } : undefined}
    >
      {destacado && (
        <span
          className="absolute -top-3 left-6 rounded-full px-3 py-1 text-[11px] font-bold text-white shadow-sm"
          style={{ backgroundColor: plan.acento }}
        >
          {plan.insignia}
        </span>
      )}

      {/* 1. Encabezado */}
      <div>
        <div className="flex items-center gap-2.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${enLista ? 'xl:w-9 xl:h-9' : ''}`}
            style={{ backgroundColor: `${plan.acento}14`, color: plan.acento }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 min-w-0">
            {enLista ? plan.etiqueta : 'Plan elegido'}
          </span>
          {/* Las opciones 1 a 3 se acreditan con examen; la convalidación, con el archivo del estudiante */}
          <span
            className="ml-auto shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: `${plan.acento}14`, color: plan.acento }}
          >
            {conExamen ? <PenLine className="w-3 h-3" /> : <Paperclip className="w-3 h-3" />}
            {conExamen ? 'Examen' : 'Archivo'}
          </span>
        </div>

        {/* Alturas mínimas solo en 2 columnas: en xl el subgrid ya alinea las filas */}
        <h3
          className={`mt-4 text-xl font-extrabold text-slate-900 leading-7 ${
            enLista ? 'sm:min-h-[3.5rem] xl:min-h-0 xl:mt-3 xl:text-lg xl:leading-6' : ''
          }`}
        >
          {plan.nombre}
        </h3>
        <p
          className={`mt-1 text-sm text-slate-500 leading-snug ${enLista ? 'sm:min-h-[4rem] xl:min-h-0 xl:text-[13px]' : ''}`}
        >
          {plan.resumen}
        </p>
      </div>

      {/* 2. Precio */}
      <div className={`mt-4 ${enLista ? 'sm:min-h-[4.25rem] xl:min-h-0 xl:mt-3' : ''}`}>
        <p className={`text-3xl font-black tracking-tight text-slate-900 leading-none ${enLista ? 'xl:text-2xl' : ''}`}>
          {plan.precio}
        </p>
        <p className="mt-1.5 text-xs text-slate-500">{plan.precioNota}</p>
      </div>

      {/* 3. Botón */}
      {enLista && (
        <button
          type="button"
          onClick={onElegir}
          className="mt-5 xl:mt-3 h-11 xl:h-10 w-full rounded-xl text-sm font-bold text-white inline-flex items-center justify-center gap-1.5 transition hover:brightness-110 cursor-pointer"
          style={{ backgroundColor: plan.acento }}
        >
          {conExamen ? 'Inscribirme al examen' : 'Enviar mi archivo'}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}

      {/* 4. Detalle: si la laptop es muy baja, solo esto hace scroll dentro de la tarjeta */}
      <div
        className={`mt-5 pt-5 border-t border-slate-100 space-y-4 flex-1 ${
          enLista ? 'xl:mt-3 xl:pt-3 xl:space-y-3 xl:min-h-0 xl:overflow-y-auto scroll-fino' : ''
        }`}
      >
        {plan.etapas.length > 0 && (
          <ul className={`space-y-3 ${enLista ? 'xl:space-y-2' : ''}`}>
            {plan.etapas.map((etapa) => (
              <li key={etapa.periodo} className="flex gap-3">
                <span className="shrink-0 w-16 text-xs font-extrabold pt-px" style={{ color: plan.acento }}>
                  {etapa.duracion}
                </span>
                <div className="min-w-0 text-xs leading-snug">
                  <p className="font-semibold text-slate-800">
                    {etapa.periodo} &bull; {etapa.costo}
                  </p>
                  <p className="text-slate-500">{etapa.detalle}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {plan.requisitos.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Requisitos</p>
            <ListaCheck items={plan.requisitos} color={plan.acento} compacta={enLista} />
          </div>
        )}

        {plan.incluye.length > 0 && <ListaCheck items={plan.incluye} color={plan.acento} compacta={enLista} />}
      </div>

      {/* 5. Documento */}
      <p className={`mt-5 inline-flex items-start gap-1.5 text-xs font-semibold text-slate-600 ${enLista ? 'xl:mt-3' : ''}`}>
        <Award className="w-4 h-4 text-slate-400 shrink-0" />
        {plan.documento}
      </p>
    </article>
  );
}

function ListaCheck({ items, color, compacta }: { items: string[]; color: string; compacta?: boolean }) {
  return (
    <ul className={`space-y-2 ${compacta ? 'xl:space-y-1.5' : ''}`}>
      {items.map((item) => (
        <li key={item} className={`flex items-start gap-2 text-sm text-slate-700 leading-snug ${compacta ? 'xl:text-[13px]' : ''}`}>
          <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color }} />
          {item}
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Registro
// ---------------------------------------------------------------------------

// Las opciones 1 a 3 son la inscripción al examen: el estudiante deja sus datos y el Centro
// de Informática le programa la fecha. Convalidación no tiene examen: solo pide el archivo.
const DECLARACION: Partial<Record<PlanOpcionId, string>> = {
  validacion: 'Declaro que no estoy matriculado en el curso de Computación.',
};

const CLASE_INPUT =
  'w-full h-11 rounded-xl border border-slate-300 bg-white px-3.5 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-uss-blue focus:ring-4 focus:ring-uss-blue/15';

// Recuerda en la pestaña que la solicitud ya se envió, para no reenviarla tras un F5
const claveEnviada = (cod: string, plan: PlanOpcionId) => `gex.solicitud.${cod}.${plan}`;

function yaEnviada(cod: string | undefined, plan: PlanOpcionId): boolean {
  if (!cod) return false;
  try {
    return sessionStorage.getItem(claveEnviada(cod, plan)) !== null;
  } catch {
    return false;
  }
}

function RegistroPlan({
  plan,
  estudiante,
  estudiantes,
  onVolver,
}: {
  plan: PlanOpcion;
  estudiante: EstudianteGEX | null;
  estudiantes: EstudianteGEX[];
  onVolver: () => void;
}) {
  const [codigo, setCodigo] = useState(estudiante?.codUniv ?? '');
  const [celular, setCelular] = useState('');
  const [correoPersonal, setCorreoPersonal] = useState('');
  const [declara, setDeclara] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [autoriza, setAutoriza] = useState(false);
  const [enviando, setEnviando] = useState<'' | 'subiendo' | 'registrando'>('');
  const [enviada, setEnviada] = useState(() => yaEnviada(estudiante?.codUniv, plan.id));
  const [error, setError] = useState('');

  // Sin estudiante elegido (se entró desde la portada) se identifica por su código en el Excel GEX
  const alumno = estudiante ?? estudiantes.find((e) => e.codUniv === codigo.trim()) ?? null;
  const esExamen = plan.id !== 'convalidacion';
  const declaracion = DECLARACION[plan.id];

  const validar = (): string => {
    if (!alumno) return 'Ingresa un código universitario registrado en GEX.';
    if (!/^9\d{8}$/.test(celular.trim())) return 'El celular debe tener 9 dígitos y empezar con 9.';
    if (declaracion && !declara) return `Marca: "${declaracion}"`;
    if (!esExamen) {
      if (!archivo) return 'Adjunta tu archivo (PDF, JPG o PNG, hasta 5 MB).';
      const problemaArchivo = revisarAdjunto(archivo);
      if (problemaArchivo) return problemaArchivo;
    }
    if (!autoriza) return 'Autoriza el uso de tus datos para registrar la solicitud.';
    return '';
  };

  const enviar = async (ev: FormEvent) => {
    ev.preventDefault();
    const problema = validar();
    setError(problema);
    if (problema || !alumno) return;

    try {
      setEnviando(archivo && !esExamen ? 'subiendo' : 'registrando');
      const adjunto = archivo && !esExamen ? await subirAdjunto(alumno.codUniv, archivo) : undefined;
      setEnviando('registrando');
      await registrarSolicitud({
        codUniv: alumno.codUniv,
        nombres: alumno.nombres,
        escuela: alumno.escuela,
        correoInstitucional: alumno.correoInstitucional,
        celular: celular.trim(),
        plan: plan.id,
        datos: {
          tipo: esExamen ? 'examen' : 'convalidacion',
          ...(declaracion ? { noMatriculado: true } : {}),
          ...(correoPersonal.trim() ? { correoPersonal: correoPersonal.trim() } : {}),
          autorizaDatos: true,
        },
        adjunto,
      });
      try {
        sessionStorage.setItem(claveEnviada(alumno.codUniv, plan.id), new Date().toISOString());
      } catch {
        // Sin sessionStorage solo se pierde el aviso tras un F5
      }
      setEnviada(true);
    } catch (e) {
      setError(`${(e as Error).message} Si persiste, escríbenos al WhatsApp 986 724 506.`);
    } finally {
      setEnviando('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <button
        type="button"
        onClick={onVolver}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-uss-blue transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Ver todos los planes
      </button>

      <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] items-start">
        <div className="lg:sticky lg:top-20">
          <TarjetaPlan plan={plan} />
        </div>

        {enviada ? (
          <section className="bg-white rounded-3xl ring-1 ring-emerald-200 shadow-sm p-6 sm:p-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="mt-4 text-2xl font-extrabold text-slate-900">
              {esExamen ? 'Inscripción al examen registrada' : 'Solicitud de convalidación registrada'}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {esExamen ? 'Te inscribimos al examen de ' : 'Recibimos tu archivo para '}
              <strong>{plan.nombre}</strong>
              {alumno && (
                <>
                  {' '}({alumno.nombres}, {alumno.codUniv})
                </>
              )}
              .{esExamen && ' El Centro de Informática programará la fecha y te la comunicará.'}
            </p>

            <h3 className="mt-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">Próximos pasos</h3>
            <ol className="mt-2 space-y-2.5">
              {plan.proceso.map((p, i) => (
                <li key={p} className="flex items-start gap-3 text-sm text-slate-700">
                  <span
                    className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
                    style={{ backgroundColor: plan.acento }}
                  >
                    {i + 1}
                  </span>
                  {p}
                </li>
              ))}
            </ol>

            <p className="mt-6 text-xs text-slate-500">
              ¿Dudas? WhatsApp 986 724 506 &bull; cinf@uss.edu.pe &bull; Lunes a viernes de 8:00 a.m. a 1:00 p.m. y de 2:00 p.m. a 6:00 p.m.
            </p>
            <button
              type="button"
              onClick={onVolver}
              className="mt-5 h-11 px-5 rounded-xl bg-white ring-1 ring-slate-200 hover:bg-slate-50 text-sm font-semibold text-slate-700 transition cursor-pointer"
            >
              Ver todos los planes
            </button>
          </section>
        ) : (
          <form onSubmit={enviar} noValidate className="bg-white rounded-3xl ring-1 ring-slate-200 shadow-sm p-5 sm:p-7 space-y-7">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: plan.acento }}>
                Registro
              </p>
              <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">{plan.nombre}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {esExamen ? 'Inscríbete al examen con tus datos.' : 'Envía tu archivo para la convalidación.'}
              </p>
            </div>

            <Paso n={1} titulo="Tus datos" color={plan.acento}>
              {!estudiante && (
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Código universitario</span>
                  <input
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                    inputMode="numeric"
                    maxLength={12}
                    placeholder="Ej. 2251804844"
                    className={`${CLASE_INPUT} mt-1.5 font-mono`}
                  />
                  {codigo.trim().length >= 10 && !alumno && (
                    <span className="mt-1.5 block text-xs text-amber-700">Ese código no está registrado en GEX.</span>
                  )}
                </label>
              )}
              {alumno && (
                <dl className="grid gap-px sm:grid-cols-2 rounded-2xl overflow-hidden ring-1 ring-slate-200 bg-slate-200">
                  <Dato label="Código" valor={alumno.codUniv} mono />
                  <Dato label="Apellidos y nombres" valor={alumno.nombres} />
                  <Dato label="Escuela" valor={alumno.escuela || '—'} />
                  <Dato label="Correo institucional" valor={alumno.correoInstitucional || '—'} />
                </dl>
              )}
              {alumno && <p className="text-xs text-slate-400">Tomados del registro del Programa GEX.</p>}
            </Paso>

            <Paso n={2} titulo="Contacto" color={plan.acento}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Celular</span>
                  <input
                    value={celular}
                    onChange={(e) => setCelular(e.target.value.replace(/\D/g, ''))}
                    inputMode="tel"
                    maxLength={9}
                    placeholder="9XX XXX XXX"
                    className={`${CLASE_INPUT} mt-1.5 font-mono`}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Correo personal <span className="font-normal text-slate-400">(opcional)</span>
                  </span>
                  <input
                    type="email"
                    value={correoPersonal}
                    onChange={(e) => setCorreoPersonal(e.target.value)}
                    maxLength={120}
                    placeholder="nombre@gmail.com"
                    className={`${CLASE_INPUT} mt-1.5`}
                  />
                </label>
              </div>
            </Paso>

            <Paso n={3} titulo={esExamen ? 'Examen' : 'Tu archivo'} color={plan.acento}>
              {esExamen ? (
                <p className="flex items-start gap-3 rounded-2xl bg-slate-50 ring-1 ring-slate-100 p-4 text-sm text-slate-600">
                  <CalendarClock className="w-5 h-5 shrink-0" style={{ color: plan.acento }} />
                  Te inscribes al examen de {plan.nombre}. El Centro de Informática programará la fecha y te la
                  comunicará por celular o correo.
                </p>
              ) : (
                <SelectorArchivo archivo={archivo} onChange={setArchivo} color={plan.acento} />
              )}
              {declaracion && <Casilla marcada={declara} onChange={setDeclara} label={declaracion} />}
            </Paso>

            <Paso n={4} titulo="Confirmación" color={plan.acento}>
              <Casilla
                marcada={autoriza}
                onChange={setAutoriza}
                label="Autorizo al Centro de Informática USS a usar estos datos para gestionar mi solicitud."
              />

              {error && (
                <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 ring-1 ring-red-200 px-3.5 py-2.5 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!!enviando}
                className="w-full sm:w-auto h-12 px-6 rounded-xl text-sm font-bold text-white inline-flex items-center justify-center gap-2 transition hover:brightness-110 disabled:opacity-60 cursor-pointer"
                style={{ backgroundColor: plan.acento }}
              >
                {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {enviando === 'subiendo'
                  ? 'Subiendo archivo…'
                  : enviando === 'registrando'
                  ? 'Registrando…'
                  : esExamen
                  ? 'Inscribirme al examen'
                  : 'Enviar solicitud de convalidación'}
              </button>
            </Paso>
          </form>
        )}
      </div>
    </div>
  );
}

function Paso({ n, titulo, color, children }: { n: number; titulo: string; color: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2.5 text-base font-bold text-slate-900">
        <span
          className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
          style={{ backgroundColor: color }}
        >
          {n}
        </span>
        {titulo}
      </h3>
      <div className="space-y-3 sm:pl-9">{children}</div>
    </section>
  );
}

function Dato({ label, valor, mono }: { label: string; valor: string; mono?: boolean }) {
  return (
    <div className="bg-slate-50 px-3.5 py-2.5 min-w-0">
      <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</dt>
      <dd className={`text-sm font-semibold text-slate-900 break-words ${mono ? 'font-mono' : ''}`}>{valor}</dd>
    </div>
  );
}

/** Un solo archivo: si el estudiante tiene varios documentos, los une en un PDF */
function SelectorArchivo({
  archivo,
  onChange,
  color,
}: {
  archivo: File | null;
  onChange: (archivo: File | null) => void;
  color: string;
}) {
  const problema = archivo ? revisarAdjunto(archivo) : '';

  if (archivo) {
    return (
      <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 ring-1 ${problema ? 'ring-red-200 bg-red-50' : 'ring-slate-200 bg-slate-50'}`}>
        <Paperclip className="w-5 h-5 shrink-0" style={{ color }} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800 truncate">{archivo.name}</p>
          <p className={`text-xs ${problema ? 'text-red-700' : 'text-slate-500'}`}>
            {problema ||
              (archivo.size < 1024 * 1024
                ? `${Math.max(1, Math.round(archivo.size / 1024))} KB`
                : `${(archivo.size / 1024 / 1024).toFixed(1)} MB`)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-800 transition cursor-pointer"
          aria-label="Quitar archivo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/60 px-4 py-8 text-center cursor-pointer transition">
      <Paperclip className="w-6 h-6" style={{ color }} />
      <span className="text-sm font-semibold text-slate-800">Adjunta tu título técnico o certificado</span>
      <span className="text-xs text-slate-500">
        PDF, JPG o PNG, hasta 5 MB. Si tienes varios documentos, únelos en un solo PDF.
      </span>
      <input
        type="file"
        accept="application/pdf,image/jpeg,image/png"
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}

function Casilla({ marcada, onChange, label }: { marcada: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-start gap-3 rounded-xl ring-1 ring-slate-200 bg-white px-3.5 py-3 cursor-pointer hover:bg-slate-50 transition">
      <input
        type="checkbox"
        checked={marcada}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 accent-[#073299] shrink-0"
      />
      <span className="text-sm text-slate-700 leading-snug">{label}</span>
    </label>
  );
}

/** "CADENAS ALVARADO LESLIE YASMIT" → "Leslie" (en el Excel van primero los dos apellidos) */
function primerNombre(nombresCompletos: string): string {
  const partes = nombresCompletos.trim().split(/\s+/);
  const nombre = (partes.length > 2 ? partes[2] : partes[1]) ?? partes[0] ?? '';
  return nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
}
