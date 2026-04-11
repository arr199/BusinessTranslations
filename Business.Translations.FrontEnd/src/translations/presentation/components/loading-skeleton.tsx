export function TableSkeleton() {
  return (
    <section className="flex-1 overflow-auto bg-slate-50 dark:bg-[#0b1219]">
      <table className="w-full text-left border-collapse table-fixed">
        <thead className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10 shadow-sm">
          <tr>
            <th className="w-32 px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Module
            </th>
            <th className="w-56 px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Key
            </th>
            <th className="w-32 px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Language
            </th>
            <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Value (Editable)
            </th>
            <th className="w-24 px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {Array.from({ length: 8 }).map((_, i) => (
            <tr
              key={i}
              className="animate-pulse bg-white/40 dark:bg-transparent"
            >
              <td className="px-6 py-4">
                <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="size-5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </td>
              <td className="px-6 py-2">
                <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end">
                  <div className="size-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "size-4",
    md: "size-8",
    lg: "size-12",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-4 border-slate-200 dark:border-slate-700 border-t-primary rounded-full animate-spin`}
      ></div>
    </div>
  );
}
