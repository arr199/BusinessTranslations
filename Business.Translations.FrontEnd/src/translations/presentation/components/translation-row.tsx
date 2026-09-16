import { useState, useRef } from "react";
import type { Translation } from "../../domain/types";

interface TranslationRowProps {
  translation: Translation;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onEdit?: (id: string, value: string) => void;
  onDelete?: (id: string, key: string) => void;
}

export function TranslationRow({
  translation,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
}: TranslationRowProps) {
  const [value, setValue] = useState(translation.value);
  const [copied, setCopied] = useState(false);
  const cancelRef = useRef(false);

  const [prevExternalValue, setPrevExternalValue] = useState(translation.value);
  if (translation.value !== prevExternalValue) {
    setPrevExternalValue(translation.value);
    setValue(translation.value);
  }

  function getLanguageBadgeColor(code: string) {
    const colors: Record<string, string> = {
      EN: "bg-blue-100 text-blue-800",
      ES: "bg-red-100 text-red-800",
      FR: "bg-indigo-100 text-indigo-800",
      DE: "bg-yellow-100 text-yellow-800",
      IT: "bg-green-100 text-green-800",
    };
    return colors[code] || "bg-slate-100 text-slate-800";
  }

  const isMissing = translation.status === "missing";

  function save() {
    if (value !== translation.value) {
      onEdit?.(translation.id, value);
    }
  }

  function handleBlur() {
    if (cancelRef.current) {
      cancelRef.current = false;
      return;
    }
    save();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelRef.current = true;
      setValue(translation.value);
      e.currentTarget.blur();
    }
  }

  function copyKey() {
    navigator.clipboard.writeText(translation.keyName).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <tr className="hover:bg-white dark:hover:bg-slate-800/40 transition-colors group bg-white/40 dark:bg-transparent">
      <td className="pl-3 pr-0 py-4 w-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect?.(translation.id, e.target.checked)}
          className="size-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/20 cursor-pointer"
        />
      </td>

      <td className="px-6 py-4">
        <span className="text-xs font-medium px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
          {translation.module}
        </span>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-1">
          <code
            className="text-xs text-primary font-mono truncate"
            title={translation.keyName}
          >
            {translation.keyName}
          </code>
          <button
            onClick={copyKey}
            className="p-0.5 rounded text-slate-300 hover:text-primary opacity-0 group-hover:opacity-100 transition-all shrink-0"
            title="Copy key"
          >
            <span className="material-symbols-outlined text-[14px]">
              {copied ? "check" : "content_copy"}
            </span>
          </button>
        </div>
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
