import React from "react";

interface HeaderProps {
  title: string;
  version?: string;
  onAddLanguage?: () => void;
  onAddModule?: () => void;
  onAddKey?: () => void;
  onToggleDarkMode?: () => void;
  isDarkMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  version,
  onAddLanguage,
  onAddModule,
  onAddKey,
  onToggleDarkMode,
  isDarkMode = false,
}) => {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8 shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        {version && (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary uppercase">
            {version}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onAddLanguage}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">language</span>
          Add Language
        </button>

        <button
          onClick={onAddModule}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">extension</span>
          Add Module
        </button>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

        <button
          onClick={onAddKey}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm shadow-primary/20"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add New Key
        </button>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-transparent"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? (
            <span className="material-symbols-outlined text-amber-400">
              light_mode
            </span>
          ) : (
            <span className="material-symbols-outlined text-slate-600">
              dark_mode
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
