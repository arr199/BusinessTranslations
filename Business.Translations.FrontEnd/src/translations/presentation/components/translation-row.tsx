import { useState } from "react";
import type { Translation } from "../../domain/types";

interface TranslationRowProps {
  translation: Translation;
  onEdit?: (id: string, value: string) => void;
  onDelete?: (id: string, key: string) => void;
}

export function TranslationRow({
  translation,
  onEdit,
  onDelete,
}: TranslationRowProps) {
  const [value, setValue] = useState(translation.value);

  const getLanguageBadgeColor = (code: string) => {
    const colors: Record<string, string> = {
      EN: "bg-blue-100 text-blue-800",
      ES: "bg-red-100 text-red-800",
      FR: "bg-indigo-100 text-indigo-800",
      DE: "bg-yellow-100 text-yellow-800",
      IT: "bg-green-100 text-green-800",
    };
    return colors[code] || "bg-slate-100 text-slate-800";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      verified: "bg-emerald-500",
      missing: "bg-amber-500",
      pending: "bg-slate-400",
    };
    return colors[status] || "bg-slate-400";
  };

  const isMissing = translation.status === "missing";

  return (
    <tr className="hover:bg-white dark:hover:bg-slate-800/40 transition-colors group bg-white/40 dark:bg-transparent">
      <td className="px-6 py-4">
        <span className="text-xs font-medium px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
          {translation.module}
        </span>
      </td>

      <td className="px-6 py-4">
        <code
          className="text-xs text-primary font-mono truncate block"
          title={translation.key}
        >
          {translation.key}
        </code>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span
            className={`size-5 rounded-full flex items-center justify-center text-[10px] font-bold ${getLanguageBadgeColor(
              translation.languageCode,
            )}`}
          >
            {translation.languageCode}
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {translation.language}
          </span>
        </div>
      </td>

      <td className="px-6 py-2">
        <div
          className={`relative flex items-center editable-cell border rounded-lg px-2 py-2 transition-all ${
            isMissing
              ? "border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-500/5"
              : "border-transparent"
          }`}
        >
          <textarea
            className={`w-full bg-transparent border-none focus:ring-0 text-sm resize-none py-0 ${
              isMissing
                ? "italic text-amber-600 dark:text-amber-500"
                : "text-slate-700 dark:text-slate-300"
            }`}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => onEdit?.(translation.id, value)}
            placeholder={isMissing ? "Translate this key..." : ""}
          />
          <span
            className={`material-symbols-outlined text-sm ${
              isMissing
                ? "text-amber-500"
                : "text-primary opacity-0 group-focus-within:opacity-100"
            }`}
          >
            {isMissing ? "warning" : "done"}
          </span>
        </div>
      </td>

      <td className="px-6 py-4 text-center">
        <span
          className={`size-2 rounded-full inline-block ${getStatusColor(translation.status)}`}
          title={translation.status}
        />
      </td>

      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-1.5 rounded text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
            title="Edit row"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>

          <button
            onClick={() => onDelete?.(translation.id, translation.key)}
            className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
            title="Delete key"
          >
            <span className="material-symbols-outlined text-[18px]">
              delete
            </span>
          </button>
        </div>
      </td>
    </tr>
  );
}
