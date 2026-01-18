import { useState, useEffect } from "react";

/**
 * Custom hook for managing dark mode state
 * - Reads from localStorage
 * - Falls back to system preference
 * - Saves preference to localStorage
 * - Applies 'dark' class to document element
 *
 * @returns [isDarkMode, toggleDarkMode]
 */
export const useDarkMode = (): [boolean, () => void] => {
  // Initialize dark mode from localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Check localStorage first
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) {
      const isDark = stored === "true";
      // Apply immediately on init
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return isDark;
    }

    // Fall back to system preference
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    }
    return prefersDark;
  });

  // Sync state changes with DOM and localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", String(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return [isDarkMode, toggleDarkMode];
};
