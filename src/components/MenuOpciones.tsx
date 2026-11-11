import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Minus,
  CheckCircle2,
  Loader2,
  Monitor,
  AlertCircle,
  Paperclip,
  X,
  Info,
  Users,
  ClipboardList,
  BadgeCheck,
  CreditCard,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import ModalGuiaPago from './ModalGuiaPago';
import {
  ACCION_PLAN,
  CONTACTO_CINF,
  CRONOGRAMAS_PROTECH,
  DOCUMENTOS_PLAN,
  LEYENDA_OBLIGATORIO,
  LEYENDA_PAGO,
  TURNOS_CINF,
  descuentoVigente,
  iconoPlan,
  normalizarIncluye,
  CRONOGRAMA_GEX_PIZARRA,
  TOTAL_CRONOGRAMA_GEX,
  formatearFechaLimite,
  estaPlazoVencido,
  type DocumentoEmitidoGex,
  type DocumentoPlan,
  type PlanOpcion,
  type PlanOpcionId,
} from '../data/planesComputacion';
import { registrarSolicitud, revisarAdjunto, subirAdjunto, type Adjunto } from '../services/solicitudesService';
import {
  GEX_DRIVE_FOLDER_ID,
  GEX_DRIVE_FOLDER_NAME,
  archivoABase64,
  construirFilaSolicitud,
  sincronizarSolicitudConGoogleDrive,
  type ArchivoAdjuntoDrive,
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
  const [modalPagoAbierto, setModalPagoAbierto] = useState(false);
  const [tabPagoInicial, setTabPagoInicial] = useState<'bancos' | 'modalidades' | 'tramites'>('bancos');

  const abrirGuiaPago = (tab: 'bancos' | 'modalidades' | 'tramites' = 'bancos') => {
    setTabPagoInicial(tab);
    setModalPagoAbierto(true);
  };

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
  // Las 4 tarjetas reservan tantas filas como la que más trae, para que la matriz quede alineada
  const filasIncluye = Math.max(1, ...planes.map((p) => normalizarIncluye(p.incluye, p.id).length));

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* Encabezado compacto en 1 o 2 líneas: saludo + título a la izquierda, badge a la derecha, subtítulo debajo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-x-4 gap-y-1.5 pb-2 border-b border-slate-100">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2">
            {nombre && (
              <span className="text-base sm:text-lg font-bold text-slate-500">
                Hola, {nombre} <span className="text-slate-300 font-normal">·</span>
              </span>
            )}
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {titulo || 'Elige cómo acreditar Computación'}
            </h2>
          </div>
          {subtitulo &&
            subtitulo.trim() !== '' &&
            subtitulo !== 'Formas oficiales del Centro de Informática para el Programa Gente con Experiencia.' && (
              <p className="mt-0.5 text-xs sm:text-sm text-slate-500 leading-normal">
                {subtitulo}
              </p>
            )}
        </div>

        <span className="self-start sm:self-center shrink-0 inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-uss-blue bg-blue-50/80 ring-1 ring-uss-blue/15 px-3 py-1 rounded-full">
          <Monitor className="w-3.5 h-3.5 text-uss-blue" />
          Acreditación en Computación
        </span>
      </div>

      {/* xl: las 4 tarjetas comparten filas (subgrid) como la matriz de la pizarra: encabezado, precio,
          dirigido/requisito/acreditación, título "Incluye", una fila por elemento, documentos y botón */}
      <div>
        <div
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:grid-rows-[auto_auto_auto_auto_repeat(var(--filas),auto)_1fr_auto] xl:gap-y-0"
          style={{ '--filas': filasIncluye, '--filas-tarjeta': filasIncluye + 6 } as CSSProperties}
        >
          {planes.map((p, i) => (
            <TarjetaPlan
              key={p.id}
              plan={p}
              numero={i + 1}
              filas={filasIncluye}
              onElegir={() => onPlan(p.id)}
              onVerDetallesPago={() => abrirGuiaPago('tramites')}
            />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 leading-relaxed bg-slate-50/80 rounded-xl px-3.5 py-2.5 border border-slate-200/60">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{LEYENDA_PAGO}</span>
            <button
              type="button"
              onClick={() => abrirGuiaPago('modalidades')}
              className="inline-flex items-center gap-1 font-bold text-uss-blue hover:text-blue-800 underline underline-offset-2 cursor-pointer transition"
            >
              <Info className="w-3.5 h-3.5" />
              Ver detalles y cómo pagar
            </button>
          </div>
          <span className="font-medium text-slate-600">{LEYENDA_OBLIGATORIO}</span>
        </div>
      </div>

      <ModalGuiaPago
        abierto={modalPagoAbierto}
        onCerrar={() => setModalPagoAbierto(false)}
        tabInicial={tabPagoInicial}
      />
    </div>
  );
}

/** Precio del plan; con descuento vigente muestra el regular tachado, el % y hasta cuándo */
function PrecioPlan({ plan }: { plan: PlanOpcion }) {
  const descuento = descuentoVigente(plan);
  const precioFormateado = (descuento?.precioFinal ?? plan.precio).replace(/^S\/(\d)/, 'S/ $1');
  const precioRegularFormateado = plan.precio.replace(/^S\/(\d)/, 'S/ $1');

  return (
    <div className="w-full text-center flex flex-col items-center justify-center">
      <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1">
        <p className="text-3xl font-extrabold tracking-tight text-slate-900 leading-none">
          {descuento?.precioFinal && <span className="sr-only">Con descuento: </span>}
          {precioFormateado}
        </p>
        {descuento?.precioFinal && (
          <s className="text-base font-semibold text-slate-400">
            <span className="sr-only">Precio regular: </span>
            {precioRegularFormateado}
          </s>
        )}
        {descuento && (
          <span className="self-center rounded-md bg-rose-600 px-1.5 py-0.5 text-xs font-bold text-white">
            -{descuento.porcentaje}%
          </span>
        )}
      </div>
      {plan.precioNota && (
        <p className="mt-1.5 text-sm text-slate-500 text-center">
          {plan.precioNota}
          {descuento && (
            <>
              {' · '}
              <span className="font-semibold text-rose-700 whitespace-nowrap">Válido hasta {descuento.hasta}</span>
            </>
          )}
        </p>
      )}
      <p className={`mt-1 text-sm font-semibold text-center ${estaPlazoVencido(plan.fechaLimite) ? 'text-rose-600' : 'text-slate-700'}`}>
        {estaPlazoVencido(plan.fechaLimite) ? 'Plazo finalizado' : 'Solicitudes'} {formatearFechaLimite(plan.fechaLimite)}
      </p>
    </div>
  );
}

/** Etapas del plan como línea de tiempo: periodo y costo a la vista, el detalle debajo */
function EtapasPlan({ plan, compacto = false }: { plan: PlanOpcion; compacto?: boolean }) {
  if (compacto) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2 text-xs space-y-1">
        {plan.etapas.map((etapa) => (
          <div key={etapa.periodo} className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: plan.acento }} />
              <span className="font-semibold text-slate-800 truncate">{etapa.periodo}</span>
              {etapa.detalle && (
                <span className="text-[10px] text-slate-400 truncate hidden sm:inline">· {etapa.detalle}</span>
              )}
            </div>
            <span className="font-bold text-slate-900 tabular-nums shrink-0">{etapa.costo}</span>
          </div>
        ))}
      </div>
    );
  }

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

/** Cronograma mensual oficial extraído de la pizarra para Computación GEX */
export function CronogramaGexPizarra({
  acento = '#073299',
  compacto = false,
}: {
  acento?: string;
  compacto?: boolean;
}) {
  if (compacto) {
    const col1 = CRONOGRAMA_GEX_PIZARRA.slice(0, 4);
    const col2 = CRONOGRAMA_GEX_PIZARRA.slice(4);

    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          <div className="space-y-0.5">
            {col1.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-0.5">
                <span className={`truncate ${item.esCero ? 'text-slate-500' : 'font-medium text-slate-800'}`}>
                  {item.mes}
                </span>
                <span className={`tabular-nums font-semibold ${item.esCero ? 'text-slate-400' : 'text-slate-900'}`}>
                  {item.esCero ? '0.00' : item.monto}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-0.5 border-l border-slate-200/80 pl-2.5">
            {col2.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-0.5">
                <span className={`truncate ${item.esCero ? 'text-slate-500' : 'font-bold text-slate-900'}`}>
                  {item.mes}
                </span>
                <span className={`tabular-nums font-semibold ${item.esCero ? 'text-slate-400' : 'text-slate-900'}`}>
                  {item.esCero ? '0.00' : item.monto}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-1.5 pt-1.5 border-t border-slate-300 flex items-center justify-between font-extrabold text-slate-900 text-xs">
          <span>Total</span>
          <span className="tabular-nums font-black text-sm" style={{ color: acento }}>
            S/ {TOTAL_CRONOGRAMA_GEX}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs">
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200/80 font-bold uppercase tracking-wider text-slate-500 text-[10px]">
        <span>Mes / Periodo</span>
        <span>Monto (S/)</span>
      </div>
      <div className="space-y-1">
        {CRONOGRAMA_GEX_PIZARRA.map((item, idx) => (
          <div key={idx}>
            {item.esSeparador && (
              <div className="my-1 border-t border-dashed border-slate-300" />
            )}
            <div className="flex items-center justify-between py-0.5">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.esCero ? '#cbd5e1' : acento }}
                />
                <span className={`font-medium ${item.esCero ? 'text-slate-500' : 'text-slate-800'}`}>
                  {item.mes}
                </span>
                {!compacto && item.detalle && (
                  <span className="text-[11px] text-slate-400 hidden sm:inline truncate">
                    · {item.detalle}
                  </span>
                )}
              </div>
              <span
                className={`tabular-nums font-semibold ${item.esCero ? 'text-slate-400' : 'text-slate-900'
                  }`}
              >
                {item.esCero ? '0.00' : item.monto}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 pt-1.5 border-t-2 border-slate-900 flex items-center justify-between font-extrabold text-slate-900 text-xs">
        <span>Total oficial</span>
        <span className="tabular-nums text-sm font-black" style={{ color: acento }}>
          S/ {TOTAL_CRONOGRAMA_GEX}
        </span>
      </div>
    </div>
  );
}

function TituloSeccion({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{children}</p>;
}

/** "Sí (50 horas) *", "Sí *" o "No", como en la pizarra; el asterisco es la tasa */
function textoDocumento(d: DocumentoEmitidoGex): string {
  if (!d.emite) return 'No';
  return `Sí${d.detalle ? ` (${d.detalle})` : ''}${d.requierePago ? ' *' : ''}`;
}

/** Certificado y constancia del plan, lado a lado */
function DocumentosEmitidos({
  plan,
  onVerDetallesPago,
  compacto = false,
}: {
  plan: PlanOpcion;
  onVerDetallesPago?: () => void;
  compacto?: boolean;
}) {
  const tienePago = plan.certificado.requierePago || plan.constancia.requierePago;
  return (
    <div className={compacto ? 'space-y-1 text-xs' : 'space-y-1.5'}>
      <div className="grid grid-cols-2 gap-2">
        {([
          ['Certificado', plan.certificado],
          ['Constancia', plan.constancia],
        ] as const).map(([etiqueta, d]) => (
          <div key={etiqueta} className={`rounded-xl bg-slate-50 ${compacto ? 'px-2.5 py-1.5' : 'px-3 py-2'}`}>
            <p className={compacto ? 'text-[10px] text-slate-500 uppercase font-semibold' : 'text-xs text-slate-500'}>
              {etiqueta}
            </p>
            <p className={`font-bold leading-snug truncate ${compacto ? 'text-xs' : 'text-sm'} ${d.emite ? 'text-slate-900' : 'text-slate-400'}`}>
              {textoDocumento(d)}
            </p>
          </div>
        ))}
      </div>
      {tienePago && onVerDetallesPago && (
        <button
          type="button"
          onClick={onVerDetallesPago}
          className={`w-full text-center font-semibold text-uss-blue hover:text-blue-800 underline underline-offset-2 cursor-pointer transition py-0.5 inline-flex items-center justify-center gap-1 ${
            compacto ? 'text-[10px]' : 'text-[11px]'
          }`}
        >
          <Info className="w-3 h-3 text-uss-blue shrink-0" />
          <span>* Ver cómo pagar el derecho de trámite</span>
        </button>
      )}
    </div>
  );
}

/** Dirigido a, requisito previo y forma de acreditación: las tres filas de texto de la matriz */
function DatosMatriz({ plan, compacto = false }: { plan: PlanOpcion; compacto?: boolean }) {
  const sinRequisito = !plan.requisitoPrincipal || /^ninguno/i.test(plan.requisitoPrincipal.trim());

  if (compacto) {
    return (
      <div className="space-y-1.5 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Dirigido a</span>
          <span className="font-semibold text-slate-800 leading-tight block truncate" title={plan.dirigidoA}>
            {plan.dirigidoA}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Requisito</span>
            <span
              className={`leading-tight block truncate ${!sinRequisito ? 'font-bold' : 'font-semibold text-slate-800'}`}
              style={!sinRequisito ? { color: plan.acento } : undefined}
            >
              {plan.requisitoPrincipal || 'Ninguno'}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Acreditación</span>
            <span className="font-semibold text-slate-800 leading-tight block truncate">
              {plan.formaAcreditacion}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const filas = [
    { Icono: Users, etiqueta: 'Dirigido a', valor: plan.dirigidoA, resaltar: false },
    { Icono: ClipboardList, etiqueta: 'Requisito previo', valor: plan.requisitoPrincipal || 'Ninguno', resaltar: !sinRequisito },
    { Icono: BadgeCheck, etiqueta: 'Acreditación', valor: plan.formaAcreditacion, resaltar: false },
  ];
  return (
    <dl className="space-y-2.5">
      {filas.map(({ Icono, etiqueta, valor, resaltar }) => (
        <div key={etiqueta} className="flex items-start gap-2.5">
          <Icono className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
          <div className="min-w-0">
            <dt className="text-xs text-slate-500">{etiqueta}</dt>
            {/* Un requisito real (entrevista, título) se marca: es lo que puede descartar la opción */}
            <dd className={`text-sm leading-snug ${resaltar ? 'font-bold' : 'font-semibold text-slate-800'}`} style={resaltar ? { color: plan.acento } : undefined}>
              {valor || '—'}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

/** Tarjeta de un plan en la lista: en xl ocupa todas las filas compartidas del subgrid */
function TarjetaPlan({
  plan,
  numero,
  filas,
  onElegir,
  onVerDetallesPago,
}: {
  plan: PlanOpcion;
  numero: number;
  filas: number;
  onElegir: () => void;
  onVerDetallesPago?: () => void;
}) {
  const Icon = iconoPlan(plan.icono);
  const destacado = plan.id === 'gex';
  const items = normalizarIncluye(plan.incluye, plan.id);
  // Filas vacías al final para que la tarjeta ocupe lo mismo que la que más trae
  const relleno = Math.max(0, filas - items.length);

  return (
    <article
      className={`relative flex flex-col rounded-2xl bg-white p-5 xl:[grid-row:span_var(--filas-tarjeta)] xl:grid xl:grid-rows-subgrid xl:gap-y-0 ${destacado ? 'ring-2 shadow-lg shadow-slate-900/5' : 'ring-1 ring-slate-200'
        }`}
      style={destacado ? ({ '--tw-ring-color': plan.acento } as CSSProperties) : undefined}
    >
      {plan.insignia && (
        <span
          className="absolute -top-2.5 right-4 z-10 rounded-full px-3 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-sm"
          style={{ backgroundColor: plan.acento }}
        >
          {plan.insignia}
        </span>
      )}

      {/* 1. Encabezado */}
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${plan.acento}14`, color: plan.acento }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: plan.acento }}>
              Opción {numero}
            </p>
            <p className="text-xs text-slate-500 leading-tight mt-0.5">{plan.etiqueta}</p>
          </div>
        </div>
        <h3 className="mt-4 text-xl font-extrabold text-slate-900 leading-tight whitespace-pre-line text-center w-full">
          {plan.nombre}
        </h3>
      </div>

      {/* 2. Precio */}
      <div className="mt-4 w-full flex justify-center">
        <PrecioPlan plan={plan} />
      </div>

      {/* 3. Dirigido a, requisito y acreditación */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <DatosMatriz plan={plan} />
      </div>

      {/* 4. Incluye: una fila del subgrid por elemento, alineadas entre las 4 tarjetas */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <TituloSeccion>Incluye</TituloSeccion>
      </div>
      <ul className="xl:[grid-row:span_var(--filas)] xl:grid xl:grid-rows-subgrid">
        {items.map((fila, idx) => (
          <li
            key={idx}
            className={`flex items-start gap-2 py-1 text-sm leading-snug ${fila.activo ? 'text-slate-700' : 'text-slate-400'}`}
          >
            {fila.activo ? (
              <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: plan.acento }} />
            ) : (
              <Minus className="w-4 h-4 mt-0.5 shrink-0 text-slate-300" />
            )}
            <span>
              {!fila.activo && <span className="sr-only">No incluye: </span>}
              {fila.texto}
              {fila.activo && fila.obligatorio && (
                <span className="font-bold text-slate-500" title="Aprobación obligatoria"> (_*)</span>
              )}
            </span>
          </li>
        ))}
        {Array.from({ length: relleno }, (_, i) => (
          <li key={`vacio-${i}`} aria-hidden="true" className="hidden xl:block" />
        ))}
      </ul>

      {/* 5. Documentos emitidos; es la fila que se estira si sobra alto */}
      <div className="mt-5 flex-1">
        <DocumentosEmitidos plan={plan} onVerDetallesPago={onVerDetallesPago} />
      </div>

      {/* 6. Botón: el texto lo pone el panel; lo que abre depende de la opción */}
      {(() => {
        const vencido = estaPlazoVencido(plan.fechaLimite);
        return (
          <button
            type="button"
            disabled={vencido}
            onClick={onElegir}
            className={`mt-5 h-11 w-full rounded-xl text-sm font-bold inline-flex items-center justify-center gap-1.5 transition ${
              vencido
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed ring-1 ring-slate-200'
                : destacado
                  ? 'text-white hover:brightness-110 cursor-pointer'
                  : 'bg-white text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50 hover:ring-slate-400 cursor-pointer'
            } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uss-blue`}
            style={destacado && !vencido ? { backgroundColor: plan.acento } : undefined}
          >
            {vencido ? 'Plazo finalizado' : (plan.textoBoton || 'Inscripción')}
            {!vencido && <ArrowRight className="w-4 h-4" />}
          </button>
        );
      })()}
    </article>
  );
}

// Los requisitos no son beneficios: van con punto, no con check
function ListaPuntos({ items, compacto = false }: { items: string[]; compacto?: boolean }) {
  if (compacto) {
    return (
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-1.5 text-[11px] text-slate-700 leading-tight">
            <span className="mt-1 w-1 h-1 rounded-full bg-slate-400 shrink-0" />
            <span className="truncate" title={item}>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

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
function ResumenPlan({ plan, onVerDetallesPago }: { plan: PlanOpcion; onVerDetallesPago?: () => void }) {
  const Icon = iconoPlan(plan.icono);
  const descuento = descuentoVigente(plan);
  const precioFormateado = (descuento?.precioFinal ?? plan.precio).replace(/^S\/(\d)/, 'S/ $1');

  return (
    <aside className="rounded-2xl bg-white ring-1 ring-slate-200 p-4 space-y-3 divide-y divide-slate-100 [&>*:not(:first-child)]:pt-3 text-xs w-full">
      {/* 1. Encabezado compacto: etiqueta, nombre y precio en un bloque equilibrado */}
      <div className="text-center">
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1"
          style={{ backgroundColor: `${plan.acento}14`, color: plan.acento }}
        >
          <Icon className="w-3.5 h-3.5" />
          <span>{plan.etiqueta}</span>
        </div>
        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
          {plan.nombre.replace(/\n+/g, ' ')}
        </h3>
        <div className="mt-1 flex items-baseline justify-center gap-1.5">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
            {precioFormateado}
          </span>
          {descuento?.precioFinal && (
            <s className="text-xs font-semibold text-slate-400">
              {plan.precio.replace(/^S\/(\d)/, 'S/ $1')}
            </s>
          )}
        </div>
        <p className={`mt-0.5 text-[11px] font-semibold text-center ${estaPlazoVencido(plan.fechaLimite) ? 'text-rose-600' : 'text-slate-600'}`}>
          {estaPlazoVencido(plan.fechaLimite) ? 'Plazo finalizado' : `Solicitudes ${formatearFechaLimite(plan.fechaLimite)}`}
        </p>
      </div>

      {/* 2. Matriz oficial: Dirigido a, Requisito y Acreditación compactos */}
      <DatosMatriz plan={plan} compacto />

      {/* 3. Cronograma oficial */}
      {plan.id === 'gex' ? (
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Cronograma oficial</p>
          <CronogramaGexPizarra acento={plan.acento} compacto />
        </div>
      ) : (
        plan.etapas.length > 0 && (
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Cronograma</p>
            <EtapasPlan plan={plan} compacto />
          </div>
        )
      )}

      {/* 4. Requisitos específicos si los tiene (ej. convalidación) */}
      {plan.requisitos.length > 0 && plan.id !== 'gex' && (
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Requisitos</p>
          <ListaPuntos items={plan.requisitos} compacto />
        </div>
      )}

      {/* 5. Documentos emitidos */}
      <div className="pt-2">
        <DocumentosEmitidos plan={plan} onVerDetallesPago={onVerDetallesPago} compacto />
        {(plan.certificado.requierePago || plan.constancia.requierePago) && (
          <p className="mt-1 text-[10px] text-slate-400 text-center leading-tight">
            * Requiere el pago de la tasa administrativa oficial.
          </p>
        )}
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Registro
// ---------------------------------------------------------------------------

// Cada opción abre su propio flujo (ACCION_PLAN): inscripción al curso GEX, entrevista previa de
// validación, solicitud de convalidación con sus documentos y horarios de PROTECH XP.
const DECLARACION: Partial<Record<PlanOpcionId, string>> = {
  validacion: 'Declaro que no estoy matriculado en el curso de Computación.',
};

const MESES_CALENDARIO = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DIAS_SEMANA_CORTO = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

function formatearDiaLargo(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const fecha = new Date(y, m - 1, d);
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const diaSemana = dias[fecha.getDay()];
  const mesNombre = MESES_CALENDARIO[m - 1]?.toLowerCase() ?? '';
  return `${diaSemana}, ${d} de ${mesNombre} de ${y}`;
}

/**
 * Calendario interactivo para agendar el día de entrevista en Validación de competencias.
 * Los días posteriores a fechaLimite (máximo el 15 de diciembre) quedan estrictamente bloqueados.
 */
function CalendarioEntrevista({
  turno,
  fechaLimite,
  valor,
  onChange,
  acento = '#073299',
}: {
  turno: string;
  fechaLimite?: string;
  valor: string;
  onChange: (iso: string) => void;
  acento?: string;
}) {
  const isoLim = fechaLimite || '2026-12-15T23:59';
  const fechaMax = new Date(isoLim);
  const anioMax = isNaN(fechaMax.getFullYear()) ? 2026 : fechaMax.getFullYear();
  const mesMax = isNaN(fechaMax.getMonth()) ? 11 : fechaMax.getMonth();

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const [anioVista, setAnioVista] = useState(() => (hoy.getFullYear() > anioMax ? anioMax : hoy.getFullYear()));
  const [mesVista, setMesVista] = useState(() => {
    if (hoy.getFullYear() === anioMax && hoy.getMonth() <= mesMax) {
      return hoy.getMonth();
    }
    return mesMax;
  });

  const puedeRetroceder = anioVista > hoy.getFullYear() || (anioVista === hoy.getFullYear() && mesVista > hoy.getMonth());
  const puedeAvanzar = anioVista < anioMax || (anioVista === anioMax && mesVista < mesMax);

  const irMesAnterior = () => {
    if (!puedeRetroceder) return;
    if (mesVista === 0) {
      setMesVista(11);
      setAnioVista((a) => a - 1);
    } else {
      setMesVista((m) => m - 1);
    }
  };

  const irMesSiguiente = () => {
    if (!puedeAvanzar) return;
    if (mesVista === 11) {
      setMesVista(0);
      setAnioVista((a) => a + 1);
    } else {
      setMesVista((m) => m + 1);
    }
  };

  const primerDiaMes = new Date(anioVista, mesVista, 1);
  const diaSemanaInicio = (primerDiaMes.getDay() + 6) % 7;
  const diasEnMes = new Date(anioVista, mesVista + 1, 0).getDate();

  return (
    <div className="mt-2.5 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-uss-blue" />
          <span className="text-xs font-bold text-slate-800">
            {MESES_CALENDARIO[mesVista]} {anioVista}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={!puedeRetroceder}
            onClick={irMesAnterior}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={!puedeAvanzar}
            onClick={irMesSiguiente}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
        {DIAS_SEMANA_CORTO.map((d, i) => (
          <span
            key={d}
            className={`text-[11px] font-bold ${i === 6 ? 'text-slate-400' : 'text-slate-500'}`}
          >
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: diaSemanaInicio }).map((_, i) => (
          <div key={`vacio-${i}`} aria-hidden="true" className="h-8" />
        ))}
        {Array.from({ length: diasEnMes }, (_, i) => i + 1).map((dia) => {
          const fechaDia = new Date(anioVista, mesVista, dia);
          const dow = fechaDia.getDay();
          const iso = `${anioVista}-${String(mesVista + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
          const esHoy = fechaDia.getTime() === hoy.getTime();
          const esPasado = fechaDia < hoy;
          const esDespuesLimite = fechaDia > fechaMax;
          const esDomingo = dow === 0;

          const esTurnoIncompatible =
            (turno === 'sabado' && dow !== 6) ||
            ((turno === 'manana' || turno === 'tarde') && dow === 6);

          const bloqueado = esPasado || esDespuesLimite || esDomingo || esTurnoIncompatible;
          const seleccionado = valor === iso;

          let motivoBloqueo = '';
          if (esDespuesLimite) motivoBloqueo = `Bloqueado: después del plazo máximo (${formatearFechaLimite(fechaLimite)})`;
          else if (esDomingo) motivoBloqueo = 'Domingo no laborable';
          else if (esPasado) motivoBloqueo = 'Fecha pasada';
          else if (esTurnoIncompatible) {
            motivoBloqueo = turno === 'sabado' ? 'El turno Sábado solo aplica en sábados' : 'Este turno solo aplica de lunes a viernes';
          }

          return (
            <button
              key={dia}
              type="button"
              disabled={bloqueado}
              title={motivoBloqueo || `Elegir ${dia} de ${MESES_CALENDARIO[mesVista]}`}
              onClick={() => onChange(iso)}
              className={`h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition relative ${
                seleccionado
                  ? 'bg-uss-blue text-white shadow-sm font-bold ring-2 ring-blue-300'
                  : bloqueado
                    ? esDespuesLimite
                      ? 'text-slate-300 bg-slate-50/70 cursor-not-allowed line-through'
                      : 'text-slate-300 cursor-not-allowed opacity-40'
                    : 'text-slate-800 hover:bg-blue-50 hover:text-uss-blue cursor-pointer border border-transparent hover:border-blue-200'
              }`}
              style={seleccionado ? { backgroundColor: acento } : undefined}
            >
              {dia}
              {esHoy && !seleccionado && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-uss-blue" />
              )}
            </button>
          );
        })}
      </div>

      {valor ? (
        <div className="mt-3 p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/60 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Check className="w-4 h-4 text-uss-blue shrink-0" />
            <span className="text-slate-800 truncate">
              Día elegido: <strong className="text-uss-blue">{formatearDiaLargo(valor)}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer shrink-0"
          >
            Cambiar
          </button>
        </div>
      ) : (
        <p className="mt-2 text-[11px] text-amber-800 bg-amber-50/70 rounded-lg p-2 border border-amber-200/50">
          ⚠️ Selecciona un día disponible en el calendario para programar tu entrevista.
        </p>
      )}

      <p className="mt-2 text-[10px] text-slate-500 leading-tight">
        Plazo máximo de recepción: <strong>{formatearFechaLimite(fechaLimite)}</strong>. Los días posteriores se encuentran bloqueados por cronograma.
      </p>
    </div>
  );
}

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
  const [pasoTab, setPasoTab] = useState<1 | 2>(1);
  const [codigo, setCodigo] = useState(estudiante?.codUniv ?? '');
  const [celular, setCelular] = useState('');
  const [correoPersonal, setCorreoPersonal] = useState('');
  const [declara, setDeclara] = useState(false);
  const [archivos, setArchivos] = useState<Record<string, File | null>>({});
  const [turno, setTurno] = useState('');
  const [fechaEntrevista, setFechaEntrevista] = useState('');
  const [cronograma, setCronograma] = useState('');
  const [autoriza, setAutoriza] = useState(false);
  const [enviando, setEnviando] = useState<'' | 'subiendo' | 'registrando'>('');
  const [enviada, setEnviada] = useState(() => yaEnviada(estudiante?.codUniv, plan.id));
  const [error, setError] = useState('');
  const [modalPago, setModalPago] = useState(false);
  const [tabPago, setTabPago] = useState<'bancos' | 'modalidades' | 'tramites'>('bancos');

  const abrirGuiaPago = (tab: 'bancos' | 'modalidades' | 'tramites' = 'bancos') => {
    setTabPago(tab);
    setModalPago(true);
  };

  // Sin estudiante elegido (se entró desde la portada) se identifica por su código en el Excel GEX
  const alumno = estudiante ?? estudiantes.find((e) => e.codUniv === codigo.trim()) ?? null;
  const esExamen = plan.id !== 'convalidacion';
  const accion = ACCION_PLAN[plan.id];
  const declaracion = DECLARACION[plan.id];
  const documentos = DOCUMENTOS_PLAN[plan.id] ?? [];
  // La entrevista y los horarios necesitan saber en qué turno contactar al estudiante
  const pideTurno = accion === 'entrevista' || accion === 'horarios';
  const turnoElegido = TURNOS_CINF.find((t) => t.clave === turno);
  const TEXTO_ENVIO: Record<typeof accion, string> = {
    inscripcion: 'Enviar',
    entrevista: 'Solicitar entrevista',
    solicitud: 'Enviar solicitud',
    horarios: 'Solicitar horario',
  };
  const TITULO_EXITO: Record<typeof accion, string> = {
    inscripcion: 'Tu inscripción quedó registrada',
    entrevista: 'Recibimos tu solicitud de entrevista',
    solicitud: 'Recibimos tu solicitud de convalidación',
    horarios: 'Recibimos tu solicitud de horario',
  };

  const tieneDosPasos = plan.id !== 'gex';
  const tituloPaso2 =
    accion === 'entrevista'
      ? 'Tu entrevista previa'
      : accion === 'horarios'
        ? 'Cronograma y turno'
        : 'Tus documentos';

  const textoBotonAvanzar =
    accion === 'entrevista'
      ? 'Selecciona tu entrevista'
      : accion === 'horarios'
        ? 'Elegir cronograma y turno'
        : 'Adjuntar documentos';

  const validarPaso1 = (): string => {
    if (!alumno) return 'Ingresa un código universitario registrado en GEX.';
    if (!/^9\d{8}$/.test(celular.trim())) return 'El celular debe tener 9 dígitos y empezar con 9.';
    return '';
  };

  const avanzarAPaso2 = () => {
    const prob = validarPaso1();
    if (prob) {
      setError(prob);
      return;
    }
    setError('');
    setPasoTab(2);
  };

  const validar = (): string => {
    const probPaso1 = validarPaso1();
    if (probPaso1) {
      if (tieneDosPasos) setPasoTab(1);
      return probPaso1;
    }
    if (pideTurno && !turnoElegido) return accion === 'entrevista' ? 'Elige el turno para tu entrevista.' : 'Elige el turno que prefieres.';
    if (accion === 'entrevista' && !fechaEntrevista) return 'Elige el día para tu entrevista en el calendario.';
    if (accion === 'horarios' && !cronograma) return 'Elige el cronograma que prefieres.';
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
    if (!autoriza) {
      return plan.id === 'gex'
        ? 'Debes marcar la casilla: "Sí, AUTORIZO la programación."'
        : 'Autoriza el uso de tus datos para registrar la solicitud.';
    }
    return '';
  };

  const enviar = async (ev: FormEvent) => {
    ev.preventDefault();
    const problema = validar();
    setError(problema);
    if (problema || !alumno) return;

    try {
      // Se suben uno por uno: se respalda en Supabase y se prepara para Google Drive
      const adjuntos: (Adjunto & { clave: string; etiqueta: string })[] = [];
      const archivosParaDrive: ArchivoAdjuntoDrive[] = [];

      for (const doc of documentos) {
        const archivo = archivos[doc.clave];
        if (!archivo) continue;
        setEnviando('subiendo');

        // Respaldo en Supabase Storage
        try {
          const resSubida = await subirAdjunto(alumno.codUniv, archivo);
          adjuntos.push({ clave: doc.clave, etiqueta: doc.etiqueta, ...resSubida });
        } catch (errSubida) {
          console.warn('[GEX] Advertencia al subir adjunto a Supabase:', errSubida);
        }

        // Conversión a Base64 para guardarlo en la carpeta de Google Drive
        try {
          const base64 = await archivoABase64(archivo);
          archivosParaDrive.push({
            clave: doc.clave,
            etiqueta: doc.etiqueta,
            nombre: archivo.name,
            tipo: archivo.type,
            tamano: archivo.size,
            base64,
          });
        } catch (errB64) {
          console.warn('[GEX] Error al codificar adjunto para Drive:', errB64);
        }
      }

      // La tabla guarda un archivo en columnas (el primero); la lista completa viaja en datos.adjuntos
      const adjunto: Adjunto | undefined = adjuntos[0];
      // En el Excel van todos los nombres en la misma celda
      const adjuntoFila = adjunto && { ...adjunto, nombre: adjuntos.map((a) => `${a.etiqueta}: ${a.nombre}`).join(' | ') };

      // 1. Construir fila de la solicitud con todos los atributos requeridos y los archivos para Drive
      const fila = construirFilaSolicitud({
        alumno,
        plan,
        celular,
        correoPersonal,
        esExamen,
        adjunto: adjuntoFila,
        declaracion,
        archivos: archivosParaDrive,
        turno: turnoElegido?.etiqueta,
        fechaEntrevista: fechaEntrevista ? formatearDiaLargo(fechaEntrevista) : undefined,
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
          tipo: accion,
          ...(turnoElegido ? { turno: `${turnoElegido.etiqueta} (${turnoElegido.detalle})` } : {}),
          ...(fechaEntrevista ? { fechaEntrevista: formatearDiaLargo(fechaEntrevista) } : {}),
          ...(cronograma ? { cronograma } : {}),
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
        <div className="order-2 lg:order-1 w-full">
          <ResumenPlan plan={plan} onVerDetallesPago={() => abrirGuiaPago('tramites')} />
        </div>

        {enviada ? (
          <section className="order-1 lg:order-2 bg-white rounded-2xl ring-1 ring-slate-200 p-5 sm:p-7 flex flex-col justify-between h-full">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                  {TITULO_EXITO[accion]}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  <strong className="font-semibold text-slate-900">{plan.nombre.replace(/\n+/g, ' ')}</strong>
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
            className="order-1 lg:order-2 bg-white rounded-2xl ring-1 ring-slate-200 divide-y divide-slate-100 flex flex-col h-full"
          >
            {/* Encabezado del flujo */}
            <div className="px-5 sm:px-6 py-3 flex items-center justify-between bg-slate-50/70 rounded-t-2xl">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: plan.acento }} />
                {plan.id === 'gex' ? 'Inscripción' : plan.nombre.replace(/\n+/g, ' ')}
              </h2>
              <span
                className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${plan.acento}15`, color: plan.acento }}
              >
                {plan.etiqueta}
              </span>
            </div>

            {/* Pestañas de pasos cuando el plan tiene 2 etapas (Validación, Convalidación, PROTECH) */}
            {tieneDosPasos && (
              <div className="px-4 sm:px-6 py-2 bg-slate-50/40 border-b border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setPasoTab(1);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                    pasoTab === 1
                      ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
                      pasoTab === 1 ? 'text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                    style={pasoTab === 1 ? { backgroundColor: plan.acento } : undefined}
                  >
                    1
                  </span>
                  <span className="truncate">Tus datos y proceso</span>
                </button>

                <button
                  type="button"
                  onClick={avanzarAPaso2}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                    pasoTab === 2
                      ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
                      pasoTab === 2 ? 'text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                    style={pasoTab === 2 ? { backgroundColor: plan.acento } : undefined}
                  >
                    2
                  </span>
                  <span className="truncate">{tituloPaso2}</span>
                </button>
              </div>
            )}

            {plan.id === 'gex' ? (
              <>
                {/* 1. DATOS */}
                <PasoRegistro numero={1} titulo="DATOS" nota="Del padrón oficial GEX" color={plan.acento}>
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
                    <div className="rounded-xl bg-slate-50 px-4 py-2.5 mb-3">
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

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="gex-celular" className="block text-sm font-semibold text-slate-800 mb-1">
                        Celular <span className="text-red-500">*</span>
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

                  {/* Guía oficial de pagos para el estudiante */}
                  <div className="mt-3 rounded-xl bg-blue-50/70 border border-blue-200/60 p-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <CreditCard className="w-4 h-4 text-uss-blue shrink-0" />
                      <span className="text-slate-700 truncate">
                        ¿Cómo pagar el derecho de trámite o tasas en bancos autorizados?
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => abrirGuiaPago('bancos')}
                      className="font-bold text-uss-blue hover:underline shrink-0 cursor-pointer"
                    >
                      Ver guía oficial →
                    </button>
                  </div>
                </PasoRegistro>
              </>
            ) : pasoTab === 1 ? (
              /* TAB 1: DATOS, CONTACTO Y QUÉ SIGUE */
              <>
                {/* 1. Datos del padrón */}
                <PasoRegistro numero={1} titulo="Tus datos" nota="Del padrón oficial GEX" color={plan.acento}>
                  {!estudiante && (
                    <div className="mb-2.5">
                      <label htmlFor="gex-codigo" className="block text-xs font-semibold text-slate-800 mb-1">
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
                        <p className="mt-1 text-xs text-amber-700">Ese código no está registrado en GEX.</p>
                      )}
                    </div>
                  )}

                  {alumno && (
                    <div className="rounded-xl bg-slate-50 px-4 py-2">
                      <p className="text-sm font-bold text-slate-900 leading-snug">{alumno.nombres}</p>
                      <dl className="mt-1 grid gap-x-6 gap-y-1 sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,1.6fr)] text-xs">
                        <div className="min-w-0">
                          <dt className="text-slate-500">Código</dt>
                          <dd className="font-semibold text-slate-900 tabular-nums">{alumno.codUniv}</dd>
                        </div>
                        <div className="min-w-0">
                          <dt className="text-slate-500">Escuela</dt>
                          <dd className="font-semibold text-slate-900 truncate" title={alumno.escuela || '—'}>
                            {alumno.escuela || '—'}
                          </dd>
                        </div>
                        <div className="min-w-0">
                          <dt className="text-slate-500">Correo USS</dt>
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
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="gex-celular" className="block text-xs font-semibold text-slate-800 mb-1">
                        Celular <span className="text-red-500">*</span>
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
                      <label htmlFor="gex-correo" className="block text-xs font-semibold text-slate-800 mb-1">
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

                {/* 3. Qué sigue */}
                <PasoRegistro numero={3} titulo="Qué sigue" nota="Proceso oficial" color={plan.acento}>
                  <ol className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2 text-xs">
                    {plan.proceso.map((p, i) => (
                      <li key={p} className="flex items-start gap-2 text-slate-700 leading-snug">
                        <span className="w-3.5 text-right font-bold text-slate-400 tabular-nums shrink-0">{i + 1}.</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ol>

                  {/* Guía oficial de pagos */}
                  <div className="mt-2.5 rounded-xl bg-blue-50/70 border border-blue-200/60 p-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <CreditCard className="w-4 h-4 text-uss-blue shrink-0" />
                      <span className="text-slate-700 truncate">
                        ¿Cómo pagar el derecho de trámite o tasas en bancos autorizados?
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => abrirGuiaPago('bancos')}
                      className="font-bold text-uss-blue hover:underline shrink-0 cursor-pointer"
                    >
                      Ver guía oficial →
                    </button>
                  </div>
                </PasoRegistro>
              </>
            ) : (
              /* TAB 2: TU ENTREVISTA PREVIA / DOCUMENTOS / CRONOGRAMA */
              <>
                <PasoRegistro
                  numero={1}
                  titulo={tituloPaso2}
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

                  {accion === 'horarios' && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-slate-800 mb-1.5">Cronograma</p>
                      <OpcionesChip
                        opciones={CRONOGRAMAS_PROTECH.map((c) => ({ clave: c, etiqueta: c, detalle: 'Sesiones en vivo por Zoom' }))}
                        valor={cronograma}
                        onChange={setCronograma}
                        color={plan.acento}
                      />
                    </div>
                  )}

                  {pideTurno && (
                    <div className="mb-2.5">
                      <p className="text-xs font-semibold text-slate-800 mb-1">
                        {accion === 'entrevista' ? 'Turno para tu entrevista' : 'Turno que prefieres'}
                      </p>
                      <OpcionesChip opciones={[...TURNOS_CINF]} valor={turno} onChange={setTurno} color={plan.acento} />
                      <p className="mt-1 text-[11px] text-slate-500">
                        {accion === 'entrevista'
                          ? 'Elige el turno y luego selecciona tu día en el calendario.'
                          : 'El Centro de Informática te confirma la sección y el horario disponibles.'}
                      </p>
                    </div>
                  )}

                  {accion === 'entrevista' && (
                    <div className="mb-2">
                      <p className="text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-uss-blue" />
                        Día para tu entrevista
                      </p>
                      <CalendarioEntrevista
                        turno={turno}
                        fechaLimite={plan.fechaLimite}
                        valor={fechaEntrevista}
                        onChange={setFechaEntrevista}
                        acento={plan.acento}
                      />
                    </div>
                  )}

                  {declaracion && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <Casilla marcada={declara} onChange={setDeclara} label={declaracion} />
                    </div>
                  )}
                </PasoRegistro>
              </>
            )}

            {/* BARRA INFERIOR DE ACCIONES */}
            <div className="px-5 sm:px-6 py-3 space-y-2 mt-auto">
              {error && (
                <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 ring-1 ring-red-200 px-3 py-2 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {error}
                </p>
              )}

              {tieneDosPasos && pasoTab === 1 ? (
                /* Botón avanzar al paso 2 */
                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-xs font-medium text-slate-500">
                    Paso 1 de 2: Verifica tus datos antes de continuar
                  </span>
                  <button
                    type="button"
                    onClick={avanzarAPaso2}
                    className="h-11 px-5 rounded-xl text-sm font-bold text-white inline-flex items-center justify-center gap-2 transition hover:brightness-110 cursor-pointer shadow-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uss-blue shrink-0"
                    style={{ backgroundColor: plan.acento }}
                  >
                    <span>{textoBotonAvanzar}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Casilla de autorización y botón de envío (Paso 2 o Plan GEX) */
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <Casilla
                    marcada={autoriza}
                    onChange={setAutoriza}
                    label={
                      plan.id === 'gex' ? (
                        <span>
                          Sí, <strong className="font-extrabold text-slate-900 underline decoration-uss-blue decoration-2">AUTORIZO</strong> la programación.
                        </span>
                      ) : (
                        'Autorizo al Centro de Informática USS a usar estos datos para gestionar mi solicitud.'
                      )
                    }
                  />

                  <div className="flex items-center gap-2 shrink-0">
                    {tieneDosPasos && (
                      <button
                        type="button"
                        onClick={() => {
                          setError('');
                          setPasoTab(1);
                        }}
                        className="h-11 px-3.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Volver</span>
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={!!enviando}
                      className="h-11 px-6 rounded-xl text-sm font-bold text-white inline-flex items-center justify-center gap-2 transition hover:brightness-110 disabled:opacity-60 cursor-pointer shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uss-blue shadow-xs"
                      style={{ backgroundColor: plan.acento }}
                    >
                      {enviando && <Loader2 className="w-4 h-4 animate-spin" />}
                      {enviando === 'subiendo'
                        ? 'Subiendo archivo…'
                        : enviando
                          ? 'Registrando…'
                          : TEXTO_ENVIO[accion]}
                      {!enviando && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        )}
      </div>

      <ModalGuiaPago
        abierto={modalPago}
        onCerrar={() => setModalPago(false)}
        tabInicial={tabPago}
      />
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

/** Opciones de una sola elección como tarjetas pequeñas (turno, cronograma) */
function OpcionesChip({
  opciones,
  valor,
  onChange,
  color,
}: {
  opciones: { clave: string; etiqueta: string; detalle: string }[];
  valor: string;
  onChange: (v: string) => void;
  color: string;
}) {
  return (
    <div role="radiogroup" className="grid gap-2 grid-cols-3">
      {opciones.map((o) => {
        const elegido = valor === o.clave;
        return (
          <button
            key={o.clave}
            type="button"
            role="radio"
            aria-checked={elegido}
            onClick={() => onChange(o.clave)}
            className={`rounded-xl px-3 py-1.5 text-left transition cursor-pointer ring-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-uss-blue ${elegido ? 'ring-2' : 'ring-slate-200 hover:ring-slate-300 bg-white'
              }`}
            style={elegido ? ({ '--tw-ring-color': color, backgroundColor: `${color}0d` } as CSSProperties) : undefined}
          >
            <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
              {elegido && <Check className="w-3.5 h-3.5 shrink-0" style={{ color }} />}
              {o.etiqueta}
            </span>
            <span className="block text-[11px] leading-tight text-slate-500">{o.detalle}</span>
          </button>
        );
      })}
    </div>
  );
}

function Casilla({ marcada, onChange, label }: { marcada: boolean; onChange: (v: boolean) => void; label: ReactNode }) {
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
