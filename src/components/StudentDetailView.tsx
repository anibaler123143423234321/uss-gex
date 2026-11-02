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
  Code,
  Laptop,
  BookOpen,
  Award,
  Wrench,
  AlertCircle,
  Sparkles,
  Trophy,
  PartyPopper,
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

  // 2. Cursos del Plan Tradicional (3 cursos: Computación I al III)
  const cursosTradicional = [
    {
      id: 'computacionI',
      codigo: 'INF-101',
      nombre: 'Computación I',
      tipo: 'Computación Básica',
      descripcion: 'Fundamentos de ofimática, productividad digital y herramientas iniciales.',
      estado: e.computacionI >= 1 ? 1 : 0,
      Icon: Monitor,
    },
    {
      id: 'computacionII',
      codigo: 'INF-102',
      nombre: 'Computación II',
      tipo: 'Computación Intermedia',
      descripcion: 'Hojas de cálculo avanzadas, análisis de datos y modelado aplicado.',
      estado: e.computacionII >= 1 ? 1 : 0,
      Icon: Code,
    },
    {
      id: 'computacionIII',
      codigo: 'INF-103',
      nombre: 'Computación III',
      tipo: 'Computación Avanzada',
      descripcion: 'Entornos de colaboración en la nube, herramientas web y gestión digital.',
      estado: e.computacionIII >= 1 ? 1 : 0,
      Icon: Laptop,
    },
  ];

  // 3. Cursos de la Ruta de Aprendizaje (PROTECH XP: 3 módulos oficiales del Excel)
  const cursosRutas = [
    {
      id: 'generico',
      codigo: 'GEN-201',
      nombre: 'Módulo Genérico',
      tipo: 'Ofimática Transversal',
      descripcion: 'Competencias digitales transversales y automatización de oficina.',
      estado: e.generico >= 1 ? 1 : 0,
      Icon: BookOpen,
    },
    {
      id: 'especifico',
      codigo: 'ESP-301',
      nombre: 'Módulo Específico',
      tipo: 'Especialidad Carrera',
      descripcion: 'Herramientas tecnológicas orientadas al perfil profesional de la carrera.',
      estado: e.especifico >= 1 ? 1 : 0,
      Icon: Award,
    },
    {
      id: 'taller',
      codigo: 'TAL-401',
      nombre: 'Taller de Certificación',
      tipo: 'Certificación MOS',
      descripcion: 'Preparación y evaluación oficial con estándar internacional Microsoft MOS.',
      estado: e.taller >= 1 ? 1 : 0,
      Icon: Wrench,
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

  /** Renderiza un contenedor de plan con fondo enriquecido, mayor altura, progreso superior y cursos en columna vertical */
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
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-md">
        {/* Sello oficial académico de fondo cuando el plan está 100% aprobado */}
        {esCompleto && (
          <img
            src="/academic-seal.svg"
            alt="Sello Académico Acreditado"
            className="absolute -top-6 -right-6 w-44 h-44 pointer-events-none opacity-[0.09] select-none z-0"
          />
        )}

        {/* Fondo sutil con trama geométrica de puntos */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(#073299 1.5px, transparent 1.5px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Encabezado del Plan + Estado */}
        <div className="space-y-4 shrink-0 relative z-10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs transition-colors ${
                  esCompleto
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 ring-4 ring-emerald-50/50'
                    : aprobados > 0
                    ? 'bg-blue-50 text-[#073299] border border-blue-200/80 ring-4 ring-blue-50/50'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}
              >
                <PlanIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {subtituloBadge}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate" title={titulo}>
                  {titulo}
                </h3>
              </div>
            </div>

            {/* Badge de Estado del Plan */}
            <div className="shrink-0">
              {esCompleto ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Acreditado (100%)</span>
                </span>
              ) : aprobados > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-[#073299] text-xs font-bold shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#073299]" />
                  <span>En Proceso</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-2xs">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pendiente</span>
                </span>
              )}
            </div>
          </div>

          {/* Barra de Progreso con altura cómoda */}
          <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-100/90 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">
                Progreso: <span className="text-[#073299] font-extrabold">{aprobados}</span> de <span className="font-bold">3</span> asignaturas
              </span>
              <span className={`font-mono font-extrabold text-xs px-2 py-0.5 rounded-lg ${
                esCompleto ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200/80 text-slate-800'
              }`}>
                {porcentaje}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  esCompleto
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-xs'
                    : 'bg-gradient-to-r from-[#073299] via-[#0b4ed6] to-blue-500'
                }`}
                style={{ width: `${porcentaje}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {aprobados} {aprobados === 1 ? 'Aprobado' : 'Aprobados'}
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                {pendientes} {pendientes === 1 ? 'Pendiente' : 'Pendientes'}
              </span>
            </div>
          </div>
        </div>

        {/* Cursos del Plan en COLUMNA VERTICAL con fondos temáticos educativos (solo cuando está aprobado) */}
        <div className="flex-1 flex flex-col justify-start gap-3.5 pt-4 relative z-10">
          {cursos.map((curso) => {
            const esAprobado = curso.estado === 1;
            const { Icon } = curso;

            return (
              <div
                key={curso.id}
                style={
                  esAprobado
                    ? {
                        backgroundImage: `url('/academic-pattern.svg'), linear-gradient(135deg, rgba(236, 253, 245, 0.88) 0%, rgba(255, 255, 255, 0.96) 60%, rgba(209, 250, 229, 0.45) 100%)`,
                        backgroundSize: '100px 100px, 100% 100%',
                        backgroundRepeat: 'repeat, no-repeat',
                      }
                    : undefined
                }
                className={`rounded-2xl border p-4 sm:p-4.5 transition-all duration-300 relative overflow-hidden group min-h-[102px] flex flex-col justify-between ${
                  esAprobado
                    ? 'border-emerald-300/90 shadow-xs hover:border-emerald-400 hover:shadow-md'
                    : 'border-slate-200/90 bg-white shadow-2xs hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {/* Marca de agua educativa de birrete/diploma cuando está aprobado */}
                {esAprobado ? (
                  <div className="absolute -bottom-2.5 -right-2.5 w-20 h-20 pointer-events-none opacity-[0.14] transition-transform duration-300 group-hover:scale-110 text-emerald-700 flex items-center justify-center">
                    <GraduationCap className="w-full h-full" />
                  </div>
                ) : (
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 pointer-events-none opacity-[0.04] text-slate-400 flex items-center justify-center">
                    <Icon className="w-full h-full" />
                  </div>
                )}

                {/* Fila superior: Código, Tipo y Badge de Estado */}
                <div className="flex items-center justify-between gap-2 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border shadow-2xs ${
                      esAprobado
                        ? 'bg-white border-emerald-200 text-emerald-900 font-extrabold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}>
                      {curso.codigo}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 truncate">
                      {curso.tipo}
                    </span>
                  </div>

                  {/* Estado Oficial */}
                  <div className="shrink-0">
                    {esAprobado ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300/80 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Aprobado (1)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Pendiente (0)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Fila media: Título del curso con ícono */}
                <div className="flex items-center gap-3 pt-2 relative z-10">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-colors ${
                      esAprobado
                        ? 'bg-emerald-600 text-white shadow-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate" title={curso.nombre}>
                      {curso.nombre}
                    </h4>
                    <p className={`text-[11px] truncate mt-0.5 ${esAprobado ? 'text-emerald-800/80 font-medium' : 'text-slate-500'}`} title={curso.descripcion}>
                      {esAprobado ? '✓ Asignatura acreditada con valor curricular CINF' : curso.descripcion}
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
    <div className="w-full flex flex-col space-y-5 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. BARRA SUPERIOR: Volver a la búsqueda + Breadcrumb institucional        */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80 shrink-0">
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-[#073299] text-xs font-semibold transition shadow-xs cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Volver a la búsqueda</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Portal GEX</span>
          <span>/</span>
          <span className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-none">{e.escuela}</span>
          <span>/</span>
          <span className="font-mono font-bold text-[#073299] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-lg">
            {e.codUniv}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MENSAJE "CONOCE CÓMO ACREDITAR" (Orientación y normativa oficial CINF)  */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-blue-50/90 via-slate-50 to-indigo-50/60 rounded-2xl border border-blue-100/90 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#073299] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#073299] uppercase tracking-wider bg-blue-100/70 px-2 py-0.5 rounded-md">
                Guía CINF USS
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Conoce cómo acreditar tu competencia informática en GEX
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Puedes acreditar mediante dos vías oficiales con el mismo valor académico: <strong className="text-slate-800">Plan Tradicional</strong> (3 cursos regulares) o <strong className="text-slate-800">Plan Rutas de Aprendizaje PROTECH XP</strong> (3 componentes por competencias). Basta con cumplir una de las dos modalidades al 100%.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowComoAcreditarModal(true)}
          type="button"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#073299] text-xs font-bold border border-blue-200/80 shadow-2xs transition hover:border-[#073299] shrink-0 cursor-pointer"
        >
          <span>Ver requisitos y normativa</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. HERO DE FELICITACIONES (Solo si el estudiante ya está acreditado)      */}
      {/* ========================================================================= */}
      {esAcreditado && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-[#073299] to-[#0a2366] text-white p-6 sm:p-7 shadow-lg border border-emerald-400/30">
          {/* Sello educativo universitario oficial de acreditación en el fondo */}
          <img
            src="/academic-seal.svg"
            alt="Sello de Acreditación CINF USS"
            className="absolute -bottom-10 -right-10 w-64 h-64 pointer-events-none opacity-20 select-none z-0"
          />

          {/* Trama decorativa de fondo con confeti / brillos */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: 'radial-gradient(white 1.5px, transparent 1.5px)',
              backgroundSize: '20px 20px',
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
                <PartyPopper className="w-7 h-7 text-yellow-300 animate-bounce" />
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-400/25 border border-emerald-300/40 text-emerald-200 text-[11px] font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Acreditación Oficial Completa (100%)</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white leading-tight">
                  ¡Felicitaciones, {nombres}!
                </h2>
                <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
                  Has cumplido satisfactoriamente con la totalidad de requisitos oficiales de acreditación en Informática mediante el <strong className="text-white font-semibold">{modalidadAcreditada}</strong>. Tu expediente se encuentra expedito para trámites de graduación y titulación.
                </p>
              </div>
            </div>

            {/* BOTÓN "IR A TUS OPCIONES" */}
            <div className="shrink-0 w-full md:w-auto">
              <button
                onClick={() => setShowOpcionesModal(true)}
                type="button"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-[#073299] hover:bg-blue-50 text-xs sm:text-sm font-extrabold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer ring-4 ring-white/20"
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Ir a tus opciones</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CONTENEDOR PRINCIPAL: 3 COLUMNAS SIMÉTRICAS                            */}
      {/*    Columna 1: Ficha del Estudiante (Nav responsivo de alta gama)          */}
      {/*    Columna 2: Plan Tradicional (3 cursos en columna)                      */}
      {/*    Columna 3: Plan Rutas PROTECH XP (3 módulos oficiales)                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch w-full">
        {/* ========================================================================= */}
        {/* COLUMNA 1: FICHA / CARNÉ DIGITAL DEL ESTUDIANTE (Nav Responsivo de Alta Gama) */}
        {/* ========================================================================= */}
        <aside className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-md relative">
          {/* Header tipo Credencial Universitaria Oficial */}
          <div className="bg-gradient-to-br from-[#052570] via-[#073299] to-[#0e48bd] p-5 sm:p-6 text-white relative overflow-hidden shrink-0">
            {/* Trama decorativa sutil */}
            <div
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage: 'radial-gradient(white 1.5px, transparent 1.5px)',
                backgroundSize: '16px 16px',
              }}
            />

            <div className="relative z-10 space-y-4">
              {/* Badge superior de credencial */}
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/15 backdrop-blur-md text-white text-[10px] font-mono font-bold tracking-wider uppercase border border-white/20">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  Carné GEX Oficial
                </span>

                {esAcreditado ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/30 text-emerald-200 text-[10px] font-bold border border-emerald-300/40">
                    <CheckCircle2 className="w-3 h-3" />
                    Acreditado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/25 text-amber-200 text-[10px] font-bold border border-amber-300/30">
                    <Clock className="w-3 h-3" />
                    En Curso
                  </span>
                )}
              </div>

              {/* Avatar + Nombre + Código */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-black text-lg text-white shrink-0 shadow-inner ring-4 ring-white/10">
                  {iniciales}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg font-extrabold leading-snug text-white truncate" title={e.nombres}>
                    {e.nombres}
                  </h2>
                  <p className="text-xs text-blue-100 font-medium truncate mt-0.5" title={e.escuela}>
                    {e.escuela || 'Universidad Señor de Sipán'}
                  </p>
                </div>
              </div>

              {/* Barra de código universitario con botón de copiar interactivo */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/25">
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <Hash className="w-3.5 h-3.5 text-blue-200" />
                  <span className="font-bold text-white tracking-wider">{e.codUniv}</span>
                </div>
                <button
                  onClick={handleCopyCode}
                  type="button"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/20 hover:bg-white/30 text-[11px] font-medium text-white transition cursor-pointer"
                  title="Copiar código universitario"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-300" />
                      <span className="text-emerald-200">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* CUERPO DEL NAV RESPONSIVO: Mosaicos individuales estructurados (Grid adaptable en tablet/móvil) */}
          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
              Datos Académicos y de Contacto
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              {/* Apellidos */}
              <div className="bg-slate-50/70 hover:bg-blue-50/40 border border-slate-200/70 rounded-xl p-3 transition flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#073299] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Apellidos</span>
                  <span className="font-bold text-slate-900 text-xs block truncate" title={apellidos}>{apellidos || '—'}</span>
                </div>
              </div>

              {/* Nombres */}
              <div className="bg-slate-50/70 hover:bg-blue-50/40 border border-slate-200/70 rounded-xl p-3 transition flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#073299] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nombres</span>
                  <span className="font-bold text-slate-900 text-xs block truncate" title={nombres}>{nombres || '—'}</span>
                </div>
              </div>

              {/* Escuela Profesional */}
              <div className="bg-slate-50/70 hover:bg-blue-50/40 border border-slate-200/70 rounded-xl p-3 transition flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <School className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Escuela Profesional</span>
                  <span className="font-semibold text-slate-800 text-xs block truncate" title={e.escuela}>{e.escuela || '—'}</span>
                </div>
              </div>

              {/* Ciclo Académico */}
              <div className="bg-slate-50/70 hover:bg-blue-50/40 border border-slate-200/70 rounded-xl p-3 transition flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ciclo Académico</span>
                  <span className="font-semibold text-slate-800 text-xs block">{e.nCicCodigo ? `Ciclo ${e.nCicCodigo}` : '—'}</span>
                </div>
              </div>

              {/* Campus / Sede */}
              <div className="bg-slate-50/70 hover:bg-blue-50/40 border border-slate-200/70 rounded-xl p-3 transition flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Campus / Sede</span>
                  <span className="font-semibold text-slate-800 text-xs block">{e.campus || 'Chiclayo'}</span>
                </div>
              </div>

              {/* Modalidad */}
              <div className="bg-slate-50/70 hover:bg-blue-50/40 border border-slate-200/70 rounded-xl p-3 transition flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Modalidad</span>
                  <span className="font-semibold text-slate-800 text-xs block truncate" title={e.modalidad}>{e.modalidad || '—'}</span>
                </div>
              </div>

              {/* Correo Institucional */}
              <div className="bg-slate-50/70 hover:bg-blue-50/40 border border-slate-200/70 rounded-xl p-3 transition flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Correo Institucional</span>
                  {e.correoInstitucional ? (
                    <a href={`mailto:${e.correoInstitucional}`} className="text-xs font-semibold text-[#073299] hover:underline block truncate" title={e.correoInstitucional}>
                      {e.correoInstitucional}
                    </a>
                  ) : (
                    <span className="text-slate-400 text-xs block">—</span>
                  )}
                </div>
              </div>

              {/* Teléfono / Celular */}
              {e.telefono && (
                <div className="bg-slate-50/70 hover:bg-blue-50/40 border border-slate-200/70 rounded-xl p-3 transition flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Teléfono / Celular</span>
                    <a href={`tel:${e.telefono}`} className="font-mono font-medium text-slate-800 hover:text-[#073299] text-xs block">
                      {e.telefono}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer del Nav: Sello de Validación Institucional */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#073299]" />
              Verificación CINF &bull; USS
            </span>
            <span className="font-mono text-[10px] text-slate-400">GEX 2026</span>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* COLUMNA 2: PLAN TRADICIONAL (Progreso arriba + 3 cursos en columna)        */}
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
        {/* COLUMNA 3: PLAN RUTAS PROTECH XP (Progreso arriba + 3 módulos oficiales)  */}
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
              Estimado(a) <strong className="text-slate-800">{nombres}</strong> ({e.codUniv}), tu acreditación en Informática se encuentra expedita. Elige una de las siguientes opciones oficiales:
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
