import { create } from "zustand";
import type { Translation } from "../types";
import { translationsApi, modulesApi, languagesApi } from "../services/api";
import type { Language } from "../data/sampleData";
import type { Module } from "../types";

interface TranslationStore {
  // State
  translations: Translation[];
  modules: Module[];
  languages: Language[];
  searchValue: string;
  selectedLanguage: string;
  selectedModule: string;
  currentPage: number;
  itemsPerPage: number;

  // Loading states
  isLoadingTranslations: boolean;
  isLoadingModules: boolean;
  isLoadingLanguages: boolean;

  // Error states
  error: string | null;

  // Translation actions
  fetchTranslations: () => Promise<void>;
  createTranslation: (translation: Omit<Translation, "id">) => Promise<void>;
  updateTranslation: (id: string, value: string) => Promise<void>;
  deleteTranslation: (id: string) => Promise<void>;

  // Module actions
  fetchModules: () => Promise<void>;
  createModule: (module: Omit<Module, "id">) => Promise<void>;

  // Language actions
  fetchLanguages: () => Promise<void>;
  createLanguage: (language: Language) => Promise<void>;

  // Filter actions
  setSearchValue: (value: string) => void;
  setSelectedLanguage: (language: string) => void;
  setSelectedModule: (module: string) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;

  // Clear error
  clearError: () => void;
}

export const useTranslationStore = create<TranslationStore>((set) => ({
  // Initial state
  translations: [],
  modules: [],
  languages: [],
  searchValue: "",
  selectedLanguage: "all",
  selectedModule: "all",
  currentPage: 1,
  itemsPerPage: 50,
  isLoadingTranslations: false,
  isLoadingModules: false,
  isLoadingLanguages: false,
  error: null,

  // Translations
  fetchTranslations: async () => {
    set({ isLoadingTranslations: true, error: null });
    try {
      const translations = await translationsApi.getAll();
      set({ translations, isLoadingTranslations: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch translations",
        isLoadingTranslations: false,
      });
    }
  },

  createTranslation: async (translation) => {
    set({ error: null });
    try {
      const newTranslation = await translationsApi.create(translation);
      set((state) => ({
        translations: [...state.translations, newTranslation],
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to create translation",
      });
      throw error;
    }
  },

  updateTranslation: async (id, value) => {
    set({ error: null });
    try {
      const updated = await translationsApi.update(id, value);
      set((state) => ({
        translations: state.translations.map((t) =>
          t.id === id ? updated : t,
        ),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to update translation",
      });
      throw error;
    }
  },

  deleteTranslation: async (id) => {
    set({ error: null });
    try {
      await translationsApi.delete(id);
      set((state) => ({
        translations: state.translations.filter((t) => t.id !== id),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete translation",
      });
      throw error;
    }
  },

  // Modules
  fetchModules: async () => {
    set({ isLoadingModules: true, error: null });
    try {
      const modules = await modulesApi.getAll();
      set({ modules, isLoadingModules: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch modules",
        isLoadingModules: false,
      });
    }
  },

  createModule: async (module) => {
    set({ error: null });
    try {
      const newModule = await modulesApi.create(module);
      set((state) => ({
        modules: [...state.modules, newModule],
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to create module",
      });
      throw error;
    }
  },

  // Languages
  fetchLanguages: async () => {
    set({ isLoadingLanguages: true, error: null });
    try {
      const languages = await languagesApi.getAll();
      set({ languages, isLoadingLanguages: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch languages",
        isLoadingLanguages: false,
      });
    }
  },

  createLanguage: async (language) => {
    set({ error: null });
    try {
      const newLanguage = await languagesApi.create(language);
      set((state) => ({
        languages: [...state.languages, newLanguage],
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to create language",
      });
      throw error;
    }
  },

  // Filters
  setSearchValue: (searchValue) => set({ searchValue }),
  setSelectedLanguage: (selectedLanguage) => set({ selectedLanguage }),
  setSelectedModule: (selectedModule) => set({ selectedModule }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setItemsPerPage: (itemsPerPage) => set({ itemsPerPage }),

  clearError: () => set({ error: null }),
}));
