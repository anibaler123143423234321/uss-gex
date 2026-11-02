import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, ChevronDown, Loader2 } from 'lucide-react';
import type { EstudianteGEX } from '../types/estudiante';

interface Props {
  estudiantes: EstudianteGEX[];
  loading?: boolean;
  onSelect: (estudiante: EstudianteGEX | null) => void;
}

/**
 * Buscador sobre el archivo Excel cargado en memoria.
 * Consulta directa por Código Universitario, Apellidos, Nombres o Correo Institucional.
 */
export default function SearchBar({ estudiantes, loading = false, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrado directo sobre el Excel cargado en memoria
  const filtered = query.trim().length >= 2
    ? estudiantes.filter((e) => {
        const q = query.toLowerCase().trim();
        return (
          e.codUniv.toLowerCase().includes(q) ||
          e.nombres.toLowerCase().includes(q) ||
          e.correoInstitucional.toLowerCase().includes(q)
        );
      }).slice(0, 30)
    : [];

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
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

  // Solo abre el dropdown cuando el usuario ESCRIBE en el input
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
          placeholder="Código, nombre o correo"
          className="w-full h-14 sm:h-16 pl-12 pr-20 rounded-2xl border-2 border-white bg-white text-base text-slate-900 placeholder:text-slate-400 focus:border-uss-blue focus:ring-4 focus:ring-uss-blue/15 outline-none transition-all shadow-xl shadow-uss-navy/15"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
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
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Dropdown mat-select con coincidencias encontradas en el Excel */}
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-2 w-full max-h-[60vh] sm:max-h-80 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150 divide-y divide-slate-100"
        >
          {filtered.length === 0 && query.trim().length >= 2 ? (
            <li className="px-4 py-6 text-center text-sm text-slate-400">
              No se encontraron coincidencias en el Excel para &ldquo;{query}&rdquo;
            </li>
          ) : (
            filtered.map((est, i) => (
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
                    {/* En el celular el nombre usa dos líneas en vez de cortarse a la mitad */}
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
                  <span className="shrink-0 text-[11px] sm:text-xs font-mono font-semibold bg-uss-blue/[0.07] text-uss-blue px-2 sm:px-2.5 py-1 rounded-lg ring-1 ring-uss-blue/15">
                    {highlight(est.codUniv)}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      )}

      {/* Ayuda inferior */}
      <p className="mt-2.5 text-xs text-slate-500 text-center">
        {loading && estudiantes.length === 0
          ? 'Cargando el Excel de estudiantes…'
          : `Buscando entre ${estudiantes.length} estudiantes del Excel`}
      </p>
    </div>
  );
}
