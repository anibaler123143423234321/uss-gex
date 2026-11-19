import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Home, LogOut } from 'lucide-react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HeroIntro } from './components/common/HeroIntro';
import AccesoGex from './components/AccesoGex';
import StudentDetailView from './components/StudentDetailView';
import MenuOpciones from './components/MenuOpciones';
import CinfAgentChat from './components/CinfAgentChat';
import { accesoService, cerrarSesion, haySesion } from './services/accesoService';
import { gexConfigService, DEFAULT_GEX_CONFIG, type GexPortalConfig } from './services/gexConfigService';
import type { EstudianteGEX } from './types/estudiante';
import type { PlanOpcionId } from './data/planesComputacion';

// Vista abierta en la pestaña: sobrevive a F5 y se borra al cerrar la pestaña.
// La identidad no va aquí: la da el token de accesoService, que solo existe tras verificar el correo.
const CLAVE_SESION = 'gex.sesion';
const LOGO_USS = `${import.meta.env.BASE_URL}logo-uss.png`;
const FOTO_CAMPUS = `${import.meta.env.BASE_URL}campus-uss.jpg`;
const FOTO_CAMPUS_800 = `${import.meta.env.BASE_URL}campus-uss-800.jpg`;
const SUBTITULO_POR_DEFECTO = DEFAULT_GEX_CONFIG.subtitulo;

interface SesionGex {
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

// Formas de entrar que se explican bajo el campo. Nunca por nombres: mostraba a otros estudiantes.
const FORMAS_DE_ENTRAR = [
  { clave: 'codigo', titulo: 'Código', ejemplo: '2251804844' },
  { clave: 'correo', titulo: 'Correo', ejemplo: 'tucorreo@uss.edu.pe' },
] as const;

/** "S/ 120" → 120. Devuelve null si el texto del panel no trae un número */
function montoDe(precio: string): number | null {
  const n = Number(precio.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default function App() {
  const [total, setTotal] = useState<number | null>(null);
  const [selected, setSelected] = useState<EstudianteGEX | null>(null);
  const [config, setConfig] = useState<GexPortalConfig>(DEFAULT_GEX_CONFIG);
  const [sesionInicial] = useState<SesionGex>(leerSesion);
  const [mostrarComoAcreditar, setMostrarComoAcreditar] = useState<boolean>(!!sesionInicial.opciones);
  const [planElegido, setPlanElegido] = useState<PlanOpcionId | null>(sesionInicial.plan ?? null);
  // Con un acceso vigente en la pestaña, la ficha se pide a la API; hasta entonces no se muestra la portada
  const [restaurando, setRestaurando] = useState<boolean>(haySesion);

  useEffect(() => {
    if (!restaurando) return;
    accesoService
      .estudiante()
      .then(setSelected)
      .catch(() => cerrarSesion())
      .finally(() => setRestaurando(false));
  }, [restaurando]);

  useEffect(() => {
    if (restaurando) return;
    guardarSesion({ opciones: mostrarComoAcreditar, plan: planElegido });
  }, [restaurando, mostrarComoAcreditar, planElegido]);

  // Cifra de la portada: solo el total, la nómina no sale del servidor
  useEffect(() => {
    accesoService
      .resumen()
      .then((r) => setTotal(r.total))
      .catch(() => setTotal(null));
  }, []);

  const salir = () => {
    cerrarSesion();
    setSelected(null);
    setMostrarComoAcreditar(false);
    setPlanElegido(null);
  };

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

  const botonSalir = (
    <button
      onClick={salir}
      type="button"
      className="gex-btn shrink-0 h-11 lg:h-9 min-w-11 justify-center px-2.5 sm:px-3 rounded-xl cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-600 hover:text-uss-blue ring-1 ring-slate-200"
      title="Salir de tu ficha"
    >
      <LogOut className="w-4 h-4 lg:w-3.5 lg:h-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">Salir</span>
    </button>
  );

  // Portada: el subtítulo del panel solo se usa si alguien lo cambió; si no, se explica qué hace la página
  const subtituloPortada =
    config.subtitulo && config.subtitulo !== SUBTITULO_POR_DEFECTO
      ? config.subtitulo
      : 'Entra con tu código universitario o tu correo institucional y ve qué cursos de Computación ya aprobaste y cómo acreditar los que faltan.';
  const ambasApagadas = config.searchByCode === false && config.searchByEmail === false;
  const formasDeEntrar = FORMAS_DE_ENTRAR.filter(
    ({ clave }) => ambasApagadas || (clave === 'codigo' ? config.searchByCode !== false : config.searchByEmail !== false)
  );
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
      <Header
        variant="hero"
        logoUrl={LOGO_USS}
        portalUrl="/"
      />

      <main id="contenido">
        <section
          aria-labelledby="portada-titulo"
          data-enter
          className="hero min-h-[100svh] flex flex-col bg-uss-blue text-white pt-[76px]"
        >
          <div className="wrap flex-1 flex flex-col">
            <div className="hero-text flex-1 grid lg:grid-cols-12 gap-x-6 gap-y-8 items-start my-auto py-8 lg:py-10">
              <div className="lg:col-span-7">
                <HeroIntro
                  badge={config.badge || 'Centro de Informática • USS'}
                  titlePrefix={config.prefijoTitulo || 'Acreditación en Computación para'}
                  highlightText={[config.titulo, config.palabraDestacada].filter(Boolean).join(' ') || 'Gente con Experiencia'}
                  lead={subtituloPortada}
                />

                <div className="mt-7">
                  <AccesoGex variante="portada" config={config} onEntrar={setSelected} inputId="acceso-estudiante" />
                  <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-blue-100" aria-label="Puedes entrar con">
                    {formasDeEntrar.map(({ titulo, ejemplo }) => (
                      <li key={titulo} className="inline-flex items-baseline gap-1.5">
                        <span className="font-semibold text-white">{titulo}</span>
                        <span className="text-blue-200">{ejemplo}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <dl className="mt-9 grid grid-cols-3 gap-4 border-t border-white/20 pt-5">
                  <div>
                    <dt className="sr-only">Estudiantes GEX registrados</dt>
                    <dd className="text-2xl sm:text-3xl font-extrabold tabular-nums">
                      {total === null ? '—' : total.toLocaleString('es-PE')}
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

              <div className="hidden lg:block lg:col-span-5 self-stretch gex-foto gex-enter-foto overflow-hidden rounded-2xl min-h-[440px] h-[min(680px,calc(100svh-76px-96px))]">
                <img
                  src={FOTO_CAMPUS}
                  srcSet={`${FOTO_CAMPUS_800} 800w, ${FOTO_CAMPUS} 1280w`}
                  sizes="(min-width: 1024px) 1200px, 100vw"
                  alt="Campus de la Universidad Señor de Sipán en Chiclayo, con el letrero USS en los jardines"
                  width={1280}
                  height={784}
                  fetchPriority="high"
                  className="w-full h-full object-cover object-[46%_60%]"
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
                {selected && botonSalir}
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
              badge={config.menuBadge || 'Acreditación en Computación'}
              planes={config.planes}
              estudiante={selected}
              onEntrar={setSelected}
              config={config}
              plan={planElegido}
              onPlan={setPlanElegido}
            />
          </main>
          </div>
        </div>
      ) : selected ? (
        <div className="flex-1 flex flex-col w-full lg:h-full lg:min-h-0 lg:overflow-hidden">
          {/* Header institucional desacoplado */}
          <Header
            variant="compact"
            logoUrl={LOGO_USS}
            portalUrl="/"
            titulo={config.menuBadge || 'Acreditación en Computación'}
            subtitulo={[config.titulo, config.palabraDestacada].filter(Boolean).join(' ') || 'GEX'}
            onBack={salir}
          />

          {/* Área principal: en escritorio cabe en 1 pantalla, en el celular fluye con scroll */}
          <main className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-3 sm:px-6 py-3 lg:py-2.5 flex-1 min-h-0 flex flex-col">
            <StudentDetailView
              key={selected.codUniv}
              estudiante={selected}
              onBack={salir}
              onOpenComoAcreditar={() => setMostrarComoAcreditar(true)}
              planes={config.planes}
              etiquetaAcreditacion={config.menuBadge || 'Acreditación en Computación'}
            />
          </main>
        </div>
      ) : (
        null
      )}

      {/* Footer desacoplado */}
      {(selected || mostrarComoAcreditar) && (
        <Footer variant={selected ? 'compact' : 'legal'} />
      )}

      {/* Agente CINF (Solo activo cuando se consulta un estudiante) */}
      {selected && (
        <CinfAgentChat
          estudiante={selected}
          planes={config.planes}
          onNavigateComoAcreditar={() => setMostrarComoAcreditar(true)}
          ocultarDock={mostrarComoAcreditar}
        />
      )}
    </div>
  );
}
