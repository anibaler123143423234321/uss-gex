import { useEffect, useState } from 'react';
import {
  X,
  CreditCard,
  Building2,
  FileText,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Info,
  Maximize2,
  ZoomIn,
} from 'lucide-react';

export interface ModalGuiaPagoProps {
  abierto: boolean;
  onCerrar: () => void;
  tabInicial?: 'bancos' | 'modalidades' | 'tramites';
}

interface GuiaTab {
  id: 'bancos' | 'modalidades' | 'tramites';
  etiqueta: string;
  icono: typeof Building2;
  titulo: string;
  descripcion: string;
}

const TABS: GuiaTab[] = [
  {
    id: 'bancos',
    etiqueta: 'Bancos y Canales',
    icono: Building2,
    titulo: 'Canales Autorizados y Bancos para Pago de Tasas',
    descripcion: 'Paga con tu código de estudiante en ventanilla, agentes o banca móvil de los bancos autorizados.',
  },
  {
    id: 'modalidades',
    etiqueta: 'Modalidades de Pago',
    icono: CreditCard,
    titulo: 'Modalidades Oficiales de Pago CINF',
    descripcion: 'Lámina oficial para acreditaciones en Computación: pago al contado, cuotas o diferido.',
  },
  {
    id: 'tramites',
    etiqueta: 'Trámites en Campus Virtual',
    icono: FileText,
    titulo: 'Cómo Programar el Servicio en Campus Virtual',
    descripcion: 'Identifica la captura de pantalla oficial para solicitar tu constancia o certificado en CampusNet.',
  },
];

const assetUrl = (path: string): string => {
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}${cleanPath}`;
};

const CANALES_PAGO_IMG = assetUrl('assets/pagos/canales_pago_bancos.png');
const MODALIDADES_PAGO_IMG = assetUrl('assets/pagos/modalidades_de_pago_oficial.png');

interface TramiteDoc {
  id: string;
  nombre: string;
  tipo: 'constancia' | 'certificado';
  modalidad: 'digital' | 'impreso';
  precio: string;
  servicioCampus: string;
  imagen: string;
  detalle: string;
}

const TRAMITES_DOCS: TramiteDoc[] = [
  {
    id: 'const-dig',
    nombre: 'Constancia CIS Digital',
    tipo: 'constancia',
    modalidad: 'digital',
    precio: 'S/ 25.00',
    servicioCampus: 'CONSTANCIA CIS DIGITAL',
    imagen: assetUrl('assets/tramites/constancia_cis_digital.png'),
    detalle: 'Envía tu voucher a centros.empresariales@uss.edu.pe (emisión en 24h hábiles).',
  },
  {
    id: 'const-imp',
    nombre: 'Constancia CIS Impresa',
    tipo: 'constancia',
    modalidad: 'impreso',
    precio: 'S/ 30.00',
    servicioCampus: 'CONSTANCIA CIS IMPRESA',
    imagen: assetUrl('assets/tramites/constancia_cis_impreso.png'),
    detalle: 'Documento en físico para recoger en sede central (Elías Aguirre 933, Chiclayo).',
  },
  {
    id: 'cert-dig',
    nombre: 'Certificado CIS Digital',
    tipo: 'certificado',
    modalidad: 'digital',
    precio: 'S/ 35.00',
    servicioCampus: 'CERTIFICADO CIS DIGITAL',
    imagen: assetUrl('assets/tramites/certificado_cis_digital.png'),
    detalle: 'Certificado con horas y código QR institucional para validación.',
  },
  {
    id: 'cert-imp',
    nombre: 'Certificado CIS Impreso',
    tipo: 'certificado',
    modalidad: 'impreso',
    precio: 'S/ 40.00',
    servicioCampus: 'CERTIFICADO CIS IMPRESO',
    imagen: assetUrl('assets/tramites/certificado_cis_impreso.png'),
    detalle: 'Certificado oficial en cartulina membretada con sellos y firmas.',
  },
];

export default function ModalGuiaPago({
  abierto,
  onCerrar,
  tabInicial = 'bancos',
}: ModalGuiaPagoProps) {
  const [tabActiva, setTabActiva] = useState<'bancos' | 'modalidades' | 'tramites'>(tabInicial);
  const [tramiteDocId, setTramiteDocId] = useState<string>('const-dig');
  const [copiadoBcp, setCopiadoBcp] = useState(false);
  const [imagenZoom, setImagenZoom] = useState<string | null>(null);

  // Sincronizar tab inicial si cambia desde afuera
  useEffect(() => {
    if (abierto) {
      setTabActiva(tabInicial);
    }
  }, [abierto, tabInicial]);

  // Manejo de tecla Escape y bloqueo de scroll
  useEffect(() => {
    if (!abierto) return;
    const anteriorOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (imagenZoom) {
          setImagenZoom(null);
        } else {
          onCerrar();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = anteriorOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [abierto, imagenZoom, onCerrar]);

  if (!abierto) return null;

  const copiarCuentaBcp = () => {
    navigator.clipboard.writeText('305-1552328-0-87');
    setCopiadoBcp(true);
    setTimeout(() => setCopiadoBcp(false), 2000);
  };

  const tramiteSeleccionado =
    TRAMITES_DOCS.find((d) => d.id === tramiteDocId) ?? TRAMITES_DOCS[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-pago-titulo"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
      onClick={onCerrar}
    >
      <div
        className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl ring-1 ring-slate-900/10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera institucional */}
        <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-[#073299] via-uss-blue to-[#0051cc] text-white flex items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase text-blue-100">
                <ShieldCheck className="w-3.5 h-3.5 text-[#ffc53d]" />
                Centro de Informática • USS
              </span>
            </div>
            <h3 id="modal-pago-titulo" className="mt-1 text-base sm:text-lg font-extrabold text-white leading-tight">
              Cómo pagar el derecho de trámite y tasas administrativas
            </h3>
            <p className="text-xs text-blue-100/90 hidden sm:block">
              Guía oficial paso a paso con imágenes del Campus Virtual y entidades bancarias.
            </p>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0"
            aria-label="Cerrar ventana"
            title="Cerrar ventana (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de pestañas */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-slate-200 bg-slate-50/80 shrink-0">
          <div className="flex flex-wrap gap-2" role="tablist">
            {TABS.map((t) => {
              const Icono = t.icono;
              const activo = tabActiva === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={activo}
                  onClick={() => setTabActiva(t.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer border ${
                    activo
                      ? 'bg-uss-blue text-white border-uss-blue shadow-sm'
                      : 'bg-white text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icono className="w-4 h-4 shrink-0" />
                  <span>{t.etiqueta}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: BANCOS Y CANALES */}
          {tabActiva === 'bancos' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="rounded-xl bg-blue-50/70 border border-blue-200/80 p-3 sm:p-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <p className="font-bold text-uss-blue mb-1">Pasos para pagar en ventanilla, app móvil o agentes:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>Indica al banco o agente que realizarás un <strong>Pago de Servicios / Recaudación Universidad Señor de Sipán</strong>.</li>
                  <li>Brinda tu <strong>Código de Estudiante</strong> como identificador del pago.</li>
                  <li>Verifica en pantalla o recibo que figure tu nombre completo y el concepto exacto.</li>
                  <li>Conserva tu voucher o comprobante digital.</li>
                </ol>
              </div>

              {/* Tarjeta de cuenta BCP destacada */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Cuenta Corriente BCP</span>
                    <button
                      type="button"
                      onClick={copiarCuentaBcp}
                      className="inline-flex items-center gap-1 text-xs font-bold text-uss-blue hover:text-blue-800 transition cursor-pointer"
                    >
                      {copiadoBcp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiadoBcp ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                  <p className="font-mono text-sm sm:text-base font-extrabold text-slate-900">305-1552328-0-87</p>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    A nombre de: <strong>Universidad Señor de Sipán S.A.C.</strong>
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Otros Bancos Autorizados</span>
                  <p className="text-xs text-slate-700 leading-snug">
                    <strong>BBVA, Interbank, Scotiabank y Banco de la Nación</strong>: a través de recaudación institucional con tu código de estudiante.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    O paga directamente en línea dentro del Campus Virtual con tarjeta de débito/crédito.
                  </p>
                </div>
              </div>

              {/* Imagen con zoom */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700">Lámina Oficial de Canales de Pago USS:</span>
                  <button
                    type="button"
                    onClick={() => setImagenZoom(CANALES_PAGO_IMG)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-uss-blue hover:underline cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    Ampliar imagen
                  </button>
                </div>
                <div
                  className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer group relative"
                  onClick={() => setImagenZoom(CANALES_PAGO_IMG)}
                >
                  <img
                    src={CANALES_PAGO_IMG}
                    alt="Canales de pago autorizados USS"
                    className="w-full h-auto object-contain max-h-[360px] mx-auto group-hover:opacity-95 transition"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center pointer-events-none">
                    <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-slate-900 font-bold text-xs px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 transition">
                      <Maximize2 className="w-3.5 h-3.5" />
                      Clic para ampliar
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MODALIDADES DE PAGO CINF */}
          {tabActiva === 'modalidades' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="rounded-xl bg-amber-50/80 border border-amber-200/80 p-3 sm:p-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <p className="font-bold text-amber-900 mb-1">Opciones de financiamiento y tasas de acreditación:</p>
                <p className="text-slate-600">
                  Las acreditaciones extracurriculares en Computación pueden programarse según el cronograma CINF (al contado, en cuotas o con pago diferido según la modalidad). Las tasas administrativas y derechos de trámite se registran en el Campus Virtual.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700">Lámina Oficial de Modalidades de Pago CINF:</span>
                  <button
                    type="button"
                    onClick={() => setImagenZoom(MODALIDADES_PAGO_IMG)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-uss-blue hover:underline cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    Ampliar imagen
                  </button>
                </div>
                <div
                  className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer group relative"
                  onClick={() => setImagenZoom(MODALIDADES_PAGO_IMG)}
                >
                  <img
                    src={MODALIDADES_PAGO_IMG}
                    alt="Modalidades de pago CINF"
                    className="w-full h-auto object-contain max-h-[380px] mx-auto group-hover:opacity-95 transition"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center pointer-events-none">
                    <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-slate-900 font-bold text-xs px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 transition">
                      <Maximize2 className="w-3.5 h-3.5" />
                      Clic para ampliar
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRÁMITES EN CAMPUS VIRTUAL */}
          {tabActiva === 'tramites' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 sm:p-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <p className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4 text-uss-blue" />
                  Ruta en Campus Virtual:
                </p>
                <p className="font-medium text-slate-800">
                  <span className="text-uss-blue font-bold">campus.uss.edu.pe</span> → Menú{' '}
                  <strong className="text-slate-900 font-bold">Trámites</strong> →{' '}
                  <strong className="text-slate-900 font-bold">Programación de servicios</strong>
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  En el buscador de servicios digita el nombre del concepto que deseas solicitar.
                </p>
              </div>

              {/* Selector de tipo de trámite */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TRAMITES_DOCS.map((doc) => {
                  const elegido = doc.id === tramiteDocId;
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setTramiteDocId(doc.id)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        elegido
                          ? 'border-uss-blue bg-blue-50/80 ring-2 ring-uss-blue/30 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          {doc.modalidad}
                        </span>
                        <p className="text-xs font-bold text-slate-900 leading-tight mt-0.5">{doc.nombre}</p>
                      </div>
                      <span className="mt-2 text-xs font-black text-uss-blue">{doc.precio}</span>
                    </button>
                  );
                })}
              </div>

              {/* Detalle y captura del trámite seleccionado */}
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900">{tramiteSeleccionado.nombre}</span>
                      <span className="text-xs font-extrabold text-uss-blue bg-blue-100 px-2 py-0.5 rounded-md">
                        {tramiteSeleccionado.precio}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Texto a buscar en CampusNet:{' '}
                      <strong className="text-uss-blue font-mono">{tramiteSeleccionado.servicioCampus}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImagenZoom(tramiteSeleccionado.imagen)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-uss-blue hover:underline cursor-pointer self-start sm:self-auto"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    Ampliar captura
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-normal">{tramiteSeleccionado.detalle}</p>

                <div
                  className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer group relative"
                  onClick={() => setImagenZoom(tramiteSeleccionado.imagen)}
                >
                  <img
                    src={tramiteSeleccionado.imagen}
                    alt={`Captura ${tramiteSeleccionado.nombre}`}
                    className="w-full h-auto object-contain max-h-[300px] mx-auto group-hover:opacity-95 transition"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center pointer-events-none">
                    <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-slate-900 font-bold text-xs px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 transition">
                      <Maximize2 className="w-3.5 h-3.5" />
                      Clic para ampliar captura oficial
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie con botón de cierre */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-uss-blue shrink-0" />
            <span>
              Realiza siempre los trámites desde tu sesión personal oficial en{' '}
              <strong className="text-slate-800 font-semibold">campus.uss.edu.pe</strong>.
            </span>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="px-4 py-2 bg-uss-blue hover:bg-[#002266] text-white rounded-xl font-bold text-xs transition cursor-pointer self-end sm:self-auto"
          >
            Entendido / Cerrar
          </button>
        </div>
      </div>

      {/* Visor de Imagen en Pantalla Completa (Zoom) */}
      {imagenZoom && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6"
          onClick={() => setImagenZoom(null)}
        >
          <div className="w-full max-w-5xl flex items-center justify-between text-white pb-3">
            <span className="text-sm font-bold text-slate-200">Vista ampliada de la lámina oficial</span>
            <button
              type="button"
              onClick={() => setImagenZoom(null)}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
              title="Cerrar vista ampliada"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div
            className="max-h-[85vh] max-w-5xl overflow-auto rounded-xl bg-slate-900/40 p-2 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imagenZoom}
              alt="Lámina oficial ampliada"
              className="max-h-[80vh] w-auto max-w-full rounded-lg shadow-2xl object-contain"
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">Haz clic fuera o presiona Esc para volver.</p>
        </div>
      )}
    </div>
  );
}
