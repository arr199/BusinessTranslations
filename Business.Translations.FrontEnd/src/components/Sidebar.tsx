import React from "react";

interface SidebarProps {
  userImageUrl?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ userImageUrl }) => {
  return (
    <aside className="w-16 flex flex-col items-center py-6 gap-8 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-30 shrink-0">
      <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white">
        <span className="material-symbols-outlined">translate</span>
      </div>

      <nav className="flex flex-col gap-4">
        <a
          className="p-3 rounded-lg text-primary bg-primary/10 transition-colors"
          href="#"
          title="Projects"
        >
          <span className="material-symbols-outlined">folder</span>
        </a>
        <a
          className="p-3 rounded-lg text-slate-400 hover:text-primary transition-colors"
          href="#"
          title="Dictionary"
        >
          <span className="material-symbols-outlined">book</span>
        </a>
        <a
          className="p-3 rounded-lg text-slate-400 hover:text-primary transition-colors"
          href="#"
          title="History"
        >
          <span className="material-symbols-outlined">history</span>
        </a>
        <a
          className="p-3 rounded-lg text-slate-400 hover:text-primary transition-colors"
          href="#"
          title="Users"
        >
          <span className="material-symbols-outlined">group</span>
        </a>
      </nav>

      <div className="mt-auto flex flex-col gap-4 items-center">
        <a
          className="p-3 rounded-lg text-slate-400 hover:text-primary transition-colors"
          href="#"
          title="Settings"
        >
          <span className="material-symbols-outlined">settings</span>
        </a>
        <div
          className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center border border-slate-300 dark:border-slate-600"
          style={
            userImageUrl ? { backgroundImage: `url("${userImageUrl}")` } : {}
          }
        />
      </div>
    </aside>
  );
};
