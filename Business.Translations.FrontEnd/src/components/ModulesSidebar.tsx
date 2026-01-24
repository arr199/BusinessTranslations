import type { Module } from "../types";

interface ModulesSidebarProps {
  modules: Module[];
  progress?: number;
  onAddModule?: () => void;
  selectedModule?: string;
  onSelectModule?: (module: string) => void;
}

export function ModulesSidebar({
  modules,
  onAddModule,
  selectedModule = "all",
  onSelectModule,
}: ModulesSidebarProps) {
  return (
    <aside className="w-60 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0">
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Modules
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {modules.map((module) => (
            <li key={module.id}>
              <div
                className={`flex items-center gap-2 pr-2 ${
                  (selectedModule === "all" && module.name === "All Modules") ||
                  selectedModule === module.name
                    ? "text-primary bg-primary/5 border-r-2 border-primary"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    onSelectModule?.(
                      module.name === "All Modules" ? "all" : module.name,
                    )
                  }
                  className="flex-1 flex items-center gap-3 px-6 py-2 text-sm font-medium transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-lg">
                    {module.icon}
                  </span>
                  {module.name}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={onAddModule}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-primary dark:hover:border-primary hover:text-primary transition-all duration-200"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Module
        </button>
      </div>
    </aside>
  );
}
