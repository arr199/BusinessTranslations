import { useMemo, useState } from "react";
import type { Module } from "../../../domain/types";
import { Modal } from "./modal";

interface ManageModulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  modules: Module[];
  onRenameModule: (moduleId: string, newName: string) => void;
  onRequestDelete: (module: Module) => void;
}

export function ManageModulesModal({
  isOpen,
  onClose,
  modules,
  onRenameModule,
  onRequestDelete,
}: ManageModulesModalProps) {
  const editableModules = useMemo(
    () => modules.filter((m) => m.name !== "All Modules"),
    [modules],
  );

  function ManageModuleRow({ module }: { module: Module }) {
    const [draftName, setDraftName] = useState(module.name);
    const isChanged = draftName.trim() !== module.name;
    const isValid = draftName.trim().length > 0;

    return (
      <li className="group flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="material-symbols-outlined text-lg text-slate-500 dark:text-slate-400">
            {module.icon}
          </span>

          <input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={!isChanged || !isValid}
            onClick={() => onRenameModule(module.id, draftName.trim())}
            className="px-3 py-2 rounded-lg text-sm font-bold bg-primary hover:bg-primary/90 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Save module name"
          >
            Save
          </button>

          <button
            type="button"
            onClick={() => onRequestDelete(module)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
            title="Delete module"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </li>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Modules">
      <div className="p-6">
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Rename modules or delete them. Deleting a module may also remove
          related translations.
        </p>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          {editableModules.length === 0 ? (
            <div className="p-4 text-sm text-slate-500 dark:text-slate-400">
              No modules found.
            </div>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {editableModules.map((module) => (
                <ManageModuleRow
                  key={`${module.id}:${module.name}`}
                  module={module}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
