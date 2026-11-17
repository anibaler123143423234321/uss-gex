import React from 'react';
import { ExternalLink, MessageCircle } from 'lucide-react';

export interface FooterProps {
  variant?: 'compact' | 'legal';
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ variant = 'compact', className = '' }) => {
  if (variant === 'legal') {
    return (
      <footer className={`py-4 px-4 text-center border-t border-slate-200/80 bg-white shrink-0 ${className}`}>
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p className="m-0">
            &copy; 2026 Centro de Informática (CINF &middot; PROTECH XP) &mdash; Universidad Señor de Sipán.
          </p>
          <div className="flex items-center gap-4 text-xs font-medium">
            <a
              href="https://campus.uss.edu.pe/CampusNet5/Login.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-uss-blue hover:underline inline-flex items-center gap-1"
            >
              Campus Virtual
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <span className="text-slate-300">&bull;</span>
            <a
              href="https://www.aulauss.edu.pe/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-uss-blue hover:underline inline-flex items-center gap-1"
            >
              Aula Virtual
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <span className="text-slate-300">&bull;</span>
            <a
              href="https://wa.me/51986724506"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3" />
              WhatsApp CINF
            </a>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={`py-2.5 lg:py-2 px-4 text-center border-t border-slate-200/80 bg-white shrink-0 ${className}`}>
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] lg:text-[10px] text-slate-500 font-medium">
        <span>Universidad Señor de Sipán &bull; Centro de Informática (CINF) &bull; Portal GEX</span>
        <span className="text-slate-300 hidden sm:inline">&bull;</span>
        <div className="inline-flex items-center gap-3">
          <a
            href="https://campus.uss.edu.pe/CampusNet5/Login.aspx"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-uss-blue hover:underline inline-flex items-center gap-0.5"
          >
            Campus Virtual
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>
          <span className="text-slate-300">&bull;</span>
          <a
            href="https://www.aulauss.edu.pe/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-uss-blue hover:underline inline-flex items-center gap-0.5"
          >
            Aula Virtual
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>
          <span className="text-slate-300">&bull;</span>
          <a
            href="https://wa.me/51986724506"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1 font-semibold"
          >
            <MessageCircle className="w-2.5 h-2.5" />
            WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
};
