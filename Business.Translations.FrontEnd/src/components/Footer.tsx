interface FooterProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void;
}

export function Footer({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: FooterProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <footer className="h-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8 text-xs text-slate-500 shrink-0">
      <div>
        Showing{" "}
        <span className="font-bold text-slate-700 dark:text-slate-300">
          {startItem}-{endItem}
        </span>{" "}
        of {totalItems.toLocaleString()} strings
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <span>Rows per page:</span>
          <select
            className="bg-transparent border-none focus:ring-0 text-xs font-bold cursor-pointer text-slate-700 dark:text-slate-300"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange?.(Number(e.target.value))}
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
            disabled={currentPage === 1}
            onClick={() => onPageChange?.(currentPage - 1)}
          >
            <span className="material-symbols-outlined text-base leading-none">
              chevron_left
            </span>
          </button>

          <span className="font-bold text-primary">{currentPage}</span>

          <button
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange?.(currentPage + 1)}
          >
            <span className="material-symbols-outlined text-base leading-none">
              chevron_right
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
