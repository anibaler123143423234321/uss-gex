import { GraduationCap, User, School, Hash } from 'lucide-react';
import type { EstudianteGEX } from '../types/estudiante';

interface Props {
  estudiante: EstudianteGEX;
}

/** Tarjeta con los datos del estudiante seleccionado. */
export default function ResultCard({ estudiante }: Props) {
  const e = estudiante;

  // Intentar separar apellidos y nombres del campo "nombres"
  // El formato parece ser "APELLIDO1 APELLIDO2 NOMBRE1 NOMBRE2..."
  // Asumimos que las primeras 2 palabras son apellidos
  const partes = e.nombres.split(/\s+/);
  const apellidos = partes.length > 2 ? partes.slice(0, 2).join(' ') : partes[0] || '';
  const nombres = partes.length > 2 ? partes.slice(2).join(' ') : partes.slice(1).join(' ');

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg overflow-hidden">
        {/* Header con color USS */}
        <div className="bg-gradient-to-r from-[#073299] to-[#0a47d1] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Estudiante encontrado</h3>
              <p className="text-blue-200 text-xs">Programa Gente con Experiencia</p>
            </div>
          </div>
        </div>

        {/* Datos */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Apellidos */}
            <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <User className="w-5 h-5 text-[#073299] dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Apellidos
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {apellidos || '—'}
                </p>
              </div>
            </div>

            {/* Nombres */}
            <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <User className="w-5 h-5 text-[#073299] dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Nombres
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {nombres || '—'}
                </p>
              </div>
            </div>

            {/* Escuela */}
            <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <School className="w-5 h-5 text-[#073299] dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Escuela
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {e.escuela || '—'}
                </p>
              </div>
            </div>

            {/* Código Universitario */}
            <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <Hash className="w-5 h-5 text-[#073299] dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Código Universitario
                </p>
                <p className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {e.codUniv || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

