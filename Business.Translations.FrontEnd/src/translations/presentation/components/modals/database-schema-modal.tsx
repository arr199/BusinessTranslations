import { useState } from "react";
import { Modal } from "./modal";
import {
  DATABASE_SCHEMAS,
  COMPLETE_SQL_SCRIPT,
} from "../../constants/database-schema";

interface DatabaseSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunMigration: () => void;
}

export function DatabaseSchemaModal({
  isOpen,
  onClose,
  onRunMigration,
}: DatabaseSchemaModalProps) {
  const [copiedTable, setCopiedTable] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyTable = async (tableName: string, sql: string) => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopiedTable(tableName);
      setTimeout(() => setCopiedTable(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(COMPLETE_SQL_SCRIPT);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Database Schema Setup"
      containerClassName="max-w-3xl"
    >
      <div className="p-6 space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">
              info
            </span>
            <div className="flex-1 text-xs text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">Two options available:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong>Copy & Run Manually:</strong> Copy the SQL queries and
                  execute them in your database client
                </li>
                <li>
                  <strong>Automatic Migration:</strong> Click "Run Migration" to
                  execute the queries through the API
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div />
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-primary dark:hover:border-primary hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined text-sm">
              {copiedAll ? "check" : "content_copy"}
            </span>
            {copiedAll ? "Copied!" : "Copy All SQL"}
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          {DATABASE_SCHEMAS.length} tables • SQL Server 2016+ compatible
        </div>

        <div className="space-y-4">
          {DATABASE_SCHEMAS.map((table) => (
            <div
              key={table.name}
              className="rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800"
            >
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div className="flex-1">
                  <span className="text-sm font-mono font-bold text-primary">
                    {table.name}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {table.description}
                  </p>
                </div>
                <button
                  onClick={() => handleCopyTable(table.name, table.sql)}
                  className="ml-4 p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-primary transition-all"
                  title="Copy SQL for this table"
                >
                  <span className="material-symbols-outlined text-sm">
                    {copiedTable === table.name ? "check" : "content_copy"}
                  </span>
                </button>
              </div>
              <div className="p-4">
                <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {table.sql}
                </pre>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onRunMigration();
              onClose();
            }}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">
              play_arrow
            </span>
            Run Migration
          </button>
        </div>
      </div>
    </Modal>
  );
}
