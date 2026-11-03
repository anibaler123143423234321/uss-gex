import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ArrowLeft, Hash, User, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import SearchBar from './components/SearchBar';
import StudentDetailView from './components/StudentDetailView';
import MenuOpciones from './components/MenuOpciones';
import { HeroIllustration } from './components/CourseIllustration';
import { fetchExcelFromDrive } from './services/driveSheetService';
import { sincronizarAutomaticoDriveASupabase, getCargaExcelVigente } from './services/cargasService';
import { gexConfigService, DEFAULT_GEX_CONFIG, type GexPortalConfig } from './services/gexConfigService';
import type { EstudianteGEX } from './types/estudiante';
import type { PlanOpcionId } from './data/planesComputacion';

// Consulta abierta en la pestaña: sobrevive a F5 y se borra al cerrar la pestaña
const CLAVE_SESION = 'gex.sesion';

interface SesionGex {
  codUniv?: string;
  opciones?: boolean;
  plan?: PlanOpcionId | null;
}

function leerSesion(): SesionGex {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE_SESION) || '{}') as SesionGex;
  } catch {
    return {};
  }
}

function guardarSesion(sesion: SesionGex): void {
  try {
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  } catch {
    // Sin sessionStorage (modo privado estricto) la consulta solo no sobrevive al F5
  }
}

// Formas de búsqueda que se explican en la portada, cada una con su propio color
const FORMAS_DE_BUSQUEDA = [
  { Icon: Hash, titulo: 'Código universitario', ejemplo: 'Ej. 2251804844', tono: 'bg-blue-50 text-uss-blue ring-blue-100' },
  { Icon: User, titulo: 'Apellidos o nombres', ejemplo: 'Ej. García Pérez', tono: 'bg-amber-50 text-amber-700 ring-amber-100' },
  { Icon: Mail, titulo: 'Correo institucional', ejemplo: 'Ej. usuario@uss.edu.pe', tono: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
];

export default function App() {
  const [estudiantes, setEstudiantes] = useState<EstudianteGEX[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [selected, setSelected] = useState<EstudianteGEX | null>(null);
  const [config, setConfig] = useState<GexPortalConfig>(DEFAULT_GEX_CONFIG);
  const [sesionInicial] = useState<SesionGex>(leerSesion);
  const [mostrarComoAcreditar, setMostrarComoAcreditar] = useState<boolean>(!!sesionInicial.opciones);
  const [planElegido, setPlanElegido] = useState<PlanOpcionId | null>(sesionInicial.plan ?? null);
  // El estudiante se recupera recién cuando llega el Excel; hasta entonces no se muestra la portada
  const [restaurando, setRestaurando] = useState<boolean>(!!sesionInicial.codUniv);

  useEffect(() => {
    if (!restaurando || cargando) return;
    const guardado = estudiantes.find((est) => est.codUniv === sesionInicial.codUniv);
    if (guardado) setSelected(guardado);
    setRestaurando(false);
  }, [restaurando, cargando, estudiantes, sesionInicial.codUniv]);

  useEffect(() => {
    if (restaurando) return;
    guardarSesion({ codUniv: selected?.codUniv, opciones: mostrarComoAcreditar, plan: planElegido });
  }, [restaurando, selected, mostrarComoAcreditar, planElegido]);

  const cerrarOpciones = () => {
    setMostrarComoAcreditar(false);
    setPlanElegido(null);
  };

  // Sincronizar vista con query param si viniese de URL directa
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('vista') === 'como-acreditar') {
      setMostrarComoAcreditar(true);
    }
  }, []);

  // Configuración del portal: la edita el panel en tbl_gex_config y llega por Realtime
  useEffect(() => {
    let montado = true;
    const cargarConfig = async () => {
      const c = await gexConfigService.getConfig();
      if (montado) setConfig(c);
    };
    cargarConfig();

    const dejarDeEscuchar = gexConfigService.suscribirse((c) => {
      if (montado) setConfig(c);
    });

    // Respaldo por si Realtime no está activo: al volver a la pestaña y cada 30 s
    window.addEventListener('focus', cargarConfig);
    const interval = window.setInterval(cargarConfig, 30000);

    return () => {
      montado = false;
      dejarDeEscuchar();
      window.removeEventListener('focus', cargarConfig);
      window.clearInterval(interval);
    };
  }, []);

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

  // Va dentro de cada encabezado: flotando fijo tapaba las tarjetas al hacer scroll en el celular
  const botonSincronizar = (sobreAzul: boolean) => (
    <button
      onClick={() => cargarDesdeDrive(false)}
      disabled={cargando}
      className={`shrink-0 h-9 px-2.5 sm:px-3 rounded-xl transition disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold ${
        sobreAzul
          ? 'bg-white/10 hover:bg-white/20 text-white ring-1 ring-white/20'
          : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-uss-blue ring-1 ring-slate-200'
      }`}
      title="Sincronizar con Google Sheets en tiempo real"
      aria-label="Sincronizar con Google Sheets"
    >
      <RefreshCw className={`w-4 h-4 lg:w-3.5 lg:h-3.5 ${cargando ? 'animate-spin' : ''}`} />
      <span className="hidden sm:inline">Sincronizar</span>
    </button>
  );

  return (
    <div
      className={`min-h-screen ${selected && !mostrarComoAcreditar ? 'lg:h-screen lg:overflow-hidden' : ''} ${
        mostrarComoAcreditar && !planElegido && !restaurando ? 'xl:h-screen xl:overflow-hidden' : ''
      } bg-[#f2f5fb] text-slate-900 flex flex-col selection:bg-uss-blue selection:text-white`}
    >
      {restaurando ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24 text-slate-500">
          <Loader2 className="w-7 h-7 animate-spin text-uss-blue" />
          <p className="text-sm font-medium">Recuperando tu consulta…</p>
        </div>
      ) : mostrarComoAcreditar ? (
        /* VISTA: MENÚ DE OPCIONES (misma sesión del estudiante) */
        <div className="flex-1 flex flex-col w-full bg-[#f2f5fb] xl:min-h-0">
          {/* Header institucional: mantiene la sesión del estudiante */}
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 py-2.5 px-4 sm:px-6 w-full shrink-0 shadow-xs">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <button
                  onClick={cerrarOpciones}
                  type="button"
                  className="shrink-0 inline-flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                  title="Volver"
                  aria-label="Volver"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Volver</span>
                </button>
                <img
                  src="/logo.png"
                  alt="Logo USS"
                  className="h-7 sm:h-8 w-auto object-contain"
                />
                <div className="border-l border-slate-200 pl-3 min-w-0">
                  <h1 className="text-sm font-bold text-uss-blue leading-tight truncate">
                    {config.titulo} {config.palabraDestacada}
                  </h1>
                  <p className="text-[11px] text-slate-500 truncate">Conoce cómo acreditar</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selected && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-uss-blue text-xs font-medium border border-blue-100">
                    Estudiante: <strong className="font-semibold">{selected.nombres.split(' ')[0]}</strong> ({selected.codUniv})
                  </span>
                )}
                {botonSincronizar(false)}
              </div>
            </div>
          </header>

          {/* Planes para acreditar Computación y registro del elegido. El footer es el general. */}
          <main
            className={`flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 ${
              planElegido ? '' : 'xl:py-5 xl:min-h-0 xl:flex xl:flex-col'
            }`}
          >
            <MenuOpciones
              titulo={config.menuTitulo}
              subtitulo={config.menuSubtitulo}
              planes={config.planes}
              estudiante={selected}
              estudiantes={estudiantes}
              plan={planElegido}
              onPlan={setPlanElegido}
            />
          </main>
        </div>
      ) : selected ? (
        <div className="flex-1 flex flex-col w-full lg:h-full lg:min-h-0 lg:overflow-hidden">
          {/* Header institucional: fijo arriba en el celular para tener siempre a mano Volver */}
          <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 py-2 lg:py-1.5 px-3 sm:px-6 w-full shrink-0">
            <div className="max-w-7xl mx-auto flex items-center gap-2.5">
              <button
                onClick={() => setSelected(null)}
                type="button"
                className="lg:hidden w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-slate-600 hover:text-uss-blue hover:bg-slate-100 transition cursor-pointer"
                aria-label="Volver a la búsqueda"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img
                src="/logo.png"
                alt="Logo USS"
                className="h-7 sm:h-8 w-auto object-contain"
              />
              <div className="border-l border-slate-200 pl-2.5 min-w-0">
                <h1 className="text-sm font-bold text-uss-blue leading-tight truncate">
                  {config.titulo} {config.palabraDestacada}
                </h1>
                <p className="text-[11px] lg:text-[10px] text-slate-500 truncate">Portal oficial de verificación</p>
              </div>
              <div className="ml-auto">{botonSincronizar(false)}</div>
            </div>
          </header>

          {/* Área principal: en escritorio cabe en 1 pantalla, en el celular fluye con scroll */}
          <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-3 lg:py-2.5 flex-1 min-h-0 flex flex-col">
            <StudentDetailView
              key={selected.codUniv}
              estudiante={selected}
              onBack={() => setSelected(null)}
              onOpenComoAcreditar={() => setMostrarComoAcreditar(true)}
            />
          </main>
        </div>
      ) : (
        /* VISTA 2: PANTALLA PRINCIPAL CON BUSCADOR */
        <div className="flex-1 flex flex-col w-full">
          {/* Portada institucional */}
          <header className="relative overflow-hidden bg-gradient-to-br from-[#041d5f] via-uss-blue to-[#1450d8] text-white px-4 sm:px-6 pt-4 pb-16 sm:pb-20">
            {/* Una sola ilustración grande y dos luces suaves: nada que se repita como mosaico */}
            <div className="absolute -left-24 -top-28 w-80 h-80 rounded-full bg-sky-400/25 blur-3xl pointer-events-none" />
            <div className="absolute right-[-6rem] bottom-[-8rem] w-96 h-96 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />
            <HeroIllustration className="absolute -right-8 bottom-2 w-56 sm:w-80 md:w-96 text-white/[0.09] pointer-events-none" />

            <div className="relative max-w-4xl mx-auto">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center rounded-2xl bg-white px-3 py-1.5 shadow-lg shadow-black/10">
                  <img
                    src="/logo.png"
                    alt="Logo Universidad Señor de Sipán"
                    className="h-8 sm:h-10 w-auto object-contain"
                  />
                </span>
                {botonSincronizar(true)}
              </div>

              <div className="mt-9 sm:mt-12 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 ring-1 ring-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#ffc53d]" />
                  {config.badge || 'Centro de Informática • USS'}
                </span>
                <h1 className="mt-4 font-display text-[2.4rem] leading-[1.05] sm:text-6xl font-extrabold tracking-tight">
                  {config.titulo}{' '}
                  {config.palabraDestacada && (
                    <span className="text-[#ffc53d]">{config.palabraDestacada}</span>
                  )}
                </h1>
                <p className="mt-3 text-sm sm:text-base text-blue-100/90 max-w-xl mx-auto leading-relaxed">
                  {config.subtitulo}
                </p>
              </div>
            </div>
          </header>

          {/* CUERPO CON BUSCADOR: sube sobre la portada para que se vea apenas abre la página */}
          <main className="flex-1 px-4 sm:px-6 pb-12 -mt-8 relative z-10">
            <div className="w-full max-w-3xl mx-auto space-y-6">
              <SearchBar
                estudiantes={estudiantes}
                loading={cargando}
                config={config}
                onSelect={(est) => setSelected(est)}
              />

              {/* Cómo buscar */}
              <section aria-label="Cómo buscar">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center sm:text-left">
                  Puedes buscar por
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {FORMAS_DE_BUSQUEDA.map(({ Icon, titulo, ejemplo, tono }) => (
                    <div
                      key={titulo}
                      className="flex items-center gap-3 rounded-2xl bg-white p-3 sm:p-4 ring-1 ring-slate-900/5 shadow-sm"
                    >
                      <div className={`w-10 h-10 rounded-xl ring-1 flex items-center justify-center shrink-0 ${tono}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 leading-tight">{titulo}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{ejemplo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </main>
        </div>
      )}

      {/* Footer compacto */}
      <footer className={`${selected ? 'py-2 lg:py-1 text-[10px]' : 'py-4 text-xs'} px-4 text-center border-t border-slate-200/80 bg-white shrink-0`}>
        <span className="text-slate-400">
          Universidad Señor de Sipán &bull;{' '}
          <span className="sm:hidden">CINF</span>
          <span className="hidden sm:inline">Centro de Informática (CINF)</span> &bull; Portal GEX
        </span>
      </footer>
    </div>
  );
}
