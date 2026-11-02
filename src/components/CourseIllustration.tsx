import type { CSSProperties, ReactNode } from 'react';

export type Ilustracion = 'monitor' | 'grafico' | 'nube' | 'libro' | 'diana' | 'medalla';

interface Props {
  tipo: Ilustracion;
  className?: string;
  style?: CSSProperties;
}

/**
 * Una ilustración propia por curso, dibujada una sola vez en la esquina de la tarjeta.
 * Reemplaza los mosaicos que repetían el mismo dibujo por todo el fondo.
 * El color sale de `currentColor`, así cada tarjeta la tiñe con su acento.
 */
export default function CourseIllustration({ tipo, className, style }: Props) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {ESCENAS[tipo]}
    </svg>
  );
}

const ESCENAS: Record<Ilustracion, ReactNode> = {
  // Computación I: pantalla con documento y cursor
  monitor: (
    <>
      <rect x="12" y="16" width="96" height="66" rx="9" fill="currentColor" fillOpacity={0.08} />
      <path d="M12 30h96" />
      <circle cx="21" cy="23" r="1.6" fill="currentColor" />
      <circle cx="28" cy="23" r="1.6" fill="currentColor" />
      <circle cx="35" cy="23" r="1.6" fill="currentColor" />
      <path d="M24 44h36M24 54h48M24 64h28" />
      <path d="M78 46l16 13-8 1.5 4.5 9-4 2-4.5-9-6 5.5z" fill="currentColor" fillOpacity={0.25} />
      <path d="M50 82l-4 16h28l-4-16M38 98h44" />
    </>
  ),
  // Computación II: hoja de cálculo con barras y tendencia
  grafico: (
    <>
      <rect x="10" y="12" width="100" height="96" rx="9" fill="currentColor" fillOpacity={0.06} />
      <path d="M10 30h100M36 12v96" strokeOpacity={0.6} />
      <path d="M17 44h12M17 58h12M17 72h12M17 86h12" strokeOpacity={0.6} />
      <rect x="46" y="70" width="12" height="28" rx="3" fill="currentColor" fillOpacity={0.22} />
      <rect x="66" y="56" width="12" height="42" rx="3" fill="currentColor" fillOpacity={0.22} />
      <rect x="86" y="40" width="12" height="58" rx="3" fill="currentColor" fillOpacity={0.22} />
      <path d="M46 60l20-14 16 6 18-16" />
      <circle cx="100" cy="36" r="3" fill="currentColor" />
    </>
  ),
  // Computación III: nube conectada a varios dispositivos
  nube: (
    <>
      <path
        d="M34 58h52a16 16 0 0 0 2-31.9A24 24 0 0 0 42 24a17 17 0 0 0-8 34z"
        fill="currentColor"
        fillOpacity={0.1}
      />
      <path d="M60 58v14M60 72H28v10M60 72h32v10M60 72v10" />
      <circle cx="60" cy="72" r="3" fill="currentColor" />
      <rect x="14" y="84" width="28" height="18" rx="3" fill="currentColor" fillOpacity={0.1} />
      <path d="M10 106h36" />
      <rect x="52" y="84" width="16" height="22" rx="3" fill="currentColor" fillOpacity={0.1} />
      <rect x="80" y="84" width="24" height="20" rx="3" fill="currentColor" fillOpacity={0.1} />
    </>
  ),
  // Módulo Genérico: libro abierto con destello
  libro: (
    <>
      <path d="M60 38c-12-8-28-8-42-2v58c14-6 30-6 42 2z" fill="currentColor" fillOpacity={0.08} />
      <path d="M60 38c12-8 28-8 42-2v58c-14-6-30-6-42 2z" fill="currentColor" fillOpacity={0.08} />
      <path d="M60 38v58" />
      <path d="M28 52c8-3 16-3 22 0M28 64c8-3 16-3 22 0M28 76c8-3 16-3 22 0" strokeOpacity={0.7} />
      <path d="M70 52c6-3 14-3 22 0M70 64c6-3 14-3 22 0" strokeOpacity={0.7} />
      <path d="M96 8l3 7.5 7.5 3-7.5 3-3 7.5-3-7.5-7.5-3 7.5-3z" fill="currentColor" fillOpacity={0.3} />
    </>
  ),
  // Módulo Específico: diana con flecha (la carrera como objetivo)
  diana: (
    <>
      <circle cx="54" cy="66" r="40" fill="currentColor" fillOpacity={0.06} />
      <circle cx="54" cy="66" r="27" />
      <circle cx="54" cy="66" r="14" fill="currentColor" fillOpacity={0.14} />
      <circle cx="54" cy="66" r="4" fill="currentColor" />
      <path d="M58 62l40-40" />
      <path d="M90 16l8 6 6 8M84 22l8 6 6 8" />
    </>
  ),
  // Taller de Certificación: certificado con medalla y cintas
  medalla: (
    <>
      <rect x="10" y="18" width="74" height="56" rx="7" fill="currentColor" fillOpacity={0.07} />
      <path d="M22 34h44M22 46h50M22 58h30" strokeOpacity={0.7} />
      <path d="M76 84l-7 26 10-6 7 9 3-24M96 84l7 26-10-6-7 9" fill="currentColor" fillOpacity={0.12} />
      <circle cx="86" cy="72" r="19" fill="currentColor" fillOpacity={0.14} />
      <circle cx="86" cy="72" r="11" />
      <path d="M81 72l4 4 7-8" />
    </>
  ),
};

/** Ilustración grande y única del encabezado de la portada (laptop con escudo y birrete). */
export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 190"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="20" y="70" width="120" height="80" rx="9" fill="currentColor" fillOpacity={0.1} />
      <path d="M6 156h148l-10 14H16z" fill="currentColor" fillOpacity={0.1} />
      <path d="M80 88l24 9v17c0 15-11 24-24 28-13-4-24-13-24-28V97z" fill="currentColor" fillOpacity={0.12} />
      <path d="M69 115l8 8 15-16" />
      <path d="M156 18l44 17-44 17-44-17z" fill="currentColor" fillOpacity={0.14} />
      <path d="M130 42v18c0 8 12 14 26 14s26-6 26-14V42" />
      <path d="M200 35v24" />
      <circle cx="200" cy="62" r="3.5" fill="currentColor" />
      <circle cx="186" cy="104" r="4" />
      <circle cx="170" cy="132" r="2.5" fill="currentColor" />
    </svg>
  );
}
