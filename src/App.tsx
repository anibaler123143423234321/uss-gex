import { useState, useEffect, useCallback } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import SearchBar from './components/SearchBar';
import StudentDetailView from './components/StudentDetailView';
import { fetchExcelFromDrive } from './services/driveSheetService';
import { sincronizarAutomaticoDriveASupabase, getCargaExcelVigente } from './services/cargasService';
import type { EstudianteGEX } from './types/estudiante';

export default function App() {
  const [estudiantes, setEstudiantes] = useState<EstudianteGEX[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [selected, setSelected] = useState<EstudianteGEX | null>(null);

  // Consulta directa a Google Drive y respaldo automático del archivo Excel en Supabase
  const cargarDesdeDrive = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    try {
      const { estudiantes: dataDrive, base64Xlsx } = await fetchExcelFromDrive();
      if (dataDrive && dataDrive.length > 0) {
        setEstudiantes(dataDrive);

        // FORMA 1: Guarda automáticamente el archivo Excel .xlsx en Supabase si cambió
        if (base64Xlsx) {
          sincronizarAutomaticoDriveASupabase(dataDrive.length, base64Xlsx);
        }
      } else {
        // Respaldo de Supabase si Google Drive no respondiera
        const { estudiantes: dataSupabase } = await getCargaExcelVigente();
        if (dataSupabase.length > 0) {
          setEstudiantes(dataSupabase);
        }
      }
    } catch (err) {
      console.error('[GEX] Error al consultar Google Drive:', err);
    } finally {
      if (!silencioso) setCargando(false);
    }
  }, []);

  // Carga inicial al abrir la página
  useEffect(() => {
    cargarDesdeDrive(false);
  }, [cargarDesdeDrive]);

  // Sincronización en tiempo real (con debouncing para evitar múltiples llamadas al cambiar de ventana)
  useEffect(() => {
    let focusTimer: number;
    const handleFocus = () => {
      window.clearTimeout(focusTimer);
      focusTimer = window.setTimeout(() => {
        cargarDesdeDrive(true);
      }, 800);
    };

    window.addEventListener('focus', handleFocus);
    const interval = window.setInterval(() => {
      cargarDesdeDrive(true);
    }, 60000);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('focus', handleFocus);
      window.clearInterval(interval);
    };
  }, [cargarDesdeDrive]);

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col selection:bg-[#073299] selection:text-white">
      {/* Botón flotante sutil para sincronizar manualmente */}
      <div className="fixed top-3.5 right-4 z-40">
        <button
          onClick={() => cargarDesdeDrive(false)}
          disabled={cargando}
          className="p-2 rounded-xl text-slate-500 hover:text-[#073299] bg-white hover:bg-slate-50 transition shadow-sm border border-slate-200 hover:border-slate-300 disabled:opacity-40 cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          title="Sincronizar con Google Sheets en tiempo real"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin text-[#073299]' : ''}`} />
          <span className="hidden sm:inline text-slate-600">Sincronizar</span>
        </button>
      </div>

      {/* VISTA 1: DETALLE DEL ESTUDIANTE SELECCIONADO */}
      {selected ? (
        <div className="flex-1 flex flex-col w-full">
          {/* Header institucional */}
          <header className="border-b border-slate-200 bg-white py-3 px-4 sm:px-6 lg:px-8 w-full shrink-0 shadow-2xs">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="Logo USS"
                  className="h-8 sm:h-9 w-auto object-contain"
                />
                <div className="border-l border-slate-200 pl-3">
                  <h1 className="text-sm font-bold text-[#073299] leading-tight">Gente con Experiencia</h1>
                  <p className="text-[11px] text-slate-500">Portal oficial de verificación</p>
                </div>
              </div>
            </div>
          </header>

          {/* Área principal con márgenes cómodos */}
          <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
            <StudentDetailView
              estudiante={selected}
              onBack={() => setSelected(null)}
            />
          </main>
        </div>
      ) : (
        /* VISTA 2: PANTALLA PRINCIPAL CON BUSCADOR */
        <div className="flex-1 flex flex-col w-full">
          {/* Header institucional */}
          <header className="pt-12 pb-6 px-4 text-center">
            {/* Logo Oficial USS */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <img
                src="/logo.png"
                alt="Logo Universidad Señor de Sipán"
                className="h-12 sm:h-14 w-auto object-contain drop-shadow-sm"
              />
            </div>

            {/* Título */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#073299] via-[#0b4ed6] to-[#1e6ff0] leading-tight pb-2">
              Gente con Experiencia
            </h1>

            <p className="mt-1 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
              Portal oficial de consulta y verificación de estudiantes GEX — Universidad Señor de Sipán
            </p>
          </header>

          {/* CUERPO CON BUSCADOR MAT-SELECT */}
          <main className="flex-1 px-3 sm:px-6 pb-16">
            <div className="w-full max-w-4xl mx-auto space-y-6">
              {/* BUSCADOR */}
              <SearchBar
                estudiantes={estudiantes}
                loading={cargando}
                onSelect={(est) => setSelected(est)}
              />

              {/* Mensaje amigable cuando no hay selección */}
              <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <Sparkles className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">
                  Escribe en el buscador para consultar el Excel en tiempo real
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Busca por código universitario (ej. 2251804844), apellidos, nombres o correo institucional
                </p>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Footer elegante */}
      <footer className="py-4 text-center border-t border-slate-200 bg-white shrink-0">
        <span className="text-xs text-slate-500">
          Universidad Señor de Sipán &bull; Centro de Informática (CINF) &bull; Portal GEX
        </span>
      </footer>
    </div>
  );
}
