import { useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  User,
  School,
  Hash,
  Mail,
  CheckCircle2,
  Clock,
  Circle,
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
  cantidad?: number;
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

  // 3. Componentes de la Ruta PROTECH XP (Genérico, Específico y Taller)
  const cursosRutas: Curso[] = [
    {
      id: 'generico',
      codigo: 'GEN-201',
      nombre: 'Genérico',
      tipo: 'Herramientas Ofimáticas (PROTECH XP)',
      descripcion: 'Ofimática Word 365, Excel 365 o Diseño con Canva.',
      estado: e.generico >= 1 ? 1 : 0,
      cantidad: e.generico,
      Icon: BookOpen,
      ilustracion: 'libro',
      acento: '#0f766e',
      tagApproved: e.generico > 1 ? `${e.generico} genéricos acreditados` : 'Transversal acreditado',
    },
    {
      id: 'especifico',
      codigo: 'ESP-301',
      nombre: 'Específico',
      tipo: 'Especialidad por Carrera',
      descripcion: 'Curso según perfil profesional (SPSS, Power BI, AutoCAD o Project).',
      estado: e.especifico >= 1 ? 1 : 0,
      cantidad: e.especifico,
      Icon: Award,
      ilustracion: 'diana',
      acento: '#b45309',
      tagApproved: e.especifico > 1 ? `${e.especifico} especialidades acreditadas` : 'Especialidad profesional acreditada',
    },
    {
      id: 'taller',
      codigo: 'TAL-401',
      nombre: 'Taller de Certificación',
      tipo: 'Certificación Internacional',
      descripcion: 'Taller de Certificación Internacional Microsoft Office Specialist (MOS).',
      estado: e.taller >= 1 ? 1 : 0,
      cantidad: e.taller,
      Icon: Wrench,
      ilustracion: 'medalla',
      acento: '#7c3aed',
      tagApproved: e.taller > 1 ? `${e.taller} certificaciones MOS acreditadas` : 'Certificación MOS acreditada',
    },
  ];

  // 4. Métricas por plan: Tradicional se acredita con 3 cursos. Rutas se acredita con 4 cursos sumando Genérico, Específico y Taller.
  const aprobadosTradicional = cursosTradicional.filter((c) => c.estado === 1).length;
  const totalRutas = (e.generico || 0) + (e.especifico || 0) + (e.taller || 0);
  const aprobadosRutas = Math.min(4, totalRutas);

  const planes = {
    tradicional: {
      titulo: 'Plan Tradicional',
      subtitulo: 'Computación I al III',
      totalMeta: 3,
      cursos: cursosTradicional,
      aprobados: aprobadosTradicional,
      PlanIcon: Monitor,
      acento: '#073299',
    },
    rutas: {
      titulo: 'Plan Rutas de Aprendizaje',
      subtitulo: 'PROTECH XP',
      totalMeta: 4,
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
      : aprobadosTradicional >= 3
      ? planes.tradicional
      : aprobadosRutas >= 4
      ? planes.rutas
      : aprobadosRutas > 0 && aprobadosTradicional === 0
      ? planes.rutas
      : (aprobadosRutas / 4) >= (aprobadosTradicional / 3)
      ? planes.rutas
      : planes.tradicional;

  // Casos del boceto: 0 → menú de opciones · en proceso → panel + menú · meta cumplida → panel de felicitaciones
  const caso: 'sin-cursos' | 'en-curso' | 'acreditado' =
    !plan ? 'sin-cursos' : plan.aprobados >= plan.totalMeta ? 'acreditado' : 'en-curso';

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
        className={`rounded-xl border px-3 py-2 sm:px-3.5 sm:py-2.5 relative overflow-hidden group flex-1 flex flex-col justify-center gap-1.5 min-h-[76px] grande:px-5 grande:py-4 grande:gap-2.5 grande:min-h-[128px] grande:rounded-2xl transition-shadow ${
          esAprobado ? 'bg-white shadow-sm hover:shadow-md' : 'bg-white border-slate-200'
        }`}
      >
        <CourseIllustration
          tipo={curso.ilustracion}
          className="absolute -right-2 -bottom-3 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 grande:w-32 grande:h-32 pointer-events-none transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3"
          style={{ color: esAprobado ? curso.acento : '#94a3b8', opacity: esAprobado ? 0.22 : 0.16 }}
        />

        {/* Fila superior: Código, Tipo y Estado */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`text-[9px] grande:text-[11px] font-mono font-bold px-1.5 grande:px-2 py-0.5 rounded-md ring-1 shrink-0 ${
                esAprobado ? 'bg-white ring-slate-200 text-slate-800' : 'bg-slate-50 ring-slate-200 text-slate-500'
              }`}
            >
              {curso.codigo}
            </span>
            <span className="text-[10px] 2xl:text-xs grande:text-[13px] text-slate-500 truncate">
              {curso.tipo}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {curso.cantidad !== undefined && (
              <span
                className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1 grande:min-w-[26px] grande:h-[26px] rounded-full text-[10px] grande:text-xs font-mono font-black ring-1 ${
                  curso.cantidad > 0
                    ? 'bg-blue-50 text-uss-blue ring-blue-200'
                    : 'bg-slate-100 text-slate-400 ring-slate-200'
                }`}
                title="Cantidad aprobada"
              >
                {curso.cantidad}
              </span>
            )}

            {esAprobado ? (
              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 grande:px-2.5 grande:py-1 rounded-full text-[10px] grande:text-xs font-bold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                <CheckCircle2 className="w-3 h-3 grande:w-3.5 grande:h-3.5" />
                Aprobado
              </span>
            ) : (
              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 grande:px-2.5 grande:py-1 rounded-full text-[10px] grande:text-xs font-bold bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                <Clock className="w-3 h-3 grande:w-3.5 grande:h-3.5" />
                Pendiente
              </span>
            )}
          </div>
        </div>

        {/* Título del curso con ícono */}
        <div className="flex items-center gap-2.5 grande:gap-3.5 relative z-10 pr-10 lg:pr-20 grande:pr-28">
          <div
            style={esAprobado ? { backgroundColor: curso.acento } : undefined}
            className={`w-8 h-8 2xl:w-9 2xl:h-9 rounded-lg grande:w-11 grande:h-11 grande:rounded-xl flex items-center justify-center shrink-0 ${
              esAprobado ? 'text-white shadow-sm' : 'bg-slate-100 text-slate-400 ring-1 ring-slate-200'
            }`}
          >
            <Icon className="w-4 h-4 grande:w-5 grande:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm 2xl:text-base grande:text-lg font-bold text-slate-900 leading-tight">
              {curso.nombre}
            </h4>
            <p className={`text-[11px] 2xl:text-[13px] grande:text-sm leading-tight mt-0.5 grande:mt-1 ${esAprobado ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
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
      className="w-full sm:w-auto h-9 px-4 2xl:h-10 grande:h-11 grande:px-5 rounded-xl bg-uss-blue hover:bg-[#041d5f] text-white text-xs 2xl:text-sm font-bold inline-flex items-center justify-center gap-1.5 grande:gap-2 shadow-sm transition cursor-pointer"
    >
      <LayoutGrid className="w-3.5 h-3.5 grande:w-4 grande:h-4" />
      Menú de opciones
    </button>
  );

  /**
   * Panel derecho del boceto (B). Arriba, a la misma altura que el carné de la izquierda,
   * la estadística de cursos y el mensaje del caso; debajo, los cursos o el menú.
   */
  const renderPanel = () => {
    const totalMeta = plan ? plan.totalMeta : 3;
    const aprobados = plan ? plan.aprobados : 0;
    const pendientes = Math.max(0, totalMeta - aprobados);
    const cursosLista = plan ? plan.cursos : cursosTradicional;

    const encabezado =
      caso === 'acreditado' && plan ? (
        <>
          <span className="inline-flex items-center gap-1 text-[10px] grande:text-xs font-bold uppercase tracking-wider text-emerald-700">
            <CheckCircle2 className="w-3 h-3 grande:w-3.5 grande:h-3.5" />
            Acreditado en Computación
          </span>
          <h3 className="text-base sm:text-lg lg:text-base 2xl:text-xl grande:text-2xl font-extrabold text-slate-900 leading-tight mt-0.5">
            ¡Felicitaciones! Terminaste Computación
          </h3>
        </>
      ) : caso === 'en-curso' && plan ? (
        <>
          <span className="inline-flex items-center gap-1 text-[10px] grande:text-xs font-bold uppercase tracking-wider text-uss-blue">
            <Sparkles className="w-3 h-3 grande:w-3.5 grande:h-3.5" />
            En proceso &bull; {plan.subtitulo}
          </span>
          <h3 className="text-base sm:text-lg lg:text-base 2xl:text-xl grande:text-2xl font-extrabold text-slate-900 leading-tight mt-0.5">
            {plan.titulo}
          </h3>
          <p className="text-xs 2xl:text-sm text-slate-600 mt-0.5 grande:mt-1">
            Te {pendientes === 1 ? 'falta 1 curso' : `faltan ${pendientes} cursos`} para acreditar Computación.
          </p>
        </>
      ) : (
        <>
          <span className="inline-flex items-center gap-1 text-[10px] grande:text-xs font-bold uppercase tracking-wider text-slate-500">
            <Circle className="w-3 h-3 grande:w-3.5 grande:h-3.5" />
            Acreditación en Computación
          </span>
          <h3 className="text-base sm:text-lg lg:text-base 2xl:text-xl grande:text-2xl font-extrabold text-slate-900 leading-tight mt-0.5">
            Debes iniciar tu acreditación en Computación
          </h3>
          <p className="text-xs grande:text-sm text-slate-600 mt-0.5 grande:mt-1">
            Aún no registras cursos aprobados en el Plan Tradicional ni en el Plan Rutas de Aprendizaje.
          </p>
        </>
      );

    return (
      <section
        className={`lg:col-span-2 lg:row-span-2 flex flex-col lg:grid lg:grid-rows-subgrid bg-white rounded-2xl ring-1 shadow-sm overflow-hidden relative ${
          caso === 'acreditado' ? 'ring-emerald-200' : 'ring-slate-900/5'
        }`}
      >
        {/* Encabezado: termina con la misma línea que el carné de la izquierda */}
        <div className="relative px-3.5 py-2.5 sm:px-4 sm:py-2 grande:px-6 grande:py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 grande:gap-6">
          {caso === 'acreditado' && (
            <img
              src="/academic-seal.svg"
              alt=""
              className="absolute -top-6 -right-6 w-28 h-28 pointer-events-none opacity-[0.08] select-none"
            />
          )}
          {/* Dona de cursos */}
          <DonaCursos total={totalMeta} aprobados={aprobados} className="w-24 h-24 2xl:w-28 2xl:h-28 grande:w-32 grande:h-32 mx-auto sm:mx-0 shrink-0" />
          <div className="min-w-0 flex-1 text-center sm:text-left relative">
            {encabezado}
          </div>
          {caso === 'en-curso' && <div className="sm:self-end shrink-0 relative">{botonMenuOpciones}</div>}
        </div>

        {/* Cuerpo: los cursos del plan, o el menú si aún no hay cursos */}
        {caso === 'sin-cursos' ? (
          <div className="p-4 sm:p-5 flex flex-col items-center justify-center text-center gap-3 min-h-0">
            <HeroIllustration className="w-32 sm:w-36 grande:w-48 text-uss-blue/30" />
            {botonMenuOpciones}
          </div>
        ) : (
          <div className="p-2.5 sm:p-3 grande:p-4 flex flex-col gap-2 grande:gap-3 min-h-0 flex-1">
            {cursosLista.map(renderCurso)}
          </div>
        )}
      </section>
    );
  };

  // Datos de la ficha, en una sola columna: identidad, escuela y correo. Ni ciclo, ni sede, ni
  // modalidad, ni teléfono: la portada es pública y basta el código para consultar a cualquier estudiante.
  const datos: { Icon: LucideIcon; label: string; valor: ReactNode }[] = [
    { Icon: User, label: 'Apellidos', valor: apellidos || '—' },
    { Icon: User, label: 'Nombres', valor: nombres || '—' },
    { Icon: School, label: 'Escuela', valor: e.escuela || '—' },
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
      <div className="hidden lg:flex items-center justify-between gap-2 pb-1 grande:pb-2 border-b border-slate-200/80 shrink-0">
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg ring-1 ring-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-uss-blue text-xs 2xl:text-sm font-semibold transition cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Volver a la búsqueda</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs 2xl:text-sm text-slate-500 min-w-0">
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
      {/* panel derecho caen a la misma altura. Altura natural: no se estira a toda la pantalla   */}
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-[auto_auto] gap-3 grande:gap-x-4 lg:gap-y-0 w-full">
        <aside className="lg:row-span-2 flex flex-col lg:grid lg:grid-rows-subgrid bg-white rounded-3xl lg:rounded-2xl ring-1 ring-slate-900/5 shadow-sm overflow-hidden">
          {/* Credencial: fondo claro con la franja azul USS arriba, sin degradados ni dibujos de fondo */}
          <div className="relative bg-[#f6f8fe] border-b border-slate-200 px-4 pt-5 pb-4 lg:px-3 lg:pt-3.5 lg:pb-3 grande:px-5 grande:pt-5 grande:pb-4 flex flex-col justify-center gap-3 lg:gap-2 grande:gap-3">
            <span className="absolute inset-x-0 top-0 h-1 bg-uss-blue" aria-hidden="true" />

            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white ring-1 ring-slate-200 text-uss-blue text-[10px] lg:text-[9px] grande:text-[11px] font-mono font-bold tracking-wider uppercase">
                <ShieldCheck className="w-3 h-3 lg:w-2.5 lg:h-2.5" />
                Carné GEX
              </span>

              {caso === 'sin-cursos' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] lg:text-[9px] grande:text-[11px] font-bold ring-1 ring-slate-200">
                  <Circle className="w-3 h-3 lg:w-2.5 lg:h-2.5" />
                  Sin iniciar
                </span>
              ) : caso === 'en-curso' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] lg:text-[9px] grande:text-[11px] font-bold ring-1 ring-amber-200">
                  <Clock className="w-3 h-3 lg:w-2.5 lg:h-2.5" />
                  En curso
                </span>
              ) : null}
            </div>

            {/* Avatar + Nombre */}
            <div className="flex items-center gap-3 lg:gap-2.5">
              <div className="w-12 h-12 lg:w-9 lg:h-9 2xl:w-11 2xl:h-11 grande:w-12 grande:h-12 rounded-2xl lg:rounded-xl bg-uss-blue flex items-center justify-center font-black text-base lg:text-sm grande:text-base text-white shrink-0 shadow-sm">
                {iniciales}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm lg:text-[13px] 2xl:text-[15px] grande:text-base font-extrabold leading-snug text-slate-900 truncate" title={e.nombres}>
                  {e.nombres}
                </h2>
                <p className="text-[10px] 2xl:text-xs text-slate-500 font-medium truncate mt-0.5" title={e.escuela}>
                  {e.escuela || 'Universidad Señor de Sipán'}
                </p>
              </div>
            </div>

            {/* Código universitario con botón de copiar */}
            <div className="flex items-center justify-between gap-2 py-1 px-2 grande:py-1.5 grande:px-3 rounded-lg bg-white ring-1 ring-slate-200">
              <div className="flex items-center gap-1 text-xs 2xl:text-sm font-mono">
                <Hash className="w-3 h-3 text-slate-400" />
                <span className="font-bold text-uss-blue tracking-wider">{e.codUniv}</span>
              </div>
              <button
                onClick={handleCopyCode}
                type="button"
                className="inline-flex items-center gap-1 px-1.5 py-0.5 grande:px-2 rounded bg-slate-100 hover:bg-slate-200 text-[10px] grande:text-xs font-semibold text-slate-600 transition cursor-pointer"
                title="Copiar código universitario"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-2.5 h-2.5 text-emerald-600" />
                    <span className="text-emerald-700">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-2.5 h-2.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Debajo de la línea: datos en una sola columna y el pie de la ficha */}
          <div className="flex flex-col min-h-0">
          <dl className="flex-1 flex flex-col divide-y divide-slate-100 px-4 lg:px-3.5 grande:px-5 min-h-0">
            {datos.map(({ Icon, label, valor }) => (
              <div key={label} className="flex items-center justify-between gap-2 py-2.5 lg:py-1.5 2xl:py-2.5 grande:py-3 min-w-0">
                <dt className="flex items-center gap-1.5 text-[11px] lg:text-[10px] 2xl:text-[11px] grande:text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">
                  <Icon className="w-3.5 h-3.5 lg:w-3 lg:h-3 2xl:w-3.5 2xl:h-3.5 grande:w-4 grande:h-4 text-uss-blue/70 shrink-0" />
                  {label}
                </dt>
                <dd className="min-w-0 text-xs lg:text-[11.5px] 2xl:text-sm grande:text-[15px] font-semibold text-slate-900 leading-snug text-right truncate">
                  {valor}
                </dd>
              </div>
            ))}
          </dl>

          {/* Pie de la ficha */}
          <div className="px-3.5 py-2 lg:px-3 lg:py-1.5 grande:px-5 grande:py-2.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-[10px] grande:text-xs text-slate-500 shrink-0">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-uss-blue" />
              Verificación CINF &bull; USS
            </span>
            <span className="font-mono text-[9px] text-slate-400">GEX 2026</span>
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

/** Dona de los cursos del plan: un segmento por curso (3 en tradicional, 4 en rutas), verde si está aprobado y gris si no */
function DonaCursos({
  total = 3,
  aprobados = 0,
  className,
}: {
  total: number;
  aprobados: number;
  className?: string;
}) {
  // Mismas proporciones que el Pie del panel: radio interior 52, exterior 75 y 3° entre segmentos
  const radio = 63.5;
  const grosor = 23;
  const circunferencia = 2 * Math.PI * radio;
  const separacion = (3 / 360) * circunferencia;
  const tramo = circunferencia / total;
  const numAprobados = Math.min(total, Math.max(0, aprobados));
  const porcentaje = total > 0 ? Math.round((numAprobados / total) * 100) : 0;

  return (
    <div className={`relative ${className ?? ''}`}>
      <svg viewBox="0 0 176 176" className="w-full h-full -rotate-90" aria-hidden="true">
        {Array.from({ length: total }).map((_, i) => (
          <circle
            key={i}
            cx="88"
            cy="88"
            r={radio}
            fill="none"
            stroke={i < numAprobados ? COLOR_APROBADO : COLOR_PENDIENTE}
            strokeWidth={grosor}
            strokeDasharray={`${tramo - separacion} ${circunferencia - tramo + separacion}`}
            strokeDashoffset={-(i * tramo + separacion / 2)}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl 2xl:text-2xl font-black text-slate-900 leading-none font-mono">
          {porcentaje}%
        </span>
      </div>
    </div>
  );
}
