import { Modal } from "./modal";
import type { BulkImportSummary } from "../../../domain/types";

interface ImportSummaryModalProps {
  summary: BulkImportSummary | null;
  onClose: () => void;
}

export function ImportSummaryModal({
  summary,
  onClose,
}: ImportSummaryModalProps) {
  return (
    <Modal
      isOpen={summary !== null}
      onClose={onClose}
      title="Import Summary"
    >
      {summary && (
        <div data-testid="import-summary-modal" className="p-6">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <SummaryCount
              icon="check_circle"
              label="Created"
              count={summary.created}
              color="text-emerald-600 dark:text-emerald-400"
            />
            <SummaryCount
              icon="published_with_changes"
              label="Updated"
              count={summary.updated}
              color="text-primary"
            />
            <SummaryCount
              icon="warning"
              label="Skipped"
              count={summary.skipped.length}
              color="text-amber-600 dark:text-amber-400"
            />
            <SummaryCount
              icon="error"
              label="Failed"
              count={summary.failed.length}
              color="text-red-600 dark:text-red-400"
            />
          </div>

          <OutcomeList title="Skipped rows" items={summary.skipped} />
          <OutcomeList title="Failed rows" items={summary.failed} />

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-bold bg-primary hover:bg-primary/90 text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function SummaryCount({
  icon,
  label,
  count,
  color,
}: {
  icon: string;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div
      data-testid={`summary-${label.toLowerCase()}`}
      className="flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
    >
      <span className={`material-symbols-outlined text-xl ${color}`}>
        {icon}
      </span>
      <div>
        <div className="text-lg font-bold text-slate-900 dark:text-white">
          {count}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {label}
        </div>
      </div>
    </div>
  );
}

function OutcomeList({
  title,
  items,
}: {
  title: string;
  items: { key: string; reason: string }[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
        {title}
      </h3>
      <ul className="max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
        {items.map((item) => (
          <li
            key={`${item.key}-${item.reason}`}
            className="px-3 py-2 text-sm flex flex-col gap-0.5"
          >
            <code className="text-xs text-primary font-mono">{item.key}</code>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {item.reason}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
