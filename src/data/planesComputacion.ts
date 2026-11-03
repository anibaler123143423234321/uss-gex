import {
  CalendarRange, CalendarDays, Clock, Route, Compass, Target, ClipboardCheck, FileBadge,
  FileText, ScrollText, BadgeCheck, ShieldCheck, Award, Medal, Trophy, Star,
  GraduationCap, BookOpen, Brain, Lightbulb, Monitor, Laptop, Cpu, Layers,
  Puzzle, Wrench, Briefcase, Users, Presentation, Video, Globe, Rocket, Sparkles, Zap,
  type LucideIcon,
} from 'lucide-react';

export type PlanOpcionId = 'gex' | 'protech' | 'validacion' | 'convalidacion';

export interface EtapaPlan {
  duracion: string;
  periodo: string;
  costo: string;
  detalle: string;
}

/** Una tarjeta del Menú de opciones. Se edita en el panel; los 4 id son fijos. */
export interface PlanOpcion {
  id: PlanOpcionId;
  /** Nombre de un ícono de ICONOS_PLAN */
  icono: string;
  acento: string;
  etiqueta: string;
  nombre: string;
  resumen: string;
  precio: string;
  precioNota: string;
  /** Vacío = sin insignia */
  insignia: string;
  etapas: EtapaPlan[];
  requisitos: string[];
  incluye: string[];
  documento: string;
  /** Lo que sigue después de registrarse */
  proceso: string[];
}

// Íconos que se pueden elegir en el panel. La misma lista valida el backend
// (ICONOS_PLAN en gexConfigStore.ts) y la muestra el panel.
export const ICONOS_PLAN: Record<string, LucideIcon> = {
  CalendarRange, CalendarDays, Clock, Route, Compass, Target, ClipboardCheck, FileBadge,
  FileText, ScrollText, BadgeCheck, ShieldCheck, Award, Medal, Trophy, Star,
  GraduationCap, BookOpen, Brain, Lightbulb, Monitor, Laptop, Cpu, Layers,
  Puzzle, Wrench, Briefcase, Users, Presentation, Video, Globe, Rocket, Sparkles, Zap,
};

export const iconoPlan = (nombre: string): LucideIcon => ICONOS_PLAN[nombre] ?? Sparkles;

/**
 * Valores oficiales de las formas de acreditar Computación en el Programa Gente con Experiencia.
 * El panel puede cambiarlos (tbl_gex_config.config.planes); estos rigen si aún no se editaron.
 * Fuente: "Acreditaciones extracurriculares para el Programa Gente con Experiencia",
 * sección 2 (Programa GEX, Validación y Convalidación), y láminas 4 y 9 del CINF
 * (Modelo PROTECH XP). No agregar costos ni requisitos que no estén ahí.
 * Copia de DEFAULT_PLANES en ecosistema-cinf/backend/src/data/gexConfigStore.ts.
 */
export const PLANES_COMPUTACION: PlanOpcion[] = [
  {
    id: 'gex',
    icono: 'CalendarRange',
    acento: '#073299',
    etiqueta: 'Curso de acreditación',
    nombre: 'Programa GEX',
    resumen: 'Clases virtuales, curso CISCO y evaluación final en los meses no curriculares.',
    precio: 'S/ 100',
    precioNota: 'al mes · enero a marzo',
    insignia: 'Con certificado',
    etapas: [
      { duracion: '3 meses', periodo: 'Enero – Marzo', costo: 'S/ 100 por mes', detalle: 'Clases virtuales, talleres y master class' },
      { duracion: '4 meses', periodo: 'Abril – Julio', costo: 'Gratis', detalle: 'Asincrónico · Curso CISCO' },
      { duracion: '1 mes', periodo: 'Agosto', costo: 'S/ 250', detalle: 'Resolución de casos aplicados' },
    ],
    requisitos: [],
    incluye: [
      'Sesiones por Zoom, talleres y webinars',
      'Módulos de alfabetización digital en Cisco NetAcad',
      'Evaluación integral de competencias en agosto',
    ],
    documento: 'Certificado de 50 horas y constancia',
    proceso: [
      'La Dirección del Programa de Experiencia Laboral envía la lista de participantes habilitados a Finanzas del Estudiante.',
      'Finanzas del Estudiante programa los servicios académicos según las tasas vigentes.',
      'El Centro de Informática te registra en tu grupo y horario.',
    ],
  },
  {
    id: 'protech',
    icono: 'Route',
    acento: '#0f766e',
    etiqueta: 'Modelo académico',
    nombre: 'PROTECH XP',
    resumen: '3 cursos de tu ruta de aprendizaje y 1 taller de certificación internacional.',
    precio: 'S/ 420',
    precioNota: 'por curso · taller S/ 340 (Sede Chiclayo)',
    insignia: '',
    etapas: [],
    requisitos: [],
    incluye: [
      '3 cursos de tu ruta de aprendizaje',
      '1 taller de certificación internacional',
      'Puedes llevar los cursos de tu ruta en paralelo',
      'Certificación Internacional Microsoft Office Specialist',
    ],
    documento: 'Certificación Internacional Microsoft Office',
    proceso: ['El Centro de Informática programará la fecha de tu examen y te la comunicará por celular o correo.'],
  },
  {
    id: 'validacion',
    icono: 'ClipboardCheck',
    acento: '#b45309',
    etiqueta: 'Reconocimiento de experiencia',
    nombre: 'Validación de conocimientos',
    resumen: 'Si ya usas herramientas digitales en tu trabajo, acredita con un examen sin cursar.',
    precio: 'Examen',
    precioNota: 'según tasa vigente',
    insignia: '',
    etapas: [],
    requisitos: [
      'Presentar solicitud formal dentro del plazo establecido',
      'Realizar el pago correspondiente',
      'No estar matriculado en el curso',
    ],
    incluye: [
      'Evaluación integral teórico-práctica',
      'Alineada al sílabo vigente y a contextos laborales reales',
    ],
    documento: 'Solo constancia (no se emite certificado)',
    proceso: [
      'Presentación de solicitud.',
      'Evaluación integral (teórico-práctica) alineada al sílabo vigente.',
      'Registro del resultado en el sistema académico.',
    ],
  },
  {
    id: 'convalidacion',
    icono: 'FileBadge',
    acento: '#7c3aed',
    etiqueta: 'Estudios previos',
    nombre: 'Convalidación',
    resumen: 'Reconoce tu formación técnica en Computación o en una carrera afín.',
    precio: 'Trámite',
    precioNota: 'según tasa vigente',
    insignia: '',
    etapas: [],
    requisitos: [
      'Presentar solicitud formal dentro del plazo establecido',
      'Copia legalizada o fedateada del Título Profesional Técnico en Computación o carrera afín',
      'Certificado de estudios y sílabos oficiales',
      'Título emitido por una institución oficialmente reconocida',
    ],
    incluye: [
      'Verificación de la documentación oficial',
      'Evaluación de equivalencia de competencias y contenidos',
    ],
    documento: 'Solo constancia (no se emite certificado)',
    proceso: [
      'Verificación de la documentación oficial.',
      'Evaluación de equivalencia de competencias y contenidos.',
      'Realizar el pago correspondiente.',
      'Registro del resultado en el sistema académico.',
    ],
  },
];

/** Completa los planes guardados con los oficiales; siempre salen los 4, en el orden oficial. */
export function mezclarPlanes(guardados: unknown): PlanOpcion[] {
  const lista = Array.isArray(guardados) ? (guardados as Partial<PlanOpcion>[]) : [];
  return PLANES_COMPUTACION.map((oficial) => ({ ...oficial, ...(lista.find((p) => p?.id === oficial.id) ?? {}) }));
}

export const NOTA_COSTOS = '* Costos por apertura vigentes en el semestre actual.';
