import { useState, useRef, useEffect } from "react";
import { useTranslationStore } from "../stateManagement/translation-store";

interface FilterBarProps {
  onExport?: () => void;
}

export function FilterBar({ onExport }: FilterBarProps) {
  const {
    searchValue,
    setSearchValue,
    selectedLanguage,
    setSelectedLanguage,
    selectedModule,
    setSelectedModule,
    modules,
    languages,
    fetchTranslations,
  } = useTranslationStore();

  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isModuleOpen, setIsModuleOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement>(null);
  const moduleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        languageRef.current &&
        !languageRef.current.contains(event.target as Node)
      ) {
        setIsLanguageOpen(false);
      }
      if (
        moduleRef.current &&
        !moduleRef.current.contains(event.target as Node)
      ) {
        setIsModuleOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function getLanguageLabel() {
    if (selectedLanguage === "all") return "All";
    return languages.find((l) => l.code === selectedLanguage)?.name || "All";
  }

  function getModuleLabel() {
    if (selectedModule === "all") return "All";
    return modules.find((m) => m.name === selectedModule)?.name || "All";
  }

  return (
    <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-3 flex items-center gap-4 flex-wrap shrink-0">
      <div className="relative flex-1 max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg leading-none">
          search
        </span>
        <input
          className="w-full pl-10 pr-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
          placeholder="Search by key or value..."
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        {/* Language Dropdown */}
        <div className="relative" ref={languageRef}>
          <button
            onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-slate-100 dark:bg-slate-800 pl-4 pr-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <p className="text-slate-700 dark:text-slate-300 text-xs font-medium">
              Language: {getLanguageLabel()}
            </p>
            <span className="material-symbols-outlined text-slate-400 text-sm">
              expand_more
            </span>
          </button>

          {isLanguageOpen && (
            <div className="absolute top-full mt-1 left-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 min-w-[160px] max-h-64 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedLanguage("all");
                  setIsLanguageOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                  selectedLanguage === "all"
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                All Languages
              </button>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLanguage(lang.code);
                    setIsLanguageOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                    selectedLanguage === lang.code
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Module Dropdown */}
        <div className="relative" ref={moduleRef}>
          <button
            onClick={() => setIsModuleOpen(!isModuleOpen)}
            className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-slate-100 dark:bg-slate-800 pl-4 pr-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <p className="text-slate-700 dark:text-slate-300 text-xs font-medium">
              Module: {getModuleLabel()}
            </p>
            <span className="material-symbols-outlined text-slate-400 text-sm">
              expand_more
            </span>
          </button>

          {isModuleOpen && (
            <div className="absolute top-full mt-1 left-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 min-w-[160px] max-h-64 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedModule("all");
                  setIsModuleOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                  selectedModule === "all"
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                All Modules
              </button>
              {modules.map((mod) => (
                <button
                  key={mod.name}
                  onClick={() => {
                    setSelectedModule(mod.name);
                    setIsModuleOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                    selectedModule === mod.name
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {mod.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">download</span>
          Export
        </button>

        <button
          onClick={() => fetchTranslations()}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">refresh</span>
        </button>
      </div>
    </section>
  );
}
