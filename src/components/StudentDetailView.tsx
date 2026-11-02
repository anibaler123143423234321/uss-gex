import { useState } from 'react';
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
  Cloud,
  Globe,
} from 'lucide-react';
import type { EstudianteGEX } from '../types/estudiante';

interface Props {
  estudiante: EstudianteGEX;
  onBack: () => void;
}

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

  // 2. Cursos del Plan Tradicional (3 cursos con mosaicos, fondos y marcas de agua DIVERSIFICADAS)
  const cursosTradicional = [
    {
      id: 'computacionI',
      codigo: 'INF-101',
      nombre: 'Computación I',
      tipo: 'Computación Básica',
      descripcion: 'Fundamentos de ofimática, productividad digital y herramientas iniciales.',
      estado: e.computacionI >= 1 ? 1 : 0,
      Icon: Monitor,
      WatermarkIcon: Monitor,
      bgApproved: 'from-emerald-50/90 via-white to-teal-50/50',
      borderApproved: 'border-emerald-300',
      badgeColor: 'text-emerald-900 bg-emerald-100/90 border-emerald-300',
      iconBg: 'bg-emerald-600 text-white',
      patternUrl: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 8h8v6H4zM16 8h8v6h-8zM28 8h8v6h-8zM4 18h8v6H4zM16 18h8v6h-8zM28 18h8v6h-8z' fill='%23059669' fill-opacity='0.05'/%3E%3C/svg%3E",
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
      WatermarkIcon: BarChart3,
      bgApproved: 'from-teal-50/90 via-white to-emerald-50/50',
      borderApproved: 'border-teal-300',
      badgeColor: 'text-teal-900 bg-teal-100/90 border-teal-300',
      iconBg: 'bg-teal-600 text-white',
      patternUrl: "data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 6h36v36H6z' fill='none' stroke='%230d9488' stroke-width='1' stroke-opacity='0.09'/%3E%3Cpath d='M6 18h36M6 30h36M18 6v36M30 6v36' stroke='%230d9488' stroke-width='1' stroke-opacity='0.09'/%3E%3Crect x='10' y='22' width='4' height='16' fill='%230d9488' fill-opacity='0.07'/%3E%3Crect x='22' y='14' width='4' height='24' fill='%230d9488' fill-opacity='0.07'/%3E%3Crect x='34' y='8' width='4' height='30' fill='%230d9488' fill-opacity='0.07'/%3E%3C/svg%3E",
      tagApproved: '✓ Análisis y Hojas de Cálculo Aprobado',
    },
    {
      id: 'computacionIII',
      codigo: 'INF-103',
      nombre: 'Computación III',
      tipo: 'Computación Avanzada',
      descripcion: 'Entornos de colaboración en la nube, herramientas web y gestión digital.',
      estado: e.computacionIII >= 1 ? 1 : 0,
      Icon: Globe,
      WatermarkIcon: Cloud,
      bgApproved: 'from-cyan-50/90 via-white to-emerald-50/50',
      borderApproved: 'border-cyan-300',
      badgeColor: 'text-cyan-900 bg-cyan-100/90 border-cyan-300',
      iconBg: 'bg-cyan-600 text-white',
      patternUrl: "data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='12' cy='16' r='4' fill='%230284c7' fill-opacity='0.08'/%3E%3Ccircle cx='36' cy='16' r='4' fill='%230284c7' fill-opacity='0.08'/%3E%3Ccircle cx='24' cy='34' r='5' fill='%230284c7' fill-opacity='0.08'/%3E%3Cpath d='M12 16l12 18 12-18' stroke='%230284c7' stroke-width='1.2' stroke-dasharray='2 2' stroke-opacity='0.12'/%3E%3C/svg%3E",
      tagApproved: '✓ Entornos Cloud y Web Aprobados',
    },
  ];

  // 3. Cursos de la Ruta de Aprendizaje (3 módulos oficiales con mosaicos y marcas de agua DIVERSIFICADAS)
  const cursosRutas = [
    {
      id: 'generico',
      codigo: 'GEN-201',
      nombre: 'Módulo Genérico',
      tipo: 'Ofimática Transversal',
      descripcion: 'Competencias digitales transversales y automatización de oficina.',
      estado: e.generico >= 1 ? 1 : 0,
      Icon: BookOpen,
      WatermarkIcon: BookOpen,
      bgApproved: 'from-emerald-50/90 via-white to-blue-50/50',
      borderApproved: 'border-emerald-300',
      badgeColor: 'text-emerald-900 bg-emerald-100/90 border-emerald-300',
      iconBg: 'bg-emerald-600 text-white',
      patternUrl: "data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 12c6-3 12-3 16 0v24c-4-3-10-3-16 0V12zm32 0c-6-3-12-3-16 0v24c4-3 10-3 16 0V12z' fill='%2310b981' fill-opacity='0.06' stroke='%23059669' stroke-width='1' stroke-opacity='0.09'/%3E%3C/svg%3E",
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
      WatermarkIcon: Award,
      bgApproved: 'from-amber-50/80 via-white to-emerald-50/50',
      borderApproved: 'border-amber-300',
      badgeColor: 'text-amber-900 bg-amber-100/90 border-amber-300',
      iconBg: 'bg-amber-600 text-white',
      patternUrl: "data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='24' cy='20' r='8' fill='%23d97706' fill-opacity='0.07' stroke='%23d97706' stroke-width='1' stroke-opacity='0.12'/%3E%3Cpath d='M20 28l4-2 4 2-1-6h-6z' fill='%23d97706' fill-opacity='0.09'/%3E%3Cpolygon points='24,14 26,18 30,18 27,21 28,25 24,23 20,25 21,21 18,18 22,18' fill='%23d97706' fill-opacity='0.14'/%3E%3C/svg%3E",
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
      WatermarkIcon: FileCheck2,
      bgApproved: 'from-indigo-50/80 via-white to-emerald-50/50',
      borderApproved: 'border-indigo-300',
      badgeColor: 'text-indigo-900 bg-indigo-100/90 border-indigo-300',
      iconBg: 'bg-indigo-600 text-white',
      patternUrl: "data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='24' cy='20' r='10' fill='%234f46e5' fill-opacity='0.07' stroke='%234f46e5' stroke-width='1' stroke-opacity='0.12'/%3E%3Cpath d='M18 28l-4 12 10-4 10 4-4-12' fill='%234f46e5' fill-opacity='0.09' stroke='%234f46e5' stroke-width='1' stroke-opacity='0.14'/%3E%3Cpath d='M20 20l3 3 6-6' stroke='%234f46e5' stroke-width='1.5' stroke-linecap='round' stroke-opacity='0.25' fill='none'/%3E%3C/svg%3E",
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

  /** Renderiza un contenedor de plan con fondo enriquecido, diseño compacto para 1 pantalla, progreso superior y cursos en columna vertical */
  const renderPlanColumn = (
    titulo: string,
    subtituloBadge: string,
    cursos: typeof cursosTradicional,
    aprobados: number,
    porcentaje: number,
    PlanIcon: typeof Monitor | typeof Sparkles
  ) => {
    const esCompleto = aprobados === 3;
    const pendientes = 3 - aprobados;

    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3 flex flex-col justify-between h-full relative overflow-hidden">
        {/* Sello oficial académico de fondo cuando el plan está 100% aprobado */}
        {esCompleto && (
          <img
            src="/academic-seal.svg"
            alt="Sello Académico Acreditado"
            className="absolute -top-4 -right-4 w-32 h-32 pointer-events-none opacity-[0.08] select-none z-0"
          />
        )}

        {/* Fondo sutil con trama geométrica de puntos */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(#073299 1.5px, transparent 1.5px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Encabezado del Plan + Estado */}
        <div className="space-y-2 shrink-0 relative z-10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-colors ${
                  esCompleto
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                    : aprobados > 0
                    ? 'bg-blue-50 text-[#073299] border border-blue-200/80'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}
              >
                <PlanIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  {subtituloBadge}
                </span>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate" title={titulo}>
                  {titulo}
                </h3>
              </div>
            </div>

            {/* Badge de Estado del Plan */}
            <div className="shrink-0">
              {esCompleto ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold shadow-2xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Acreditado (100%)</span>
                </span>
              ) : aprobados > 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-[#073299] text-[10px] font-bold shadow-2xs">
                  <Sparkles className="w-3 h-3 text-[#073299]" />
                  <span>En Proceso</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold shadow-2xs">
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  <span>Pendiente</span>
                </span>
              )}
            </div>
          </div>

          {/* Barra de Progreso compacta */}
          <div className="p-2 bg-slate-50/90 rounded-xl border border-slate-100/90 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className="text-slate-700">
                Progreso: <span className="text-[#073299] font-extrabold">{aprobados}</span> de <span className="font-bold">3</span> asignaturas
              </span>
              <span className={`font-mono font-extrabold text-[10px] px-1.5 py-0.2 rounded-md ${
                esCompleto ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200/80 text-slate-800'
              }`}>
                {porcentaje}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  esCompleto
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    : 'bg-gradient-to-r from-[#073299] via-[#0b4ed6] to-blue-500'
                }`}
                style={{ width: `${porcentaje}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
              <span>• {aprobados} {aprobados === 1 ? 'Aprobado' : 'Aprobados'}</span>
              <span>• {pendientes} {pendientes === 1 ? 'Pendiente' : 'Pendientes'}</span>
            </div>
          </div>
        </div>

        {/* Cursos del Plan en COLUMNA VERTICAL con mosaicos, fondos y marcas de agua DIVERSIFICADAS */}
        <div className="flex-1 flex flex-col justify-between gap-2 pt-2 relative z-10 min-h-0">
          {cursos.map((curso) => {
            const esAprobado = curso.estado === 1;
            const { Icon, WatermarkIcon } = curso;

            return (
              <div
                key={curso.id}
                style={
                  esAprobado
                    ? {
                        backgroundImage: `url("${curso.patternUrl}"), linear-gradient(135deg, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.98) 100%)`,
                        backgroundSize: '48px 48px, 100% 100%',
                        backgroundRepeat: 'repeat, no-repeat',
                      }
                    : undefined
                }
                className={`rounded-xl border p-2.5 transition-all relative overflow-hidden group flex flex-col justify-between min-h-0 ${
                  esAprobado
                    ? `bg-gradient-to-br ${curso.bgApproved} ${curso.borderApproved} shadow-2xs`
                    : 'border-slate-200/90 bg-white shadow-2xs'
                }`}
              >
                {/* Marca de agua individual propia y temática de cada curso */}
                {esAprobado ? (
                  <div className="absolute -bottom-1.5 -right-1.5 w-14 h-14 pointer-events-none opacity-[0.14] transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
                    <WatermarkIcon className="w-full h-full text-slate-800" />
                  </div>
                ) : (
                  <div className="absolute -bottom-1 -right-1 w-12 h-12 pointer-events-none opacity-[0.04] text-slate-400 flex items-center justify-center">
                    <Icon className="w-full h-full" />
                  </div>
                )}

                {/* Fila superior: Código, Tipo y Badge de Estado */}
                <div className="flex items-center justify-between gap-2 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border shadow-2xs ${
                      esAprobado
                        ? 'bg-white border-slate-200 text-slate-800 font-extrabold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}>
                      {curso.codigo}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate">
                      {curso.tipo}
                    </span>
                  </div>

                  {/* Estado Oficial */}
                  <div className="shrink-0">
                    {esAprobado ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-md text-[10px] font-extrabold border shadow-2xs ${curso.badgeColor}`}>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Aprobado (1)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Pendiente (0)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Fila media: Título del curso con ícono */}
                <div className="flex items-center gap-2.5 pt-1 relative z-10">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs transition-colors ${
                      esAprobado
                        ? `${curso.iconBg}`
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 leading-tight truncate" title={curso.nombre}>
                      {curso.nombre}
                    </h4>
                    <p className={`text-[10px] truncate mt-0.2 ${esAprobado ? 'text-slate-700 font-medium' : 'text-slate-500'}`} title={curso.descripcion}>
                      {esAprobado ? curso.tagApproved : curso.descripcion}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between min-h-0 gap-1.5 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. BARRA SUPERIOR: Volver a la búsqueda + Breadcrumb institucional        */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-200/80 shrink-0">
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-[#073299] text-xs font-semibold transition shadow-2xs cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Volver a la búsqueda</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Portal GEX</span>
          <span>/</span>
          <span className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-none">{e.escuela}</span>
          <span>/</span>
          <span className="font-mono font-bold text-[#073299] bg-blue-50 border border-blue-100 px-2 py-0.2 rounded-md">
            {e.codUniv}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ALERTA ULTRA-SLIM DE ACREDITACIÓN (Bajo perfil, sin textos burocráticos) */}
      {/* ========================================================================= */}
      {esAcreditado && (
        <div className="rounded-xl bg-gradient-to-r from-emerald-600 via-teal-700 to-[#073299] text-white px-3 py-1.5 shadow-2xs border border-emerald-400/30 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-white/20 text-emerald-100 shrink-0">
              Acreditado 100%
            </span>
            <span className="text-xs font-bold truncate">
              ¡Felicitaciones, {nombres}!
            </span>
            <span className="text-[11px] text-emerald-100 hidden md:inline truncate">
              &bull; Cumples con la acreditación en Informática ({modalidadAcreditada})
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowComoAcreditarModal(true)}
              type="button"
              className="text-[11px] text-emerald-100 hover:text-white underline font-semibold cursor-pointer"
            >
              Conoce cómo acreditar
            </button>
            <button
              onClick={() => setShowOpcionesModal(true)}
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white text-[#073299] hover:bg-emerald-50 text-[11px] font-extrabold shadow-2xs transition cursor-pointer"
            >
              <span>Ir a tus opciones</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CONTENEDOR PRINCIPAL: 3 COLUMNAS SIMÉTRICAS QUE CABEN EN 1 PANTALLA    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 w-full flex-1 min-h-0 items-stretch">
        {/* ========================================================================= */}
        {/* COLUMNA 1: FICHA DEL ESTUDIANTE COMPACTA                                  */}
        {/* ========================================================================= */}
        <aside className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between h-full relative">
          {/* Header con Credencial */}
          <div className="bg-gradient-to-br from-[#052570] via-[#073299] to-[#0e48bd] p-2.5 sm:p-3 text-white relative overflow-hidden shrink-0">
            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded bg-white/15 text-white text-[9px] font-mono font-bold tracking-wider uppercase border border-white/20">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-300" />
                  Carné GEX
                </span>

                {esAcreditado ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-200 text-[9px] font-bold border border-emerald-300/40">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Acreditado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-400/25 text-amber-200 text-[9px] font-bold border border-amber-300/30">
                    <Clock className="w-2.5 h-2.5" />
                    En Curso
                  </span>
                )}
              </div>

              {/* Avatar + Nombre */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-black text-sm text-white shrink-0 shadow-inner">
                  {iniciales}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xs sm:text-sm font-extrabold leading-snug text-white truncate" title={e.nombres}>
                    {e.nombres}
                  </h2>
                  <p className="text-[10px] text-blue-100 font-medium truncate mt-0.2" title={e.escuela}>
                    {e.escuela || 'Universidad Señor de Sipán'}
                  </p>
                </div>
              </div>

              {/* Barra de código universitario con botón de copiar */}
              <div className="flex items-center justify-between gap-2 p-1 px-2 rounded-lg bg-white/15 backdrop-blur-md border border-white/25">
                <div className="flex items-center gap-1 text-[11px] font-mono">
                  <Hash className="w-3 h-3 text-blue-200" />
                  <span className="font-bold text-white tracking-wider">{e.codUniv}</span>
                </div>
                <button
                  onClick={handleCopyCode}
                  type="button"
                  className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-white/20 hover:bg-white/30 text-[10px] font-medium text-white transition cursor-pointer"
                  title="Copiar código universitario"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-2.5 h-2.5 text-emerald-300" />
                      <span className="text-emerald-200">Copiado</span>
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
          </div>

          {/* Lista compacta de datos del estudiante */}
          <div className="p-2.5 flex-1 flex flex-col justify-between text-xs divide-y divide-slate-100 min-h-0">
            {/* Apellidos */}
            <div className="flex items-center justify-between gap-2 py-1 first:pt-0">
              <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
                <User className="w-3.5 h-3.5 text-[#073299] shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Apellidos</span>
              </div>
              <span className="font-bold text-slate-900 text-xs truncate text-right">{apellidos || '—'}</span>
            </div>

            {/* Nombres */}
            <div className="flex items-center justify-between gap-2 py-1">
              <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
                <User className="w-3.5 h-3.5 text-[#073299] shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Nombres</span>
              </div>
              <span className="font-bold text-slate-900 text-xs truncate text-right">{nombres || '—'}</span>
            </div>

            {/* Escuela Profesional */}
            <div className="flex items-center justify-between gap-2 py-1">
              <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
                <School className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Escuela</span>
              </div>
              <span className="font-semibold text-slate-800 text-xs truncate text-right max-w-[140px]" title={e.escuela}>{e.escuela || '—'}</span>
            </div>

            {/* Ciclo Académico */}
            <div className="flex items-center justify-between gap-2 py-1">
              <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
                <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Ciclo</span>
              </div>
              <span className="font-semibold text-slate-800 text-xs">{e.nCicCodigo ? `Ciclo ${e.nCicCodigo}` : '—'}</span>
            </div>

            {/* Campus / Sede */}
            <div className="flex items-center justify-between gap-2 py-1">
              <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Sede</span>
              </div>
              <span className="font-semibold text-slate-800 text-xs">{e.campus || 'Chiclayo'}</span>
            </div>

            {/* Modalidad */}
            <div className="flex items-center justify-between gap-2 py-1">
              <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
                <Compass className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Modalidad</span>
              </div>
              <span className="font-semibold text-slate-800 text-xs truncate text-right">{e.modalidad || '—'}</span>
            </div>

            {/* Correo Institucional */}
            <div className="flex items-center justify-between gap-2 py-1">
              <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Correo</span>
              </div>
              {e.correoInstitucional ? (
                <a href={`mailto:${e.correoInstitucional}`} className="text-xs font-semibold text-[#073299] hover:underline truncate text-right max-w-[150px]" title={e.correoInstitucional}>
                  {e.correoInstitucional}
                </a>
              ) : (
                <span className="text-slate-400 text-xs">—</span>
              )}
            </div>

            {/* Teléfono / Celular */}
            {e.telefono && (
              <div className="flex items-center justify-between gap-2 py-1">
                <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Teléfono</span>
                </div>
                <a href={`tel:${e.telefono}`} className="font-mono font-medium text-slate-800 text-xs">
                  {e.telefono}
                </a>
              </div>
            )}
          </div>

          {/* Footer del Nav */}
          <div className="p-2 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-[10px] text-slate-500 shrink-0">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#073299]" />
              Verificación CINF &bull; USS
            </span>
            <span className="font-mono text-[9px] text-slate-400">GEX 2026</span>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* COLUMNA 2: PLAN TRADICIONAL                                               */}
        {/* ========================================================================= */}
        {renderPlanColumn(
          'Plan Tradicional',
          'Computación I al III',
          cursosTradicional,
          aprobadosTradicional,
          porcentajeTradicional,
          Monitor
        )}

        {/* ========================================================================= */}
        {/* COLUMNA 3: PLAN RUTAS PROTECH XP                                          */}
        {/* ========================================================================= */}
        {renderPlanColumn(
          'Plan Rutas de Aprendizaje',
          'PROTECH XP Oficial',
          cursosRutas,
          aprobadosRutas,
          porcentajeRutas,
          Sparkles
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. MODAL: "IR A TUS OPCIONES" (Para estudiantes acreditados)              */}
      {/* ========================================================================= */}
      {showOpcionesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative space-y-6">
            {/* Botón cerrar */}
            <button
              onClick={() => setShowOpcionesModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Encabezado del modal */}
            <div className="flex items-center gap-3.5 pr-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                  Acreditación Vigente
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Opciones y Trámites para Estudiantes Acreditados
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Estimado(a) <strong className="text-slate-800">{nombres}</strong> ({e.codUniv}), has culminado con éxito la acreditación oficial en Informática. Puedes gestionar tus opciones oficiales a continuación:
            </p>

            {/* Opciones disponibles */}
            <div className="space-y-3">
              {/* Opción 1: Solicitar Constancia */}
              <a
                href="https://campus.uss.edu.pe"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl border border-slate-200 hover:border-[#073299] bg-slate-50/60 hover:bg-blue-50/40 transition flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#073299] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#073299] group-hover:text-white transition">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#073299] transition">
                      1. Solicitar Constancia Oficial de Acreditación (CINF)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tramita tu constancia con firma digital a través del Campus Virtual USS (Mesa de Partes).
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#073299] shrink-0 mt-1" />
              </a>

              {/* Opción 2: Imprimir / Descargar Reporte Digital */}
              <button
                onClick={() => window.print()}
                type="button"
                className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/40 transition flex items-start justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-600 group-hover:text-white transition">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                      2. Imprimir / Guardar Ficha de Verificación (PDF)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Genera el comprobante imprimible con el registro oficial de las asignaturas aprobadas.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0 mt-1" />
              </button>

              {/* Opción 3: Trámite de Graduación / Titulación */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    3. Validación para Carpeta de Grado y Titulación
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tu cumplimiento de computación se valida de forma automática ante los Centros Empresariales USS y Registros Académicos.
                  </p>
                </div>
              </div>

              {/* Opción 4: Mesa de Ayuda CINF */}
              <a
                href="mailto:cinf@uss.edu.pe"
                className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-100/60 transition flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      4. Mesa de Ayuda y Consultas CINF
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Correo: cinf@uss.edu.pe &bull; Atención de lunes a viernes de 8:00 a.m. a 6:00 p.m.
                    </p>
                  </div>
                </div>
                <Mail className="w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0 mt-1" />
              </a>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowOpcionesModal(false)}
                type="button"
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
              >
                Entendido, cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: "CONOCE CÓMO ACREDITAR" (Detalles oficiales de la normativa)     */}
      {/* ========================================================================= */}
      {showComoAcreditarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Botón cerrar */}
            <button
              onClick={() => setShowComoAcreditarModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Encabezado */}
            <div className="flex items-center gap-3.5 pr-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#073299] flex items-center justify-center shrink-0">
                <Info className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#073299] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">
                  Normativa Oficial CINF &bull; USS
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Conoce Cómo Acreditar tu Competencia Informática
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              El Centro de Informática (CINF) de la Universidad Señor de Sipán establece dos modalidades académicas válidas para el programa Gente con Experiencia (GEX). Concluir con éxito cualquiera de las dos vías otorga la acreditación definitiva:
            </p>

            {/* Comparación de los dos planes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vía 1: Plan Tradicional */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#073299] flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    Plan Tradicional
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500">
                  Ruta regular curricular compuesta por 3 asignaturas semestrales:
                </p>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                  <li><strong className="font-semibold">Computación I</strong> (INF-101)</li>
                  <li><strong className="font-semibold">Computación II</strong> (INF-102)</li>
                  <li><strong className="font-semibold">Computación III</strong> (INF-103)</li>
                </ul>
                <div className="pt-2 border-t border-slate-200/80 text-[11px] font-semibold text-[#073299]">
                  Meta: 3 de 3 aprobados (100%)
                </div>
              </div>

              {/* Vía 2: Plan Rutas de Aprendizaje */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    Plan Rutas PROTECH XP
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500">
                  Ruta modular intensiva por competencias y certificación:
                </p>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                  <li><strong className="font-semibold">Módulo Genérico</strong> (GEN-201)</li>
                  <li><strong className="font-semibold">Módulo Específico</strong> (ESP-301)</li>
                  <li><strong className="font-semibold">Taller Certificación</strong> (TAL-401)</li>
                </ul>
                <div className="pt-2 border-t border-slate-200/80 text-[11px] font-semibold text-emerald-700">
                  Meta: 3 de 3 aprobados (100%)
                </div>
              </div>
            </div>

            {/* Preguntas frecuentes / Reglas de negocio */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700 space-y-2">
              <h5 className="font-bold text-[#073299]">Preguntas Clave:</h5>
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

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowComoAcreditarModal(false)}
                type="button"
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
              >
                Cerrar guía
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
