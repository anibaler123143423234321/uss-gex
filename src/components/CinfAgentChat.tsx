import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import {
  Sparkles,
  ArrowUp,
  X,
  ChevronRight,
  RotateCcw,
  Phone,
  MapPin,
  GraduationCap,
} from 'lucide-react';
import {
  CONTACTO_CINF,
  DOCUMENTOS_PLAN,
  NOTA_COSTOS,
  PLAZO_SOLICITUD,
  PLANES_COMPUTACION,
  POLITICAS_GEX,
  type PlanOpcion,
} from '../data/planesComputacion';
import type { EstudianteGEX } from '../types/estudiante';

interface Props {
  estudiante?: EstudianteGEX | null;
  estudiantes?: EstudianteGEX[];
  onNavigateComoAcreditar?: () => void;
  ocultarDock?: boolean;
  /** Planes vigentes (los del panel); el agente responde con sus precios y requisitos */
  planes?: PlanOpcion[];
}

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  time: string;
  isHtml?: boolean;
}

interface DatosEstudiante {
  email: string;
  sede: string;
  condicion: string;
}

// Logo 3D geométrico idéntico al estilo Hostinger
function HostingerStyleAgentLogo({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g1" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
        <linearGradient id="g2" x1="0%" y1="20%" x2="100%" y2="80%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#7e22ce" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#6366f1" floodOpacity="0.3" />
        </filter>
      </defs>
      <g filter="url(#glow)">
        <path
          d="M 50 16 C 54 28 62 36 74 38 C 64 48 54 44 48 38 C 44 32 46 22 50 16 Z"
          fill="url(#g1)"
        />
        <path
          d="M 28 68 C 30 54 38 46 48 44 C 44 58 38 66 30 72 C 26 74 26 72 28 68 Z"
          fill="url(#g2)"
        />
        <path
          d="M 72 68 C 70 54 62 46 52 44 C 56 58 62 66 70 72 C 74 74 74 72 72 68 Z"
          fill="url(#g3)"
        />
        <circle cx="50" cy="46" r="6" fill="#ffffff" opacity="0.9" />
      </g>
    </svg>
  );
}

// Componente para formatear negritas **, viñetas •, correos y listas sin mostrar asteriscos
function FormattedMessageText({ text, isUser }: { text: string; isUser: boolean }) {
  const lines = text.split('\n');

  const parseInline = (line: string) => {
    // Separa por **negrita**
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const content = part.slice(2, -2);
        return (
          <strong
            key={index}
            className={`font-bold ${isUser ? 'text-white' : 'text-slate-900'}`}
          >
            {content}
          </strong>
        );
      }

      // Si contiene correo institucional, volverlo enlace cliqueable
      if (part.toLowerCase().includes('@uss.edu.pe')) {
        const subParts = part.split(/([a-zA-Z0-9._%+-]+@uss\.edu\.pe)/gi);
        return subParts.map((sp, spIdx) => {
          if (sp.toLowerCase().endsWith('@uss.edu.pe')) {
            return (
              <a
                key={spIdx}
                href={`mailto:${sp}`}
                className={`underline font-semibold ${
                  isUser ? 'text-white' : 'text-uss-blue hover:text-blue-800'
                }`}
              >
                {sp}
              </a>
            );
          }
          return sp;
        });
      }

      return part;
    });
  };

  return (
    <div className="space-y-1 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Viñeta
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
          const content = trimmed.slice(2);
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-0.5">
              <span className={`shrink-0 select-none ${isUser ? 'text-blue-200' : 'text-uss-blue font-bold'}`}>
                •
              </span>
              <div className="flex-1">{parseInline(content)}</div>
            </div>
          );
        }

        // Lista numerada
        const numMatch = trimmed.match(/^(\d+\.)\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-0.5">
              <span className={`shrink-0 font-mono font-bold text-[10px] ${isUser ? 'text-blue-200' : 'text-uss-blue'}`}>
                {numMatch[1]}
              </span>
              <div className="flex-1">{parseInline(numMatch[2])}</div>
            </div>
          );
        }

        return <div key={idx}>{parseInline(line)}</div>;
      })}
    </div>
  );
}

// Analiza si el estudiante está acreditado o qué le falta llevar
function analizarEstudiante(e: EstudianteGEX) {
  const compI = e.computacionI >= 1 ? 1 : 0;
  const compII = e.computacionII >= 1 ? 1 : 0;
  const compIII = e.computacionIII >= 1 ? 1 : 0;
  const totalTradicional = compI + compII + compIII;

  const generico = e.generico || 0;
  const especifico = e.especifico || 0;
  const taller = e.taller || 0;
  const totalRutas = generico + especifico + taller;

  const esAcreditadoTradicional = totalTradicional >= 3;
  const esAcreditadoRutas = totalRutas >= 4;
  const esAcreditado = esAcreditadoTradicional || esAcreditadoRutas;

  return {
    esAcreditado,
    esAcreditadoTradicional,
    esAcreditadoRutas,
    totalTradicional,
    totalRutas,
    generico,
    especifico,
    taller,
    pendientesTradicional: Math.max(0, 3 - totalTradicional),
    pendientesRutas: Math.max(0, 4 - totalRutas),
  };
}

// Genera el resumen institucional según si está acreditado o qué debe llevar
function generarResumen(est: EstudianteGEX | null, datos: DatosEstudiante) {
  if (est) {
    const {
      esAcreditado,
      totalTradicional,
      totalRutas,
      pendientesTradicional,
      pendientesRutas,
    } = analizarEstudiante(est);

    // CASO A: YA ACREDITADO -> NO RECOMENDAR CURSOS NI MATRÍCULA
    if (esAcreditado) {
      return `🎓 **ESTADO: 100% ACREDITADO(A) EN COMPUTACIÓN**

¡Felicitaciones, **${est.nombres.split(' ')[0]}**! Ya completaste satisfactoriamente todos los requisitos de computación para tu carrera de **${est.escuela}**.

✅ **Situación académica:**
• Asignaturas aprobadas: Plan cumplido al 100%.
• Cursos pendientes por llevar: **Ninguno (0 cursos)**.
• Condición actual: **Expedito / Acreditado**.

ℹ️ **Aviso importante:**
Ya no necesitas matricularte ni cursar ningún plan de acreditación en Computación. Si necesitas tu certificado o constancia para trámite de grado de Bachiller, puedes comunicarte a los canales de atención del CINF.`;
    }

    // CASO B: EN CURSO -> RESUMEN DE LO QUE TIENE QUE LLEVAR
    const planSugerido =
      totalRutas > 0 && totalTradicional === 0
        ? 'Rutas XP'
        : (totalRutas / 4) >= (totalTradicional / 3)
        ? 'Rutas XP'
        : 'Tradicional';

    return `📋 **RESUMEN DE CURSOS POR LLEVAR**

Hola **${est.nombres.split(' ')[0]}**, este es el estado oficial de tus asignaturas de Computación en **${est.escuela}**:

• **Avance actual:** ${
      planSugerido === 'Rutas XP'
        ? `${Math.min(4, totalRutas)} de 4 cursos aprobados (Ruta PROTECH XP).`
        : `${totalTradicional} de 3 cursos aprobados (Plan Tradicional).`
    }
• **Lo que tienes que llevar:** Te falta(n) **${
      planSugerido === 'Rutas XP' ? pendientesRutas : pendientesTradicional
    } curso(s)** para completar tu acreditación.

🎯 **Opciones para completar tu acreditación:**
1. **Ruta PROTECH XP (4 cursos en total):**
   Puedes cursar módulos Genéricos (Ofimática), Específicos de ${est.escuela} o Taller de Certificación MOS. Te faltan **${pendientesRutas} curso(s)**.
2. **Plan Tradicional (3 asignaturas):**
   Aprobar Computación I, II y III regulares. Te faltan **${pendientesTradicional} curso(s)**.`;
  }

  return `📋 **RESUMEN DE INFORMACIÓN - CINF USS**

Datos registrados:
• **Correo:** ${datos.email}
• **Sede:** ${datos.sede}
• **Condición:** ${datos.condicion}

📌 **Requisitos para acreditar Computación:**
• Estudiantes de ${datos.condicion} en ${datos.sede} deben cursar un total de **4 componentes** (Ruta PROTECH XP) o **3 asignaturas regulares** (Plan Tradicional).
• Si ya aprobaste todos tus cursos requeridos, tu condición es **Acreditado** y no requieres llevar cursos adicionales.
• Para consultas sobre convalidaciones, contáctanos en nuestros canales de atención CINF.`;
}

// ---------------------------------------------------------------------------
// Conocimiento del agente sobre las formas de acreditar (Programa Gente con Experiencia)
// ---------------------------------------------------------------------------
// Fuente: uss-gex/documentos (anexo de la Resolución de Directorio N.° 0039-A-2026/PD-USS y láminas
// del CINF). Los precios, requisitos y pasos salen de los planes que edita el panel, para que el
// agente nunca diga un costo distinto al de las tarjetas.

const sinTildes = (texto: string) => texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function fichaPlan(plan: PlanOpcion): string {
  const lineas = [`**${plan.nombre}** — ${plan.resumen}`, `• **Costo:** ${plan.precio} (${plan.precioNota})`];
  plan.etapas.forEach((e) => lineas.push(`• **${e.periodo}:** ${e.costo} — ${e.detalle}`));
  if (plan.requisitos.length) {
    lineas.push('', '**Requisitos:**');
    plan.requisitos.forEach((r) => lineas.push(`• ${r}`));
  }
  lineas.push(`• **Plazo de solicitud:** ${PLAZO_SOLICITUD}`);
  const documentos = DOCUMENTOS_PLAN[plan.id] ?? [];
  if (documentos.length) {
    lineas.push('', '**Documentos que subes al inscribirte** (PDF, JPG o PNG, hasta 5 MB cada uno):');
    documentos.forEach((d) => lineas.push(`• ${d.etiqueta}${d.obligatorio ? '' : ' (opcional: si ya pagaste)'}`));
  }
  if (plan.proceso.length) {
    lineas.push('', '**Proceso:**');
    plan.proceso.forEach((p, i) => lineas.push(`${i + 1}. ${p}`));
  }
  lineas.push('', `**Obtienes:** ${plan.documento}`);
  return lineas.join('\n');
}

const COMO_INSCRIBIRSE = 'Para inscribirte entra a **Menú de opciones**, elige la opción y pulsa **Inscribirme**.';

/** Responde preguntas sobre las formas de acreditar; null si la consulta no trata de eso */
export function responderSobreAcreditacion(consulta: string, planes: PlanOpcion[]): string | null {
  const q = sinTildes(consulta);
  const plan = (id: PlanOpcion['id']) => planes.find((p) => p.id === id);
  const tiene = (...palabras: string[]) => palabras.some((p) => q.includes(p));

  // Temas transversales primero: "plazo de la validación" pregunta por el plazo, no por la validación
  if (tiene('plazo', 'fecha limite', 'hasta cuando', 'cuando vence')) {
    return `📅 **Plazo para presentar la solicitud**\nEn las 4 opciones puedes presentar tu solicitud **${PLAZO_SOLICITUD}**.\n\nEl curso de acreditación (Programa GEX) se lleva en los meses no curriculares: enero a marzo y agosto.\n\n${COMO_INSCRIBIRSE}`;
  }
  if (tiene('certificado', 'constancia', 'diploma')) {
    return `🎓 **Certificado y constancia**\n• **Curso de acreditación (Programa GEX):** certificado de 50 horas y constancia.\n• **Validación de competencias:** solo constancia.\n• **Convalidación:** solo constancia.\n\nEl certificado solo se emite cuando cursas y apruebas el curso.`;
  }
  if (tiene('cambio de fecha', 'reserva', 'traslado', 'desaprob', 'jal', 'inhabilit', 'politica', 'norma', 'regla', 'bachiller')) {
    return `📌 **Políticas del programa**\n${POLITICAS_GEX.map((p) => `• ${p}`).join('\n')}`;
  }

  if (tiene('convalid', 'titulo tecnico', 'titulo profesional tecnico')) {
    const p = plan('convalidacion');
    return p ? `${fichaPlan(p)}\n\n${COMO_INSCRIBIRSE}` : null;
  }
  if (tiene('validacion', 'validar', 'examen', 'sin cursar', 'experiencia laboral')) {
    const p = plan('validacion');
    return p ? `${fichaPlan(p)}\n\nEs solo un examen: no llevas clases.\n\n${COMO_INSCRIBIRSE}` : null;
  }
  if (tiene('protech', 'ruta', 'taller de certificacion', 'mos')) {
    const p = plan('protech');
    return p ? `${fichaPlan(p)}\n\n${COMO_INSCRIBIRSE}` : null;
  }
  if (tiene('gex', 'curso de acreditacion', 'cisco', 'netacad', 'etapa', 'cronograma', 'zoom', 'master')) {
    const p = plan('gex');
    return p ? `${fichaPlan(p)}\n\n${COMO_INSCRIBIRSE}` : null;
  }

  if (tiene('costo', 'precio', 'cuanto', 'pago', 'pagar', 'tasa', 'inversion', 'cuota')) {
    const lineas = planes.map((p) => `• **${p.nombre}:** ${p.precio} (${p.precioNota})`);
    return `💰 **Costos para acreditar Computación**\n${lineas.join('\n')}\n\n${NOTA_COSTOS}`;
  }
  if (tiene('requisito')) {
    const conRequisitos = planes.filter((p) => p.requisitos.length > 0);
    return conRequisitos
      .map((p) => `**${p.nombre}:**\n${p.requisitos.map((r) => `• ${r}`).join('\n')}`)
      .join('\n\n');
  }
  if (tiene('cuando pago', 'pago primero', 'pagar primero', 'antes de pagar', 'comprobante', 'voucher')) {
    return `💳 **¿Cuándo se paga?**\nPrimero te inscribes y subes tus documentos. El Centro de Informática revisa tu solicitud y se programa el pago de la tasa; recién ahí pagas.\n• **Validación:** pagas antes de rendir el examen.\n• **Convalidación:** pagas después de que se verifican tus documentos.\n\nSi ya pagaste, puedes subir tu comprobante al inscribirte (es opcional).`;
  }
  if (tiene('inscrib', 'registr', 'matricul', 'adjunt', 'archivo', 'documento', 'subir')) {
    return `📝 **Cómo te inscribes**\n1. Entra a **Menú de opciones**.\n2. Elige tu forma de acreditar y pulsa **Inscribirme**.\n3. Deja tu celular; en validación y convalidación sube además cada documento requerido (PDF, JPG o PNG, hasta 5 MB cada uno).\n\nEl Centro de Informática recibe tu solicitud, programa el pago y te contacta por WhatsApp o correo. Plazo: ${PLAZO_SOLICITUD}.`;
  }
  if (tiene('opcion', 'forma', 'acredit', 'como hago', 'que puedo')) {
    const lineas = planes.map((p, i) => `${i + 1}. **${p.nombre}** (${p.precio}) — ${p.resumen}`);
    return `🧭 **Formas de acreditar Computación en Gente con Experiencia**\n${lineas.join('\n')}\n\nPregúntame por cualquiera de ellas o por costos, requisitos, certificado o plazo.`;
  }
  return null;
}

export default function CinfAgentChat({ estudiante, estudiantes = [], ocultarDock, planes = PLANES_COMPUTACION }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [dockDismissed, setDockDismissed] = useState<boolean>(false);
  const [bottomInputText, setBottomInputText] = useState<string>('');
  const [chatInputText, setChatInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // Paso de recopilación de los 3 datos requeridos (1: correo, 2: sede, 3: condicion, 'ready': listo)
  const [onboardingPaso, setOnboardingPaso] = useState<'correo' | 'sede' | 'condicion' | 'listo'>(
    estudiante ? 'listo' : 'correo'
  );
  const [datosForm, setDatosForm] = useState<DatosEstudiante>({
    email: estudiante?.correoInstitucional || '',
    sede: estudiante?.campus || 'Chiclayo',
    condicion: estudiante?.modalidad || 'Gente con Experiencia (GEX)',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const abrirChat = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  // Al seleccionar un estudiante, generar automáticamente el resumen y poner el badge en 1
  useEffect(() => {
    if (estudiante) {
      const datos: DatosEstudiante = {
        email: estudiante.correoInstitucional,
        sede: estudiante.campus || 'Chiclayo',
        condicion: estudiante.modalidad || 'Gente con Experiencia (GEX)',
      };
      setDatosForm(datos);
      setOnboardingPaso('listo');

      const resumen = generarResumen(estudiante, datos);
      setMessages([
        {
          id: `auto-summary-${estudiante.codUniv}`,
          sender: 'agent',
          text: resumen,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setUnreadCount(1);
    }
  }, [estudiante?.codUniv]);

  // Auto-scroll
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => chatInputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const horaActual = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Ejecuta la respuesta del bot tras completar los 3 datos o hacer una pregunta
  const responderConResumen = (est: EstudianteGEX | null, datos: DatosEstudiante) => {
    setIsTyping(true);
    setTimeout(() => {
      const resumen = generarResumen(est, datos);
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-summary-${Date.now()}`,
          sender: 'agent',
          text: resumen,
          time: horaActual(),
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  // Paso 1: Ingreso de correo / código
  const handleIngresarCorreo = (correoIngresado: string) => {
    const clean = correoIngresado.trim();
    if (!clean) return;

    let emailNormalizado = clean;
    if (!emailNormalizado.includes('@') && !/^\d+$/.test(emailNormalizado)) {
      emailNormalizado = `${emailNormalizado}@uss.edu.pe`;
    }

    // Buscar si coincide con algún estudiante en la base de datos
    const encontrado = estudiantes.find(
      (e) =>
        e.correoInstitucional.toLowerCase() === emailNormalizado.toLowerCase() ||
        e.codUniv === clean
    );

    const nuevosDatos: DatosEstudiante = {
      email: encontrado ? encontrado.correoInstitucional : emailNormalizado,
      sede: encontrado ? encontrado.campus || 'Chiclayo' : datosForm.sede,
      condicion: encontrado ? encontrado.modalidad || 'Gente con Experiencia' : datosForm.condicion,
    };

    setDatosForm(nuevosDatos);

    setMessages((prev) => [
      ...prev,
      {
        id: `user-correo-${Date.now()}`,
        sender: 'user',
        text: emailNormalizado,
        time: horaActual(),
      },
    ]);

    // Si ya encontramos al estudiante directamente por su correo/código, completamos los 3 datos de una vez
    if (encontrado) {
      setOnboardingPaso('listo');
      responderConResumen(encontrado, nuevosDatos);
      return;
    }

    // Si no, avanzamos al Dato 2: Sede
    setOnboardingPaso('sede');
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-ask-sede-${Date.now()}`,
          sender: 'agent',
          text: `Correo registrado: **${emailNormalizado}** ✅\n\n**Dato 2 de 3:** Por favor selecciona tu **Sede de estudios**:`,
          time: horaActual(),
        },
      ]);
      setIsTyping(false);
    }, 400);
  };

  // Paso 2: Selección de Sede
  const handleSeleccionarSede = (sede: 'Chiclayo' | 'Filial') => {
    const sedeLabel = sede === 'Chiclayo' ? '📍 Sede Chiclayo' : '🏢 Filiales USS';
    const nuevosDatos = { ...datosForm, sede: sede === 'Chiclayo' ? 'Chiclayo' : 'Filiales' };
    setDatosForm(nuevosDatos);

    setMessages((prev) => [
      ...prev,
      {
        id: `user-sede-${Date.now()}`,
        sender: 'user',
        text: sedeLabel,
        time: horaActual(),
      },
    ]);

    setOnboardingPaso('condicion');
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-ask-condicion-${Date.now()}`,
          sender: 'agent',
          text: `Sede seleccionada: **${sedeLabel}** ✅\n\n**Dato 3 de 3:** Indícanos tu **condición académica**:`,
          time: horaActual(),
        },
      ]);
      setIsTyping(false);
    }, 400);
  };

  // Paso 3: Selección de Condición (Completa los 3 datos)
  const handleSeleccionarCondicion = (condicionLabel: string) => {
    const nuevosDatos = { ...datosForm, condicion: condicionLabel };
    setDatosForm(nuevosDatos);

    setMessages((prev) => [
      ...prev,
      {
        id: `user-condicion-${Date.now()}`,
        sender: 'user',
        text: condicionLabel,
        time: horaActual(),
      },
    ]);

    setOnboardingPaso('listo');

    // Buscar si con el correo ingresado existía el estudiante
    const encontrado = estudiantes.find(
      (e) =>
        e.correoInstitucional.toLowerCase() === datosForm.email.toLowerCase() ||
        e.codUniv === datosForm.email
    );

    responderConResumen(encontrado || estudiante || null, nuevosDatos);
  };

  // Envío libre de mensajes desde input (dock o chatbox)
  const handleSendMessage = (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    abrirChat();

    // Si aún está en el paso de correo, este input responde al dato 1
    if (onboardingPaso === 'correo') {
      handleIngresarCorreo(trimmed);
      setBottomInputText('');
      setChatInputText('');
      return;
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      time: horaActual(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInputText('');
    setBottomInputText('');
    setIsTyping(true);

    const query = trimmed.toLowerCase();

    setTimeout(() => {
      let respuesta = '';

      if (query.includes('telefono') || query.includes('contacto') || query.includes('celular') || query.includes('atencion') || query.includes('atención') || query.includes('horario')) {
        respuesta = `📞 **Canales Oficiales de Atención CINF:**
• **WhatsApp / Teléfono:** +51 ${CONTACTO_CINF.whatsapp}
• **Correo:** ${CONTACTO_CINF.correo}
• **Horario:** ${CONTACTO_CINF.horario}
• **Ubicación:** ${CONTACTO_CINF.direccion}`;
      } else if (responderSobreAcreditacion(trimmed, planes)) {
        respuesta = responderSobreAcreditacion(trimmed, planes)!;
      } else {
        const estActual =
          estudiante ||
          estudiantes.find(
            (e) =>
              e.correoInstitucional.toLowerCase() === datosForm.email.toLowerCase() ||
              e.codUniv === datosForm.email
          );
        respuesta = generarResumen(estActual || null, datosForm);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          text: respuesta,
          time: horaActual(),
        },
      ]);
      setIsTyping(false);
    }, 500);
  };

  const handleSubmitBottom = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!bottomInputText.trim()) {
      abrirChat();
      return;
    }
    handleSendMessage(bottomInputText);
  };

  const handleSubmitChat = (e?: React.FormEvent) => {
    e?.preventDefault();
    handleSendMessage(chatInputText);
  };

  const handleKeyDownBottom = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmitBottom();
  };

  const handleKeyDownChat = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmitChat();
  };

  // Resetear sesión
  const handleReset = () => {
    setMessages([]);
    setOnboardingPaso(estudiante ? 'listo' : 'correo');
    setDatosForm({
      email: estudiante?.correoInstitucional || '',
      sede: estudiante?.campus || 'Chiclayo',
      condicion: estudiante?.modalidad || 'Gente con Experiencia (GEX)',
    });
  };

  return (
    <>
      {/* ===================================================================== */}
      {/* 1. INPUT DOCK FLOTANTE INFERIOR                                       */}
      {/* ===================================================================== */}
      {!dockDismissed && !isOpen && !ocultarDock && (
        <aside
          aria-label="Asistente Virtual"
          className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-[520px] transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-slate-900/10 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2">
            <span className="text-[#6366f1] shrink-0 flex items-center">
              <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#6366f1]" />
            </span>

            <input
              type="text"
              value={bottomInputText}
              onChange={(e) => setBottomInputText(e.target.value)}
              onKeyDown={handleKeyDownBottom}
              placeholder={
                estudiante
                  ? `Consultar cursos de ${estudiante.nombres.split(' ')[0]}...`
                  : 'Ingresa tu correo institucional o consulta...'
              }
              className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 placeholder:truncate min-w-0"
            />

            <button
              type="button"
              onClick={() => handleSubmitBottom()}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#6366f1] hover:bg-[#4f46e5] active:scale-95 text-white flex items-center justify-center shrink-0 shadow-sm transition cursor-pointer"
              title="Preguntar al agente"
            >
              <ArrowUp className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setDockDismissed(true)}
              className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-500 flex items-center justify-center shrink-0 transition cursor-pointer"
              title="Cerrar sugerencia"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* ===================================================================== */}
      {/* 2. BOTÓN LANZADOR FLOTANTE DERECHO CON CONTADOR                      */}
      {/* ===================================================================== */}
      {!isOpen && (
        <button
          type="button"
          onClick={abrirChat}
          className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-40 bg-[#073299] hover:bg-[#041d5f] text-white px-3.5 py-2.5 rounded-full shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-white"
          title="Abrir Agente CINF"
        >
          <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </span>
          <span className="text-xs font-bold tracking-wide">Agente CINF</span>

          {/* Contador de 1 mensaje al lado derecho */}
          {unreadCount > 0 && (
            <span className="min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-md animate-bounce ring-1 ring-white">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* ===================================================================== */}
      {/* 3. VENTANA FLOTANTE DEL CHAT AGENTE (Lado derecho)                   */}
      {/* ===================================================================== */}
      {isOpen && (
        <aside
          aria-label="Ventana de Chat Agente"
          className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-50 w-[380px] sm:w-[410px] max-w-[calc(100vw-1.5rem)] h-[620px] max-h-[88vh] rounded-[28px] bg-white shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header del Agente */}
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-2.5">
              <HostingerStyleAgentLogo className="w-7 h-7" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 leading-tight flex items-center gap-1.5">
                  CINF Agente
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Asistente de Acreditación USS</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
                title="Reiniciar chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
                title="Minimizar"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cuerpo del Agente */}
          <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0 bg-gradient-to-b from-white via-slate-50/40 to-slate-50">
            {messages.length === 0 ? (
              /* ESTADO INICIAL */
              <div className="flex flex-col items-center text-center space-y-4 pt-1 pb-2">
                <div className="relative my-1">
                  <HostingerStyleAgentLogo className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md" />
                </div>

                <h4 className="text-lg font-bold text-slate-900 tracking-tight">
                  ¿En qué puedo ayudarte hoy?
                </h4>

                {/* Tarjeta destacada púrpura/azul (Card principal) */}
                <div
                  onClick={() => {
                    if (estudiante) {
                      const estActual = estudiante;
                      const resumen = generarResumen(estActual, datosForm);
                      setMessages([
                        {
                          id: `user-ask-${Date.now()}`,
                          sender: 'user',
                          text: `Consultar estado y cursos de ${estActual.nombres.split(' ')[0]}`,
                          time: horaActual(),
                        },
                        {
                          id: `agent-summary-${Date.now() + 1}`,
                          sender: 'agent',
                          text: resumen,
                          time: horaActual(),
                        },
                      ]);
                    } else if (onboardingPaso !== 'listo') {
                      setMessages([
                        {
                          id: `agent-ask-email-${Date.now()}`,
                          sender: 'agent',
                          text: `👋 ¡Hola! Para brindarte tu **resumen de cursos y acreditación**, necesitamos confirmar tus 3 datos:\n\n**Dato 1 de 3:** Ingresa tu **correo institucional** (@uss.edu.pe) o código universitario:`,
                          time: horaActual(),
                        },
                      ]);
                    } else {
                      responderConResumen(null, datosForm);
                    }
                  }}
                  className="w-full text-left bg-gradient-to-br from-[#6366f1] via-[#5b5bf5] to-[#4338ca] text-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer relative overflow-hidden group"
                >
                  <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="text-sm font-extrabold text-white leading-tight">
                        Ayúdame a consultar mi acreditación
                      </h5>
                      <p className="text-xs text-blue-100/90 mt-1 leading-snug">
                        {estudiante
                          ? `Revisar cursos de ${estudiante.nombres.split(' ')[0]} (${estudiante.escuela})`
                          : 'Ingresa tus 3 datos y te daré tu resumen de asignaturas.'}
                      </p>
                    </div>
                    <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-0.5">
                      <ChevronRight className="w-4 h-4 text-white" />
                    </span>
                  </div>

                  <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/15 text-[10px] font-semibold tracking-wide">
                    <span className="text-amber-300 font-bold">%</span>
                    Orientación CINF • 100% Gratuito
                  </div>
                </div>

                {/* Separador "O EXPLORAR" */}
                <div className="w-full text-left pt-1">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    O explorar
                  </span>
                </div>

                {/* SOLO DEJA LO DEL TELÉFONO (Eliminados los demás botones) */}
                <div className="w-full">
                  <button
                    type="button"
                    onClick={() =>
                      handleSendMessage('¿Cuáles son los números de teléfono y canales de atención del CINF?')
                    }
                    className="w-full text-left bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-xs transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-uss-blue truncate">
                        Canales de atención del CINF
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ) : (
              /* HISTORIAL DE MENSAJES Y PASOS INTERACTIVOS */
              <div className="space-y-3 pt-1">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-[#073299] text-white rounded-tr-xs'
                          : 'bg-white border border-slate-200/90 text-slate-800 shadow-xs rounded-tl-xs'
                      }`}
                    >
                      <FormattedMessageText text={m.text} isUser={m.sender === 'user'} />
                      <span
                        className={`block text-[9px] mt-1 text-right ${
                          m.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                        }`}
                      >
                        {m.time}
                      </span>
                    </div>
                  </div>
                ))}

                {/* INTERACTIVO: Paso 2 (Sede) si está activo */}
                {onboardingPaso === 'sede' && !isTyping && (
                  <div className="p-3 bg-white border border-blue-200/80 rounded-2xl shadow-xs space-y-2 animate-in fade-in">
                    <p className="text-[11px] font-bold text-slate-700">Selecciona tu sede:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSeleccionarSede('Chiclayo')}
                        className="py-2 px-2.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-uss-blue rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Sede Chiclayo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSeleccionarSede('Filial')}
                        className="py-2 px-2.5 bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>🏢 Filiales USS</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* INTERACTIVO: Paso 3 (Condición) si está activo */}
                {onboardingPaso === 'condicion' && !isTyping && (
                  <div className="p-3 bg-white border border-blue-200/80 rounded-2xl shadow-xs space-y-2 animate-in fade-in">
                    <p className="text-[11px] font-bold text-slate-700">Selecciona tu condición académica:</p>
                    <div className="grid grid-cols-1 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSeleccionarCondicion('🎓 Estudiante Regular Pregrado')}
                        className="py-1.5 px-3 bg-blue-50 hover:bg-blue-600 hover:text-white text-uss-blue rounded-xl text-xs font-bold transition text-left cursor-pointer flex items-center gap-2"
                      >
                        <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                        <span>Estudiante Regular</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSeleccionarCondicion('💼 Gente con Experiencia (GEX)')}
                        className="py-1.5 px-3 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-800 rounded-xl text-xs font-bold transition text-left cursor-pointer flex items-center gap-2"
                      >
                        <span>💼 Gente con Experiencia (GEX)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSeleccionarCondicion('📜 Egresado')}
                        className="py-1.5 px-3 bg-slate-50 hover:bg-slate-700 hover:text-white text-slate-700 rounded-xl text-xs font-bold transition text-left cursor-pointer flex items-center gap-2"
                      >
                        <span>📜 Egresado</span>
                      </button>
                    </div>
                  </div>
                )}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 px-3 py-2 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Footer del Chat Agente */}
          <div className="p-3 bg-white border-t border-slate-100 shrink-0">
            <form onSubmit={handleSubmitChat} className="relative flex items-center">
              <input
                ref={chatInputRef}
                type="text"
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                onKeyDown={handleKeyDownChat}
                placeholder={
                  onboardingPaso === 'correo' && messages.length > 0
                    ? 'Escribe tu correo o código...'
                    : 'Pregunta lo que quieras sobre el CINF...'
                }
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/10 rounded-full pl-4 pr-11 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition"
              />
              <button
                type="submit"
                disabled={!chatInputText.trim()}
                className="absolute right-1.5 w-7 h-7 rounded-full bg-[#6366f1] disabled:bg-slate-200 disabled:cursor-not-allowed hover:bg-[#4f46e5] text-white flex items-center justify-center transition cursor-pointer"
                title="Enviar"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </form>
            <p className="text-[9.5px] text-slate-400 text-center mt-1.5 tracking-tight">
              La inteligencia artificial puede cometer errores.
            </p>
          </div>
        </aside>
      )}
    </>
  );
}
