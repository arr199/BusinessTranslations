import { useState, useEffect, useRef } from "react";
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
  const cancelRef = useRef(false);

  useEffect(() => {
    setValue(translation.value);
  }, [translation.value]);

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

  const isMissing = translation.status === "missing";

  const save = () => {
    if (value !== translation.value) {
      onEdit?.(translation.id, value);
    }
  };

  const handleBlur = () => {
    if (cancelRef.current) {
      cancelRef.current = false;
      return;
    }
    save();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelRef.current = true;
      setValue(translation.value);
      e.currentTarget.blur();
    }
  };

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
          title={translation.keyName}
        >
          {translation.keyName}
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
        <textarea
          className={`w-full bg-transparent rounded-lg px-3 py-2 text-sm resize-none outline-none border transition-colors ${
            isMissing
              ? "border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-500/5 italic text-amber-600 dark:text-amber-500"
              : "border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-primary focus:bg-primary/5 text-slate-700 dark:text-slate-300"
          }`}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={isMissing ? "Translate this key..." : ""}
        />
      </td>

      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onDelete?.(translation.id, translation.keyName)}
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
