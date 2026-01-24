interface SidebarProps {
  activeView?: "dashboard" | "settings";
  onOpenDashboard?: () => void;
  onOpenSettings?: () => void;
}

export function Sidebar({
  activeView = "dashboard",
  onOpenDashboard,
  onOpenSettings,
}: SidebarProps) {
  return (
    <aside className="w-16 flex flex-col items-center py-6 gap-8 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-30 shrink-0">
      <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white">
        <span className="material-symbols-outlined">translate</span>
      </div>

      <nav className="flex flex-col gap-4">
        <button
          type="button"
          onClick={onOpenDashboard}
          className={`p-3 rounded-lg transition-all duration-200 hover:bg-primary/10 ${
            activeView === "dashboard"
              ? "text-primary bg-primary/10"
              : "text-slate-400 hover:text-primary"
          }`}
          title="Projects"
        >
          <span className="material-symbols-outlined">folder</span>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className={`p-3 rounded-lg transition-all duration-200 hover:bg-primary/10 ${
            activeView === "settings"
              ? "text-primary bg-primary/10"
              : "text-slate-400 hover:text-primary"
          }`}
          title="Settings"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
      </nav>
    </aside>
  );
}
