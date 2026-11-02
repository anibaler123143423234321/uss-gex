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
} from 'lucide-react';
import type { EstudianteGEX } from '../types/estudiante';

interface Props {
  estudiante: EstudianteGEX;
  onBack: () => void;
}

export default function StudentDetailView({ estudiante: e, onBack }: Props) {
  // 1. Separar apellidos y nombres
  const partes = e.nombres.trim().split(/\s+/);
  const apellidos = partes.length > 2 ? partes.slice(0, 2).join(' ') : partes[0] || '';
  const nombres = partes.length > 2 ? partes.slice(2).join(' ') : partes.slice(1).join(' ');

  // Iniciales para el avatar
  const iniciales = (
    (apellidos[0] || '') + (nombres[0] || '')
  ).toUpperCase() || 'USS';

  // 2. Cursos del Plan Tradicional (3 cursos: Computación I al III)
  const cursosTradicional = [
    {
      id: 'computacionI',
      codigo: 'INF-101',
      nombre: 'Computación I',
      tipo: 'Computación Básica',
      estado: e.computacionI >= 1 ? 1 : 0,
      Icon: Monitor,
    },
    {
      id: 'computacionII',
      codigo: 'INF-102',
      nombre: 'Computación II',
      tipo: 'Computación Intermedia',
      estado: e.computacionII >= 1 ? 1 : 0,
      Icon: Code,
    },
    {
      id: 'computacionIII',
      codigo: 'INF-103',
      nombre: 'Computación III',
      tipo: 'Computación Avanzada',
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
      estado: e.generico >= 1 ? 1 : 0,
      Icon: BookOpen,
    },
    {
      id: 'especifico',
      codigo: 'ESP-301',
      nombre: 'Módulo Específico',
      tipo: 'Especialidad Carrera',
      estado: e.especifico >= 1 ? 1 : 0,
      Icon: Award,
    },
    {
      id: 'taller',
      codigo: 'TAL-401',
      nombre: 'Taller de Certificación',
      tipo: 'Certificación MOS',
      estado: e.taller >= 1 ? 1 : 0,
      Icon: Wrench,
    },
  ];

  // 4. Métricas por modalidad (calculado exactamente sobre 3 cursos cada uno)
  const aprobadosTradicional = cursosTradicional.filter((c) => c.estado === 1).length;
  const porcentajeTradicional = Math.round((aprobadosTradicional / 3) * 100);

  const aprobadosRutas = cursosRutas.filter((c) => c.estado === 1).length;
  const porcentajeRutas = Math.round((aprobadosRutas / 3) * 100);

  /** Renderiza un contenedor de plan con su progreso arriba y sus cursos en columna vertical */
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-start space-y-4">
        {/* Encabezado del Plan + Estado */}
        <div className="space-y-3 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  esCompleto
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    : aprobados > 0
                    ? 'bg-blue-50 text-[#073299] border border-blue-200/60'
                    : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                }`}
              >
                <PlanIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {subtituloBadge}
                </span>
                <h3 className="text-sm font-bold text-slate-900 truncate" title={titulo}>
                  {titulo}
                </h3>
              </div>
            </div>

            {/* Badge de Estado */}
            <div className="shrink-0">
              {esCompleto ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Acreditado</span>
                </span>
              ) : aprobados > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[#073299] text-xs font-bold shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#073299]" />
                  <span>En Proceso</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-2xs">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pendiente</span>
                </span>
              )}
            </div>
          </div>

          {/* Barra de Progreso arriba en el encabezado */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600">
                Progreso: <span className="text-[#073299] font-bold">{aprobados}</span> de <span className="font-bold">3</span> aprobados
              </span>
              <span className="text-slate-900 font-mono font-bold text-xs">
                {porcentaje}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  esCompleto
                    ? 'bg-emerald-500'
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

        {/* Cursos del Plan en COLUMNA VERTICAL (no en rows) */}
        <div className="flex-1 flex flex-col justify-start gap-3 pt-1">
          {cursos.map((curso) => {
            const esAprobado = curso.estado === 1;
            const { Icon } = curso;

            return (
              <div
                key={curso.id}
                className={`rounded-xl border p-3.5 transition-all bg-white flex items-center justify-between gap-3 ${
                  esAprobado
                    ? 'border-emerald-200 bg-emerald-50/20 shadow-2xs hover:border-emerald-300'
                    : 'border-slate-200 bg-slate-50/30 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      esAprobado
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {curso.codigo}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        {curso.tipo}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate mt-1" title={curso.nombre}>
                      {curso.nombre}
                    </h4>
                  </div>
                </div>

                {/* Badge Oficial */}
                <div className="shrink-0">
                  {esAprobado ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Aprobado (1)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Pendiente (0)</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col animate-in fade-in duration-200">
      {/* Barra superior: botón volver + breadcrumbs con márgenes cómodos */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-200 shrink-0">
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-[#073299] text-xs font-semibold transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a la búsqueda</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Portal GEX</span>
          <span>/</span>
          <span className="font-semibold text-slate-800 truncate">{e.escuela}</span>
          <span>/</span>
          <span className="font-mono font-bold text-[#073299] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-md">
            {e.codUniv}
          </span>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL: 3 COLUMNAS SIMÉTRICAS (1/3 FICHA, 1/3 TRADICIONAL, 1/3 RUTAS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch w-full">
        {/* ========================================================================= */}
        {/* COLUMNA 1 (1/3): FICHA DEL ESTUDIANTE EN COLUMNA VERTICAL                 */}
        {/* ========================================================================= */}
        <aside className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-start">
          {/* Header con Iniciales y Nombre */}
          <div className="bg-gradient-to-br from-[#073299] via-[#0941bf] to-[#1258e2] p-5 text-white flex items-center gap-3.5 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center font-bold text-base text-white shrink-0 shadow-inner">
              {iniciales}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-base font-bold leading-tight truncate">
                {e.nombres}
              </h2>
              <p className="text-xs text-blue-100 truncate mt-0.5">
                {e.escuela || 'Universidad Señor de Sipán'}
              </p>
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-white/20 text-white text-[10px] font-mono font-semibold">
                <Hash className="w-3 h-3" />
                {e.codUniv}
              </span>
            </div>
          </div>

          {/* Datos del estudiante en columna vertical limpia */}
          <div className="p-5 flex-1 flex flex-col justify-start text-xs divide-y divide-slate-100 space-y-3">
            {/* Apellidos */}
            <div className="flex items-start gap-3 pt-2.5 first:pt-0">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#073299] flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Apellidos</span>
                <span className="font-bold text-slate-900 text-xs block truncate" title={apellidos}>{apellidos || '—'}</span>
              </div>
            </div>

            {/* Nombres */}
            <div className="flex items-start gap-3 pt-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#073299] flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nombres</span>
                <span className="font-bold text-slate-900 text-xs block truncate" title={nombres}>{nombres || '—'}</span>
              </div>
            </div>

            {/* Escuela Profesional */}
            <div className="flex items-start gap-3 pt-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                <School className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Escuela Profesional</span>
                <span className="font-semibold text-slate-800 text-xs block truncate" title={e.escuela}>{e.escuela || '—'}</span>
              </div>
            </div>

            {/* Ciclo Académico */}
            <div className="flex items-start gap-3 pt-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ciclo Académico</span>
                <span className="font-semibold text-slate-800 text-xs block">{e.nCicCodigo ? `Ciclo ${e.nCicCodigo}` : '—'}</span>
              </div>
            </div>

            {/* Campus / Sede */}
            <div className="flex items-start gap-3 pt-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Campus / Sede</span>
                <span className="font-semibold text-slate-800 text-xs block">{e.campus || 'Chiclayo'}</span>
              </div>
            </div>

            {/* Modalidad */}
            <div className="flex items-start gap-3 pt-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Modalidad</span>
                <span className="font-semibold text-slate-800 text-xs block truncate" title={e.modalidad}>{e.modalidad || '—'}</span>
              </div>
            </div>

            {/* Correo Institucional */}
            <div className="flex items-start gap-3 pt-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
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
              <div className="flex items-start gap-3 pt-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Teléfono / Celular</span>
                  <span className="font-mono font-medium text-slate-800 text-xs block">{e.telefono}</span>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* COLUMNA 2 (1/3): PLAN TRADICIONAL EN COLUMNA VERTICAL                     */}
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
        {/* COLUMNA 3 (1/3): PLAN RUTAS EN COLUMNA VERTICAL (3 Módulos oficiales)     */}
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
    </div>
  );
}
