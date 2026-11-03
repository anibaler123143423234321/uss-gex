import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, ChevronDown, Loader2 } from 'lucide-react';
import type { EstudianteGEX } from '../types/estudiante';
import type { GexPortalConfig } from '../services/gexConfigService';

interface Props {
  estudiantes: EstudianteGEX[];
  loading?: boolean;
  config?: GexPortalConfig;
  onSelect: (estudiante: EstudianteGEX | null) => void;
}

type CoincidenciaRazon = 'correo' | 'codigo' | 'nombre';

interface ResultadoBusqueda {
  est: EstudianteGEX;
  razon: CoincidenciaRazon;
}

/**
 * Buscador sobre el archivo Excel cargado en memoria.
 * Aplica cascada de prioridad estricta:
 * 1° Correo institucional -> 2° Código universitario -> 3° Nombres y apellidos (si no existen en los anteriores).
 */
export default function SearchBar({ estudiantes, loading = false, config, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const searchByEmail = config?.searchByEmail ?? true;
  const searchByCode = config?.searchByCode ?? true;
  const searchByName = config?.searchByName ?? true;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrado con prioridad en cascada: 1° Correo -> 2° Código -> 3° Nombres si no existen anteriores
  const filteredWithReason: ResultadoBusqueda[] = query.trim().length >= 2
    ? (() => {
        const q = query.toLowerCase().trim();

        // 1. Coincidencias por correo (Prioridad 1)
        const porCorreo: ResultadoBusqueda[] = searchByEmail
          ? estudiantes
              .filter((e) => e.correoInstitucional && e.correoInstitucional.toLowerCase().includes(q))
              .map((e) => ({ est: e, razon: 'correo' }))
          : [];

        // 2. Coincidencias por código (Prioridad 2)
        const porCodigo: ResultadoBusqueda[] = searchByCode
          ? estudiantes
              .filter((e) => e.codUniv && e.codUniv.toLowerCase().includes(q))
              .map((e) => ({ est: e, razon: 'codigo' }))
          : [];

        // 3. Coincidencias por nombres (Prioridad 3)
        const porNombres: ResultadoBusqueda[] = searchByName
          ? estudiantes
              .filter((e) => e.nombres && e.nombres.toLowerCase().includes(q))
              .map((e) => ({ est: e, razon: 'nombre' }))
          : [];

        let acumulado: ResultadoBusqueda[] = [];

        // Prioridad 1: Correo
        if (porCorreo.length > 0) {
          acumulado = [...porCorreo];
        }

        // Prioridad 2: Código
        if (porCodigo.length > 0) {
          const codigosVistos = new Set(acumulado.map((item) => item.est.codUniv));
          const nuevosPorCodigo = porCodigo.filter((item) => !codigosVistos.has(item.est.codUniv));
          acumulado = [...acumulado, ...nuevosPorCodigo];
        }

        // Prioridad 3: Nombres y apellidos SOLO si no existen coincidencias por correo ni código
        if (acumulado.length === 0 && porNombres.length > 0) {
          acumulado = porNombres;
        }

        return acumulado.slice(0, 30);
      })()
    : [];

  const filtered = filteredWithReason.map((r) => r.est);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navegación por teclado
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[highlightIndex]) {
        (items[highlightIndex] as HTMLElement).scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightIndex]);

  // Selección de un estudiante: CIERRA el dropdown y desenfoca el input
  const handleSelect = useCallback((est: EstudianteGEX) => {
    onSelect(est);
    setQuery(est.nombres);
    setOpen(false);
    setHighlightIndex(-1);
    inputRef.current?.blur();
  }, [onSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setOpen(val.trim().length >= 2);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' && filtered.length > 0) {
        setOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter' && highlightIndex >= 0 && filtered[highlightIndex]) {
      e.preventDefault();
      handleSelect(filtered[highlightIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const clearQuery = () => {
    setQuery('');
    setOpen(false);
    setHighlightIndex(-1);
    onSelect(null);
    inputRef.current?.focus();
  };

  /** Resalta la coincidencia en el texto */
  const highlight = (text: string) => {
    if (!query.trim() || !text) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-amber-200/90 text-inherit rounded-sm px-0.5 font-bold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-4xl mx-auto">
      {/* Input de consulta sobre el Excel */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="w-5 h-5 text-uss-blue animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-uss-blue transition-colors" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Buscar por correo, código o nombres..."
          className="w-full h-14 sm:h-16 pl-12 pr-20 rounded-2xl border-2 border-white bg-white text-base text-slate-900 placeholder:text-slate-400 focus:border-uss-blue focus:ring-4 focus:ring-uss-blue/15 outline-none transition-all shadow-xl shadow-[#041d5f]/15"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
        />

        {/* Botones de acción derecha */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (filtered.length > 0) setOpen(!open);
            }}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Dropdown con coincidencias encontradas en el Excel */}
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-2 w-full max-h-[60vh] sm:max-h-80 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150 divide-y divide-slate-100"
        >
          {filteredWithReason.length === 0 && query.trim().length >= 2 ? (
            <li className="px-4 py-6 text-center text-sm text-slate-400">
              No se encontraron coincidencias en el Excel para &ldquo;{query}&rdquo;.
            </li>
          ) : (
            filteredWithReason.map(({ est, razon }, i) => (
              <li
                key={`${est.codUniv}-${est.item}-${i}`}
                role="option"
                aria-selected={i === highlightIndex}
                onClick={() => handleSelect(est)}
                onMouseEnter={() => setHighlightIndex(i)}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  i === highlightIndex
                    ? 'bg-uss-blue/[0.07]'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 sm:truncate">
                      {highlight(est.nombres)}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 mt-0.5 min-w-0">
                      <span className="text-xs text-slate-500 truncate">
                        {est.escuela}
                      </span>
                      {est.correoInstitucional && (
                        <>
                          <span className="hidden sm:inline text-slate-300">&bull;</span>
                          <span className="text-xs text-slate-400 truncate">
                            {highlight(est.correoInstitucional)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Badge de Criterio de Coincidencia (Correo / Código / Nombre) */}
                    <span
                      className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        razon === 'correo'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : razon === 'codigo'
                          ? 'bg-blue-50 text-uss-blue border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                      title={`Coincidencia encontrada por ${razon}`}
                    >
                      {razon === 'correo' ? 'Correo' : razon === 'codigo' ? 'Código' : 'Nombre'}
                    </span>

                    <span className="text-[11px] sm:text-xs font-mono font-semibold bg-uss-blue/[0.07] text-uss-blue px-2 sm:px-2.5 py-1 rounded-lg ring-1 ring-uss-blue/15">
                      {highlight(est.codUniv)}
                    </span>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      )}

    </div>
  );
}

