import { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, Download, RefreshCw, CheckCircle2 } from 'lucide-react';
import { parseExcelFile, downloadOriginalExcelFromBase64 } from '../services/excelService';
import { registrarNuevaVersionExcel } from '../services/cargasService';
import type { EstudianteGEX } from '../types/estudiante';
import type { CargaExcelGEX } from '../services/cargasService';

interface Props {
  archivoNombre: string;
  totalRegistros: number;
  cargaVigente: CargaExcelGEX | null;
  onExcelCargado: (nombre: string, data: EstudianteGEX[], nuevaCarga?: CargaExcelGEX) => void;
}

export default function ExcelUploader({
  archivoNombre,
  totalRegistros,
  cargaVigente,
  onExcelCargado,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [procesando, setProcesando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcesando(true);
    setMensajeExito(null);

    try {
      // 1. Leer el archivo binario original y obtener el Base64 y los datos parseados
      const { estudiantes, base64 } = await parseExcelFile(file);

      // 2. Guardar el archivo Excel binario real (.xlsx) en Supabase
      const nuevaCarga = await registrarNuevaVersionExcel(
        file.name,
        estudiantes.length,
        base64
      );

      onExcelCargado(file.name, estudiantes, nuevaCarga || undefined);
      setMensajeExito(`¡Archivo Excel "${file.name}" guardado exitosamente en Supabase! (${estudiantes.length} registros)`);
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err) {
      console.error('Error al procesar el archivo Excel:', err);
      alert('Error al leer el archivo Excel. Asegúrate de que sea un archivo .xlsx, .xls o .csv válido.');
    } finally {
      setProcesando(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDescargarExcel = () => {
      // Si tenemos el archivo binario original guardado en Supabase
      if (cargaVigente?.archivo_base64) {
        downloadOriginalExcelFromBase64(cargaVigente.archivo_base64, cargaVigente.nombre_archivo);
      } else if (cargaVigente?.archivo_url) {
        window.open(cargaVigente.archivo_url, '_blank');
      } else {
        alert('No hay un archivo Excel binario disponible para descargar.');
      }
    };

    return (
      <div className="w-full max-w-2xl mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Info del archivo Excel actual */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate max-w-xs">
                  {archivoNombre}
                </span>
                {cargaVigente && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                    v{cargaVigente.version}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {totalRegistros > 0
                  ? `${totalRegistros.toLocaleString()} registros en el Excel binario oficial`
                  : 'Aún no hay archivo cargado en Supabase'}
              </p>
            </div>
          </div>

          {/* Botones de acción: Descargar y Actualizar Excel */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Botón Descargar Excel */}
            <button
              onClick={handleDescargarExcel}
              disabled={!cargaVigente}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition disabled:opacity-40"
              title="Descargar el archivo Excel original"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar Excel (.xlsx)
            </button>

            {/* Botón Subir / Chancar Excel */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={procesando}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#073299] hover:bg-[#052677] text-white transition shadow-sm disabled:opacity-50"
              title="Subir y guardar el archivo Excel real en Supabase"
            >
              {procesando ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UploadCloud className="w-3.5 h-3.5" />
              )}
              {procesando ? 'Guardando Excel...' : 'Chancar / Cargar Excel'}
            </button>
          </div>
        </div>

        {/* Alerta de éxito */}
        {mensajeExito && (
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg p-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{mensajeExito}</span>
          </div>
        )}
      </div>
    );
  }
