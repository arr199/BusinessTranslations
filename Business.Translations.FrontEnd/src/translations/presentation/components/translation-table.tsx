import { TranslationRow } from "./translation-row";
import type { Translation } from "../../domain/types";

interface TranslationTableProps {
  translations: Translation[];
  onEdit?: (id: string, value: string) => void;
  onDelete?: (id: string, key: string) => void;
}

export function TranslationTable({
  translations,
  onEdit,
  onDelete,
}: TranslationTableProps) {
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
            <th className="w-24 px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">
              Status
            </th>
            <th className="w-24 px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">
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
