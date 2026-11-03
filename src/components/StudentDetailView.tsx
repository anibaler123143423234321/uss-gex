import { useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  User,
  School,
  Hash,
  Mail,
  MapPin,
  Compass,
  CheckCircle2,
  Clock,
  Circle,
  Layers,
  Monitor,
  Laptop,
  BookOpen,
  Award,
  Wrench,
  Sparkles,
  Copy,
  Check,
  ShieldCheck,
  BarChart3,
  LayoutGrid,
  type LucideIcon,
} from 'lucide-react';
import CourseIllustration, { HeroIllustration, type Ilustracion } from './CourseIllustration';
import type { EstudianteGEX } from '../types/estudiante';

interface Props {
  estudiante: EstudianteGEX;
  onBack: () => void;
  onOpenComoAcreditar?: () => void;
}

interface Curso {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  descripcion: string;
  estado: number;
  Icon: LucideIcon;
  ilustracion: Ilustracion;
  /** Color propio del curso: tiñe su ícono, su ilustración y su resplandor */
  acento: string;
  tagApproved: string;
}

export default function StudentDetailView({ estudiante: e, onBack, onOpenComoAcreditar }: Props) {
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // 1. Separar apellidos y nombres
  const partes = e.nombres.trim().split(/\s+/);
  const apellidos = partes.length > 2 ? partes.slice(0, 2).join(' ') : partes[0] || '';
  const nombres = partes.length > 2 ? partes.slice(2).join(' ') : partes.slice(1).join(' ');

  // Iniciales para el avatar
  const iniciales = (
    (apellidos[0] || '') + (nombres[0] || '')
  ).toUpperCase() || 'USS';

  // Copiar código al portapapeles
  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(e.codUniv);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // 2. Cursos del Plan Tradicional. Textos según el catálogo oficial CINF (agrupacionesData.ts del ecosistema)
  const cursosTradicional: Curso[] = [
    {
      id: 'computacionI',
      codigo: 'INF-101',
      nombre: 'Computación I',
      tipo: 'Computación Básica',
      descripcion: 'Asignatura regular curricular de informática y herramientas de productividad.',
      estado: e.computacionI >= 1 ? 1 : 0,
      Icon: Monitor,
      ilustracion: 'monitor',
      acento: '#073299',
      tagApproved: 'Asignatura regular aprobada',
    },
    {
      id: 'computacionII',
      codigo: 'INF-102',
      nombre: 'Computación II',
      tipo: 'Computación Básica',
      descripcion: 'Asignatura regular curricular (Sede Chiclayo - S/ 330.00).',
      estado: e.computacionII >= 1 ? 1 : 0,
      Icon: BarChart3,
      ilustracion: 'grafico',
      acento: '#0369a1',
      tagApproved: 'Asignatura regular aprobada',
    },
    {
      id: 'computacionIII',
      codigo: 'INF-103',
      nombre: 'Computación III',
      tipo: 'Computación Básica',
      descripcion: 'Asignatura regular curricular (Sede Chiclayo - S/ 330.00).',
      estado: e.computacionIII >= 1 ? 1 : 0,
      Icon: Laptop,
      ilustracion: 'nube',
      acento: '#4338ca',
      tagApproved: 'Asignatura regular aprobada',
    },
  ];

  // 3. Componentes de la Ruta PROTECH XP que evalúa la base GEX: son 3, no 4
  const cursosRutas: Curso[] = [
    {
      id: 'generico',
      codigo: 'GEN-201',
      nombre: 'Módulo Genérico',
      tipo: 'Herramientas Ofimáticas (PROTECH XP)',
      descripcion: 'Ofimática Word 365, Excel 365 o Diseño con Canva.',
      estado: e.generico >= 1 ? 1 : 0,
      Icon: BookOpen,
      ilustracion: 'libro',
      acento: '#0f766e',
      tagApproved: 'Módulo transversal acreditado',
    },
    {
      id: 'especifico',
      codigo: 'ESP-301',
      nombre: 'Módulo Específico',
      tipo: 'Especialidad por Carrera',
      descripcion: 'Curso según perfil profesional (SPSS, Power BI, AutoCAD o Project).',
      estado: e.especifico >= 1 ? 1 : 0,
      Icon: Award,
      ilustracion: 'diana',
      acento: '#b45309',
      tagApproved: 'Especialidad profesional acreditada',
    },
    {
      id: 'taller',
      codigo: 'TAL-401',
      nombre: 'Taller de Certificación',
      tipo: 'Certificación Internacional',
      descripcion: 'Taller de Certificación Internacional Microsoft Office Specialist (MOS).',
      estado: e.taller >= 1 ? 1 : 0,
      Icon: Wrench,
      ilustracion: 'medalla',
      acento: '#7c3aed',
      tagApproved: 'Certificación MOS acreditada',
    },
  ];

  // 4. Métricas por plan: en GEX ambos planes se acreditan con 3 de 3
  const aprobadosTradicional = cursosTradicional.filter((c) => c.estado === 1).length;
  const aprobadosRutas = cursosRutas.filter((c) => c.estado === 1).length;

  const planes = {
    tradicional: {
      titulo: 'Plan Tradicional',
      subtitulo: 'Computación I al III',
      cursos: cursosTradicional,
      aprobados: aprobadosTradicional,
      PlanIcon: Monitor,
      acento: '#073299',
    },
    rutas: {
      titulo: 'Plan Rutas de Aprendizaje',
      subtitulo: 'PROTECH XP',
      cursos: cursosRutas,
      aprobados: aprobadosRutas,
      PlanIcon: Sparkles,
      acento: '#0f766e',
    },
  };

  // Se muestra un solo plan, el que el estudiante está llevando: primero el que ya completó,
  // si no el que más avanzó. Sin cursos en ninguno, no hay plan que mostrar.
  const plan =
    aprobadosTradicional === 0 && aprobadosRutas === 0
      ? null
      : aprobadosTradicional === 3
      ? planes.tradicional
      : aprobadosRutas === 3
      ? planes.rutas
      : aprobadosRutas > aprobadosTradicional
      ? planes.rutas
      : planes.tradicional;

  // Casos del boceto: 0 → menú de opciones · 1-2 → panel + menú · 3 → panel de felicitaciones
  const caso: 'sin-cursos' | 'en-curso' | 'acreditado' =
    !plan ? 'sin-cursos' : plan.aprobados === 3 ? 'acreditado' : 'en-curso';

  /** Tarjeta de un curso: un solo dibujo propio en la esquina, sin mosaicos de fondo */
  const renderCurso = (curso: Curso) => {
    const esAprobado = curso.estado === 1;
    const { Icon } = curso;

    return (
      <div
        key={curso.id}
        style={
          esAprobado
            ? {
                borderColor: `${curso.acento}40`,
                backgroundImage: `radial-gradient(120% 130% at 100% 100%, ${curso.acento}1f 0%, transparent 55%)`,
              }
            : undefined
        }
        className={`rounded-2xl border p-3.5 relative overflow-hidden group flex-1 flex flex-col justify-center gap-2 min-h-[96px] transition-shadow ${
          esAprobado ? 'bg-white shadow-sm hover:shadow-md' : 'bg-white border-slate-200'
        }`}
      >
        <CourseIllustration
          tipo={curso.ilustracion}
          className="absolute -right-3 -bottom-4 w-24 h-24 lg:w-32 lg:h-32 pointer-events-none transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3"
          style={{ color: esAprobado ? curso.acento : '#94a3b8', opacity: esAprobado ? 0.26 : 0.2 }}
        />

        {/* Fila superior: Código, Tipo y Estado */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ring-1 shrink-0 ${
                esAprobado ? 'bg-white ring-slate-200 text-slate-800' : 'bg-slate-50 ring-slate-200 text-slate-500'
              }`}
            >
              {curso.codigo}
            </span>
            <span className="text-[11px] text-slate-500 truncate">
              {curso.tipo}
            </span>
          </div>

          {esAprobado ? (
            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Aprobado
            </span>
          ) : (
            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 ring-1 ring-amber-200">
              <Clock className="w-3.5 h-3.5" />
              Pendiente
            </span>
          )}
        </div>

        {/* Título del curso con ícono */}
        <div className="flex items-center gap-3 relative z-10 pr-12 lg:pr-24">
          <div
            style={esAprobado ? { backgroundColor: curso.acento } : undefined}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              esAprobado ? 'text-white shadow-sm' : 'bg-slate-100 text-slate-400 ring-1 ring-slate-200'
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-[15px] font-bold text-slate-900 leading-tight">
              {curso.nombre}
            </h4>
            <p className={`text-xs leading-snug mt-0.5 ${esAprobado ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
              {esAprobado ? `✓ ${curso.tagApproved}` : curso.descripcion}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Lleva a la pantalla de opciones de App, que conserva al estudiante en el header
  const botonMenuOpciones = (
    <button
      type="button"
      onClick={onOpenComoAcreditar}
      className="w-full sm:w-auto h-11 px-5 rounded-xl bg-uss-blue hover:bg-[#041d5f] text-white text-sm font-bold inline-flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
    >
      <LayoutGrid className="w-4 h-4" />
      Menú de opciones
    </button>
  );

  /**
   * Panel derecho del boceto (B). Arriba, a la misma altura que el carné de la izquierda,
   * la estadística de cursos y el mensaje del caso; debajo, los cursos o el menú.
   */
  const renderPanel = () => {
    const cursosDona = plan ? plan.cursos : cursosTradicional;
    const pendientes = plan ? 3 - plan.aprobados : 3;

    const encabezado =
      caso === 'acreditado' && plan ? (
        <>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Acreditado en Computación
          </span>
          <h3 className="text-xl sm:text-2xl lg:text-xl font-extrabold text-slate-900 leading-tight mt-0.5">
            ¡Felicitaciones! Terminaste Computación
          </h3>
        </>
      ) : caso === 'en-curso' && plan ? (
        <>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-uss-blue">
            <Sparkles className="w-3.5 h-3.5" />
            En proceso &bull; {plan.subtitulo}
          </span>
          <h3 className="text-xl sm:text-2xl lg:text-xl font-extrabold text-slate-900 leading-tight mt-0.5">
            {plan.titulo}
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Te {pendientes === 1 ? 'falta 1 curso' : `faltan ${pendientes} cursos`} para acreditar Computación.
          </p>
        </>
      ) : (
        <>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <Circle className="w-3.5 h-3.5" />
            Acreditación en Computación
          </span>
          <h3 className="text-xl sm:text-2xl lg:text-xl font-extrabold text-slate-900 leading-tight mt-0.5">
            Debes iniciar tu acreditación en Computación
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Aún no registras cursos aprobados en el Plan Tradicional ni en el Plan Rutas de Aprendizaje.
          </p>
        </>
      );

    return (
      <section
        className={`lg:col-span-2 lg:row-span-2 flex flex-col lg:grid lg:grid-rows-subgrid bg-white rounded-3xl lg:rounded-2xl ring-1 shadow-sm overflow-hidden relative ${
          caso === 'acreditado' ? 'ring-emerald-200' : 'ring-slate-900/5'
        }`}
      >
        {/* Encabezado: termina con la misma línea que el carné de la izquierda */}
        <div className="relative px-4 py-4 sm:px-5 lg:py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
          {caso === 'acreditado' && (
            <img
              src="/academic-seal.svg"
              alt=""
              className="absolute -top-6 -right-6 w-36 h-36 pointer-events-none opacity-[0.08] select-none"
            />
          )}
          {/* Dona de cursos con el mismo estilo de la gráfica del panel (GexVersionesView) */}
          <DonaCursos cursos={cursosDona} className="w-32 h-32 lg:w-28 lg:h-28 mx-auto sm:mx-0 shrink-0" />
          <div className="min-w-0 flex-1 text-center sm:text-left relative">
            {encabezado}
            <LeyendaCursos cursos={cursosDona} />
          </div>
          {caso !== 'sin-cursos' && <div className="sm:self-end shrink-0 relative">{botonMenuOpciones}</div>}
        </div>

        {/* Cuerpo: los cursos del plan, o el menú si aún no hay cursos */}
        {caso === 'sin-cursos' ? (
          <div className="p-6 flex flex-col items-center justify-center text-center gap-4 min-h-0">
            <HeroIllustration className="w-40 sm:w-48 text-uss-blue/30" />
            {botonMenuOpciones}
          </div>
        ) : (
          <div className="p-4 sm:p-5 lg:p-3 flex flex-col gap-2.5 min-h-0">
            {cursosDona.map(renderCurso)}
          </div>
        )}
      </section>
    );
  };

  // Datos de la ficha, en una sola columna: solo lo académico. El teléfono no se muestra:
  // la portada es pública y basta el código para consultar a cualquier estudiante.
  const datos: { Icon: LucideIcon; label: string; valor: ReactNode }[] = [
    { Icon: User, label: 'Apellidos', valor: apellidos || '—' },
    { Icon: User, label: 'Nombres', valor: nombres || '—' },
    { Icon: School, label: 'Escuela', valor: e.escuela || '—' },
    { Icon: Layers, label: 'Ciclo', valor: e.nCicCodigo ? `Ciclo ${e.nCicCodigo}` : '—' },
    { Icon: MapPin, label: 'Sede', valor: e.campus || 'Chiclayo' },
    { Icon: Compass, label: 'Modalidad', valor: e.modalidad || '—' },
    {
      Icon: Mail,
      label: 'Correo',
      valor: e.correoInstitucional ? (
        <a href={`mailto:${e.correoInstitucional}`} className="text-uss-blue hover:underline break-all lg:break-normal">
          {e.correoInstitucional}
        </a>
      ) : (
        '—'
      ),
    },
  ];

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 gap-3 lg:gap-2 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. BARRA SUPERIOR (escritorio): Volver + Breadcrumb institucional          */}
      {/*    En el celular, Volver vive en el header fijo                            */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex items-center justify-between gap-2 pb-1 border-b border-slate-200/80 shrink-0">
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg ring-1 ring-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-uss-blue text-xs font-semibold transition cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Volver a la búsqueda</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
          <span>Portal GEX</span>
          <span>/</span>
          <span className="font-semibold text-slate-800 truncate">{e.escuela}</span>
          <span>/</span>
          <span className="font-mono font-bold text-uss-blue bg-blue-50 ring-1 ring-blue-100 px-2 py-0.5 rounded-md">
            {e.codUniv}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FICHA (A) A LA IZQUIERDA Y UN SOLO PANEL (B) A LA DERECHA              */}
      {/* ========================================================================= */}
      {/* Dos filas compartidas (encabezado y cuerpo): con subgrid la línea bajo el carné y la del */}
      {/* panel derecho caen a la misma altura, sin importar cuánto mida cada contenido          */}
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-[auto_minmax(0,1fr)] gap-3 lg:gap-y-0 w-full flex-1 min-h-0">
        <aside className="lg:row-span-2 flex flex-col lg:grid lg:grid-rows-subgrid bg-white rounded-3xl lg:rounded-2xl ring-1 ring-slate-900/5 shadow-sm overflow-hidden">
          {/* Credencial: fondo claro con la franja azul USS arriba, sin degradados ni dibujos de fondo */}
          <div className="relative bg-[#f6f8fe] border-b border-slate-200 px-4 pt-5 pb-4 lg:px-3 lg:pt-3.5 lg:pb-3 flex flex-col justify-center gap-3 lg:gap-2">
            <span className="absolute inset-x-0 top-0 h-1 bg-uss-blue" aria-hidden="true" />

            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white ring-1 ring-slate-200 text-uss-blue text-[10px] lg:text-[9px] font-mono font-bold tracking-wider uppercase">
                <ShieldCheck className="w-3 h-3 lg:w-2.5 lg:h-2.5" />
                Carné GEX
              </span>

              {caso === 'sin-cursos' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] lg:text-[9px] font-bold ring-1 ring-slate-200">
                  <Circle className="w-3 h-3 lg:w-2.5 lg:h-2.5" />
                  Sin iniciar
                </span>
              ) : caso === 'en-curso' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] lg:text-[9px] font-bold ring-1 ring-amber-200">
                  <Clock className="w-3 h-3 lg:w-2.5 lg:h-2.5" />
                  En curso
                </span>
              ) : null}
            </div>

            {/* Avatar + Nombre */}
            <div className="flex items-center gap-3 lg:gap-2.5">
              <div className="w-12 h-12 lg:w-9 lg:h-9 rounded-2xl lg:rounded-xl bg-uss-blue flex items-center justify-center font-black text-base lg:text-sm text-white shrink-0 shadow-sm">
                {iniciales}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base lg:text-sm font-extrabold leading-snug text-slate-900 lg:truncate" title={e.nombres}>
                  {e.nombres}
                </h2>
                <p className="text-xs lg:text-[10px] text-slate-500 font-medium truncate mt-0.5" title={e.escuela}>
                  {e.escuela || 'Universidad Señor de Sipán'}
                </p>
              </div>
            </div>

            {/* Código universitario con botón de copiar */}
            <div className="flex items-center justify-between gap-2 py-1.5 lg:py-1 px-2.5 lg:px-2 rounded-xl lg:rounded-lg bg-white ring-1 ring-slate-200">
              <div className="flex items-center gap-1 text-sm lg:text-[11px] font-mono">
                <Hash className="w-3.5 h-3.5 lg:w-3 lg:h-3 text-slate-400" />
                <span className="font-bold text-uss-blue tracking-wider">{e.codUniv}</span>
              </div>
              <button
                onClick={handleCopyCode}
                type="button"
                className="inline-flex items-center gap-1 px-2 py-1 lg:px-1.5 lg:py-0.5 rounded-lg lg:rounded bg-slate-100 hover:bg-slate-200 text-[11px] lg:text-[10px] font-semibold text-slate-600 transition cursor-pointer"
                title="Copiar código universitario"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3 h-3 lg:w-2.5 lg:h-2.5 text-emerald-600" />
                    <span className="text-emerald-700">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 lg:w-2.5 lg:h-2.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Debajo de la línea: datos en una sola columna y el pie de la ficha */}
          <div className="flex flex-col min-h-0">
          <dl className="flex-1 flex flex-col divide-y divide-slate-100 px-4 lg:px-3 min-h-0">
            {datos.map(({ Icon, label, valor }) => (
              <div key={label} className="lg:flex-1 flex items-center justify-between gap-3 py-2.5 lg:py-1 min-w-0">
                <dt className="flex items-center gap-1.5 text-[11px] lg:text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                  <Icon className="w-3.5 h-3.5 lg:w-3 lg:h-3 text-uss-blue/70 shrink-0" />
                  {label}
                </dt>
                <dd className="min-w-0 text-sm lg:text-xs font-semibold text-slate-900 leading-snug text-right lg:truncate">
                  {valor}
                </dd>
              </div>
            ))}
          </dl>

          {/* Pie de la ficha */}
          <div className="px-3.5 py-2 lg:p-2 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-[11px] lg:text-[10px] text-slate-500 shrink-0">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 lg:w-3 lg:h-3 text-uss-blue" />
              Verificación CINF &bull; USS
            </span>
            <span className="font-mono text-[10px] lg:text-[9px] text-slate-400">GEX 2026</span>
          </div>
          </div>
        </aside>

        {renderPanel()}
      </div>

    </div>
  );
}

// Colores de la gráfica "Distribución de Estado" del panel GEX
const COLOR_APROBADO = '#10B981';
const COLOR_PENDIENTE = '#94A3B8';

/** Dona de los cursos del plan: un segmento por curso, verde si está aprobado y gris si no */
function DonaCursos({ cursos, className }: { cursos: Curso[]; className?: string }) {
  // Mismas proporciones que el Pie del panel: radio interior 52, exterior 75 y 3° entre segmentos
  const radio = 63.5;
  const grosor = 23;
  const circunferencia = 2 * Math.PI * radio;
  const separacion = (3 / 360) * circunferencia;
  const tramo = circunferencia / cursos.length;
  const aprobados = cursos.filter((c) => c.estado === 1).length;

  return (
    <div className={`relative ${className ?? ''}`}>
      <svg viewBox="0 0 176 176" className="w-full h-full -rotate-90" aria-hidden="true">
        {cursos.map((curso, i) => (
          <circle
            key={curso.id}
            cx="88"
            cy="88"
            r={radio}
            fill="none"
            stroke={curso.estado === 1 ? COLOR_APROBADO : COLOR_PENDIENTE}
            strokeWidth={grosor}
            strokeDasharray={`${tramo - separacion} ${circunferencia - tramo + separacion}`}
            strokeDashoffset={-(i * tramo + separacion / 2)}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-slate-900 leading-none font-mono">
          {aprobados}/{cursos.length}
        </span>
        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
          Cursos
        </span>
      </div>
    </div>
  );
}

/** Leyenda de la dona: cuántos cursos van aprobados y cuántos faltan, con su porcentaje */
function LeyendaCursos({ cursos }: { cursos: Curso[] }) {
  const aprobados = cursos.filter((c) => c.estado === 1).length;
  const pendientes = cursos.length - aprobados;
  const filas = [
    { nombre: 'Aprobados', valor: aprobados, color: COLOR_APROBADO },
    { nombre: 'Pendientes', valor: pendientes, color: COLOR_PENDIENTE },
  ];

  return (
    <div className="mt-3 inline-flex flex-col gap-1.5 text-left">
      {filas.map((fila) => (
        <div key={fila.nombre} className="flex items-center justify-between gap-6 text-sm">
          <span className="flex items-center gap-2 text-slate-700">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: fila.color }} />
            {fila.nombre}
          </span>
          <span className="font-mono font-bold text-slate-900">
            {fila.valor} ({Math.round((fila.valor / cursos.length) * 100)}%)
          </span>
        </div>
      ))}
    </div>
  );
}
