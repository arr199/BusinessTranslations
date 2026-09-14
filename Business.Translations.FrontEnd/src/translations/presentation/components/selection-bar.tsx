interface SelectionBarProps {
  count: number;
  onDelete: () => void;
  onClear: () => void;
}

export function SelectionBar({ count, onDelete, onClear }: SelectionBarProps) {
  if (count === 0) return null;

  return (
    <div
      data-testid="selection-bar"
      className="fixed bottom-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <span className="text-sm font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
        {count} selected
      </span>

      <button
        onClick={onDelete}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
      >
        <span className="material-symbols-outlined text-sm">delete</span>
        Delete
      </button>

      <button
        onClick={onClear}
        className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors whitespace-nowrap"
      >
        Clear selection
      </button>
    </div>
  );
}
