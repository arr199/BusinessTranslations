import React from "react";
import type { Module } from "../types";

interface ModulesSidebarProps {
  modules: Module[];
  progress?: number;
}

export const ModulesSidebar: React.FC<ModulesSidebarProps> = ({
  modules,
  progress = 0,
}) => {
  return (
    <aside className="w-60 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0">
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Modules
        </span>
        <button
          className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          title="Manage Modules"
        >
          <span className="material-symbols-outlined text-sm">settings</span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {modules.map((module) => (
            <li key={module.id}>
              <a
                className={`flex items-center gap-3 px-6 py-2 text-sm font-medium transition-colors ${
                  module.isActive
                    ? "text-primary bg-primary/5 border-r-2 border-primary"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
                href="#"
              >
                <span className="material-symbols-outlined text-lg">
                  {module.icon}
                </span>
                {module.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {progress > 0 && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Translation Progress
              </span>
              <span className="text-[10px] font-bold text-primary">
                {progress}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
