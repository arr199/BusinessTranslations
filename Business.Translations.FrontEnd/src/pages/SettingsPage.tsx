import { useMemo, useState } from "react";
import type { Module } from "../types";
import type { Language } from "../data/sampleData";

interface SettingsPageProps {
  modules: Module[];
  languages: Language[];
  onBack: () => void;
  onAddModule: () => void;
  onAddLanguage: () => void;
  onRenameModule: (moduleId: string, newName: string) => void;
  onRequestDeleteModule: (module: Module) => void;
  onRequestDeleteLanguage: (language: Language) => void;
}

export function SettingsPage({
  modules,
  languages,
  onBack,
  onAddModule,
  onAddLanguage,
  onRenameModule,
  onRequestDeleteModule,
  onRequestDeleteLanguage,
}: SettingsPageProps) {
  const editableModules = useMemo(
    () => modules.filter((m) => m.name !== "All Modules"),
    [modules],
  );

  function ModuleRow({ module }: { module: Module }) {
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
            onClick={() => onRequestDeleteModule(module)}
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
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            title="Back"
          >
            <span className="material-symbols-outlined text-xl">
              arrow_back
            </span>
          </button>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Settings
          </h1>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Manage modules & languages
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-[#0b1219]">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                    Modules
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Rename modules or delete them.
                  </p>
                </div>

                <button
                  onClick={onAddModule}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-primary dark:hover:border-primary hover:text-primary transition-all"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add Module
                </button>
              </div>
            </div>

            {editableModules.length === 0 ? (
              <div className="p-6 text-sm text-slate-500 dark:text-slate-400">
                No modules found.
              </div>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                {editableModules.map((module) => (
                  <ModuleRow
                    key={`${module.id}:${module.name}`}
                    module={module}
                  />
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                    Languages
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Add or delete languages you no longer need.
                  </p>
                </div>

                <button
                  onClick={onAddLanguage}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-primary dark:hover:border-primary hover:text-primary transition-all"
                >
                  <span className="material-symbols-outlined text-sm">
                    language
                  </span>
                  Add Language
                </button>
              </div>
            </div>

            {languages.length === 0 ? (
              <div className="p-6 text-sm text-slate-500 dark:text-slate-400">
                No languages found.
              </div>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                {languages.map((language) => (
                  <li
                    key={language.code}
                    className="group flex items-center justify-between gap-3 px-6 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-primary">
                          {language.code}
                        </span>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                          {language.name}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onRequestDeleteLanguage(language)}
                      className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                      title="Delete language"
                    >
                      <span className="material-symbols-outlined text-lg">
                        delete
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
