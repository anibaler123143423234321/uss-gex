import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ArrowLeft, ArrowUpRight, Loader2, Home } from 'lucide-react';
import SearchBar from './components/SearchBar';
import StudentDetailView from './components/StudentDetailView';
import MenuOpciones from './components/MenuOpciones';
import CinfAgentChat from './components/CinfAgentChat';
import { fetchExcelFromDrive } from './services/driveSheetService';
import { sincronizarAutomaticoDriveASupabase, getCargaExcelVigente } from './services/cargasService';
import { gexConfigService, DEFAULT_GEX_CONFIG, type GexPortalConfig } from './services/gexConfigService';
import type { EstudianteGEX } from './types/estudiante';
import type { PlanOpcionId } from './data/planesComputacion';

// Consulta abierta en la pestaña: sobrevive a F5 y se borra al cerrar la pestaña
const CLAVE_SESION = 'gex.sesion';
const LOGO_USS = `${import.meta.env.BASE_URL}logo-uss.png`;
const FOTO_CAMPUS = `${import.meta.env.BASE_URL}campus-uss.jpg`;
const FOTO_CAMPUS_800 = `${import.meta.env.BASE_URL}campus-uss-800.jpg`;
const SUBTITULO_POR_DEFECTO = DEFAULT_GEX_CONFIG.subtitulo;

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

// Formas de búsqueda que se explican bajo el buscador
const FORMAS_DE_BUSQUEDA = [
  { titulo: 'Código', ejemplo: '2251804844' },
  { titulo: 'Apellidos', ejemplo: 'García Pérez' },
  { titulo: 'Correo', ejemplo: '@uss.edu.pe' },
];

/** "S/ 120" → 120. Devuelve null si el texto del panel no trae un número */
function montoDe(precio: string): number | null {
  const n = Number(precio.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

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
      className={`gex-btn shrink-0 min-w-11 justify-center px-2.5 sm:px-3 rounded-xl disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5 font-semibold ${
        sobreAzul
          ? 'h-11 text-sm bg-white/10 hover:bg-white/20 text-white ring-1 ring-white/30'
          : 'h-11 lg:h-9 text-xs bg-white hover:bg-slate-50 text-slate-600 hover:text-uss-blue ring-1 ring-slate-200'
      }`}
      title="Sincronizar con Google Sheets en tiempo real"
      aria-label="Sincronizar con Google Sheets"
    >
      <RefreshCw className={`w-4 h-4 lg:w-3.5 lg:h-3.5 ${cargando ? 'animate-spin' : ''}`} />
      <span className="hidden sm:inline">Sincronizar</span>
    </button>
  );

  // Portada: el subtítulo del panel solo se usa si alguien lo cambió; si no, se explica qué hace la página
  const subtituloPortada =
    config.subtitulo && config.subtitulo !== SUBTITULO_POR_DEFECTO
      ? config.subtitulo
      : 'Escribe tu código, correo o apellidos y ve qué cursos de Computación ya aprobaste y cómo acreditar los que faltan.';
  const planMasBarato = config.planes
    .map((p) => ({ nombre: p.nombre, monto: montoDe(p.precio) }))
    .filter((p): p is { nombre: string; monto: number } => p.monto !== null)
    .sort((a, b) => a.monto - b.monto)[0];
  const precioMinimo = planMasBarato ? `S/ ${planMasBarato.monto}` : null;

  const portada = (
    /* PORTADA: una pantalla azul con el buscador, los datos en vivo y la foto del campus.
       Estructura Taste-Skill: header.nav encima del hero, main > section.hero > .wrap > .hero-text */
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-uss-blue focus:font-semibold"
      >
        Saltar al contenido
      </a>
      <header className="nav absolute inset-x-0 top-0 z-20 bg-uss-blue text-white">
        <div className="wrap flex items-center justify-between gap-3 h-[76px]">
          <a href="/" title="Ir al Portal CINF" className="inline-flex items-center min-h-11 shrink-0">
            <img
              src={LOGO_USS}
              alt="Universidad Señor de Sipán"
              width={851}
              height={293}
              className="h-9 sm:h-11 w-auto brightness-0 invert"
            />
          </a>
          <div className="flex items-center gap-2">
            {botonSincronizar(true)}
            <a
              href="/"
              className="gex-btn shrink-0 h-11 px-3 sm:px-4 rounded-xl inline-flex items-center gap-1.5 text-sm font-semibold bg-white text-uss-blue hover:bg-blue-50"
            >
              <span className="hidden sm:inline">Ir al Portal CINF</span>
              <span className="sm:hidden">Portal</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </header>

      <main id="contenido">
        <section
          aria-labelledby="portada-titulo"
          data-enter
          className="hero min-h-[100svh] flex flex-col bg-uss-blue text-white pt-[76px]"
        >
          <div className="wrap flex-1 flex flex-col">
            <div className="hero-text flex-1 grid lg:grid-cols-12 gap-x-6 gap-y-8 items-start my-auto py-8 lg:py-10">
              <div className="lg:col-span-7 gex-enter">
                <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-[#ffc53d]">
                  {config.badge || 'Centro de Informática USS'}
                </p>
                <h1
                  id="portada-titulo"
                  className="mt-4 font-display text-[2.15rem] leading-[1.06] sm:text-5xl xl:text-[3.6rem] font-extrabold tracking-tight text-balance"
                >
                  Acreditación en Computación para{' '}
                  <span className="text-[#ffc53d]">
                    {[config.titulo, config.palabraDestacada].filter(Boolean).join(' ') || 'Gente con Experiencia'}
                  </span>
                </h1>
                <p className="mt-4 text-base sm:text-lg text-blue-100 max-w-xl leading-relaxed">
                  {subtituloPortada}
                </p>

                <div className="mt-7">
                  <label htmlFor="buscar-estudiante" className="block text-sm font-semibold text-white mb-2">
                    Busca al estudiante
                  </label>
                  <SearchBar
                    estudiantes={estudiantes}
                    loading={cargando}
                    config={config}
                    onSelect={(est) => setSelected(est)}
                    inputId="buscar-estudiante"
                    textoBoton="Ver mi avance"
                  />
                  <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-blue-100" aria-label="Puedes buscar por">
                    {FORMAS_DE_BUSQUEDA.map(({ titulo, ejemplo }) => (
                      <li key={titulo} className="inline-flex items-baseline gap-1.5">
                        <span className="font-semibold text-white">{titulo}</span>
                        <span className="hidden sm:inline text-blue-200">{ejemplo}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <dl className="mt-9 grid grid-cols-3 gap-4 border-t border-white/20 pt-5">
                  <div>
                    <dt className="sr-only">Estudiantes GEX registrados</dt>
                    <dd className="text-2xl sm:text-3xl font-extrabold tabular-nums">
                      {cargando && estudiantes.length === 0 ? '—' : estudiantes.length.toLocaleString('es-PE')}
                    </dd>
                    <dd className="text-xs sm:text-sm text-blue-100 mt-1">estudiantes GEX</dd>
                  </div>
                  <div>
                    <dt className="sr-only">Formas de acreditar</dt>
                    <dd className="text-2xl sm:text-3xl font-extrabold tabular-nums">{config.planes.length}</dd>
                    <dd className="text-xs sm:text-sm text-blue-100 mt-1">formas de acreditar Computación</dd>
                  </div>
                  <div>
                    <dt className="sr-only">Precio más bajo</dt>
                    <dd className="text-2xl sm:text-3xl font-extrabold tabular-nums">{precioMinimo ?? '—'}</dd>
                    <dd className="text-xs sm:text-sm text-blue-100 mt-1">
                      {planMasBarato ? `desde, por ${planMasBarato.nombre.toLowerCase()}` : 'según la forma que elijas'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="hidden lg:block lg:col-span-5 self-stretch gex-foto gex-enter-foto overflow-hidden rounded-2xl min-h-[420px]">
                <img
                  src={FOTO_CAMPUS}
                  srcSet={`${FOTO_CAMPUS_800} 800w, ${FOTO_CAMPUS} 1280w`}
                  sizes="(min-width: 1024px) 1200px, 100vw"
                  alt="Campus de la Universidad Señor de Sipán en Chiclayo, con el letrero USS en los jardines"
                  width={1280}
                  height={784}
                  fetchPriority="high"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <p className="pb-7 text-xs text-blue-200">
              Universidad Señor de Sipán · Centro de Informática CINF · Portal GEX
            </p>
          </div>
        </section>
      </main>
    </>
  );

  // La portada va sin envoltorio: header.nav y main quedan directo en #root
  if (!restaurando && !mostrarComoAcreditar && !selected) return portada;

  return (
    <div
      className={`min-h-screen ${selected ? 'lg:h-screen lg:overflow-hidden' : ''} bg-[#f2f5fb] text-slate-900 flex flex-col selection:bg-uss-blue selection:text-white`}
    >
      {restaurando ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24 text-slate-500">
          <Loader2 className="w-7 h-7 animate-spin text-uss-blue" />
          <p className="text-sm font-medium">Recuperando tu consulta…</p>
        </div>
      ) : mostrarComoAcreditar ? (
        /* VISTA: MENÚ DE OPCIONES (misma sesión del estudiante) */
        <div className="flex-1 flex flex-col w-full bg-[#f2f5fb] lg:min-h-0 lg:overflow-hidden">
          {/* Header institucional: mantiene la sesión del estudiante */}
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 py-2 sm:py-2.5 px-4 sm:px-6 w-full shrink-0 shadow-xs">
            <div className="max-w-7xl grande:max-w-[1600px] mx-auto flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <button
                  // Un solo botón para regresar: del registro a las opciones y de las opciones a la ficha
                  onClick={planElegido ? () => setPlanElegido(null) : cerrarOpciones}
                  type="button"
                  className="gex-btn shrink-0 inline-flex items-center justify-center gap-1.5 h-11 lg:h-9 min-w-11 px-2.5 sm:px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                  title="Volver"
                  aria-label="Volver"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Volver</span>
                </button>
                <a
                  href="/"
                  title="Ir al inicio"
                  className="flex items-center gap-2.5 sm:gap-3 min-w-0 group hover:opacity-90 transition"
                >
                  <img
                    src={LOGO_USS}
                    alt="Logo USS"
                    className="h-7 sm:h-8 w-auto object-contain"
                  />
                  <div className="border-l border-slate-200 pl-3 min-w-0">
                    <h1 className="text-sm font-bold text-uss-blue leading-tight truncate">
                      {config.titulo} {config.palabraDestacada}
                    </h1>
                    <p className="text-[11px] text-slate-500 truncate">Conoce cómo acreditar</p>
                  </div>
                </a>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/"
                  className="gex-btn shrink-0 h-11 lg:h-9 min-w-11 justify-center px-2.5 sm:px-3 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-600 hover:text-uss-blue ring-1 ring-slate-200"
                  title="Ir al inicio"
                >
                  <Home className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                  <span className="hidden sm:inline">Inicio</span>
                </a>
                {botonSincronizar(false)}
              </div>
            </div>
          </header>

          {/* Planes para acreditar Computación y registro del elegido. El footer es el general.
              En monitores grandes se ensancha para que el comparativo de las 4 tarjetas quepa en una línea */}
          {/* En escritorio la página no hace scroll (lg:h-screen): lo hace este contenedor, a todo el ancho
              para que la barra quede en el borde de la ventana. En el celular el espacio de abajo evita que el
              botón flotante del Agente CINF tape el de enviar */}
          <div className="flex-1 min-h-0 lg:overflow-y-auto">
          <main className="w-full max-w-7xl grande:max-w-[1600px] mx-auto px-4 sm:px-6 pt-5 pb-24 lg:pt-3 lg:pb-2">
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
        </div>
      ) : selected ? (
        <div className="flex-1 flex flex-col w-full lg:h-full lg:min-h-0 lg:overflow-hidden">
          {/* Header institucional: fijo arriba en el celular para tener siempre a mano Volver */}
          <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 py-2 lg:py-1.5 px-3 sm:px-6 w-full shrink-0">
            <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto flex items-center gap-2.5">
              <button
                onClick={() => setSelected(null)}
                type="button"
                className="lg:hidden w-11 h-11 -ml-1 rounded-xl flex items-center justify-center text-slate-600 hover:text-uss-blue hover:bg-slate-100 transition cursor-pointer"
                aria-label="Volver a la búsqueda"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <a
                href="/"
                title="Ir al inicio"
                className="flex items-center gap-2.5 min-w-0 group hover:opacity-90 transition"
              >
                <img
                  src={LOGO_USS}
                  alt="Logo USS"
                  className="h-7 sm:h-8 w-auto object-contain"
                />
                <div className="border-l border-slate-200 pl-2.5 min-w-0">
                  <h1 className="text-sm font-bold text-uss-blue leading-tight truncate">
                    {config.titulo} {config.palabraDestacada}
                  </h1>
                  <p className="text-[11px] lg:text-[10px] text-slate-500 truncate">Portal oficial de verificación</p>
                </div>
              </a>
              <div className="ml-auto flex items-center gap-2">
                <a
                  href="/"
                  className="gex-btn shrink-0 h-11 lg:h-9 min-w-11 justify-center px-2.5 sm:px-3 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-600 hover:text-uss-blue ring-1 ring-slate-200"
                  title="Ir al inicio"
                >
                  <Home className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                  <span className="hidden sm:inline">Inicio</span>
                </a>
                {botonSincronizar(false)}
              </div>
            </div>
          </header>

          {/* Área principal: en escritorio cabe en 1 pantalla, en el celular fluye con scroll */}
          <main className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-3 sm:px-6 py-3 lg:py-2.5 flex-1 min-h-0 flex flex-col">
            <StudentDetailView
              key={selected.codUniv}
              estudiante={selected}
              onBack={() => setSelected(null)}
              onOpenComoAcreditar={() => setMostrarComoAcreditar(true)}
              planes={config.planes}
            />
          </main>
        </div>
      ) : (
        null
      )}

      {/* Footer compacto (la portada lleva su propia línea legal) */}
      {(selected || mostrarComoAcreditar) && (
      <footer className={`${selected ? 'py-2 lg:py-1 text-[10px]' : 'py-4 text-xs'} px-4 text-center border-t border-slate-200/80 bg-white shrink-0`}>
        <span className="text-slate-500">
          Universidad Señor de Sipán &bull;{' '}
          <span className="sm:hidden">CINF</span>
          <span className="hidden sm:inline">Centro de Informática (CINF)</span> &bull; Portal GEX
        </span>
      </footer>
      )}

      {/* Agente CINF (Solo activo cuando se consulta un estudiante) */}
      {selected && (
        <CinfAgentChat
          estudiante={selected}
          estudiantes={estudiantes}
          planes={config.planes}
          onNavigateComoAcreditar={() => setMostrarComoAcreditar(true)}
          ocultarDock={mostrarComoAcreditar}
        />
      )}
    </div>
  );
}
