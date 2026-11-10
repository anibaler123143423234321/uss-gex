import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import {
  ArrowRight,
  Award,
  Check,
  Minus,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Monitor,
  AlertCircle,
  Paperclip,
  X,
  Info,
} from 'lucide-react';
import {
  COMPARATIVA,
  CONTACTO_CINF,
  DOCUMENTOS_PLAN,
  MODALIDAD,
  NOTA_COSTOS,
  PLAZO_SOLICITUD,
  POLITICAS_GEX,
  descuentoVigente,
  iconoPlan,
  type DocumentoPlan,
  type PlanOpcion,
  type PlanOpcionId,
} from '../data/planesComputacion';
import { registrarSolicitud, revisarAdjunto, subirAdjunto, type Adjunto } from '../services/solicitudesService';
import {
  GEX_DRIVE_FOLDER_ID,
  GEX_DRIVE_FOLDER_NAME,
  construirFilaSolicitud,
  sincronizarSolicitudConGoogleDrive,
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

  // Al pasar de la lista al registro (o volver) se empieza desde arriba; en escritorio el scroll
  // no es de la ventana sino del contenedor del <main> (ver App)
  useEffect(() => {
    window.scrollTo({ top: 0 });
    document.querySelector('main')?.parentElement?.scrollTo({ top: 0 });
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
    <div className="flex flex-col gap-8">
      <div className="max-w-2xl">
        <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-uss-blue">
          <Monitor className="w-4 h-4" />
          Acreditación en Computación
        </p>
        <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
          {/* El saludo va aparte: el título lo escribe el panel y no siempre admite anteponer un nombre */}
          {nombre && <span className="block text-base font-semibold text-slate-500">Hola, {nombre}</span>}
          {titulo || 'Elige cómo acreditar Computación'}
        </h2>
        {subtitulo && <p className="mt-2 text-sm sm:text-base text-slate-600">{subtitulo}</p>}
      </div>

      {/* xl: las 4 tarjetas comparten filas (subgrid): encabezado, precio, botón, una por fila del
          comparativo, detalle y documento. Así el comparativo se lee en horizontal, como una tabla */}
      <div
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:grid-rows-[auto_auto_auto_auto_repeat(var(--filas),auto)_1fr_auto] xl:gap-y-0"
        // Cada tarjeta ocupa las filas del comparativo más las 6 fijas (con el título "Incluye")
        style={{ '--filas': COMPARATIVA.length, '--filas-tarjeta': COMPARATIVA.length + 6 } as CSSProperties}
      >
        {planes.map((p, i) => (
          <TarjetaPlan key={p.id} plan={p} numero={i + 1} onElegir={() => onPlan(p.id)} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section className="rounded-2xl bg-white ring-1 ring-slate-200 p-5 sm:p-6">
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Info className="w-5 h-5 text-uss-blue" />
            Antes de registrarte
          </h3>
          <ul className="mt-3 space-y-2">
            {POLITICAS_GEX.map((politica) => (
              <li key={politica} className="flex items-start gap-2.5 text-sm text-slate-700 leading-snug">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-uss-blue shrink-0" />
                {politica}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-white ring-1 ring-slate-200 p-5 sm:p-6">
          <h3 className="text-base font-bold text-slate-900">Atención del Centro de Informática</h3>
          <ul className="mt-3 space-y-2.5 text-sm text-slate-700">
            <li className="flex items-start gap-2.5">
              <MessageCircle className="w-4 h-4 mt-0.5 text-uss-blue shrink-0" />
              <a
                href={CONTACTO_CINF.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-uss-blue hover:underline"
              >
                WhatsApp {CONTACTO_CINF.whatsapp}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 mt-0.5 text-uss-blue shrink-0" />
              <a href={`mailto:${CONTACTO_CINF.correo}`} className="font-semibold text-uss-blue hover:underline break-all">
                {CONTACTO_CINF.correo}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
              {CONTACTO_CINF.direccion}
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
              {CONTACTO_CINF.horario}
            </li>
          </ul>
        </section>
      </div>

      <p className="text-xs text-slate-500">{NOTA_COSTOS}</p>
    </div>
  );
}

/** Precio del plan; con descuento vigente muestra el regular tachado, el % y hasta cuándo */
function PrecioPlan({ plan }: { plan: PlanOpcion }) {
  const descuento = descuentoVigente(plan);
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="text-3xl font-extrabold tracking-tight text-slate-900 leading-none">
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
          <span className="self-center rounded-md bg-rose-600 px-1.5 py-0.5 text-xs font-bold text-white">
            -{descuento.porcentaje}%
          </span>
        )}
      </div>
      <p className="mt-1.5 text-sm text-slate-500">
        {plan.precioNota}
        {descuento && (
          <>
            {plan.precioNota && ' · '}
            <span className="font-semibold text-rose-700 whitespace-nowrap">Válido hasta {descuento.hasta}</span>
          </>
        )}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-700">Solicitudes {PLAZO_SOLICITUD}</p>
    </div>
  );
}

/** Etapas del plan como línea de tiempo: periodo y costo a la vista, el detalle debajo */
function EtapasPlan({ plan }: { plan: PlanOpcion }) {
  return (
    <ol className="space-y-3">
      {plan.etapas.map((etapa, i) => (
        <li key={etapa.periodo} className="relative flex gap-3">
          {i < plan.etapas.length - 1 && (
            <span className="absolute left-[5px] top-4 -bottom-3 w-px bg-slate-200" aria-hidden="true" />
          )}
          <span
            className="relative mt-1.5 w-[11px] h-[11px] rounded-full ring-2 ring-white shrink-0"
            style={{ backgroundColor: plan.acento }}
          />
          <div className="min-w-0 flex-1 text-sm leading-snug">
            <p className="flex flex-wrap justify-between gap-x-3 font-semibold text-slate-900">
              <span>{etapa.periodo}</span>
              <span>{etapa.costo}</span>
            </p>
            <p className="text-slate-500">{etapa.detalle}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function TituloSeccion({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{children}</p>;
}

/** Tarjeta de un plan en la lista: en xl ocupa todas las filas compartidas del subgrid */
function TarjetaPlan({ plan, numero, onElegir }: { plan: PlanOpcion; numero: number; onElegir: () => void }) {
  const Icon = iconoPlan(plan.icono);
  const destacado = !!plan.insignia;
  const conDetalle = plan.etapas.length > 0 || plan.requisitos.length > 0;

  return (
    <article
      className={`relative flex flex-col rounded-2xl bg-white p-5 xl:[grid-row:span_var(--filas-tarjeta)] xl:grid xl:grid-rows-subgrid xl:gap-y-0 ${
        destacado ? 'ring-2 shadow-lg shadow-slate-900/5' : 'ring-1 ring-slate-200'
      }`}
      style={destacado ? ({ '--tw-ring-color': plan.acento } as CSSProperties) : undefined}
    >
      {/* 1. Encabezado */}
      <div>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${plan.acento}14`, color: plan.acento }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: plan.acento }}>
              Opción {numero}
            </p>
            <p className="text-xs text-slate-500 truncate">{plan.etiqueta}</p>
          </div>
          {plan.insignia && (
            <span
              className="ml-auto shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
              style={{ backgroundColor: plan.acento }}
            >
              {plan.insignia}
            </span>
          )}
        </div>
        <h3 className="mt-4 text-xl font-extrabold text-slate-900 leading-tight">{plan.nombre}</h3>
        <p className="mt-1.5 text-sm text-slate-600 leading-snug">{plan.resumen}</p>
      </div>

      {/* 2. Precio */}
      <div className="mt-5">
        <PrecioPlan plan={plan} />
      </div>

      {/* 3. Botón: solo el plan destacado va relleno, para que la página no compita en 4 colores */}
      <button
        type="button"
        onClick={onElegir}
        className={`mt-5 h-11 w-full rounded-xl text-sm font-bold inline-flex items-center justify-center gap-1.5 transition cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uss-blue ${
          destacado
            ? 'text-white hover:brightness-110'
            : 'bg-white text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50 hover:ring-slate-400'
        }`}
        style={destacado ? { backgroundColor: plan.acento } : undefined}
      >
        {plan.id === 'convalidacion' ? 'Enviar mis documentos' : 'Inscribirme'}
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* 4. Comparativo: las mismas filas en las 4 tarjetas; lo que el plan no trae va con guion */}
      <div className="mt-6">
        <TituloSeccion>Incluye</TituloSeccion>
      </div>
      <ul className="xl:[grid-row:span_var(--filas)] xl:grid xl:grid-rows-subgrid">
        {COMPARATIVA.map((fila) => {
          const valor = fila.planes[plan.id];
          return (
            <li
              key={fila.texto}
              className={`flex items-start gap-2 py-1 text-sm leading-snug ${valor ? 'text-slate-700' : 'text-slate-400'}`}
            >
              {valor ? (
                <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: plan.acento }} />
              ) : (
                <Minus className="w-4 h-4 mt-0.5 shrink-0 text-slate-300" />
              )}
              <span>
                {!valor && <span className="sr-only">No incluye: </span>}
                {typeof valor === 'string' ? valor : fila.texto}
              </span>
            </li>
          );
        })}
      </ul>

      {/* 5. Etapas o requisitos; es la fila que se estira si sobra alto */}
      <div className={`flex-1 mt-5 ${conDetalle ? 'pt-5 border-t border-slate-100' : ''}`}>
        {plan.etapas.length > 0 && (
          <>
            <TituloSeccion>Cronograma y costos</TituloSeccion>
            <EtapasPlan plan={plan} />
          </>
        )}
        {plan.requisitos.length > 0 && (
          <div className={plan.etapas.length > 0 ? 'mt-5' : ''}>
            <TituloSeccion>Requisitos</TituloSeccion>
            <ListaPuntos items={plan.requisitos} />
          </div>
        )}
        {/* Sin etapas ni requisitos (PROTECH XP) se muestra cómo funciona, para no dejar el espacio vacío */}
        {!conDetalle && plan.incluye.length > 0 && (
          <div className="pt-5 border-t border-slate-100">
            <TituloSeccion>Cómo funciona</TituloSeccion>
            <ListaPuntos items={plan.incluye} />
          </div>
        )}
      </div>

      {/* 6. Documento que obtiene */}
      <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5">
        <Award className="w-4 h-4 mt-0.5 shrink-0" style={{ color: plan.acento }} />
        <p className="text-sm leading-snug text-slate-700">
          <span className="block text-xs text-slate-500">Obtienes · {MODALIDAD[plan.id].corta}</span>
          <span className="font-semibold">{plan.documento}</span>
        </p>
      </div>
    </article>
  );
}

function ListaCheck({ items, color }: { items: string[]; color: string }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-slate-700 leading-snug">
          <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color }} />
          {item}
        </li>
      ))}
    </ul>
  );
}

// Los requisitos no son beneficios: van con punto, no con check
function ListaPuntos({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700 leading-snug">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Resumen del plan elegido, al lado del formulario de registro */
function ResumenPlan({ plan }: { plan: PlanOpcion }) {
  const Icon = iconoPlan(plan.icono);
  return (
    <aside className="rounded-2xl bg-white ring-1 ring-slate-200 p-5 space-y-4 divide-y divide-slate-100 [&>*:not(:first-child)]:pt-4">
      <div>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${plan.acento}14`, color: plan.acento }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Plan elegido</p>
            <h3 className="text-lg font-extrabold text-slate-900 leading-tight">{plan.nombre}</h3>
          </div>
        </div>
        <div className="mt-4">
          <PrecioPlan plan={plan} />
        </div>
      </div>

      {plan.etapas.length > 0 && (
        <div>
          <TituloSeccion>Cronograma y costos</TituloSeccion>
          <EtapasPlan plan={plan} />
        </div>
      )}

      {plan.requisitos.length > 0 && (
        <div>
          <TituloSeccion>Requisitos</TituloSeccion>
          <ListaPuntos items={plan.requisitos} />
        </div>
      )}

      {plan.incluye.length > 0 && (
        <div>
          <TituloSeccion>Incluye</TituloSeccion>
          <ListaCheck items={plan.incluye} color={plan.acento} />
        </div>
      )}

      <p className="flex items-start gap-2 text-sm font-semibold text-slate-700 leading-snug">
        <Award className="w-4 h-4 mt-0.5 shrink-0" style={{ color: plan.acento }} />
        {plan.documento}
      </p>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Registro
// ---------------------------------------------------------------------------

// Las opciones 1, 2 y 4 son la inscripción: el estudiante deja sus datos y el Centro de
// Informática le programa la fecha. Validación (2) y convalidación (3) piden además un archivo
// (ADJUNTO_PLAN): la solicitud y el pago, o el título y los sílabos.
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
  const [archivos, setArchivos] = useState<Record<string, File | null>>({});
  const [autoriza, setAutoriza] = useState(false);
  const [enviando, setEnviando] = useState<'' | 'subiendo' | 'registrando'>('');
  const [enviada, setEnviada] = useState(() => yaEnviada(estudiante?.codUniv, plan.id));
  const [error, setError] = useState('');

  // Sin estudiante elegido (se entró desde la portada) se identifica por su código en el Excel GEX
  const alumno = estudiante ?? estudiantes.find((e) => e.codUniv === codigo.trim()) ?? null;
  const esExamen = plan.id !== 'convalidacion';
  const declaracion = DECLARACION[plan.id];
  const documentos = DOCUMENTOS_PLAN[plan.id] ?? [];

  const validar = (): string => {
    if (!alumno) return 'Ingresa un código universitario registrado en GEX.';
    if (!/^9\d{8}$/.test(celular.trim())) return 'El celular debe tener 9 dígitos y empezar con 9.';
    if (declaracion && !declara) return `Marca: "${declaracion}"`;
    for (const doc of documentos) {
      const archivo = archivos[doc.clave];
      if (!archivo) {
        if (doc.obligatorio) return `Falta adjuntar: ${doc.etiqueta} (PDF, JPG o PNG, hasta 5 MB).`;
        continue;
      }
      const problemaArchivo = revisarAdjunto(archivo);
      if (problemaArchivo) return `${doc.etiqueta}: ${problemaArchivo}`;
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
      // Se suben uno por uno: si alguno falla no se registra una solicitud a medias
      const adjuntos: (Adjunto & { clave: string; etiqueta: string })[] = [];
      for (const doc of documentos) {
        const archivo = archivos[doc.clave];
        if (!archivo) continue;
        setEnviando('subiendo');
        adjuntos.push({ clave: doc.clave, etiqueta: doc.etiqueta, ...(await subirAdjunto(alumno.codUniv, archivo)) });
      }
      // La tabla guarda un archivo en columnas (el primero); la lista completa viaja en datos.adjuntos
      const adjunto: Adjunto | undefined = adjuntos[0];
      // En el Excel van todos los nombres en la misma celda
      const adjuntoFila = adjunto && { ...adjunto, nombre: adjuntos.map((a) => `${a.etiqueta}: ${a.nombre}`).join(' | ') };

      // 1. Construir fila de la solicitud con todos los atributos requeridos
      const fila = construirFilaSolicitud({
        alumno,
        plan,
        celular,
        correoPersonal,
        esExamen,
        adjunto: adjuntoFila,
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
          // Nombres recortados: datos tiene un tope de 4 KB en la tabla
          ...(adjuntos.length ? { adjuntos: adjuntos.map((a) => ({ ...a, nombre: a.nombre.slice(0, 80) })) } : {}),
          autorizaDatos: true,
          carpetaDriveId: GEX_DRIVE_FOLDER_ID,
          carpetaDriveNombre: GEX_DRIVE_FOLDER_NAME,
          marcaTemporal: fila['Fecha y Hora'],
        },
        adjunto,
      });

      // 3. Agregar la fila a la hoja de Drive del centro. No bloquea: la solicitud ya quedó en el
      // panel; si Drive falla se deja el motivo en la consola para poder diagnosticarlo.
      sincronizarSolicitudConGoogleDrive(fila).then((r) => {
        if (!r.ok) console.warn('[GEX] No se guardó en Drive:', r.mensaje);
      });

      try {
        sessionStorage.setItem(claveEnviada(alumno.codUniv, plan.id), new Date().toISOString());
        sessionStorage.setItem(
          `gex.solicitud_detalle.${alumno.codUniv}`,
          JSON.stringify({
            id: Date.now(),
            cod_univ: alumno.codUniv,
            plan: plan.id,
            estado: 'solicitada',
            paso: 1,
            comentario: 'Tu solicitud ha sido recibida con éxito y está en espera de revisión.',
            created_at: new Date().toISOString(),
            actualizado_en: new Date().toISOString(),
          })
        );
        window.dispatchEvent(new CustomEvent('gex_solicitud_actualizada'));
      } catch {
        // Sin sessionStorage solo se pierde el aviso tras un F5
      }
      setEnviada(true);
    } catch (e) {
      setError(`${(e as Error).message} Si persiste, escríbenos al WhatsApp ${CONTACTO_CINF.whatsapp}.`);
    } finally {
      setEnviando('');
    }
  };

  const INPUT =
    'w-full h-10 rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-uss-blue focus:ring-2 focus:ring-uss-blue/20';

  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] items-start">
        {/* En el celular el formulario va primero: el resumen ya se vio en la lista */}
        <div className="order-2 lg:order-1 lg:sticky lg:top-4">
          <ResumenPlan plan={plan} />
        </div>

        {enviada ? (
          <section className="order-1 lg:order-2 bg-white rounded-2xl ring-1 ring-slate-200 p-5 sm:p-7">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                  {esExamen ? 'Tu inscripción quedó registrada' : 'Recibimos tu solicitud de convalidación'}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  <strong className="font-semibold text-slate-900">{plan.nombre}</strong>
                  {alumno && ` · ${alumno.nombres} (${alumno.codUniv})`}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-base font-bold text-slate-900">Qué sigue</h3>
              <ol className="mt-3 space-y-3">
                {plan.proceso.map((p, i) => (
                  <li key={p} className="flex items-start gap-3 text-sm text-slate-700 leading-snug">
                    <span
                      className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
                      style={{ backgroundColor: plan.acento }}
                    >
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{p}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                ¿Dudas? WhatsApp{' '}
                <a
                  href={CONTACTO_CINF.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-uss-blue hover:underline"
                >
                  {CONTACTO_CINF.whatsapp}
                </a>{' '}
                · {CONTACTO_CINF.correo}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (alumno) {
                      try {
                        sessionStorage.removeItem(claveEnviada(alumno.codUniv, plan.id));
                        sessionStorage.removeItem(`gex.solicitud_detalle.${alumno.codUniv}`);
                        window.dispatchEvent(new CustomEvent('gex_solicitud_actualizada'));
                      } catch {
                        // ignore
                      }
                    }
                    setEnviada(false);
                  }}
                  className="h-10 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-sm font-bold text-slate-700 transition cursor-pointer"
                >
                  Nueva solicitud
                </button>
                <button
                  type="button"
                  onClick={onVolver}
                  className="h-10 px-5 rounded-xl bg-uss-blue hover:brightness-110 text-sm font-bold text-white transition cursor-pointer"
                >
                  Listo
                </button>
              </div>
            </div>
          </section>
        ) : (
          <form
            onSubmit={enviar}
            noValidate
            className="order-1 lg:order-2 bg-white rounded-2xl ring-1 ring-slate-200 divide-y divide-slate-100"
          >
            <div className="px-5 sm:px-6 py-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
              <h2 className="text-xl font-extrabold text-slate-900 leading-tight">{plan.nombre}</h2>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: plan.acento }}>
                {MODALIDAD[plan.id].registro}
              </p>
            </div>

            {/* 1. Datos del padrón */}
            <PasoRegistro numero={1} titulo="Tus datos" nota="Del padrón oficial GEX" color={plan.acento}>
              {!estudiante && (
                <div className="mb-3">
                  <label htmlFor="gex-codigo" className="block text-sm font-semibold text-slate-800 mb-1">
                    Código universitario
                  </label>
                  <input
                    id="gex-codigo"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                    inputMode="numeric"
                    maxLength={12}
                    placeholder="Ej. 2251804844"
                    className={INPUT}
                  />
                  {codigo.trim().length >= 10 && !alumno && (
                    <p className="mt-1.5 text-sm text-amber-700">Ese código no está registrado en GEX.</p>
                  )}
                </div>
              )}

              {alumno && (
                <div className="rounded-xl bg-slate-50 px-4 py-2.5">
                  <p className="text-sm font-bold text-slate-900 leading-snug">{alumno.nombres}</p>
                  <dl className="mt-1 grid gap-x-6 gap-y-2 sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,1.6fr)] text-sm">
                    <div className="min-w-0">
                      <dt className="text-xs text-slate-500">Código</dt>
                      <dd className="font-semibold text-slate-900 tabular-nums">{alumno.codUniv}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-slate-500">Escuela</dt>
                      <dd className="font-semibold text-slate-900 truncate" title={alumno.escuela || '—'}>
                        {alumno.escuela || '—'}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-slate-500">Correo USS</dt>
                      <dd className="font-semibold text-slate-900 truncate" title={alumno.correoInstitucional || '—'}>
                        {alumno.correoInstitucional || '—'}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
            </PasoRegistro>

            {/* 2. Contacto */}
            <PasoRegistro numero={2} titulo="Cómo te contactamos" color={plan.acento}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="gex-celular" className="block text-sm font-semibold text-slate-800 mb-1">
                    Celular
                  </label>
                  <input
                    id="gex-celular"
                    value={celular}
                    onChange={(e) => setCelular(e.target.value.replace(/\D/g, ''))}
                    inputMode="tel"
                    autoComplete="tel-national"
                    maxLength={9}
                    placeholder="9 dígitos"
                    className={`${INPUT} tabular-nums`}
                  />
                </div>
                <div>
                  <label htmlFor="gex-correo" className="block text-sm font-semibold text-slate-800 mb-1">
                    Correo personal <span className="font-normal text-slate-500">(opcional)</span>
                  </label>
                  <input
                    id="gex-correo"
                    type="email"
                    value={correoPersonal}
                    onChange={(e) => setCorreoPersonal(e.target.value)}
                    autoComplete="email"
                    maxLength={120}
                    placeholder="nombre@gmail.com"
                    className={INPUT}
                  />
                </div>
              </div>
            </PasoRegistro>

            {/* 3. Documentos (validación y convalidación) y lo que sigue; los requisitos van en el resumen del plan */}
            <PasoRegistro
              numero={3}
              titulo={documentos.length ? 'Tus documentos' : 'Qué sigue después de inscribirte'}
              nota={documentos.length ? 'PDF, JPG o PNG · hasta 5 MB cada uno' : undefined}
              color={plan.acento}
            >
              {documentos.length > 0 && (
                <div className="mb-2.5 grid gap-2 sm:grid-cols-2">
                  {documentos.map((doc) => (
                    <SelectorArchivo
                      key={doc.clave}
                      documento={doc}
                      archivo={archivos[doc.clave] ?? null}
                      onChange={(archivo) => setArchivos((previos) => ({ ...previos, [doc.clave]: archivo }))}
                      color={plan.acento}
                    />
                  ))}
                </div>
              )}

              {documentos.length > 0 && <p className="text-sm font-semibold text-slate-800 mb-1">Qué sigue</p>}
              {/* Con 4 pasos o más, o si además hay archivo, van en dos columnas: así el formulario entra en una pantalla */}
              <ol className={plan.proceso.length > 3 || documentos.length ? 'grid gap-x-6 gap-y-1.5 sm:grid-cols-2' : 'space-y-1.5'}>
                {plan.proceso.map((p, i) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-slate-700 leading-snug">
                    <span className="w-4 text-right font-semibold text-slate-400 tabular-nums shrink-0">{i + 1}.</span>
                    {p}
                  </li>
                ))}
              </ol>

              {declaracion && (
                <div className="mt-3">
                  <Casilla marcada={declara} onChange={setDeclara} label={declaracion} />
                </div>
              )}
            </PasoRegistro>

            {/* Confirmación y envío, en una fila para que el formulario entre en una pantalla */}
            <div className="px-5 sm:px-6 py-3 space-y-3">
              {error && (
                <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 ring-1 ring-red-200 px-3.5 py-2.5 text-sm text-red-800">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {error}
                </p>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Casilla
                  marcada={autoriza}
                  onChange={setAutoriza}
                  label="Autorizo al Centro de Informática USS a usar estos datos para gestionar mi solicitud."
                />
                <button
                  type="submit"
                  disabled={!!enviando}
                  className="h-11 px-6 rounded-xl text-sm font-bold text-white inline-flex items-center justify-center gap-2 transition hover:brightness-110 disabled:opacity-60 cursor-pointer shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uss-blue"
                  style={{ backgroundColor: plan.acento }}
                >
                  {enviando && <Loader2 className="w-4 h-4 animate-spin" />}
                  {enviando === 'subiendo'
                    ? 'Subiendo archivo…'
                    : enviando
                    ? 'Registrando…'
                    : esExamen
                    ? 'Inscribirme'
                    : 'Enviar solicitud'}
                  {!enviando && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function PasoRegistro({
  numero,
  titulo,
  nota,
  color,
  children,
}: {
  numero: number;
  titulo: string;
  nota?: string;
  color: string;
  children: ReactNode;
}) {
  return (
    <section className="px-5 sm:px-6 py-2.5">
      <div className="flex items-center gap-2.5 mb-2.5">
        <span
          className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
          style={{ backgroundColor: color }}
        >
          {numero}
        </span>
        <h3 className="text-base font-bold text-slate-900">{titulo}</h3>
        {nota && <span className="ml-auto text-xs text-slate-500">{nota}</span>}
      </div>
      {children}
    </section>
  );
}

/** Un archivo por documento requerido; en una sola línea para que varios entren en la pantalla */
function SelectorArchivo({
  documento,
  archivo,
  onChange,
  color,
}: {
  documento: DocumentoPlan;
  archivo: File | null;
  onChange: (archivo: File | null) => void;
  color: string;
}) {
  const problema = archivo ? revisarAdjunto(archivo) : '';
  const peso = archivo
    ? archivo.size < 1024 * 1024
      ? `${Math.max(1, Math.round(archivo.size / 1024))} KB`
      : `${(archivo.size / 1024 / 1024).toFixed(1)} MB`
    : '';

  if (archivo) {
    return (
      <div className={`flex items-center gap-2.5 rounded-xl px-3 py-1.5 ring-1 ${problema ? 'ring-red-200 bg-red-50' : 'ring-slate-200 bg-slate-50'}`}>
        {problema ? (
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
        ) : (
          <Check className="w-4 h-4 shrink-0" style={{ color }} />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 truncate">{documento.etiqueta}</p>
          <p className={`text-xs truncate ${problema ? 'text-red-700' : 'text-slate-500'}`}>
            {problema || `${archivo.name} · ${peso}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition cursor-pointer shrink-0"
          aria-label={`Quitar ${documento.etiqueta}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <label className="flex items-center gap-2.5 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 px-3 py-1.5 cursor-pointer transition focus-within:border-uss-blue focus-within:ring-2 focus-within:ring-uss-blue/20">
      <Paperclip className="w-4 h-4 shrink-0" style={{ color }} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-900 truncate" title={documento.etiqueta}>
          {documento.etiqueta}
        </span>
        <span className="block text-xs text-slate-500">
          {documento.obligatorio ? 'Obligatorio' : 'Opcional: si ya pagaste'}
        </span>
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
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={marcada}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-5 h-5 rounded accent-[#073299] shrink-0 cursor-pointer"
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
