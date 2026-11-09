import { useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  Loader2,
  Minus,
  Monitor,
  AlertCircle,
  CalendarClock,
  Paperclip,
  X,
  PenLine,
  FileSpreadsheet,
  Download,
  ExternalLink,
  FolderCheck,
} from 'lucide-react';
import {
  COMPARATIVA,
  NOTA_COSTOS,
  descuentoVigente,
  iconoPlan,
  type PlanOpcion,
  type PlanOpcionId,
} from '../data/planesComputacion';
import { registrarSolicitud, revisarAdjunto, subirAdjunto } from '../services/solicitudesService';
import {
  GEX_DRIVE_FOLDER_ID,
  GEX_DRIVE_FOLDER_NAME,
  GEX_DRIVE_FOLDER_PATH,
  GEX_DRIVE_FOLDER_URL,
  construirFilaSolicitud,
  descargarExcelSolicitud,
  descargarExcelConsolidado,
  guardarSolicitudEnHistorial,
  obtenerSolicitudesGuardadas,
  sincronizarSolicitudConGoogleDrive,
  type FilaSolicitudGEX,
} from '../services/driveSolicitudesService';
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
  // En 2 columnas no hay subgrid: si una tarjeta trae descuento, todas reservan su alto en el precio
  const conDescuento = planes.some((p) => descuentoVigente(p));

  return (
    // En xl las tarjetas se estiran hasta el pie si sobra alto; si no caben, la página hace scroll
    // (con el comparativo ya no entran en una laptop baja sin esconder las etapas y requisitos).
    <div className="flex flex-col gap-8 sm:gap-10 xl:gap-4 xl:flex-1">
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

      {/* xl: filas compartidas con subgrid (encabezado, precio, botón, una por fila del comparativo,
          detalle y documento), para que las 4 tarjetas queden alineadas como una tabla de precios */}
      <div
        className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:grid-rows-[auto_auto_auto_repeat(var(--filas),auto)_1fr_auto] xl:gap-x-4 xl:gap-y-0 items-stretch pt-2 xl:pt-3 xl:flex-1"
        // Cada tarjeta ocupa las filas del comparativo más las 5 fijas
        style={{ '--filas': COMPARATIVA.length, '--filas-tarjeta': COMPARATIVA.length + 5 } as CSSProperties}
      >
        {planes.map((p, i) => (
          <TarjetaPlan key={p.id} plan={p} numero={i + 1} reservarDescuento={conDescuento} onElegir={() => onPlan(p.id)} />
        ))}
      </div>

      <p className="text-center text-xs text-slate-400 shrink-0">{NOTA_COSTOS}</p>
    </div>
  );
}

/** Tarjeta de un plan al estilo de una página de precios. Sin onElegir sirve de resumen del plan elegido. */
function TarjetaPlan({
  plan,
  numero,
  reservarDescuento,
  onElegir,
  compacto,
}: {
  plan: PlanOpcion;
  numero?: number;
  reservarDescuento?: boolean;
  onElegir?: () => void;
  compacto?: boolean;
}) {
  const Icon = iconoPlan(plan.icono);
  const destacado = !!plan.insignia && !!onElegir;
  const descuento = descuentoVigente(plan);

  // En la lista (xl) la tarjeta ocupa todas las filas del subgrid; como resumen del plan elegido es una columna normal
  const enLista = !!onElegir;
  const conExamen = plan.id !== 'convalidacion';
  const conDetalle = plan.etapas.length > 0 || plan.requisitos.length > 0;

  // En la lista van todas las filas (las que no aplican con "–"); en el resumen, solo lo que incluye
  const comparativo = COMPARATIVA.map((fila) => {
    const valor = fila.planes[plan.id];
    return { texto: typeof valor === 'string' ? valor : fila.texto, incluido: !!valor };
  }).filter((fila) => enLista || fila.incluido);

  if (compacto) {
    return (
      <article className="rounded-2xl bg-white p-3.5 sm:p-4 ring-1 ring-slate-200/90 shadow-sm space-y-2.5">
        {/* Encabezado */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${plan.acento}14`, color: plan.acento }}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-none">
                Plan elegido
              </span>
              <h3 className="text-sm font-black text-slate-900 leading-tight truncate">{plan.nombre}</h3>
            </div>
          </div>
          <span
            className="shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: `${plan.acento}14`, color: plan.acento }}
          >
            {conExamen ? <PenLine className="w-2.5 h-2.5" /> : <Paperclip className="w-2.5 h-2.5" />}
            {conExamen ? 'Examen' : 'Archivo'}
          </span>
        </div>

        {/* Precio */}
        <div className="bg-slate-50/90 rounded-xl p-2.5 ring-1 ring-slate-100 flex items-baseline justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900 leading-none">
                {descuento?.precioFinal ?? plan.precio}
              </span>
              {descuento && (
                <span className="rounded-full bg-rose-600 px-1.5 py-0.2 text-[9px] font-extrabold text-white">
                  -{descuento.porcentaje}%
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">{plan.precioNota}</p>
          </div>
          {plan.insignia && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shrink-0"
              style={{ backgroundColor: plan.acento }}
            >
              {plan.insignia}
            </span>
          )}
        </div>

        {/* Incluye / Beneficios principales */}
        <ul className="space-y-1 text-slate-600">
          {comparativo.slice(0, 3).map((fila) => (
            <li key={fila.texto} className="flex items-start gap-1.5 text-[11px] leading-snug">
              <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: plan.acento }} />
              <span className="line-clamp-1">{fila.texto}</span>
            </li>
          ))}
        </ul>

        {/* Etapas en miniatura */}
        {plan.etapas.length > 0 && (
          <div className="border-t border-slate-100 pt-2 space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Cronograma</span>
            <div className="grid grid-cols-3 gap-1">
              {plan.etapas.map((etapa) => (
                <div key={etapa.periodo} className="bg-slate-50 rounded-lg p-1 text-center min-w-0">
                  <span className="text-[10px] font-bold text-slate-800 block leading-tight truncate">
                    {etapa.duracion}
                  </span>
                  <span className="text-[9px] text-slate-500 block leading-tight truncate">
                    {etapa.costo}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documento */}
        <div className="border-t border-slate-100 pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
          <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{plan.documento}</span>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`relative flex flex-col rounded-3xl bg-white p-5 sm:p-6 ring-1 ring-slate-200 shadow-sm ${
        enLista ? 'xl:[grid-row:span_var(--filas-tarjeta)] xl:grid xl:grid-rows-subgrid xl:p-4' : ''
      }`}
      style={destacado ? { boxShadow: `0 0 0 2px ${plan.acento}, 0 10px 30px -12px ${plan.acento}55` } : undefined}
    >
      {/* Número de opción en la lista; el borde de color sigue marcando al plan con insignia */}
      {enLista && numero && (
        <span
          className="absolute -top-3 left-6 rounded-full px-3 py-1 text-[11px] font-bold text-white shadow-sm"
          style={{ backgroundColor: plan.acento }}
        >
          Opción {numero}
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
          {/* Todas se acreditan con examen menos la convalidación, que pide el archivo del estudiante */}
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

      {/* 2. Precio; con descuento vigente, como una página de precios: el regular tachado, el % y hasta cuándo.
          Va en las mismas dos líneas que sin descuento, para que el menú siga entrando en 1920×945. */}
      <div
        className={`mt-4 ${
          enLista ? `${reservarDescuento ? 'sm:min-h-[5.5rem]' : 'sm:min-h-[4.25rem]'} xl:min-h-0 xl:mt-3` : ''
        }`}
      >
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className={`text-3xl font-black tracking-tight text-slate-900 leading-none ${enLista ? 'xl:text-2xl' : ''}`}>
            {descuento?.precioFinal && <span className="sr-only">Con descuento: </span>}
            {descuento?.precioFinal ?? plan.precio}
          </p>
          {descuento?.precioFinal && (
            <s className="text-base font-semibold text-slate-400">
              <span className="sr-only">Precio regular: </span>
              {plan.precio}
            </s>
          )}
          {descuento && (
            <span className="self-center rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-extrabold text-white">
              -{descuento.porcentaje}%
            </span>
          )}
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          {plan.precioNota}
          {descuento && (
            <>
              {plan.precioNota && ' · '}
              <span className="font-bold text-rose-700 whitespace-nowrap">Válido hasta {descuento.hasta}</span>
            </>
          )}
        </p>
      </div>

      {/* 3. Botón */}
      {enLista && (
        <button
          type="button"
          onClick={onElegir}
          className="mt-5 xl:mt-3 h-11 xl:h-10 w-full rounded-xl text-sm font-bold text-white inline-flex items-center justify-center gap-1.5 transition hover:brightness-110 cursor-pointer"
          style={{ backgroundColor: plan.acento }}
        >
          {conExamen ? 'Inscribirme' : 'Enviar mi archivo'}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}

      {/* 4. Comparativo: una fila del subgrid por cada una, así quedan a la misma altura en las 4 tarjetas */}
      <ul
        className={`mt-5 ${enLista ? 'xl:mt-3 xl:[grid-row:span_var(--filas)] xl:grid xl:grid-rows-subgrid' : 'space-y-1'}`}
      >
        {comparativo.map((fila) => (
          <li
            key={fila.texto}
            className={`flex items-start gap-2 py-1 text-sm leading-snug ${enLista ? 'xl:py-[3px] xl:text-[13px]' : ''} ${
              fila.incluido ? 'text-slate-700' : 'text-slate-400'
            }`}
          >
            {fila.incluido ? (
              <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: plan.acento }} />
            ) : (
              <Minus className="w-4 h-4 mt-0.5 shrink-0 text-slate-300" />
            )}
            {fila.texto}
          </li>
        ))}
      </ul>

      {/* 5. Detalle: etapas o requisitos; es la fila que se estira si sobra alto */}
      <div
        className={`space-y-4 flex-1 ${conDetalle ? 'mt-5 pt-5 border-t border-slate-100' : ''} ${
          enLista ? `xl:space-y-3 ${conDetalle ? 'xl:mt-3 xl:pt-3' : ''}` : ''
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
      </div>

      {/* 6. Documento */}
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

// Las opciones 1, 2 y 4 son la inscripción: el estudiante deja sus datos y el Centro de
// Informática le programa la fecha. Convalidación (opción 3) se registra con el archivo del estudiante.
const DECLARACION: Partial<Record<PlanOpcionId, string>> = {
  validacion: 'Declaro que no estoy matriculado en el curso de Computación.',
};

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
  const [enviando, setEnviando] = useState<'' | 'subiendo' | 'registrando' | 'excel' | 'drive'>('');
  const [enviada, setEnviada] = useState(() => yaEnviada(estudiante?.codUniv, plan.id));
  const [error, setError] = useState('');
  const [filaGenerada, setFilaGenerada] = useState<FilaSolicitudGEX | null>(null);

  // Sin estudiante elegido (se entró desde la portada) se identifica por su código en el Excel GEX
  const alumno = estudiante ?? estudiantes.find((e) => e.codUniv === codigo.trim()) ?? null;
  const esExamen = plan.id !== 'convalidacion';
  const declaracion = DECLARACION[plan.id];

  const getFilaActual = (): FilaSolicitudGEX => {
    if (filaGenerada) return filaGenerada;
    const guardadas = obtenerSolicitudesGuardadas();
    const encontrada = guardadas.find(
      (f) => f['Código Universitario'] === alumno?.codUniv && f['ID Plan'] === plan.id
    );
    if (encontrada) return encontrada;
    return construirFilaSolicitud({
      alumno: alumno || {
        item: 1,
        condicionEstudio: 'Gente con Experiencia',
        campus: 'Chiclayo',
        escuela: '—',
        seuss: '—',
        codUniv: codigo || 'USS',
        nombres: 'Estudiante GEX',
        nCicCodigo: 0,
        ingreso: '—',
        egreso: '—',
        modalidad: 'Virtual',
        computacionI: 0,
        computacionII: 0,
        computacionIII: 0,
        generico: 0,
        especifico: 0,
        taller: 0,
        correoInstitucional: '—',
      },
      plan,
      celular: celular || '—',
      correoPersonal: correoPersonal || '—',
      esExamen,
      declaracion,
    });
  };

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

      // 1. Construir fila de la solicitud con todos los atributos requeridos
      const fila = construirFilaSolicitud({
        alumno,
        plan,
        celular,
        correoPersonal,
        esExamen,
        adjunto,
        declaracion,
      });

      // 2. Registrar en Supabase (tbl_gex_solicitudes)
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
          carpetaDriveId: GEX_DRIVE_FOLDER_ID,
          carpetaDriveNombre: GEX_DRIVE_FOLDER_NAME,
          marcaTemporal: fila['Marca temporal'],
        },
        adjunto,
      });

      // 3. Generar y descargar automáticamente el archivo Excel (.xlsx)
      setEnviando('excel');
      descargarExcelSolicitud(fila);

      // 4. Acumular en historial local para respaldo y consolidado
      guardarSolicitudEnHistorial(fila);
      setFilaGenerada(fila);

      // 5. Enviar al Webhook de Google Apps Script vinculado a la carpeta BDSolicitudes-Gex
      setEnviando('drive');
      sincronizarSolicitudConGoogleDrive(fila).catch((err) =>
        console.warn('Error en webhook de Drive:', err)
      );

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
    <div className="max-w-5xl mx-auto w-full">
      <button
        type="button"
        onClick={onVolver}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-uss-blue transition cursor-pointer mb-2.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Ver todos los planes
      </button>

      <div className="grid gap-3.5 lg:grid-cols-[minmax(0,290px)_minmax(0,1fr)] items-start">
        <div className="lg:sticky lg:top-14">
          <TarjetaPlan plan={plan} compacto />
        </div>

        {enviada ? (
          <section className="bg-white rounded-2xl ring-1 ring-emerald-200 shadow-sm p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 ring-1 ring-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                  {esExamen ? 'Inscripción al examen registrada' : 'Solicitud de convalidación registrada'}
                </h2>
                <p className="text-xs text-slate-600 truncate">
                  {esExamen ? 'Te inscribimos a ' : 'Recibimos tu solicitud para '}
                  <strong>{plan.nombre}</strong>
                  {alumno && ` (${alumno.nombres}, ${alumno.codUniv})`}
                </p>
              </div>
            </div>

            {/* Tarjeta de Confirmación de Excel y Google Drive */}
            <div className="mt-4 rounded-xl bg-gradient-to-br from-blue-50/80 via-white to-slate-50 ring-1 ring-blue-100 p-3.5 sm:p-4 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100/70 pb-2">
                <div className="flex items-center gap-2 text-uss-blue">
                  <div className="w-7 h-7 rounded-lg bg-blue-100/70 text-uss-blue flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-none">
                      Excel Generado y Vinculado a Google Drive
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      CINF GEX &bull; {GEX_DRIVE_FOLDER_NAME}
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200">
                  <FolderCheck className="w-3 h-3" />
                  Listo en Drive
                </span>
              </div>

              <div className="grid gap-1.5 text-xs text-slate-600 bg-white/70 rounded-lg p-2.5 ring-1 ring-slate-100">
                <p className="flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-slate-700 shrink-0">Carpeta Drive:</span>
                  <span className="font-mono text-slate-600 truncate">{GEX_DRIVE_FOLDER_PATH}</span>
                </p>
                <p className="flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-slate-700 shrink-0">Archivo Excel:</span>
                  <span className="font-mono text-uss-blue font-bold truncate">
                    BDSolicitudes_GEX_{alumno?.codUniv || 'USS'}_{plan.id}.xlsx
                  </span>
                </p>
                <p className="flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-slate-700 shrink-0">Marca temporal:</span>
                  <span>{getFilaActual()['Marca temporal']}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => descargarExcelSolicitud(getFilaActual())}
                  className="h-9 px-3.5 rounded-xl bg-uss-blue hover:bg-blue-800 text-white text-xs font-bold inline-flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar Excel (.xlsx)
                </button>

                <a
                  href={GEX_DRIVE_FOLDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 px-3.5 rounded-xl bg-white ring-1 ring-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  Abrir carpeta en Google Drive
                </a>

                {obtenerSolicitudesGuardadas().length > 1 && (
                  <button
                    type="button"
                    onClick={() => descargarExcelConsolidado(obtenerSolicitudesGuardadas())}
                    className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3 h-3 text-slate-500" />
                    Consolidado ({obtenerSolicitudesGuardadas().length})
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3.5 border-t border-slate-100 pt-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Próximos pasos</h3>
              <ol className="mt-1.5 space-y-1.5">
                {plan.proceso.map((p, i) => (
                  <li key={p} className="flex items-start gap-2 text-xs text-slate-700">
                    <span
                      className="w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: plan.acento }}
                    >
                      {i + 1}
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[11px] text-slate-500">
                ¿Dudas? WhatsApp 986 724 506 &bull; cinf@uss.edu.pe
              </p>
              <button
                type="button"
                onClick={onVolver}
                className="h-8 px-3.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                Ver todos los planes
              </button>
            </div>
          </section>
        ) : (
          <form
            onSubmit={enviar}
            noValidate
            className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-3.5 sm:p-4.5 space-y-3"
          >
            {/* Cabecera del formulario */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: plan.acento }} />
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight truncate">
                  Registro &bull; {plan.nombre}
                </h2>
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                {esExamen ? 'Examen CINF' : 'Convalidación'}
              </span>
            </div>

            {/* Paso 1: Tus datos */}
            <section className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <span
                    className="w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                    style={{ backgroundColor: plan.acento }}
                  >
                    1
                  </span>
                  Tus datos académicos
                </h3>
                <span className="text-[10px] text-slate-400">Padrón oficial GEX</span>
              </div>

              {!estudiante && (
                <label className="block">
                  <input
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                    inputMode="numeric"
                    maxLength={12}
                    placeholder="Ingresa tu código universitario (ej. 2251804844)"
                    className="w-full h-8.5 rounded-lg border border-slate-300 bg-white px-3 text-xs sm:text-sm font-mono placeholder:text-slate-400 outline-none transition focus:border-uss-blue focus:ring-2 focus:ring-uss-blue/15"
                  />
                  {codigo.trim().length >= 10 && !alumno && (
                    <span className="mt-1 block text-[11px] text-amber-700">Ese código no está registrado en GEX.</span>
                  )}
                </label>
              )}

              {alumno && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-50 rounded-xl p-2.5 ring-1 ring-slate-200/80">
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Código</span>
                    <span className="text-xs font-bold text-slate-900 font-mono block truncate">{alumno.codUniv}</span>
                  </div>
                  <div className="min-w-0 sm:col-span-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Estudiante</span>
                    <span className="text-xs font-bold text-slate-900 block truncate" title={alumno.nombres}>
                      {alumno.nombres}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Escuela</span>
                    <span className="text-xs font-semibold text-slate-800 block truncate" title={alumno.escuela || '—'}>
                      {alumno.escuela || '—'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Correo USS</span>
                    <span className="text-xs font-semibold text-slate-800 block truncate" title={alumno.correoInstitucional || '—'}>
                      {alumno.correoInstitucional || '—'}
                    </span>
                  </div>
                </div>
              )}
            </section>

            {/* Paso 2: Contacto */}
            <section className="space-y-1">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                <span
                  className="w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                  style={{ backgroundColor: plan.acento }}
                >
                  2
                </span>
                Datos de contacto
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                    Celular <span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={celular}
                    onChange={(e) => setCelular(e.target.value.replace(/\D/g, ''))}
                    inputMode="tel"
                    maxLength={9}
                    placeholder="9XX XXX XXX"
                    className="w-full h-8.5 rounded-lg border border-slate-300 bg-white px-2.5 text-xs sm:text-sm font-mono placeholder:text-slate-400 outline-none transition focus:border-uss-blue focus:ring-2 focus:ring-uss-blue/15"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                    Correo personal <span className="text-slate-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="email"
                    value={correoPersonal}
                    onChange={(e) => setCorreoPersonal(e.target.value)}
                    maxLength={120}
                    placeholder="nombre@gmail.com"
                    className="w-full h-8.5 rounded-lg border border-slate-300 bg-white px-2.5 text-xs sm:text-sm placeholder:text-slate-400 outline-none transition focus:border-uss-blue focus:ring-2 focus:ring-uss-blue/15"
                  />
                </div>
              </div>
            </section>

            {/* Paso 3: Examen / Archivo */}
            <section className="space-y-1">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                <span
                  className="w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                  style={{ backgroundColor: plan.acento }}
                >
                  3
                </span>
                {esExamen ? 'Programación del examen' : 'Documento a convalidar'}
              </h3>

              {esExamen ? (
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 ring-1 ring-slate-200/80 px-3 py-2 text-xs text-slate-600">
                  <CalendarClock className="w-4 h-4 shrink-0 text-uss-blue" />
                  <span>
                    Te inscribes al examen de <strong>{plan.nombre}</strong>. El Centro de Informática programará la fecha y te notificará por WhatsApp/correo.
                  </span>
                </div>
              ) : (
                <SelectorArchivo archivo={archivo} onChange={setArchivo} color={plan.acento} />
              )}
              {declaracion && <Casilla marcada={declara} onChange={setDeclara} label={declaracion} />}
            </section>

            {/* Paso 4: Confirmación y Envío */}
            <section className="space-y-2 pt-1 border-t border-slate-100">
              <label className="flex items-start gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 cursor-pointer hover:bg-slate-100/70 transition">
                <input
                  type="checkbox"
                  checked={autoriza}
                  onChange={(e) => setAutoriza(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#073299] shrink-0"
                />
                <span className="text-[11px] sm:text-xs text-slate-700 leading-snug">
                  Autorizo al Centro de Informática USS a usar estos datos para gestionar mi solicitud y generar mi registro en Excel/Drive.
                </span>
              </label>

              {error && (
                <p role="alert" className="flex items-center gap-1.5 rounded-lg bg-red-50 ring-1 ring-red-200 px-3 py-1.5 text-xs text-red-700">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                <span className="text-[10px] text-slate-400">
                  Destino: <strong>BDSolicitudes-Gex</strong> (Drive y Excel)
                </span>

                <button
                  type="submit"
                  disabled={!!enviando}
                  className="h-9 sm:h-10 px-5 rounded-xl text-xs sm:text-sm font-bold text-white inline-flex items-center justify-center gap-2 transition hover:brightness-110 disabled:opacity-60 cursor-pointer shadow-md"
                  style={{ backgroundColor: plan.acento }}
                >
                  {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {enviando === 'subiendo'
                    ? 'Subiendo archivo…'
                    : enviando === 'registrando'
                    ? 'Registrando solicitud…'
                    : enviando === 'excel'
                    ? 'Generando Excel…'
                    : enviando === 'drive'
                    ? 'Sincronizando con Drive…'
                    : esExamen
                    ? 'Inscribirme'
                    : 'Enviar solicitud de convalidación'}
                </button>
              </div>
            </section>
          </form>
        )}
      </div>
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
      <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ring-1 ${problema ? 'ring-red-200 bg-red-50' : 'ring-slate-200 bg-slate-50'}`}>
        <Paperclip className="w-4 h-4 shrink-0" style={{ color }} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-800 truncate">{archivo.name}</p>
          <p className={`text-[10px] ${problema ? 'text-red-700' : 'text-slate-500'}`}>
            {problema ||
              (archivo.size < 1024 * 1024
                ? `${Math.max(1, Math.round(archivo.size / 1024))} KB`
                : `${(archivo.size / 1024 / 1024).toFixed(1)} MB`)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-800 transition cursor-pointer"
          aria-label="Quitar archivo"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/60 px-3 py-2.5 text-center cursor-pointer transition">
      <Paperclip className="w-4 h-4 text-slate-500 shrink-0" style={{ color }} />
      <span className="text-xs font-semibold text-slate-800">Adjunta certificado o constancia</span>
      <span className="text-[10px] text-slate-400">(PDF, JPG o PNG hasta 5 MB)</span>
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
    <label className="flex items-start gap-2.5 rounded-lg ring-1 ring-slate-200 bg-white px-3 py-2 cursor-pointer hover:bg-slate-50 transition">
      <input
        type="checkbox"
        checked={marcada}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-3.5 h-3.5 accent-[#073299] shrink-0"
      />
      <span className="text-xs text-slate-700 leading-snug">{label}</span>
    </label>
  );
}

/** "CADENAS ALVARADO LESLIE YASMIT" → "Leslie" (en el Excel van primero los dos apellidos) */
function primerNombre(nombresCompletos: string): string {
  const partes = nombresCompletos.trim().split(/\s+/);
  const nombre = (partes.length > 2 ? partes[2] : partes[1]) ?? partes[0] ?? '';
  return nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
}
