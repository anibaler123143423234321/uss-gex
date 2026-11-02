import { useState } from 'react';
import {
  ArrowLeft,
  Hash,
  CheckCircle2,
  Clock,
  Monitor,
  Code,
  Laptop,
  BookOpen,
  Award,
  Wrench,
  AlertCircle,
  Sparkles,
  Columns,
} from 'lucide-react';
import type { EstudianteGEX } from '../types/estudiante';

interface Props {
  estudiante: EstudianteGEX;
  onBack: () => void;
}

type ModalidadPlan = 'tradicional' | 'rutas' | 'ambos';

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
  // Las opciones oficiales de la ruta exigen 4 componentes:
  // 1) 3 genéricos + 1 específico/taller  2) 4 talleres  3) 4 cursos (2 genéricos + 2 específicos)
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

  // 5. Detección automática del plan inicial del estudiante
  const getInitialPlan = (): ModalidadPlan => {
    if (aprobadosTradicional > 0 && aprobadosRutas === 0) return 'tradicional';
    if (aprobadosRutas > 0 && aprobadosTradicional === 0) return 'rutas';
    if (aprobadosTradicional > 0 && aprobadosRutas > 0) return 'ambos';
    return 'tradicional';
  };

  const [activePlan, setActivePlan] = useState<ModalidadPlan>(getInitialPlan);

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
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-3.5 shadow-sm space-y-2.5">
        {/* Cabecera del Plan */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#073299]/10 text-[#073299]">
                {tipoPlan === 'tradicional' ? 'Plan Tradicional' : 'Plan Rutas'}
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                {titulo}
              </h3>
            </div>
          </div>

          {/* Badge de Estado del Plan */}
          <div className="shrink-0">
            {esCompleto ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Acreditación Completa</span>
              </span>
            ) : aprobados > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[#073299] text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#073299]" />
                <span>En Proceso ({porcentaje}%)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-xs">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
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
            <span className="text-slate-900 font-mono font-bold">
              {porcentaje}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                esCompleto
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-[#073299] via-[#0b4ed6] to-blue-500'
              }`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-0.5">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {aprobados} {aprobados === 1 ? 'Aprobado' : 'Aprobados'}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              {pendientes} {pendientes === 1 ? 'Pendiente' : 'Pendientes'}
            </span>
          </div>
        </div>

        {/* Tarjetas de los Cursos en Grid compacto */}
        <div className={`grid gap-2 pt-1 ${tipoPlan === 'tradicional' ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
          {cursos.map((curso) => {
            const esAprobado = curso.estado === 1;
            const { Icon } = curso;

            return (
              <div
                key={curso.id}
                className={`rounded-xl border p-2.5 transition-all bg-white flex flex-col justify-between ${
                  esAprobado
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200 bg-slate-50/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {curso.codigo}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                        esAprobado
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight truncate" title={curso.nombre}>
                    {curso.nombre}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {curso.tipo}
                  </p>
                </div>

                {/* Badge Oficial */}
                <div className="pt-2 mt-1.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[9px] font-medium text-slate-400">Estado:</span>
                  {esAprobado ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Aprobado (1)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                      <Clock className="w-3 h-3 text-amber-600" />
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
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100 shrink-0">
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-[#073299] text-xs font-semibold transition shadow-xs cursor-pointer"
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
        {/* NAV IZQUIERDO (1/3 = 4 cols): DATOS DEL ESTUDIANTE EN FORMATO COMPACTO    */}
        {/* ========================================================================= */}
        <aside className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          {/* Header con Iniciales y Nombre */}
          <div className="bg-gradient-to-r from-[#073299] via-[#0941bf] to-[#1258e2] p-3 sm:p-3.5 text-white flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center font-bold text-base text-white shrink-0 shadow-inner">
              {iniciales}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xs sm:text-sm font-bold leading-tight truncate">
                {e.nombres}
              </h2>
              <p className="text-[11px] text-blue-200 truncate mt-0.5">
                {e.escuela || 'Universidad Señor de Sipán'}
              </p>
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-white/20 text-white text-[10px] font-mono font-semibold">
                <Hash className="w-2.5 h-2.5" />
                {e.codUniv}
              </span>
            </div>
          </div>

          {/* Resumen rápido de acreditación: Tradicional (Base 3) y Rutas (Base 4) */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2 rounded-lg border border-slate-200/80">
              <span className="text-[10px] font-medium text-slate-400 block uppercase">Tradicional</span>
              <span
                className={`font-mono font-bold text-xs ${
                  porcentajeTradicional === 100
                    ? 'text-emerald-700'
                    : aprobadosTradicional > 0
                    ? 'text-[#073299]'
                    : 'text-slate-600'
                }`}
              >
                {aprobadosTradicional}/3 ({porcentajeTradicional}%)
              </span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200/80">
              <span className="text-[10px] font-medium text-slate-400 block uppercase">Rutas</span>
              <span
                className={`font-mono font-bold text-xs ${
                  porcentajeRutas === 100
                    ? 'text-emerald-700'
                    : aprobadosRutas > 0
                    ? 'text-[#073299]'
                    : 'text-slate-600'
                }`}
              >
                {aprobadosRutas}/4 ({porcentajeRutas}%)
              </span>
            </div>
          </div>

          {/* Grid de 2 columnas de atributos del estudiante (ahorra espacio vertical) */}
          <div className="p-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Apellidos</span>
              <span className="font-semibold text-slate-800 truncate block text-[11px]" title={apellidos}>{apellidos || '—'}</span>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Nombres</span>
              <span className="font-semibold text-slate-800 truncate block text-[11px]" title={nombres}>{nombres || '—'}</span>
            </div>

            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Escuela</span>
              <span className="font-semibold text-slate-800 truncate block text-[11px]" title={e.escuela}>{e.escuela || '—'}</span>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Ciclo</span>
              <span className="font-semibold text-slate-800 block text-[11px]">{e.nCicCodigo ? `Ciclo ${e.nCicCodigo}` : '—'}</span>
            </div>

            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Campus</span>
              <span className="font-semibold text-slate-800 block text-[11px]">{e.campus || 'Chiclayo'}</span>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Modalidad</span>
              <span className="font-semibold text-slate-800 truncate block text-[11px]" title={e.modalidad}>{e.modalidad || '—'}</span>
            </div>

            <div className="min-w-0 col-span-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Correo Institucional</span>
              {e.correoInstitucional ? (
                <a href={`mailto:${e.correoInstitucional}`} className="text-[11px] font-medium text-[#073299] hover:underline truncate block" title={e.correoInstitucional}>
                  {e.correoInstitucional}
                </a>
              ) : (
                <span className="text-slate-400 text-[11px]">—</span>
              )}
            </div>

            {e.telefono && (
              <div className="min-w-0 col-span-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Teléfono / Celular</span>
                <span className="font-mono font-medium text-slate-800 text-[11px]">{e.telefono}</span>
              </div>
            )}
          </div>

          {/* Botón de acción rápido al pie del nav */}
          <div className="p-2.5 bg-slate-50/70 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={onBack}
              className="w-full py-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition cursor-pointer"
            >
              Buscar otro estudiante
            </button>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* SECCIÓN DERECHA (2/3 = 8 cols): CURSOS COMPACTOS EN UNA SOLA PANTALLA    */}
        {/* ========================================================================= */}
        <section className="lg:col-span-8 space-y-2.5">
          {/* Pestañas de selección compactas */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActivePlan('tradicional')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activePlan === 'tradicional'
                  ? 'bg-white text-[#073299] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Plan Tradicional</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                  porcentajeTradicional === 100
                    ? 'bg-emerald-100 text-emerald-800'
                    : aprobadosTradicional > 0
                    ? 'bg-blue-100 text-[#073299]'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {aprobadosTradicional}/3 ({porcentajeTradicional}%)
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActivePlan('rutas')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activePlan === 'rutas'
                  ? 'bg-white text-[#073299] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plan Rutas</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                  porcentajeRutas === 100
                    ? 'bg-emerald-100 text-emerald-800'
                    : aprobadosRutas > 0
                    ? 'bg-blue-100 text-[#073299]'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {aprobadosRutas}/4 ({porcentajeRutas}%)
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActivePlan('ambos')}
              className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                activePlan === 'ambos'
                  ? 'bg-white text-[#073299] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Ver ambos</span>
            </button>
          </div>

          {/* CONTENIDO DEL PLAN ACTIVO */}
          {activePlan === 'tradicional' && (
            renderPlanCard(
              'Plan Tradicional (Computación I al III)',
              cursosTradicional,
              aprobadosTradicional,
              3,
              porcentajeTradicional,
              'tradicional'
            )
          )}

          {activePlan === 'rutas' && (
            renderPlanCard(
              'Plan Rutas de Aprendizaje (PROTECH XP)',
              cursosRutas,
              aprobadosRutas,
              4,
              porcentajeRutas,
              'rutas'
            )
          )}

          {activePlan === 'ambos' && (
            <div className="space-y-2.5">
              {renderPlanCard(
                'Plan Tradicional (Computación I al III)',
                cursosTradicional,
                aprobadosTradicional,
                3,
                porcentajeTradicional,
                'tradicional'
              )}

              {renderPlanCard(
                'Plan Rutas de Aprendizaje (PROTECH XP)',
                cursosRutas,
                aprobadosRutas,
                4,
                porcentajeRutas,
                'rutas'
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
