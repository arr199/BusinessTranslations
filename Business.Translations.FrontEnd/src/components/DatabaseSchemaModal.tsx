import React from "react";
import { Modal } from "./Modal";
import { DATABASE_SCHEMAS } from "../data/databaseSchema";

interface DatabaseSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunMigration: () => void;
}

export const DatabaseSchemaModal: React.FC<DatabaseSchemaModalProps> = ({
  isOpen,
  onClose,
  onRunMigration,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">
            database
          </span>
          <h2 className="text-lg font-bold">Database Schema Update</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            The following database tables will be created to support
            multi-language translation management:
          </p>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {DATABASE_SCHEMAS.map((table) => (
              <div
                key={table.name}
                className="rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800"
              >
                <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-primary">
                    Table: {table.name}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Schema
                  </span>
                </div>
                <div className="p-4">
                  <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed">
                    {table.schema}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onRunMigration}
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
};
