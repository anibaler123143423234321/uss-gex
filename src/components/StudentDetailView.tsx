import { useState, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowLeft,
  User,
  School,
  Hash,
  Mail,
  Phone,
  MapPin,
  Compass,
  CheckCircle2,
  Clock,
  Layers,
  Monitor,
  Laptop,
  BookOpen,
  Award,
  Wrench,
  AlertCircle,
  Sparkles,
  Trophy,
  Info,
  ArrowRight,
  Copy,
  Check,
  ShieldCheck,
  GraduationCap,
  ExternalLink,
  Printer,
  FileCheck2,
  HelpCircle,
  X,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import CourseIllustration, { type Ilustracion } from './CourseIllustration';
import type { EstudianteGEX } from '../types/estudiante';

interface Props {
  estudiante: EstudianteGEX;
  onBack: () => void;
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

type PlanId = 'tradicional' | 'rutas';

export default function StudentDetailView({ estudiante: e, onBack }: Props) {
  const [showOpcionesModal, setShowOpcionesModal] = useState<boolean>(false);
  const [showComoAcreditarModal, setShowComoAcreditarModal] = useState<boolean>(false);
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

  // 2. Cursos del Plan Tradicional: tonos de azul, una ilustración distinta por curso
  const cursosTradicional: Curso[] = [
    {
      id: 'computacionI',
      codigo: 'INF-101',
      nombre: 'Computación I',
      tipo: 'Computación Básica',
      descripcion: 'Fundamentos de ofimática, productividad digital y herramientas iniciales.',
      estado: e.computacionI >= 1 ? 1 : 0,
      Icon: Monitor,
      ilustracion: 'monitor',
      acento: '#073299',
      tagApproved: '✓ Fundamentos de Ofimática Aprobados',
    },
    {
      id: 'computacionII',
      codigo: 'INF-102',
      nombre: 'Computación II',
      tipo: 'Computación Intermedia',
      descripcion: 'Hojas de cálculo avanzadas, análisis de datos y modelado aplicado.',
      estado: e.computacionII >= 1 ? 1 : 0,
      Icon: BarChart3,
      ilustracion: 'grafico',
      acento: '#0369a1',
      tagApproved: '✓ Análisis y Hojas de Cálculo Aprobado',
    },
    {
      id: 'computacionIII',
      codigo: 'INF-103',
      nombre: 'Computación III',
      tipo: 'Computación Avanzada',
      descripcion: 'Entornos de colaboración en la nube, herramientas web y gestión digital.',
      estado: e.computacionIII >= 1 ? 1 : 0,
      Icon: Laptop,
      ilustracion: 'nube',
      acento: '#4338ca',
      tagApproved: '✓ Computación Avanzada Aprobada',
    },
  ];

  // 3. Cursos de la Ruta de Aprendizaje: turquesa, ámbar y violeta, una ilustración por módulo
  const cursosRutas: Curso[] = [
    {
      id: 'generico',
      codigo: 'GEN-201',
      nombre: 'Módulo Genérico',
      tipo: 'Ofimática Transversal',
      descripcion: 'Competencias digitales transversales y automatización de oficina.',
      estado: e.generico >= 1 ? 1 : 0,
      Icon: BookOpen,
      ilustracion: 'libro',
      acento: '#0f766e',
      tagApproved: '✓ Módulo Transversal Acreditado',
    },
    {
      id: 'especifico',
      codigo: 'ESP-301',
      nombre: 'Módulo Específico',
      tipo: 'Especialidad Carrera',
      descripcion: 'Herramientas tecnológicas orientadas al perfil profesional de la carrera.',
      estado: e.especifico >= 1 ? 1 : 0,
      Icon: Award,
      ilustracion: 'diana',
      acento: '#b45309',
      tagApproved: '✓ Especialidad de Carrera Acreditada',
    },
    {
      id: 'taller',
      codigo: 'TAL-401',
      nombre: 'Taller de Certificación',
      tipo: 'Certificación MOS',
      descripcion: 'Preparación y evaluación oficial con estándar internacional Microsoft MOS.',
      estado: e.taller >= 1 ? 1 : 0,
      Icon: Wrench,
      ilustracion: 'medalla',
      acento: '#7c3aed',
      tagApproved: '✓ Certificación Internacional MOS Aprobada',
    },
  ];

  // 4. Métricas por modalidad (calculado sobre 3 asignaturas cada una)
  const aprobadosTradicional = cursosTradicional.filter((c) => c.estado === 1).length;
  const porcentajeTradicional = Math.round((aprobadosTradicional / 3) * 100);
  const acreditadoTradicional = aprobadosTradicional === 3;

  const aprobadosRutas = cursosRutas.filter((c) => c.estado === 1).length;
  const porcentajeRutas = Math.round((aprobadosRutas / 3) * 100);
  const acreditadoRutas = aprobadosRutas === 3;

  // Estado general de acreditación
  const esAcreditado = acreditadoTradicional || acreditadoRutas;

  const modalidadAcreditada =
    acreditadoTradicional && acreditadoRutas
      ? 'Plan Tradicional y Plan Rutas PROTECH XP'
      : acreditadoTradicional
      ? 'Plan Tradicional (Computación I al III)'
      : 'Plan Rutas de Aprendizaje (PROTECH XP)';

  // En el celular se ve un plan a la vez; arranca en el que más avanzó el estudiante
  const [planMovil, setPlanMovil] = useState<PlanId>(
    aprobadosRutas > aprobadosTradicional ? 'rutas' : 'tradicional'
  );

  const planes = [
    {
      id: 'tradicional' as PlanId,
      titulo: 'Plan Tradicional',
      tituloCorto: 'Tradicional',
      subtitulo: 'Computación I al III',
      cursos: cursosTradicional,
      aprobados: aprobadosTradicional,
      porcentaje: porcentajeTradicional,
      PlanIcon: Monitor,
      acento: '#073299',
    },
    {
      id: 'rutas' as PlanId,
      titulo: 'Plan Rutas de Aprendizaje',
      tituloCorto: 'Rutas',
      subtitulo: 'PROTECH XP Oficial',
      cursos: cursosRutas,
      aprobados: aprobadosRutas,
      porcentaje: porcentajeRutas,
      PlanIcon: Sparkles,
      acento: '#0f766e',
    },
  ];

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
        className={`rounded-2xl lg:rounded-xl border p-3 lg:p-2.5 relative overflow-hidden group flex-1 flex flex-col justify-center gap-2 lg:gap-1 min-h-[96px] lg:min-h-[62px] transition-shadow ${
          esAprobado ? 'bg-white shadow-sm hover:shadow-md' : 'bg-white border-slate-200'
        }`}
      >
        <CourseIllustration
          tipo={curso.ilustracion}
          className="absolute -right-3 -bottom-4 w-24 h-24 lg:w-28 lg:h-28 pointer-events-none transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3"
          style={{ color: esAprobado ? curso.acento : '#94a3b8', opacity: esAprobado ? 0.26 : 0.2 }}
        />

        {/* Fila superior: Código, Tipo y Estado */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`text-[10px] lg:text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ring-1 shrink-0 ${
                esAprobado ? 'bg-white ring-slate-200 text-slate-800' : 'bg-slate-50 ring-slate-200 text-slate-500'
              }`}
            >
              {curso.codigo}
            </span>
            <span className="text-[11px] lg:text-[10px] text-slate-500 truncate">
              {curso.tipo}
            </span>
          </div>

          {esAprobado ? (
            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] lg:text-[10px] font-bold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 lg:w-3 lg:h-3" />
              Aprobado<span className="hidden lg:inline"> (1)</span>
            </span>
          ) : (
            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] lg:text-[10px] font-bold bg-amber-50 text-amber-700 ring-1 ring-amber-200">
              <Clock className="w-3.5 h-3.5 lg:w-3 lg:h-3" />
              Pendiente<span className="hidden lg:inline"> (0)</span>
            </span>
          )}
        </div>

        {/* Título del curso con ícono */}
        <div className="flex items-center gap-3 lg:gap-2.5 relative z-10 pr-10 lg:pr-6">
          <div
            style={esAprobado ? { backgroundColor: curso.acento } : undefined}
            className={`w-10 h-10 lg:w-7 lg:h-7 rounded-xl lg:rounded-lg flex items-center justify-center shrink-0 ${
              esAprobado ? 'text-white shadow-sm' : 'bg-slate-100 text-slate-400 ring-1 ring-slate-200'
            }`}
          >
            <Icon className="w-5 h-5 lg:w-3.5 lg:h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-[15px] lg:text-xs font-bold text-slate-900 leading-tight lg:truncate" title={curso.nombre}>
              {curso.nombre}
            </h4>
            <p
              className={`text-xs lg:text-[10px] leading-snug mt-0.5 lg:truncate ${esAprobado ? 'text-slate-700 font-medium' : 'text-slate-500'}`}
              title={curso.descripcion}
            >
              {esAprobado ? curso.tagApproved : curso.descripcion}
            </p>
          </div>
        </div>
      </div>
    );
  };

  /** Contenedor de un plan: progreso arriba y cursos en columna */
  const renderPlan = (plan: (typeof planes)[number]) => {
    const { titulo, subtitulo, cursos, aprobados, porcentaje, PlanIcon, acento } = plan;
    const esCompleto = aprobados === 3;
    const pendientes = 3 - aprobados;

    return (
      <section
        key={plan.id}
        id={`plan-${plan.id}`}
        role="tabpanel"
        className={`${planMovil === plan.id ? 'flex' : 'hidden'} lg:flex bg-white rounded-3xl lg:rounded-2xl ring-1 ring-slate-900/5 shadow-sm p-3.5 lg:p-3 flex-col h-full relative overflow-hidden`}
      >
        {/* Un solo resplandor del color del plan, en lugar de una trama de puntos */}
        <div
          className="absolute -top-20 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: `${acento}14` }}
        />

        {/* Sello oficial académico de fondo cuando el plan está 100% aprobado */}
        {esCompleto && (
          <img
            src="/academic-seal.svg"
            alt=""
            className="absolute -top-4 -right-4 w-32 h-32 pointer-events-none opacity-[0.08] select-none z-0"
          />
        )}

        {/* Encabezado del Plan + Estado */}
        <div className="flex items-center justify-between gap-2 shrink-0 relative z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-10 h-10 lg:w-8 lg:h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${acento}14`, color: acento }}
            >
              <PlanIcon className="w-5 h-5 lg:w-4 lg:h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] lg:text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                {subtitulo}
              </span>
              <h3 className="text-base lg:text-sm font-extrabold text-slate-900 lg:truncate leading-tight" title={titulo}>
                {titulo}
              </h3>
            </div>
          </div>

          {esCompleto ? (
            <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 lg:py-0.5 rounded-full bg-emerald-50 ring-1 ring-emerald-200 text-emerald-700 text-[11px] lg:text-[10px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 lg:w-3 lg:h-3" />
              Acreditado
            </span>
          ) : aprobados > 0 ? (
            <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 lg:py-0.5 rounded-full bg-blue-50 ring-1 ring-blue-200 text-uss-blue text-[11px] lg:text-[10px] font-bold">
              <Sparkles className="w-3.5 h-3.5 lg:w-3 lg:h-3" />
              En proceso
            </span>
          ) : (
            <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 lg:py-0.5 rounded-full bg-amber-50 ring-1 ring-amber-200 text-amber-700 text-[11px] lg:text-[10px] font-bold">
              <AlertCircle className="w-3.5 h-3.5 lg:w-3 lg:h-3" />
              Pendiente
            </span>
          )}
        </div>

        {/* Progreso con anillo */}
        <div className="mt-3 lg:mt-2 flex items-center gap-3 p-2.5 lg:p-2 rounded-2xl lg:rounded-xl bg-slate-50 ring-1 ring-slate-100 shrink-0 relative z-10">
          <AnilloProgreso porcentaje={porcentaje} color={esCompleto ? '#059669' : acento} />
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-[13px] lg:text-[11px] font-semibold text-slate-700">
              <span className="font-extrabold" style={{ color: esCompleto ? '#059669' : acento }}>{aprobados}</span> de 3 asignaturas aprobadas
            </p>
            <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${porcentaje}%`,
                  background: esCompleto ? 'linear-gradient(90deg,#10b981,#059669)' : `linear-gradient(90deg,${acento}99,${acento})`,
                }}
              />
            </div>
            <p className="text-[11px] lg:text-[10px] text-slate-500">
              {pendientes === 0 ? 'Plan completo' : `${pendientes} ${pendientes === 1 ? 'asignatura pendiente' : 'asignaturas pendientes'}`}
            </p>
          </div>
        </div>

        {/* Cursos del plan */}
        <div className="flex-1 flex flex-col gap-2.5 lg:gap-2 pt-3 lg:pt-2 relative z-10 min-h-0">
          {cursos.map(renderCurso)}
        </div>
      </section>
    );
  };

  // Datos de la ficha. Los largos ocupan las dos columnas de la cuadrícula.
  const datos: { Icon: LucideIcon; label: string; valor: ReactNode; ancho?: boolean }[] = [
    { Icon: User, label: 'Apellidos', valor: apellidos || '—' },
    { Icon: User, label: 'Nombres', valor: nombres || '—' },
    { Icon: School, label: 'Escuela', valor: e.escuela || '—', ancho: true },
    { Icon: Layers, label: 'Ciclo', valor: e.nCicCodigo ? `Ciclo ${e.nCicCodigo}` : '—' },
    { Icon: MapPin, label: 'Sede', valor: e.campus || 'Chiclayo' },
    { Icon: Compass, label: 'Modalidad', valor: e.modalidad || '—', ancho: !e.telefono },
    ...(e.telefono
      ? [{
          Icon: Phone,
          label: 'Teléfono',
          valor: (
            <a href={`tel:${e.telefono}`} className="font-mono hover:text-uss-blue">
              {e.telefono}
            </a>
          ),
        }]
      : []),
    {
      Icon: Mail,
      label: 'Correo',
      ancho: true,
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
    <div className="w-full flex-1 flex flex-col min-h-0 gap-3 lg:gap-1.5 animate-in fade-in duration-200">
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
      {/* 2. FELICITACIÓN DE ACREDITACIÓN: tarjeta en el celular, franja en escritorio */}
      {/* ========================================================================= */}
      {esAcreditado && (
        <div className="relative overflow-hidden rounded-3xl lg:rounded-xl bg-gradient-to-br lg:bg-gradient-to-r from-emerald-700 to-teal-700 text-white p-4 lg:px-3 lg:py-1.5 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-2 shrink-0">
          <Trophy className="lg:hidden absolute -right-4 -top-4 w-28 h-28 text-white/10 rotate-12 pointer-events-none" />

          <div className="flex items-center gap-3 lg:gap-2 min-w-0 relative">
            <div className="lg:hidden w-11 h-11 rounded-2xl bg-white/15 ring-1 ring-white/25 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-uss-gold" />
            </div>
            <span className="hidden lg:inline text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/20 text-emerald-50 shrink-0">
              Acreditado 100%
            </span>
            <div className="min-w-0 lg:flex lg:items-center lg:gap-2">
              <p className="text-base lg:text-xs font-bold leading-tight lg:truncate">
                ¡Felicitaciones, {nombres}!
              </p>
              <p className="text-xs lg:text-[11px] text-emerald-50/90 mt-0.5 lg:mt-0 lg:truncate">
                <span className="hidden lg:inline">&bull; </span>Cumples con la acreditación en Informática ({modalidadAcreditada})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-2.5 shrink-0 relative">
            <button
              onClick={() => setShowComoAcreditarModal(true)}
              type="button"
              className="flex-1 lg:flex-none h-10 lg:h-auto rounded-xl bg-white/15 ring-1 ring-white/25 lg:bg-transparent lg:ring-0 lg:underline text-xs lg:text-[11px] font-semibold text-white lg:text-emerald-50 hover:text-white cursor-pointer"
            >
              Conoce cómo acreditar
            </button>
            <button
              onClick={() => setShowOpcionesModal(true)}
              type="button"
              className="flex-1 lg:flex-none h-10 lg:h-auto inline-flex items-center justify-center gap-1 px-3 lg:px-2.5 lg:py-0.5 rounded-xl lg:rounded-lg bg-white text-emerald-800 hover:bg-emerald-50 text-xs lg:text-[11px] font-extrabold transition cursor-pointer"
            >
              Ir a tus opciones
              <ArrowRight className="w-3.5 h-3.5 lg:w-3 lg:h-3" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CONTENEDOR PRINCIPAL: 3 columnas en escritorio, una debajo de otra en el celular */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 w-full flex-1 min-h-0 items-stretch">
        {/* ========================================================================= */}
        {/* COLUMNA 1: FICHA DEL ESTUDIANTE                                           */}
        {/* ========================================================================= */}
        <aside className="bg-white rounded-3xl lg:rounded-2xl ring-1 ring-slate-900/5 shadow-sm overflow-hidden flex flex-col h-full">
          {/* Credencial */}
          <div className="bg-gradient-to-br from-uss-navy via-uss-blue to-uss-sky p-4 lg:p-3 text-white relative overflow-hidden shrink-0">
            {/* Un birrete grande y una luz: un solo dibujo, no un mosaico */}
            <div className="absolute -left-12 -top-12 w-40 h-40 rounded-full bg-sky-400/25 blur-2xl pointer-events-none" />
            <GraduationCap
              strokeWidth={1.25}
              className="absolute -right-5 -bottom-7 w-32 h-32 lg:w-28 lg:h-28 text-white/[0.08] -rotate-12 pointer-events-none"
            />

            <div className="relative z-10 space-y-3 lg:space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/15 text-white text-[10px] lg:text-[9px] font-mono font-bold tracking-wider uppercase ring-1 ring-white/20">
                  <ShieldCheck className="w-3 h-3 lg:w-2.5 lg:h-2.5 text-uss-gold" />
                  Carné GEX
                </span>

                {esAcreditado ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-100 text-[10px] lg:text-[9px] font-bold ring-1 ring-emerald-300/40">
                    <CheckCircle2 className="w-3 h-3 lg:w-2.5 lg:h-2.5" />
                    Acreditado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-300/20 text-amber-100 text-[10px] lg:text-[9px] font-bold ring-1 ring-amber-200/40">
                    <Clock className="w-3 h-3 lg:w-2.5 lg:h-2.5" />
                    En curso
                  </span>
                )}
              </div>

              {/* Avatar + Nombre */}
              <div className="flex items-center gap-3 lg:gap-2.5">
                <div className="w-12 h-12 lg:w-9 lg:h-9 rounded-2xl lg:rounded-xl bg-white/15 ring-1 ring-white/30 flex items-center justify-center font-black text-base lg:text-sm text-white shrink-0">
                  {iniciales}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base lg:text-sm font-extrabold leading-snug text-white lg:truncate" title={e.nombres}>
                    {e.nombres}
                  </h2>
                  <p className="text-xs lg:text-[10px] text-blue-100 font-medium truncate mt-0.5" title={e.escuela}>
                    {e.escuela || 'Universidad Señor de Sipán'}
                  </p>
                </div>
              </div>

              {/* Código universitario con botón de copiar */}
              <div className="flex items-center justify-between gap-2 py-1.5 lg:py-1 px-2.5 lg:px-2 rounded-xl lg:rounded-lg bg-white/10 ring-1 ring-white/20">
                <div className="flex items-center gap-1 text-sm lg:text-[11px] font-mono">
                  <Hash className="w-3.5 h-3.5 lg:w-3 lg:h-3 text-blue-200" />
                  <span className="font-bold text-white tracking-wider">{e.codUniv}</span>
                </div>
                <button
                  onClick={handleCopyCode}
                  type="button"
                  className="inline-flex items-center gap-1 px-2 py-1 lg:px-1.5 lg:py-0.5 rounded-lg lg:rounded bg-white/15 hover:bg-white/25 text-[11px] lg:text-[10px] font-semibold text-white transition cursor-pointer"
                  title="Copiar código universitario"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3 h-3 lg:w-2.5 lg:h-2.5 text-emerald-300" />
                      <span className="text-emerald-200">Copiado</span>
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
          </div>

          {/* Datos del estudiante en cuadrícula de 2 columnas */}
          <dl className="flex-1 grid grid-cols-2 lg:auto-rows-fr gap-px bg-slate-100 min-h-0">
            {datos.map(({ Icon, label, valor, ancho }) => (
              <div key={label} className={`bg-white px-3.5 py-2.5 lg:px-3 lg:py-1.5 flex flex-col justify-center min-w-0 ${ancho ? 'col-span-2' : ''}`}>
                <dt className="flex items-center gap-1.5 text-[10px] lg:text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  <Icon className="w-3.5 h-3.5 lg:w-3 lg:h-3 text-uss-blue/70 shrink-0" />
                  {label}
                </dt>
                <dd className="mt-0.5 text-sm lg:text-xs font-semibold text-slate-900 leading-snug lg:truncate">
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
        </aside>

        {/* Selector de plan (solo celular): muestra el avance de los dos sin hacer scroll */}
        <div role="tablist" aria-label="Planes de acreditación" className="lg:hidden grid grid-cols-2 gap-1 p-1 rounded-2xl bg-white ring-1 ring-slate-900/5 shadow-sm">
          {planes.map((plan) => {
            const activo = planMovil === plan.id;
            const completo = plan.aprobados === 3;
            return (
              <button
                key={plan.id}
                role="tab"
                type="button"
                aria-selected={activo}
                aria-controls={`plan-${plan.id}`}
                onClick={() => setPlanMovil(plan.id)}
                style={activo ? { backgroundColor: plan.acento } : undefined}
                className={`rounded-xl px-3 py-2 text-left transition cursor-pointer ${
                  activo ? 'text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className={`block text-[10px] font-bold uppercase tracking-wider ${activo ? 'text-white/75' : 'text-slate-400'}`}>
                  {plan.id === 'tradicional' ? 'Computación I–III' : 'PROTECH XP'}
                </span>
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold truncate">{plan.tituloCorto}</span>
                  <span
                    className={`shrink-0 inline-flex items-center gap-0.5 text-[11px] font-mono font-bold px-1.5 rounded-md ${
                      activo ? 'bg-white/20' : completo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {completo && <Check className="w-3 h-3" />}
                    {plan.aprobados}/3
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* COLUMNAS 2 Y 3: PLAN TRADICIONAL Y PLAN RUTAS PROTECH XP                  */}
        {/* ========================================================================= */}
        {planes.map(renderPlan)}
      </div>

      {/* ========================================================================= */}
      {/* 5. MODAL: "IR A TUS OPCIONES" (Para estudiantes acreditados)              */}
      {/* ========================================================================= */}
      {showOpcionesModal && (
        <HojaModal onClose={() => setShowOpcionesModal(false)} ancho="sm:max-w-xl">
          {/* Encabezado del modal */}
          <div className="flex items-center gap-3.5 pr-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 ring-1 ring-amber-200 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                Acreditación Vigente
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1 leading-snug">
                Opciones y Trámites para Estudiantes Acreditados
              </h3>
            </div>
          </div>

          <p className="text-[13px] sm:text-xs text-slate-600 leading-relaxed">
            Estimado(a) <strong className="text-slate-800">{nombres}</strong> ({e.codUniv}), has culminado con éxito la acreditación oficial en Informática. Puedes gestionar tus opciones oficiales a continuación:
          </p>

          {/* Opciones disponibles */}
          <div className="space-y-2.5 sm:space-y-3">
            {/* Opción 1: Solicitar Constancia */}
            <a
              href="https://campus.uss.edu.pe"
              target="_blank"
              rel="noreferrer"
              className="p-3.5 sm:p-4 rounded-2xl ring-1 ring-slate-200 hover:ring-uss-blue bg-slate-50/60 hover:bg-blue-50/40 transition flex items-start justify-between gap-3 group"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-uss-blue flex items-center justify-center shrink-0 group-hover:bg-uss-blue group-hover:text-white transition">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-uss-blue transition">
                    1. Solicitar Constancia Oficial de Acreditación (CINF)
                  </h4>
                  <p className="text-xs sm:text-[11px] text-slate-500 mt-0.5">
                    Tramita tu constancia con firma digital a través del Campus Virtual USS (Mesa de Partes).
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-uss-blue shrink-0 mt-1" />
            </a>

            {/* Opción 2: Imprimir / Descargar Reporte Digital */}
            <button
              onClick={() => window.print()}
              type="button"
              className="w-full text-left p-3.5 sm:p-4 rounded-2xl ring-1 ring-slate-200 hover:ring-emerald-500 bg-slate-50/60 hover:bg-emerald-50/40 transition flex items-start justify-between gap-3 group cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                    2. Imprimir / Guardar Ficha de Verificación (PDF)
                  </h4>
                  <p className="text-xs sm:text-[11px] text-slate-500 mt-0.5">
                    Genera el comprobante imprimible con el registro oficial de las asignaturas aprobadas.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0 mt-1" />
            </button>

            {/* Opción 3: Trámite de Graduación / Titulación */}
            <div className="p-3.5 sm:p-4 rounded-2xl ring-1 ring-slate-200 bg-slate-50/60 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  3. Validación para Carpeta de Grado y Titulación
                </h4>
                <p className="text-xs sm:text-[11px] text-slate-500 mt-0.5">
                  Tu cumplimiento de computación se valida de forma automática ante los Centros Empresariales USS y Registros Académicos.
                </p>
              </div>
            </div>

            {/* Opción 4: Mesa de Ayuda CINF */}
            <a
              href="mailto:cinf@uss.edu.pe"
              className="p-3.5 sm:p-4 rounded-2xl ring-1 ring-slate-200 hover:ring-slate-300 bg-slate-50/60 hover:bg-slate-100/60 transition flex items-start justify-between gap-3 group"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    4. Mesa de Ayuda y Consultas CINF
                  </h4>
                  <p className="text-xs sm:text-[11px] text-slate-500 mt-0.5">
                    Correo: cinf@uss.edu.pe &bull; Atención de lunes a viernes de 8:00 a.m. a 6:00 p.m.
                  </p>
                </div>
              </div>
              <Mail className="w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0 mt-1" />
            </a>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => setShowOpcionesModal(false)}
              type="button"
              className="w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl bg-uss-navy text-white hover:bg-uss-blue text-sm sm:text-xs font-bold transition cursor-pointer"
            >
              Entendido, cerrar
            </button>
          </div>
        </HojaModal>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: "CONOCE CÓMO ACREDITAR" (Detalles oficiales de la normativa)     */}
      {/* ========================================================================= */}
      {showComoAcreditarModal && (
        <HojaModal onClose={() => setShowComoAcreditarModal(false)} ancho="sm:max-w-2xl">
          {/* Encabezado */}
          <div className="flex items-center gap-3.5 pr-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 ring-1 ring-blue-200 text-uss-blue flex items-center justify-center shrink-0">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-uss-blue uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">
                Normativa Oficial CINF &bull; USS
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1 leading-snug">
                Conoce Cómo Acreditar tu Competencia Informática
              </h3>
            </div>
          </div>

          <p className="text-[13px] sm:text-xs text-slate-600 leading-relaxed">
            El Centro de Informática (CINF) de la Universidad Señor de Sipán establece dos modalidades académicas válidas para el programa Gente con Experiencia (GEX). Concluir con éxito cualquiera de las dos vías otorga la acreditación definitiva:
          </p>

          {/* Comparación de los dos planes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Vía 1: Plan Tradicional */}
            <div className="p-4 rounded-2xl ring-1 ring-blue-100 bg-blue-50/40 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-uss-blue text-white flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Plan Tradicional
                </h4>
              </div>
              <p className="text-xs sm:text-[11px] text-slate-500">
                Ruta regular curricular compuesta por 3 asignaturas semestrales:
              </p>
              <ul className="text-[13px] sm:text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                <li><strong className="font-semibold">Computación I</strong> (INF-101)</li>
                <li><strong className="font-semibold">Computación II</strong> (INF-102)</li>
                <li><strong className="font-semibold">Computación III</strong> (INF-103)</li>
              </ul>
              <div className="pt-2 border-t border-blue-100 text-xs sm:text-[11px] font-semibold text-uss-blue">
                Meta: 3 de 3 aprobados (100%)
              </div>
            </div>

            {/* Vía 2: Plan Rutas de Aprendizaje */}
            <div className="p-4 rounded-2xl ring-1 ring-teal-100 bg-teal-50/40 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Plan Rutas PROTECH XP
                </h4>
              </div>
              <p className="text-xs sm:text-[11px] text-slate-500">
                Ruta modular intensiva por competencias y certificación:
              </p>
              <ul className="text-[13px] sm:text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                <li><strong className="font-semibold">Módulo Genérico</strong> (GEN-201)</li>
                <li><strong className="font-semibold">Módulo Específico</strong> (ESP-301)</li>
                <li><strong className="font-semibold">Taller Certificación</strong> (TAL-401)</li>
              </ul>
              <div className="pt-2 border-t border-teal-100 text-xs sm:text-[11px] font-semibold text-teal-700">
                Meta: 3 de 3 aprobados (100%)
              </div>
            </div>
          </div>

          {/* Preguntas frecuentes / Reglas de negocio */}
          <div className="p-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 text-[13px] sm:text-xs text-slate-700 space-y-2">
            <h5 className="font-bold text-uss-blue">Preguntas Clave:</h5>
            <p>
              &bull; <strong>¿Debo completar ambos planes?</strong> No. Basta con que uno de los dos planes esté al 100% (3 de 3 aprobados).
            </p>
            <p>
              &bull; <strong>¿Tiene costo la constancia?</strong> El trámite de constancia digital se efectúa bajo las tasas académicas vigentes del CINF USS en Mesa de Partes.
            </p>
            <p>
              &bull; <strong>¿Cómo convalidar si estudié en otra institución?</strong> Presenta tus certificados de estudios en la coordinación CINF para evaluación curricular.
            </p>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => setShowComoAcreditarModal(false)}
              type="button"
              className="w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl bg-uss-navy text-white hover:bg-uss-blue text-sm sm:text-xs font-bold transition cursor-pointer"
            >
              Cerrar guía
            </button>
          </div>
        </HojaModal>
      )}
    </div>
  );
}

/** Anillo de progreso del plan con el porcentaje al centro */
function AnilloProgreso({ porcentaje, color }: { porcentaje: number; color: string }) {
  const radio = 18;
  const circunferencia = 2 * Math.PI * radio;
  return (
    <div className="relative w-12 h-12 lg:w-10 lg:h-10 shrink-0">
      <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90" aria-hidden="true">
        <circle cx="22" cy="22" r={radio} fill="none" stroke="#e2e8f0" strokeWidth="5" />
        <circle
          cx="22"
          cy="22"
          r={radio}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia * (1 - porcentaje / 100)}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] lg:text-[10px] font-extrabold text-slate-800">
        {porcentaje}%
      </span>
    </div>
  );
}

/** Modal que en el celular se abre como hoja desde abajo y en escritorio queda centrado */
function HojaModal({ children, onClose, ancho }: { children: ReactNode; onClose: () => void; ancho: string }) {
  const estiloEntrada: CSSProperties = { animationDuration: '200ms' };
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
      style={estiloEntrada}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(ev) => ev.stopPropagation()}
        className={`bg-white w-full ${ancho} rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl relative space-y-5 sm:space-y-6 max-h-[88vh] overflow-y-auto animate-in slide-in-from-bottom-2`}
      >
        <div className="sm:hidden mx-auto -mt-2 h-1.5 w-10 rounded-full bg-slate-200" />
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}
