export function TableSkeletonRows({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr
          key={i}
          className="animate-pulse bg-white/40 dark:bg-transparent"
        >
          <td className="pl-3 pr-0 py-4 w-10">
            <div className="size-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </td>
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
    </>
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
