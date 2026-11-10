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

/**
 * Descuento en porcentaje sobre el precio principal (no sobre las etapas). Lo edita el panel;
 * se muestra solo desde el inicio hasta el fin, ambos días incluidos y en hora de Lima.
 */
export interface DescuentoPlan {
  activo: boolean;
  /** Entero de 1 a 99 */
  porcentaje: number;
  /** yyyy-mm-dd */
  inicio: string;
  fin: string;
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
  /** Sin descuento si falta */
  descuento?: DescuentoPlan;
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
 * Fuente: uss-gex/documentos — "Acreditaciones extracurriculares para el Programa Gente con
 * Experiencia" (anexo de la Resolución de Directorio N.° 0039-A-2026/PD-USS), sección 2, y las
 * láminas del CINF de la presentación (9 a 12). PROTECH XP sale de las láminas 4 y 9 del CINF.
 * No agregar costos ni requisitos que no estén ahí.
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
    insignia: 'Certificado',
    etapas: [
      { duracion: '3 meses', periodo: 'Enero – Marzo', costo: 'S/ 100 por mes', detalle: 'Clases virtuales, talleres y master class' },
      { duracion: '4 meses', periodo: 'Abril – Julio', costo: 'Gratis', detalle: 'Asincrónico · Curso CISCO' },
      { duracion: '1 mes', periodo: 'Agosto', costo: 'S/ 250', detalle: 'Resolución de casos aplicados' },
    ],
    requisitos: [],
    incluye: [
      'Sesiones por Zoom, talleres y webinars',
      'Masterclass de acompañamiento académico',
      'Alfabetización digital en Cisco NetAcad, con insignias digitales',
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
    id: 'validacion',
    icono: 'ClipboardCheck',
    acento: '#b45309',
    etiqueta: 'Reconocimiento de experiencia',
    nombre: 'Validación de competencias',
    resumen: 'Si ya trabajas y usas herramientas digitales en tu entorno profesional, acredita con un examen, sin cursar.',
    precio: 'S/.',
    precioNota: 'según tasa vigente',
    insignia: 'Constancia',
    etapas: [],
    requisitos: [
      'Presentar la solicitud formal hasta el 15 de diciembre',
      'Realizar el pago de las tasas administrativas vigentes',
      'No estar matriculado en el curso de acreditación',
    ],
    incluye: [
      'Examen teórico-práctico en Microsoft Word o Microsoft Excel',
      'Alineado al sílabo vigente y a contextos laborales reales',
    ],
    documento: 'Solo constancia (no se emite certificado)',
    proceso: [
      'Presentación de la solicitud.',
      'El Centro de Informática la revisa y se programa el pago de la tasa.',
      'Examen teórico-práctico en Microsoft Word o Microsoft Excel, alineado al sílabo vigente.',
      'Registro del resultado en el sistema académico.',
    ],
  },
  {
    id: 'convalidacion',
    icono: 'FileBadge',
    acento: '#7c3aed',
    etiqueta: 'Estudios previos',
    nombre: 'Convalidación',
    resumen: 'Si ya cuentas con formación técnica y experiencia laboral, reconoce tu título en Computación o carrera afín.',
    precio: 'Trámite',
    precioNota: 'según tasa vigente',
    insignia: 'Constancia',
    etapas: [],
    requisitos: [
      'Presentar la solicitud formal hasta el 15 de diciembre',
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
      'Programación y pago del Derecho de trámite del Centro de Informática y del Derecho de Convalidación CIS.',
      'Registro del resultado en el sistema académico.',
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
    insignia: 'Certificado',
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
];

/**
 * Cómo se acredita cada opción, según la sección 2 del documento: el curso cierra con la evaluación
 * integral de agosto, la validación es solo un examen y la convalidación es documental (no lleva
 * examen). No se edita en el panel porque de esto depende el formulario.
 */
export const MODALIDAD: Record<PlanOpcionId, { corta: string; registro: string }> = {
  gex: { corta: 'Curso y evaluación', registro: 'Inscripción al curso' },
  validacion: { corta: 'Examen', registro: 'Inscripción al examen' },
  convalidacion: { corta: 'Documentos', registro: 'Solicitud de convalidación' },
  protech: { corta: 'Cursos y taller', registro: 'Inscripción' },
};

/** Una fila del comparativo de las tarjetas: va en el mismo orden en los 4 planes, como una página de precios */
export interface FilaComparativa {
  /** Se muestra con "–" en los planes que no lo incluyen */
  texto: string;
  /** Planes que sí lo incluyen; true usa el mismo texto, un string lo cambia solo para ese plan */
  planes: Partial<Record<PlanOpcionId, true | string>>;
}

// Misma fuente que PLANES_COMPUTACION. Según la tabla de certificación (sección 2 y lámina 12): el
// curso da certificado de 50 horas y constancia; validación y convalidación, solo constancia. La
// convalidación es documental, por eso no lleva evaluación.
export const COMPARATIVA: FilaComparativa[] = [
  { texto: 'Sesiones por Zoom, talleres y master class', planes: { gex: true, protech: 'Sesiones por Zoom' } },
  { texto: 'Curso asincrónico en Cisco NetAcad', planes: { gex: 'Curso asincrónico gratis en Cisco NetAcad' } },
  { texto: 'Cursos de tu ruta y taller de certificación', planes: { protech: '3 cursos de tu ruta y 1 taller de certificación' } },
  {
    texto: 'Acreditas sin cursar',
    planes: { validacion: 'Acreditas tu experiencia, sin cursar', convalidacion: 'Acreditas con tu título técnico, sin cursar' },
  },
  {
    texto: 'Examen o evaluación final',
    planes: {
      gex: 'Evaluación integral en agosto',
      validacion: 'Examen en Word o Excel',
      protech: 'Examen al final',
    },
  },
  { texto: 'Certificado', planes: { gex: 'Certificado de 50 horas', protech: 'Certificación internacional' } },
  { texto: 'Constancia de cumplimiento', planes: { gex: true, protech: true, validacion: true, convalidacion: true } },
];

/** Un documento que el estudiante sube al registrarse */
export interface DocumentoPlan {
  clave: string;
  etiqueta: string;
  obligatorio: boolean;
}

// El comprobante es opcional en ambos: según el documento el pago va después de la solicitud (en
// convalidación es el paso 3, tras verificar los papeles; y las tasas las programa Finanzas del
// Estudiante), así que al inscribirse el estudiante todavía puede no tenerlo.
const COMPROBANTE: DocumentoPlan = { clave: 'pago', etiqueta: 'Comprobante de pago', obligatorio: false };

/**
 * Documentos que pide cada plan, uno por requisito de la sección 2 del documento oficial.
 * Programa GEX y PROTECH XP no piden archivos: el estudiante solo deja sus datos.
 */
export const DOCUMENTOS_PLAN: Partial<Record<PlanOpcionId, DocumentoPlan[]>> = {
  validacion: [{ clave: 'solicitud', etiqueta: 'Solicitud formal', obligatorio: true }, COMPROBANTE],
  convalidacion: [
    { clave: 'solicitud', etiqueta: 'Solicitud formal', obligatorio: true },
    { clave: 'titulo', etiqueta: 'Título técnico legalizado o fedateado', obligatorio: true },
    { clave: 'estudios', etiqueta: 'Certificado de estudios y sílabos', obligatorio: true },
    COMPROBANTE,
  ],
};

/** Fecha límite para presentar la solicitud en las 4 opciones (la indicó el Centro de Informática) */
export const PLAZO_SOLICITUD = 'hasta el 15 de diciembre';

/** Políticas generales del documento que el estudiante debe conocer antes de registrarse */
export const POLITICAS_GEX: string[] = [
  'La acreditación en Computación es requisito indispensable para el trámite de bachillerato.',
  'Una vez registrado, debes cancelar el íntegro de las cuotas dentro del cronograma de Finanzas del Estudiante.',
  'No hay cambios de fecha, reservas de matrícula ni traslados entre convocatorias.',
  'Si desapruebas o te inhabilitas, repites la acreditación en el siguiente verano y asumes sus costos.',
  'El certificado solo se emite al cursar y aprobar el curso; en validación y convalidación se emite constancia.',
];

/** Canales del Centro de Informática (lámina de contacto de la presentación) */
export const CONTACTO_CINF = {
  whatsapp: '986 724 506',
  whatsappUrl: 'https://wa.me/51986724506',
  correo: 'centro.informatica@uss.edu.pe',
  direccion: 'Elías Aguirre N.° 933, 1.er piso — Chiclayo',
  horario: 'Lunes a viernes · 8:00 a. m. – 1:00 p. m. y 2:00 p. m. – 6:00 p. m.',
};

/** Completa los planes guardados con los oficiales; siempre salen los 4, en el orden oficial (Opción 1 a 4). */
export function mezclarPlanes(guardados: unknown): PlanOpcion[] {
  const lista = Array.isArray(guardados) ? (guardados as Partial<PlanOpcion>[]) : [];
  return PLANES_COMPUTACION.map((oficial) => {
    const guardado = lista.find((p) => p?.id === oficial.id) ?? {};
    let insignia = guardado.insignia;
    if (!insignia || insignia === 'Con certificado' || insignia === 'Certificado o constancia') {
      insignia = oficial.insignia;
    }
    return { ...oficial, ...guardado, insignia };
  });
}

export const NOTA_COSTOS = '* Costos por apertura vigentes en el semestre actual.';

/** Descuento que rige hoy, listo para la tarjeta. precioFinal es null si el precio no trae número ("S/.", "Trámite"). */
export interface DescuentoVigente {
  porcentaje: number;
  precioFinal: string | null;
  /** dd/mm/aaaa */
  hasta: string;
}

// El día cambia a medianoche de Lima, no de UTC ni de la zona del navegador
const hoyEnLima = (): string => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });

/** Rebaja solo el primer número del precio y deja el resto del texto: "S/ 420" al 15 % → "S/ 357" */
function precioConDescuento(precio: string, porcentaje: number): string | null {
  const numero = precio.match(/\d[\d,]*(?:\.\d+)?/);
  if (!numero || numero.index === undefined) return null;
  const final = Math.round(Number(numero[0].replace(/,/g, '')) * (100 - porcentaje)) / 100;
  const texto = final.toLocaleString('en-US', Number.isInteger(final) ? {} : { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return precio.slice(0, numero.index) + texto + precio.slice(numero.index + numero[0].length);
}

/** Copia del cálculo de GexPlanesEditor en ecosistema-cinf, que lo usa para la vista previa */
export function descuentoVigente(plan: PlanOpcion, hoy = hoyEnLima()): DescuentoVigente | null {
  const d = plan.descuento;
  if (!d?.activo || !(d.porcentaje >= 1 && d.porcentaje <= 99) || !d.inicio || !d.fin) return null;
  if (hoy < d.inicio || hoy > d.fin) return null;
  return {
    porcentaje: d.porcentaje,
    precioFinal: precioConDescuento(plan.precio, d.porcentaje),
    hasta: d.fin.split('-').reverse().join('/'),
  };
}
