import React from "react";
import { Header } from "../components";
import { useDarkMode } from "../hooks/useDarkMode";

/**
 * Simple example showing how to use individual components
 */
export const SimpleExample: React.FC = () => {
  const [isDarkMode, toggleDarkMode] = useDarkMode();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header
        title="My Custom Page"
        version="v1.0.0"
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onAddLanguage={() => alert("Add Language clicked")}
        onAddModule={() => alert("Add Module clicked")}
        onAddKey={() => alert("Add Key clicked")}
      />

      <main className="p-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
          Welcome!
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          This is a simple example showing how to use individual components.
          Check the source code to see how easy it is!
        </p>
        <p className="text-slate-600 dark:text-slate-300 mt-4">
          Current mode: <strong>{isDarkMode ? "Dark" : "Light"}</strong>
        </p>
      </main>
    </div>
  );
};
