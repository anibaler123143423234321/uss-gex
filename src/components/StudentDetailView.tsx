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

  // 2. Cursos del Plan Tradicional (3 cursos: Computación I al III - Base: 3)
  const cursosTradicional = [
    {
      id: 'computacionI',
      codigo: 'INF-101',
      nombre: 'Computación I',
      tipo: 'Básico',
      estado: e.computacionI,
      Icon: Monitor,
    },
    {
      id: 'computacionII',
      codigo: 'INF-102',
      nombre: 'Computación II',
      tipo: 'Intermedio',
      estado: e.computacionII,
      Icon: Code,
    },
    {
      id: 'computacionIII',
      codigo: 'INF-103',
      nombre: 'Computación III',
      tipo: 'Avanzado',
      estado: e.computacionIII,
      Icon: Laptop,
    },
  ];

  // 3. Componentes de la Ruta de Aprendizaje (PROTECH XP - Base: 4 componentes)
  const aprobadosRutasCount =
    Number(e.generico || 0) + Number(e.especifico || 0) + Number(e.taller || 0);

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
      nombre: 'Taller Certificación',
      tipo: 'Certificación MOS',
      estado: e.taller >= 1 ? 1 : 0,
      Icon: Wrench,
    },
    {
      id: 'complementoRuta',
      codigo: 'RUT-404',
      nombre: '4.° Componente Ruta',
      tipo: 'Cierre de Acreditación',
      estado: aprobadosRutasCount >= 4 ? 1 : 0,
      Icon: Sparkles,
    },
  ];

  // 4. Métricas por modalidad:
  // Tradicional: Base = 3 cursos
  const aprobadosTradicional = cursosTradicional.filter((c) => c.estado === 1).length;
  const porcentajeTradicional = Math.round((aprobadosTradicional / 3) * 100);

  // Rutas: Base = 4 componentes (siempre 4 en la ruta)
  const aprobadosRutas = Math.min(4, aprobadosRutasCount);
  const porcentajeRutas = Math.round((aprobadosRutas / 4) * 100);

  /** Renderiza la tarjeta de un plan con altura compacta para no scrollear */
  const renderPlanCard = (
    titulo: string,
    cursos: typeof cursosTradicional | typeof cursosRutas,
    aprobados: number,
    baseTotal: number,
    porcentaje: number,
    tipoPlan: 'tradicional' | 'rutas'
  ) => {
    const pendientes = baseTotal - aprobados;
    const esCompleto = aprobados >= baseTotal;

    return (
      <div className="bg-white rounded-xl border border-slate-200 p-2.5 sm:p-3 shadow-xs space-y-2">
        {/* Cabecera del Plan */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#073299]/10 text-[#073299]">
              {tipoPlan === 'tradicional' ? 'Plan Tradicional' : 'Plan Rutas'}
            </span>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
              {titulo}
            </h3>
          </div>

          {/* Badge de Estado del Plan */}
          <div className="shrink-0">
            {esCompleto ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold shadow-xs">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Acreditación Completa</span>
              </span>
            ) : aprobados > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[#073299] text-[10px] font-bold shadow-xs">
                <Sparkles className="w-3 h-3 text-[#073299]" />
                <span>En Proceso ({porcentaje}%)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold shadow-xs">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                <span>Pendiente (0%)</span>
              </span>
            )}
          </div>
        </div>

        {/* Barra de progreso académico compacta */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-slate-600">
              Progreso: <span className="text-[#073299] font-bold">{aprobados}</span> de <span className="font-bold">{baseTotal}</span> aprobados
            </span>
            <span className="text-slate-900 font-mono font-bold text-xs">
              {porcentaje}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                esCompleto
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-[#073299] via-[#0b4ed6] to-blue-500'
              }`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {aprobados} {aprobados === 1 ? 'Aprobado' : 'Aprobados'}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              {pendientes} {pendientes === 1 ? 'Pendiente' : 'Pendientes'}
            </span>
          </div>
        </div>

        {/* Tarjetas de los Cursos en Grid compacto */}
        <div className={`grid gap-2 pt-0.5 ${tipoPlan === 'tradicional' ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
          {cursos.map((curso) => {
            const esAprobado = curso.estado === 1;
            const { Icon } = curso;

            return (
              <div
                key={curso.id}
                className={`rounded-lg border p-2 transition-all bg-white flex flex-col justify-between ${
                  esAprobado
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200 bg-slate-50/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {curso.codigo}
                    </span>
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                        esAprobado
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                    </div>
                  </div>
                  <h4 className="text-[11px] font-bold text-slate-900 leading-tight truncate" title={curso.nombre}>
                    {curso.nombre}
                  </h4>
                  <p className="text-[9px] text-slate-400 truncate mt-0.5">
                    {curso.tipo}
                  </p>
                </div>

                {/* Badge Oficial */}
                <div className="pt-1.5 mt-1 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[9px] font-medium text-slate-400">Estado:</span>
                  {esAprobado ? (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      Aprobado (1)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                      <Clock className="w-2.5 h-2.5 text-amber-600" />
                      Pendiente (0)
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
    <div className="w-full flex flex-col h-full animate-in fade-in duration-150">
      {/* Barra superior compacta: botón volver + breadcrumbs */}
      <div className="flex items-center justify-between gap-2 pb-1.5 mb-2 border-b border-slate-100 shrink-0">
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-[#073299] text-xs font-semibold transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a la búsqueda</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Portal GEX</span>
          <span>/</span>
          <span className="font-semibold text-slate-800 truncate">{e.escuela}</span>
          <span>/</span>
          <span className="font-mono font-bold text-[#073299] bg-blue-50 px-2 py-0.5 rounded">
            {e.codUniv}
          </span>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL: 1/3 (NAV IZQUIERDO = 4 cols) Y 2/3 (CURSOS = 8 cols) OCUPANDO TODO EL VIEWPORT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start w-full flex-1 min-h-0">
        {/* ========================================================================= */}
        {/* NAV IZQUIERDO (1/3 = 4 cols): DATOS DEL ESTUDIANTE EN COLUMNA VERTICAL    */}
        {/* ========================================================================= */}
        <aside className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Header con Iniciales y Nombre */}
          <div className="bg-gradient-to-r from-[#073299] via-[#0941bf] to-[#1258e2] p-3 text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-inner">
              {iniciales}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xs sm:text-sm font-bold leading-tight truncate">
                {e.nombres}
              </h2>
              <p className="text-[10px] text-blue-200 truncate mt-0.5">
                {e.escuela || 'Universidad Señor de Sipán'}
              </p>
              <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.2 rounded bg-white/20 text-white text-[9px] font-mono font-semibold">
                <Hash className="w-2.5 h-2.5" />
                {e.codUniv}
              </span>
            </div>
          </div>

          {/* Datos del estudiante en columna vertical limpia */}
          <div className="p-3 space-y-2 text-xs divide-y divide-slate-100">
            {/* Apellidos */}
            <div className="flex items-start gap-2.5 pt-1.5 first:pt-0">
              <div className="w-5 h-5 rounded-md bg-blue-50 text-[#073299] flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3 h-3" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Apellidos</span>
                <span className="font-bold text-slate-900 text-xs block truncate" title={apellidos}>{apellidos || '—'}</span>
              </div>
            </div>

            {/* Nombres */}
            <div className="flex items-start gap-2.5 pt-1.5">
              <div className="w-5 h-5 rounded-md bg-blue-50 text-[#073299] flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3 h-3" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Nombres</span>
                <span className="font-bold text-slate-900 text-xs block truncate" title={nombres}>{nombres || '—'}</span>
              </div>
            </div>

            {/* Escuela Profesional */}
            <div className="flex items-start gap-2.5 pt-1.5">
              <div className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                <School className="w-3 h-3" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Escuela Profesional</span>
                <span className="font-semibold text-slate-800 text-xs block truncate" title={e.escuela}>{e.escuela || '—'}</span>
              </div>
            </div>

            {/* Ciclo Académico */}
            <div className="flex items-start gap-2.5 pt-1.5">
              <div className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                <Layers className="w-3 h-3" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Ciclo Académico</span>
                <span className="font-semibold text-slate-800 text-xs block">{e.nCicCodigo ? `Ciclo ${e.nCicCodigo}` : '—'}</span>
              </div>
            </div>

            {/* Campus / Sede */}
            <div className="flex items-start gap-2.5 pt-1.5">
              <div className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-3 h-3" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Campus / Sede</span>
                <span className="font-semibold text-slate-800 text-xs block">{e.campus || 'Chiclayo'}</span>
              </div>
            </div>

            {/* Modalidad */}
            <div className="flex items-start gap-2.5 pt-1.5">
              <div className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                <Compass className="w-3 h-3" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Modalidad</span>
                <span className="font-semibold text-slate-800 text-xs block truncate" title={e.modalidad}>{e.modalidad || '—'}</span>
              </div>
            </div>

            {/* Correo Institucional */}
            <div className="flex items-start gap-2.5 pt-1.5">
              <div className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                <Mail className="w-3 h-3" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Correo Institucional</span>
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
              <div className="flex items-start gap-2.5 pt-1.5">
                <div className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-3 h-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Teléfono / Celular</span>
                  <span className="font-mono font-medium text-slate-800 text-xs block">{e.telefono}</span>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* SECCIÓN DERECHA (2/3 = 8 cols): ESTADÍSTICAS SUPERIORES Y AMBOS PLANES    */}
        {/* ========================================================================= */}
        <section className="lg:col-span-8 space-y-2.5">
          {/* LADO DERECHO SUPERIOR: LAS 2 ESTADÍSTICAS (Tradicional y Rutas) */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Estadística Plan Tradicional */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  porcentajeTradicional === 100
                    ? 'bg-emerald-50 text-emerald-700'
                    : aprobadosTradicional > 0
                    ? 'bg-blue-50 text-[#073299]'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  <Monitor className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
                    Plan Tradicional
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate block">
                    {aprobadosTradicional} de 3 aprobados
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                  porcentajeTradicional === 100
                    ? 'bg-emerald-100 text-emerald-800'
                    : aprobadosTradicional > 0
                    ? 'bg-blue-100 text-[#073299]'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {porcentajeTradicional}%
                </span>
              </div>
            </div>

            {/* Estadística Plan Rutas */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  porcentajeRutas === 100
                    ? 'bg-emerald-50 text-emerald-700'
                    : aprobadosRutas > 0
                    ? 'bg-blue-50 text-[#073299]'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
                    Plan Rutas
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate block">
                    {aprobadosRutas} de 4 aprobados
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                  porcentajeRutas === 100
                    ? 'bg-emerald-100 text-emerald-800'
                    : aprobadosRutas > 0
                    ? 'bg-blue-100 text-[#073299]'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {porcentajeRutas}%
                </span>
              </div>
            </div>
          </div>

          {/* AMBOS PLANES ESTÁTICOS (Ver ambos por defecto y de forma permanente) */}
          <div className="space-y-2.5">
            {/* Bloque 1: Plan Tradicional */}
            {renderPlanCard(
              'Plan Tradicional (Computación I al III)',
              cursosTradicional,
              aprobadosTradicional,
              3,
              porcentajeTradicional,
              'tradicional'
            )}

            {/* Bloque 2: Plan Rutas */}
            {renderPlanCard(
              'Plan Rutas de Aprendizaje (PROTECH XP)',
              cursosRutas,
              aprobadosRutas,
              4,
              porcentajeRutas,
              'rutas'
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
