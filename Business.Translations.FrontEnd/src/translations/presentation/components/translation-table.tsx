import { useRef, useState, useCallback, useEffect } from "react";
import { TranslationRow } from "./translation-row";
import type { Translation } from "../../domain/types";

interface TranslationTableProps {
  translations: Translation[];
  hasActiveFilters?: boolean;
  onEdit?: (id: string, value: string) => void;
  onDelete?: (id: string, key: string) => void;
  onAddTranslation?: () => void;
}

const DEFAULT_WIDTHS = [128, 224, 128, 0, 96]; // 0 = flex column
const MIN_WIDTH = 60;
const STORAGE_KEY = "bt-col-widths";

function loadWidths(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === DEFAULT_WIDTHS.length)
        return parsed;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_WIDTHS;
}

export function TranslationTable({
  translations,
  hasActiveFilters = false,
  onEdit,
  onDelete,
  onAddTranslation,
}: TranslationTableProps) {
  const [colWidths, setColWidths] = useState<number[]>(loadWidths);
  const dragRef = useRef<{
    colIndex: number;
    startX: number;
    startWidth: number;
  } | null>(null);

  const onMouseDown = useCallback(
    (colIndex: number, e: React.MouseEvent) => {
      e.preventDefault();
      dragRef.current = {
        colIndex,
        startX: e.clientX,
        startWidth: colWidths[colIndex],
      };
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [colWidths],
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { colIndex, startX, startWidth } = dragRef.current;
      const newWidth = Math.max(MIN_WIDTH, startWidth + (e.clientX - startX));
      setColWidths((prev) => {
        const next = [...prev];
        next[colIndex] = newWidth;
        return next;
      });
    };
    const onMouseUp = () => {
      dragRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      setColWidths((cur) => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cur));
        } catch {
          /* ignore */
        }
        return cur;
      });
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const colStyle = (i: number): React.CSSProperties =>
    colWidths[i] ? { width: colWidths[i] } : {};

  const resizeHandle = (colIndex: number) => (
    <span
      onMouseDown={(e) => onMouseDown(colIndex, e)}
      className="absolute -right-2 top-0 h-full w-4 cursor-col-resize flex items-center justify-center z-10"
    >
      <span className="h-2/3 w-px rounded-full bg-slate-300 dark:bg-slate-600 pointer-events-none transition-colors group-hover/resize:bg-primary/60" />
    </span>
  );

  if (translations.length === 0) {
    return (
      <section className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-[#0b1219]">
        <div className="text-center px-6 py-16 max-w-sm">
          <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4 block">
            {hasActiveFilters ? "search_off" : "translate"}
          </span>
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {hasActiveFilters ? "No translations found" : "No translations yet"}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            {hasActiveFilters
              ? "Try adjusting your search or filter criteria."
              : "Get started by adding your first translation key."}
          </p>
          {!hasActiveFilters && onAddTranslation && (
            <button
              onClick={onAddTranslation}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-primary hover:bg-primary/90 text-white transition-colors"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add Translation
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 overflow-auto bg-slate-50 dark:bg-[#0b1219]">
      <table className="w-full text-left border-collapse table-fixed">
        <thead className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10 shadow-sm">
          <tr>
            <th
              style={colStyle(0)}
              className="relative px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500"
            >
              Module{resizeHandle(0)}
            </th>
            <th
              style={colStyle(1)}
              className="relative px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500"
            >
              Key{resizeHandle(1)}
            </th>
            <th
              style={colStyle(2)}
              className="relative px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500"
            >
              Language{resizeHandle(2)}
            </th>
            <th
              style={colStyle(3)}
              className="relative px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500"
            >
              Value (Editable)
            </th>
            <th
              style={colStyle(4)}
              className="relative px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {translations.map((translation) => (
            <TranslationRow
              key={translation.id}
              translation={translation}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
}
