import React from 'react';
import { ArrowLeft, ArrowUpRight, Home } from 'lucide-react';

export interface HeaderProps {
  variant: 'hero' | 'compact';
  logoUrl?: string;
  portalUrl?: string;
  titulo?: string;
  subtitulo?: string;
  onBack?: () => void;
  syncButton?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  variant,
  logoUrl,
  portalUrl = '/',
  titulo = 'Acreditación en Computación',
  subtitulo = 'GEX',
  onBack,
  syncButton,
}) => {
  const resolvedLogo = logoUrl || `${import.meta.env.BASE_URL}logo-uss.png`;

  if (variant === 'hero') {
    return (
      <header className="nav absolute inset-x-0 top-0 z-20 bg-uss-blue text-white">
        <div className="wrap flex items-center justify-between gap-3 h-[76px]">
          <a
            href={portalUrl}
            title="Ir al Portal CINF"
            className="inline-flex items-center min-h-11 shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg"
          >
            <img
              src={resolvedLogo}
              alt="Universidad Señor de Sipán"
              width={851}
              height={293}
              className="h-9 sm:h-11 w-auto brightness-0 invert group-hover:opacity-90 transition-opacity"
            />
          </a>
          <div className="flex items-center gap-2">
            {syncButton}
            <a
              href={portalUrl}
              className="gex-btn shrink-0 h-11 px-3 sm:px-4 rounded-xl inline-flex items-center gap-1.5 text-sm font-semibold bg-white text-uss-blue hover:bg-blue-50 transition shadow-sm"
              title="Ir al Portal Principal del Centro de Informática USS"
            >
              <span className="hidden sm:inline">Ir al Portal CINF</span>
              <span className="sm:hidden">Portal</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </header>
    );
  }

  // Variante 'compact': barra sticky de 64-76px para consulta de alumno
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 py-2 lg:py-1.5 px-3 sm:px-6 w-full shrink-0">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto flex items-center gap-2.5 min-h-[52px]">
        {onBack && (
          <button
            onClick={onBack}
            type="button"
            className="lg:hidden w-11 h-11 -ml-1 rounded-xl flex items-center justify-center text-slate-600 hover:text-uss-blue hover:bg-slate-100 transition cursor-pointer"
            aria-label="Salir de mi ficha"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <a
          href={portalUrl}
          title="Ir al inicio"
          className="flex items-center gap-2.5 min-w-0 group hover:opacity-90 transition"
        >
          <img
            src={resolvedLogo}
            alt="Logo USS"
            className="h-7 sm:h-8 w-auto object-contain"
          />
          <div className="border-l border-slate-200 pl-2.5 min-w-0">
            <h1 className="text-sm font-bold text-uss-blue leading-tight truncate">
              {titulo} {subtitulo}
            </h1>
            <p className="text-[11px] lg:text-[10px] text-slate-500 truncate">Portal oficial de verificación</p>
          </div>
        </a>
        <div className="ml-auto flex items-center gap-2">
          <a
            href={portalUrl}
            className="gex-btn shrink-0 h-11 lg:h-9 min-w-11 justify-center px-2.5 sm:px-3 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-600 hover:text-uss-blue ring-1 ring-slate-200"
            title="Ir al inicio"
          >
            <Home className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
            <span className="hidden sm:inline">Inicio</span>
          </a>
          {syncButton}
        </div>
      </div>
    </header>
  );
};
