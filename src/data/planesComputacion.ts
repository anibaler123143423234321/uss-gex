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

export interface ItemIncluyeGex {
  texto: string;
  activo: boolean;
  /** (_*) en la pizarra: hay que aprobar ese curso (p. ej. Cisco NetAcad) para poder acreditar */
  obligatorio?: boolean;
}

/** Certificado o constancia que emite el plan. requierePago es el asterisco (*) de la pizarra */
export interface DocumentoEmitidoGex {
  emite: boolean;
  /** "50 horas", "90 horas por curso"… vacío si no hay detalle */
  detalle: string;
  requierePago: boolean;
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
  /** Fecha y hora límite en formato ISO local YYYY-MM-DDTHH:mm (ej. "2026-12-15T23:59") */
  fechaLimite?: string;
  etapas: EtapaPlan[];
  requisitos: string[];
  incluye: (ItemIncluyeGex | string)[];
  documento: string;
  /** Lo que sigue después de registrarse */
  proceso: string[];
  /** Matriz oficial del Centro de Informática (pizarra): público, requisito y cómo se acredita */
  dirigidoA: string;
  requisitoPrincipal: string;
  formaAcreditacion: string;
  certificado: DocumentoEmitidoGex;
  constancia: DocumentoEmitidoGex;
  /** Texto del botón de la tarjeta: Inscripción, Entrevista, Solicitud, Ver horarios */
  textoBoton: string;
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

export interface ItemCronogramaPizarra {
  mes: string;
  monto: string;
  montoNumero: number;
  esCero: boolean;
  detalle?: string;
  esSeparador?: boolean;
}

/**
 * Cronograma financiero mensual oficial de Computación GEX (fijado en pizarra).
 * Suma total exacta: 100 + 100 + 100 + 0 + 0 + 0 + 0 + 250 = S/ 550.00.
 */
export const CRONOGRAMA_GEX_PIZARRA: ItemCronogramaPizarra[] = [
  { mes: 'Enero 2027', monto: '100.00', montoNumero: 100, esCero: false, detalle: 'Clases virtuales y talleres' },
  { mes: 'Feb 2027', monto: '100.00', montoNumero: 100, esCero: false, detalle: 'Clases virtuales y talleres' },
  { mes: 'Marzo 2027', monto: '100.00', montoNumero: 100, esCero: false, detalle: 'Clases virtuales y master class' },
  { mes: 'Abr', monto: '0.00', montoNumero: 0, esCero: true, detalle: 'Asincrónico · Curso CISCO' },
  { mes: 'May', monto: '0.00', montoNumero: 0, esCero: true, detalle: 'Asincrónico · Curso CISCO' },
  { mes: 'Jun', monto: '0.00', montoNumero: 0, esCero: true, detalle: 'Asincrónico · Curso CISCO' },
  { mes: 'Jul', monto: '0.00', montoNumero: 0, esCero: true, detalle: 'Asincrónico · Curso CISCO' },
  { mes: 'Agosto', monto: '250.00', montoNumero: 250, esCero: false, detalle: 'Resolución de casos y evaluación final', esSeparador: true },
];

export const TOTAL_CRONOGRAMA_GEX = '550.00';

export const iconoPlan = (nombre: string): LucideIcon => ICONOS_PLAN[nombre] ?? Sparkles;

/**
 * Fila "Incluye" de la matriz oficial (pizarra del Centro de Informática). Van en el mismo orden en
 * los 4 planes para que el portal las alinee como una tabla: Zoom, asincrónico, Cisco y examen.
 */
export const COMPARATIVA_OFICIAL: Record<PlanOpcionId, ItemIncluyeGex[]> = {
  gex: [
    { texto: 'Sesiones en vivo por Zoom', activo: true },
    { texto: 'Sesiones asincrónicas', activo: true },
    { texto: 'Certificado Cisco NetAcad', activo: true, obligatorio: true },
    { texto: 'Evaluación integral', activo: true },
  ],
  validacion: [
    { texto: 'Sesiones en vivo por Zoom', activo: false },
    { texto: 'Sesiones asincrónicas', activo: false },
    { texto: 'Certificado Cisco', activo: false },
    { texto: 'Examen de certificación', activo: true },
  ],
  convalidacion: [
    { texto: 'Sesiones en vivo por Zoom', activo: false },
    { texto: 'Sesiones asincrónicas', activo: false },
    { texto: 'Certificado Cisco', activo: false },
    { texto: 'Examen de certificación', activo: false },
  ],
  protech: [
    { texto: 'Sesiones en vivo por Zoom (cronograma de 3, 2 o 1 mes)', activo: true },
    { texto: 'Sesiones asincrónicas', activo: false },
    { texto: 'Certificado Cisco gratis', activo: true, obligatorio: true },
    { texto: 'Taller de certificación internacional', activo: true },
  ],
};

/**
 * Lo demás de la matriz oficial por plan. Rige mientras el panel no lo edite: mezclarPlanes completa
 * con esto los planes guardados antes de que existieran estos campos.
 */
export const MATRIZ_OFICIAL: Record<PlanOpcionId, {
  dirigidoA: string;
  requisitoPrincipal: string;
  formaAcreditacion: string;
  certificado: DocumentoEmitidoGex;
  constancia: DocumentoEmitidoGex;
  textoBoton: string;
}> = {
  gex: {
    dirigidoA: 'Estudiantes de pregrado de la modalidad Gente con Experiencia',
    requisitoPrincipal: 'Ninguno',
    formaAcreditacion: 'Curso GEX',
    certificado: { emite: true, detalle: '50 horas', requierePago: true },
    constancia: { emite: true, detalle: '', requierePago: true },
    textoBoton: 'Inscripción',
  },
  validacion: {
    dirigidoA: 'Estudiantes con conocimientos de nivel avanzado en Informática',
    requisitoPrincipal: 'Entrevista previa',
    formaAcreditacion: 'Examen de certificación',
    certificado: { emite: false, detalle: '', requierePago: false },
    constancia: { emite: true, detalle: '', requierePago: true },
    textoBoton: 'Entrevista',
  },
  convalidacion: {
    dirigidoA: 'Estudiantes con título profesional técnico en Computación o carrera afín',
    requisitoPrincipal: 'Título profesional o título técnico legalizado',
    formaAcreditacion: 'Resolución de convalidación',
    certificado: { emite: false, detalle: '', requierePago: false },
    constancia: { emite: true, detalle: '', requierePago: false },
    textoBoton: 'Solicitud',
  },
  protech: {
    dirigidoA: 'Estudiantes de pregrado USS',
    requisitoPrincipal: 'Ninguno',
    formaAcreditacion: '3 cursos + 1 taller',
    certificado: { emite: true, detalle: '90 horas por curso', requierePago: true },
    constancia: { emite: true, detalle: '', requierePago: false },
    textoBoton: 'Ver horarios',
  },
};

/**
 * Normaliza "Incluye". Las listas viejas eran solo textos (viñetas sin ✓ ni —, de antes de la matriz):
 * esas se reemplazan por la fila oficial. Una lista con objetos es la que editó el panel y se respeta.
 */
export function normalizarIncluye(incluye: unknown, planId?: PlanOpcionId): ItemIncluyeGex[] {
  const lista = Array.isArray(incluye) ? incluye : [];
  const editada = lista.some((item) => item && typeof item === 'object');
  if (editada) {
    return lista
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const obj = item as { texto?: unknown; activo?: unknown; obligatorio?: unknown };
        const texto = String(obj.texto ?? '').trim();
        if (!texto) return null;
        return { texto, activo: obj.activo !== false, ...(obj.obligatorio === true ? { obligatorio: true } : {}) };
      })
      .filter((x): x is ItemIncluyeGex => x !== null);
  }
  return planId ? COMPARATIVA_OFICIAL[planId].map((x) => ({ ...x })) : [];
}

/** Un certificado o constancia guardado a medias se completa con el oficial */
export function normalizarDocumento(valor: unknown, oficial: DocumentoEmitidoGex): DocumentoEmitidoGex {
  if (!valor || typeof valor !== 'object') return { ...oficial };
  const v = valor as Partial<Record<keyof DocumentoEmitidoGex, unknown>>;
  return {
    emite: typeof v.emite === 'boolean' ? v.emite : oficial.emite,
    detalle: typeof v.detalle === 'string' ? v.detalle : oficial.detalle,
    requierePago: typeof v.requierePago === 'boolean' ? v.requierePago : oficial.requierePago,
  };
}

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
    precio: 'S/ 550',
    precioNota: 'Pago total: 3 meses de S/ 100 + S/ 250 final',
    insignia: 'Certificado',
    fechaLimite: '2026-12-15T23:59',
    etapas: [
      { duracion: '3 meses', periodo: 'Enero – Marzo', costo: 'S/ 100 por mes', detalle: 'Clases virtuales, talleres y master class' },
      { duracion: '4 meses', periodo: 'Abril – Julio', costo: 'Gratis', detalle: 'Asincrónico · Curso CISCO' },
      { duracion: '1 mes', periodo: 'Agosto', costo: 'S/ 250', detalle: 'Resolución de casos aplicados' },
    ],
    requisitos: [],
    incluye: COMPARATIVA_OFICIAL.gex,
    ...MATRIZ_OFICIAL.gex,
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
    precio: 'S/ 340',
    precioNota: 'Derecho de examen de certificación',
    insignia: 'Constancia',
    fechaLimite: '2026-12-15T23:59',
    etapas: [],
    requisitos: [
      'Entrevista previa con el Centro de Informática',
      'Presentar la solicitud formal hasta el 15 de diciembre',
      'Realizar el pago de las tasas administrativas vigentes',
      'No estar matriculado en el curso de acreditación',
    ],
    incluye: COMPARATIVA_OFICIAL.validacion,
    ...MATRIZ_OFICIAL.validacion,
    documento: 'Solo constancia (no se emite certificado)',
    proceso: [
      'Solicitas tu entrevista y eliges el turno que te acomoda.',
      'El Centro de Informática te contacta para la entrevista previa.',
      'Si la apruebas, se programa el pago del derecho de examen.',
      'Rindes el examen de certificación en Microsoft Word o Microsoft Excel.',
    ],
  },
  {
    id: 'convalidacion',
    icono: 'FileBadge',
    acento: '#7c3aed',
    etiqueta: 'Estudios previos',
    nombre: 'Convalidación',
    resumen: 'Si ya cuentas con formación técnica y experiencia laboral, reconoce tu título en Computación o carrera afín.',
    precio: 'S/ 120',
    precioNota: 'Trámite de resolución de convalidación',
    insignia: 'Constancia',
    fechaLimite: '2026-12-15T23:59',
    etapas: [],
    requisitos: [
      'Título profesional o título técnico legalizado',
      'Certificado de estudios',
      'Título emitido por una institución oficialmente reconocida',
    ],
    incluye: COMPARATIVA_OFICIAL.convalidacion,
    ...MATRIZ_OFICIAL.convalidacion,
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
    precioNota: 'Por cada curso de la ruta',
    insignia: 'Certificado',
    fechaLimite: '2026-12-15T23:59',
    etapas: [],
    requisitos: [],
    incluye: COMPARATIVA_OFICIAL.protech,
    ...MATRIZ_OFICIAL.protech,
    documento: 'Certificación Internacional Microsoft Office',
    proceso: [
      'Eliges el cronograma y el turno que prefieres.',
      'El Centro de Informática te confirma la sección y el horario disponibles.',
      'Te matriculas en tus cursos y en el taller de certificación.',
    ],
  },
];

/**
 * Qué abre el botón de cada opción (pizarra oficial). Es fijo por opción porque de él depende el
 * formulario; el panel solo cambia el texto del botón.
 */
export type AccionPlan = 'inscripcion' | 'entrevista' | 'solicitud' | 'horarios';
export const ACCION_PLAN: Record<PlanOpcionId, AccionPlan> = {
  gex: 'inscripcion',
  validacion: 'entrevista',
  convalidacion: 'solicitud',
  protech: 'horarios',
};

/** Turnos de atención del Centro de Informática: para la entrevista o el horario que prefiere el estudiante */
export const TURNOS_CINF = [
  { clave: 'manana', etiqueta: 'Mañana', detalle: 'Lunes a viernes · 8:00 a. m. – 1:00 p. m.' },
  { clave: 'tarde', etiqueta: 'Tarde', detalle: 'Lunes a viernes · 2:00 p. m. – 6:00 p. m.' },
  { clave: 'sabado', etiqueta: 'Sábado', detalle: 'Sábados · 9:00 a. m. – 12:00 p. m.' },
] as const;

/** Cronogramas de PROTECH XP según la pizarra: el mismo curso en 3, 2 o 1 mes */
export const CRONOGRAMAS_PROTECH = ['3 meses', '2 meses', '1 mes'] as const;

/** Leyenda de los asteriscos de la matriz oficial */
export const LEYENDA_PAGO = '* Requiere el pago de la tasa administrativa oficial.';
export const LEYENDA_OBLIGATORIO = '(_*) Aprobación obligatoria del curso Cisco NetAcad.';

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
 * Solo convalidación pide archivos; las demás opciones solo dejan sus datos.
 */
// Validación ya no pide archivos al inscribirse: según la pizarra empieza con una entrevista previa
export const DOCUMENTOS_PLAN: Partial<Record<PlanOpcionId, DocumentoPlan[]>> = {
  convalidacion: [
    { clave: 'titulo', etiqueta: 'Título profesional o título técnico legalizado', obligatorio: true },
    { clave: 'estudios', etiqueta: 'Certificado de estudios', obligatorio: true },
    COMPROBANTE,
  ],
};

const MESES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre',
];

export function formatearFechaLimite(fechaIso?: string): string {
  if (!fechaIso || typeof fechaIso !== 'string') return 'hasta el 15 de diciembre';
  const limpia = fechaIso.trim();
  if (!limpia) return 'hasta el 15 de diciembre';

  const [fechaPart, horaPart] = limpia.split('T');
  const partesFecha = fechaPart.split('-').map(Number);
  if (partesFecha.length < 3 || isNaN(partesFecha[1]) || isNaN(partesFecha[2])) {
    return 'hasta el 15 de diciembre';
  }

  const dia = partesFecha[2];
  const mes = MESES_ES[partesFecha[1] - 1] ?? 'diciembre';

  if (!horaPart) {
    return `hasta el ${dia} de ${mes}`;
  }

  const [hStr, mStr] = horaPart.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (isNaN(h) || isNaN(m)) {
    return `hasta el ${dia} de ${mes}`;
  }

  const periodo = h >= 12 ? 'p. m.' : 'a. m.';
  const hora12 = h % 12 === 0 ? 12 : h % 12;
  const minutos = m === 0 ? '' : `:${String(m).padStart(2, '0')}`;

  return `hasta el ${dia} de ${mes} · ${hora12}${minutos} ${periodo}`;
}

export function estaPlazoVencido(fechaIso?: string): boolean {
  if (!fechaIso) return false;
  try {
    const d = new Date(fechaIso);
    return !isNaN(d.getTime()) && Date.now() > d.getTime();
  } catch {
    return false;
  }
}

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
  horario: 'Lunes a viernes · 8:00 a. m. – 1:00 p. m. y 2:00 p. m. – 6:00 p. m. | Sábados · 9:00 a. m. – 12:00 p. m.',
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
    // Los planes guardados antes de la matriz oficial no traen estos campos: rigen los oficiales
    const textoO = (valor: unknown, porDefecto: string) => (typeof valor === 'string' ? valor : porDefecto);
    const requisitos = oficial.id === 'convalidacion'
      ? oficial.requisitos
      : (Array.isArray(guardado.requisitos) ? guardado.requisitos : oficial.requisitos);
    const requisitoPrincipal = oficial.id === 'convalidacion'
      ? oficial.requisitoPrincipal
      : textoO(guardado.requisitoPrincipal, oficial.requisitoPrincipal);

    return {
      ...oficial,
      ...guardado,
      insignia,
      requisitos,
      fechaLimite: typeof guardado.fechaLimite === 'string' && guardado.fechaLimite.trim() ? guardado.fechaLimite : oficial.fechaLimite || '2026-12-15T23:59',
      incluye: normalizarIncluye(guardado.incluye, oficial.id),
      dirigidoA: textoO(guardado.dirigidoA, oficial.dirigidoA),
      requisitoPrincipal,
      formaAcreditacion: textoO(guardado.formaAcreditacion, oficial.formaAcreditacion),
      textoBoton: guardado.textoBoton || oficial.textoBoton,
      certificado: normalizarDocumento(guardado.certificado, oficial.certificado),
      constancia: normalizarDocumento(guardado.constancia, oficial.constancia),
    };
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
