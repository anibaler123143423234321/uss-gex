import { useState, useEffect, useCallback, type ReactNode } from 'react';
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
  ClipboardCheck,
  XCircle,
  AlertCircle,
  Phone,
  X,
  RefreshCw,
  Send,
  Lock,
  type LucideIcon,
} from 'lucide-react';
import CourseIllustration, { HeroIllustration, type Ilustracion } from './CourseIllustration';
import type { EstudianteGEX } from '../types/estudiante';
import {
  consultarSolicitudesEstudiante,
  type SolicitudEstadoEstudiante,
} from '../services/solicitudesService';
import { CONTACTO_CINF, PLANES_COMPUTACION } from '../data/planesComputacion';

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

// Pasos oficiales del flujo de atención GEX CINF
const PASOS_TRAMITE = [
  {
    paso: 1,
    clave: 'solicitada',
    titulo: 'Solicitud registrada',
    subtitulo: 'Recepción CINF',
    descripcion: 'Tus datos e inscripción fueron registrados con éxito.',
  },
  {
    paso: 2,
    clave: 'en_atencion',
    titulo: 'Revisión y Finanzas',
    subtitulo: 'Habilitación académica',
    descripcion: 'Se valida tu expediente y se programan los cargos correspondientes.',
  },
  {
    paso: 3,
    clave: 'asignada',
    titulo: 'Asignación académica',
    subtitulo: 'Grupo y horario CINF',
    descripcion: 'El Centro de Informática te asigna grupo, horario y acceso a plataformas.',
  },
  {
    paso: 4,
    clave: 'aprobada',
    titulo: 'Acreditación final',
    subtitulo: 'Registro de nota',
    descripcion: 'Evaluación aprobada y expedición oficial de la constancia de acreditación.',
  },
];

function getPasoActual(sol: SolicitudEstadoEstudiante): number {
  if (sol.estado === 'aprobada') return 4;
  if (sol.estado === 'asignada') return 3;
  if (sol.estado === 'en_atencion') return 2;
  if (sol.estado === 'solicitada') return 1;
  return Math.min(4, Math.max(1, sol.paso || 1));
}

function getEstadoBadgeInfo(sol: SolicitudEstadoEstudiante) {
  if (sol.estado === 'rechazada') {
    return {
      texto: 'Observada',
      estilo: 'bg-rose-50 text-rose-700 ring-rose-200 hover:bg-rose-100',
      Icon: XCircle,
    };
  }
  if (sol.estado === 'aprobada' || sol.paso === 4) {
    return {
      texto: 'Acreditado (Paso 4/4)',
      estilo: 'bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100',
      Icon: CheckCircle2,
    };
  }
  if (sol.estado === 'asignada' || sol.paso === 3) {
    return {
      texto: 'Asignado (Paso 3/4)',
      estilo: 'bg-indigo-50 text-indigo-700 ring-indigo-200 hover:bg-indigo-100',
      Icon: Sparkles,
    };
  }
  if (sol.estado === 'en_atencion' || sol.paso === 2) {
    return {
      texto: 'En atención (Paso 2/4)',
      estilo: 'bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-100',
      Icon: Clock,
    };
  }
  return {
    texto: 'En trámite (Paso 1/4)',
    estilo: 'bg-sky-50 text-sky-700 ring-sky-200 hover:bg-sky-100',
    Icon: Clock,
  };
}

function getNombrePlan(planId: string): string {
  const plan = PLANES_COMPUTACION.find((p) => p.id === planId);
  return plan ? plan.nombre : planId.toUpperCase();
}

function formatFecha(fechaIso?: string): string {
  if (!fechaIso) return 'Reciente';
  try {
    const d = new Date(fechaIso);
    if (isNaN(d.getTime())) return fechaIso;
    return d.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return fechaIso;
  }
}

export default function StudentDetailView({ estudiante: e, onBack, onOpenComoAcreditar }: Props) {
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [solicitudes, setSolicitudes] = useState<SolicitudEstadoEstudiante[]>([]);
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState<boolean>(true);
  const [modalSeguimientoAbierto, setModalSeguimientoAbierto] = useState<boolean>(false);

  // Consulta en tiempo real de trámites y solicitudes registradas para este código
  const cargarEstado = useCallback(async () => {
    setCargandoSolicitudes(true);
    try {
      const data = await consultarSolicitudesEstudiante(e.codUniv);
      setSolicitudes(data);
    } catch (err) {
      console.warn('[StudentDetailView] Error al consultar solicitudes:', err);
    } finally {
      setCargandoSolicitudes(false);
    }
  }, [e.codUniv]);

  useEffect(() => {
    cargarEstado();

    const handleActualizada = () => {
      cargarEstado();
    };

    window.addEventListener('gex_solicitud_actualizada', handleActualizada);
    return () => {
      window.removeEventListener('gex_solicitud_actualizada', handleActualizada);
    };
  }, [cargarEstado]);

  const solicitudActiva = solicitudes.length > 0 ? solicitudes[0] : null;

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

  /** Tarjeta de un curso */
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

  // Botón estándar para abrir Menú de opciones
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
   * Panel derecho del boceto (B).
   * La dona refleja estrictamente el avance de cursos curriculares aprobados (0% si no registra cursos).
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
        {/* Encabezado: dona de cursos (siempre 0% si no tiene cursos) y texto descriptivo */}
        <div className="relative px-3.5 py-2.5 sm:px-4 sm:py-2.5 grande:px-6 grande:py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 grande:gap-6">
          {caso === 'acreditado' && (
            <img
              src="/academic-seal.svg"
              alt=""
              className="absolute -top-6 -right-6 w-28 h-28 pointer-events-none opacity-[0.08] select-none"
            />
          )}

          {/* Gráfica circular estricta de cursos aprobados */}
          <DonaCursos
            total={totalMeta}
            aprobados={aprobados}
            className="w-24 h-24 2xl:w-28 2xl:h-28 grande:w-32 grande:h-32 mx-auto sm:mx-0 shrink-0"
          />

          <div className="min-w-0 flex-1 text-center sm:text-left relative">
            {encabezado}
          </div>

          {caso === 'en-curso' && <div className="sm:self-end shrink-0 relative">{botonMenuOpciones}</div>}
        </div>

        {/* Cuerpo del panel */}
        {caso === 'sin-cursos' ? (
          <div className="p-4 sm:p-5 flex flex-col items-center justify-center text-center gap-3.5 min-h-0 flex-1">
            <HeroIllustration className="w-32 sm:w-36 grande:w-48 text-uss-blue/30" />

            {/* Botones en el medio */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full">
              {solicitudActiva ? (
                <>
                  {/* Botón Ver Estado: visible al medio junto al menú bloqueado */}
                  <button
                    type="button"
                    onClick={() => setModalSeguimientoAbierto(true)}
                    className="w-full sm:w-auto h-9 px-4 2xl:h-10 grande:h-11 grande:px-5 rounded-xl bg-uss-blue hover:bg-[#041d5f] text-white text-xs 2xl:text-sm font-bold inline-flex items-center justify-center gap-1.5 grande:gap-2 shadow-sm transition cursor-pointer"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5 grande:w-4 grande:h-4 text-sky-200" />
                    <span>Ver estado</span>
                  </button>

                  {/* Menú de opciones bloqueado porque ya se envió solicitud */}
                  <button
                    type="button"
                    disabled
                    className="w-full sm:w-auto h-9 px-4 2xl:h-10 grande:h-11 grande:px-5 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs 2xl:text-sm font-semibold inline-flex items-center justify-center gap-1.5 grande:gap-2 cursor-not-allowed opacity-60 select-none"
                    title={`Ya registraste una solicitud para el ${getNombrePlan(solicitudActiva.plan)}.`}
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Menú de opciones</span>
                  </button>
                </>
              ) : (
                botonMenuOpciones
              )}
            </div>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-[auto_auto] gap-3 grande:gap-x-4 lg:gap-y-0 w-full">
        <aside className="lg:row-span-2 flex flex-col lg:grid lg:grid-rows-subgrid bg-white rounded-3xl lg:rounded-2xl ring-1 ring-slate-900/5 shadow-sm overflow-hidden">
          {/* Credencial: fondo claro con la franja azul USS arriba */}
          <div className="relative bg-[#f6f8fe] border-b border-slate-200 px-4 pt-5 pb-4 lg:px-3 lg:pt-3.5 lg:pb-3 grande:px-5 grande:pt-5 grande:pb-4 flex flex-col justify-center gap-3 lg:gap-2 grande:gap-3">
            <span className="absolute inset-x-0 top-0 h-1 bg-uss-blue" aria-hidden="true" />

            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white ring-1 ring-slate-200 text-uss-blue text-[10px] lg:text-[9px] grande:text-[11px] font-mono font-bold tracking-wider uppercase">
                <ShieldCheck className="w-3 h-3 lg:w-2.5 lg:h-2.5" />
                Carné GEX
              </span>

              {/* Insignia de estado */}
              {cargandoSolicitudes ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] lg:text-[9px] grande:text-[11px] font-medium animate-pulse">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  Verificando...
                </span>
              ) : solicitudActiva ? (
                (() => {
                  const badge = getEstadoBadgeInfo(solicitudActiva);
                  const IconBadge = badge.Icon;
                  return (
                    <button
                      type="button"
                      onClick={() => setModalSeguimientoAbierto(true)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] lg:text-[9px] grande:text-[11px] font-bold ring-1 transition cursor-pointer group shadow-2xs ${badge.estilo}`}
                      title="Haz clic para ver el estado de tu trámite"
                    >
                      <IconBadge className="w-3 h-3 lg:w-2.5 lg:h-2.5 shrink-0" />
                      <span>{badge.texto}</span>
                      <span className="text-[8px] opacity-70 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                    </button>
                  );
                })()
              ) : caso === 'sin-cursos' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] lg:text-[9px] grande:text-[11px] font-bold ring-1 ring-slate-200">
                  <Circle className="w-3 h-3 lg:w-2.5 lg:h-2.5" />
                  Sin iniciar
                </span>
              ) : caso === 'en-curso' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] lg:text-[9px] grande:text-[11px] font-bold ring-1 ring-amber-200">
                  <Clock className="w-3 h-3 lg:w-2.5 lg:h-2.5" />
                  En curso
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] lg:text-[9px] grande:text-[11px] font-bold ring-1 ring-emerald-200">
                  <CheckCircle2 className="w-3 h-3 lg:w-2.5 lg:h-2.5" />
                  Acreditado
                </span>
              )}
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

      {/* Modal interactivo de Estado de Solicitud */}
      {modalSeguimientoAbierto && (
        <ModalSeguimientoSolicitud
          estudiante={e}
          solicitudes={solicitudes}
          cargando={cargandoSolicitudes}
          onClose={() => setModalSeguimientoAbierto(false)}
          onRecargar={cargarEstado}
          onOpenMenuOpciones={onOpenComoAcreditar}
        />
      )}
    </div>
  );
}

// Colores de la gráfica "Distribución de Estado" del panel GEX
const COLOR_APROBADO = '#10B981';
const COLOR_PENDIENTE = '#94A3B8';

/** Dona de los cursos del plan: un segmento por curso, verde si completado y gris si no */
function DonaCursos({
  total = 3,
  aprobados = 0,
  className,
}: {
  total: number;
  aprobados: number;
  className?: string;
}) {
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

/**
 * Modal de Seguimiento de Estado de Trámites GEX para el Estudiante.
 * Diseño ancho en una sola pantalla sin scroll.
 */
interface ModalSeguimientoProps {
  estudiante: EstudianteGEX;
  solicitudes: SolicitudEstadoEstudiante[];
  cargando: boolean;
  onClose: () => void;
  onRecargar: () => void;
  onOpenMenuOpciones?: () => void;
}

function ModalSeguimientoSolicitud({
  estudiante: e,
  solicitudes,
  cargando,
  onClose,
  onRecargar,
}: ModalSeguimientoProps) {
  useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const solicitudPrincipal = solicitudes[0] ?? null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-4xl xl:max-w-5xl w-full border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header del Modal */}
        <div className="px-5 sm:px-6 py-3.5 border-b border-slate-200 bg-[#f8fafc] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-uss-blue flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-50 text-uss-blue ring-1 ring-blue-200">
                  Estado de Solicitud GEX
                </span>
                <span className="text-xs font-mono font-bold text-uss-blue bg-blue-50/50 px-2 py-0.5 rounded">
                  #{e.codUniv}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">&bull;</span>
                <span className="text-xs font-medium text-slate-500 truncate hidden sm:inline">{e.escuela}</span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 truncate mt-0.5" title={e.nombres}>
                {e.nombres}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer shrink-0"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido en una sola pantalla sin scroll */}
        <div className="p-5 sm:p-6 flex flex-col gap-3.5">
          {cargando ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <RefreshCw className="w-8 h-8 text-uss-blue animate-spin" />
              <p className="text-sm font-semibold text-slate-700">Consultando estado en tiempo real...</p>
              <p className="text-xs text-slate-500">Verificando en Centro de Informática y registros GEX</p>
            </div>
          ) : !solicitudPrincipal ? (
            <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Circle className="w-7 h-7 stroke-1" />
              </div>
              <div className="max-w-md">
                <h4 className="text-base font-bold text-slate-900">
                  No registras solicitudes activas
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Aún no encontramos un trámite de acreditación registrado con el código <strong>{e.codUniv}</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2.5 mt-2 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={onRecargar}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Volver a verificar
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Bloque Superior: Plan y Stepper Horizontal de 4 pasos */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-col gap-3">
                {/* Cabecera del plan */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-uss-blue font-mono bg-blue-50 px-2 py-0.5 rounded ring-1 ring-blue-100">
                      Modalidad elegida
                    </span>
                    <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
                      {getNombrePlan(solicitudPrincipal.plan)}
                    </h4>
                    <span className="text-slate-300 hidden sm:inline">&bull;</span>
                    <p className="text-xs text-slate-500">
                      Registrada el: <strong>{formatFecha(solicitudPrincipal.created_at)}</strong>
                    </p>
                  </div>

                  {(() => {
                    const badge = getEstadoBadgeInfo(solicitudPrincipal);
                    const IconBadge = badge.Icon;
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1 shrink-0 ${badge.estilo}`}>
                        <IconBadge className="w-3.5 h-3.5" />
                        {badge.texto}
                      </span>
                    );
                  })()}
                </div>

                {/* Stepper Horizontal de 4 pasos */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                  {PASOS_TRAMITE.map((pasoItem) => {
                    const pasoActual = getPasoActual(solicitudPrincipal);
                    const completado =
                      pasoItem.paso < pasoActual ||
                      (pasoItem.paso === 4 && solicitudPrincipal.estado === 'aprobada');
                    const activo =
                      pasoItem.paso === pasoActual && solicitudPrincipal.estado !== 'aprobada';

                    return (
                      <div
                        key={pasoItem.paso}
                        className={`rounded-xl p-2.5 sm:p-3 border transition-all flex flex-col justify-between ${
                          completado
                            ? 'bg-emerald-50/60 border-emerald-200/90 text-emerald-900 shadow-2xs'
                            : activo
                            ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-slate-50/60 border-slate-200/60 text-slate-400 opacity-65'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono font-bold shrink-0 ${
                              completado
                                ? 'bg-emerald-600 text-white'
                                : activo
                                ? 'bg-uss-blue text-white shadow-xs'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {completado ? <Check className="w-3 h-3 stroke-[3]" /> : pasoItem.paso}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              completado
                                ? 'bg-emerald-100 text-emerald-800'
                                : activo
                                ? 'bg-blue-100 text-uss-blue'
                                : 'bg-slate-200/80 text-slate-500'
                            }`}
                          >
                            {completado ? 'Listo' : activo ? 'En curso' : 'Pendiente'}
                          </span>
                        </div>

                        <div className="mt-1.5 min-w-0">
                          <h6
                            className={`text-xs font-bold leading-tight truncate ${
                              activo ? 'text-uss-blue' : completado ? 'text-emerald-900' : 'text-slate-700'
                            }`}
                          >
                            {pasoItem.titulo}
                          </h6>
                          <p className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-1">
                            {pasoItem.subtitulo}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bloque Inferior: 2 Columnas (Izquierda: Qué sigue y Observación · Derecha: Canales de Atención CINF) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Columna 1: Observaciones y Qué sigue */}
                <div className="flex flex-col gap-2.5">
                  {solicitudPrincipal.comentario ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 sm:p-3 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs min-w-0">
                        <strong className="text-amber-900 block font-bold">Observación del Centro de Informática:</strong>
                        <span className="text-amber-800 mt-0.5 block">{solicitudPrincipal.comentario}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Tu trámite está en cola de revisión habitual sin observaciones pendientes.</span>
                    </div>
                  )}

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex-1 flex flex-col justify-center">
                    <h6 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1">
                      ¿Qué sigue en tu trámite?
                    </h6>
                    <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                      <li>La Dirección del Programa envía la lista a Finanzas del Estudiante.</li>
                      <li>Finanzas programa las tasas académicas según aranceles vigentes.</li>
                      <li>El CINF te asigna en tu grupo y horario, notificándote a tu correo o WhatsApp.</li>
                    </ol>
                  </div>
                </div>

                {/* Columna 2: Tarjeta WhatsApp y Canales de Atención */}
                <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs sm:text-sm font-bold text-emerald-950">
                        Atención directa CINF
                      </h5>
                      <p className="text-xs text-emerald-800 mt-0.5 leading-snug">
                        WhatsApp: <strong>{CONTACTO_CINF.whatsapp}</strong>
                      </p>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        Horario: {CONTACTO_CINF.horario} &bull; {CONTACTO_CINF.correo}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`${CONTACTO_CINF.whatsappUrl}?text=${encodeURIComponent(
                      `Hola CINF, consulto el avance de mi trámite GEX (Código: ${e.codUniv} - Estudiante: ${e.nombres}).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Escribir por WhatsApp al CINF
                  </a>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer del Modal */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-200 bg-[#f8fafc] flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onRecargar}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
            Actualizar estado
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
