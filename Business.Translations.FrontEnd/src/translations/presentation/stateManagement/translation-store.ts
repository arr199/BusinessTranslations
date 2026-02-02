import { create } from "zustand";
import type { Translation, UiLanguage } from "../../domain/types";
import type { Module } from "../../domain/types";
import { translationsDataSource } from "../../data/datasource/translation-datasource";
import { modulesDataSource } from "../../data/datasource/module-datasource";
import { languagesDataSource } from "../../data/datasource/language-datasource";

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
      const state = useTranslationStore.getState();

      const moduleId =
        state.selectedModule !== "all"
          ? state.modules.find((m) => m.name === state.selectedModule)?.id
          : undefined;

      const languageId =
        state.selectedLanguage !== "all"
          ? state.languages.find((l) => l.code === state.selectedLanguage)?.id
          : undefined;

      const translations = await translationsDataSource.getAll({
        moduleId,
        languageId,
        keywords: state.searchValue,
        limit: state.itemsPerPage,
        offset: (state.currentPage - 1) * state.itemsPerPage,
      });
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
      const newTranslation = await translationsDataSource.create(translation);
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
      const updated = await translationsDataSource.update(id, value);
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
      await translationsDataSource.delete(id);
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
      const modules = await modulesDataSource.getAll();
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
      const newModule = await modulesDataSource.create(module);
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

  updateModule: async (id, module) => {
    set({ error: null });
    try {
      const existing = useTranslationStore
        .getState()
        .modules.find((m) => m.id === id);

      const updated = await modulesDataSource.update(id, module);

      set((state) => {
        const oldName = existing?.name;
        const newName = updated.name;

        return {
          modules: state.modules.map((m) => (m.id === id ? updated : m)),
          translations:
            oldName && newName && oldName !== newName
              ? state.translations.map((t) =>
                  t.module === oldName ? { ...t, module: newName } : t,
                )
              : state.translations,
          selectedModule:
            oldName && newName && state.selectedModule === oldName
              ? newName
              : state.selectedModule,
        };
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update module",
      });
      throw error;
    }
  },

  deleteModule: async (id) => {
    set({ error: null });
    try {
      const moduleToDelete = useTranslationStore
        .getState()
        .modules.find((m) => m.id === id);

      await modulesDataSource.delete(id);

      set((state) => {
        const deletedName = moduleToDelete?.name;

        return {
          modules: state.modules.filter((m) => m.id !== id),
          translations: deletedName
            ? state.translations.filter((t) => t.module !== deletedName)
            : state.translations,
          selectedModule:
            deletedName && state.selectedModule === deletedName
              ? "all"
              : state.selectedModule,
          currentPage: 1,
        };
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete module",
      });
      throw error;
    }
  },

  // Languages
  fetchLanguages: async () => {
    set({ isLoadingLanguages: true, error: null });
    try {
      const languages = await languagesDataSource.getAll();
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
      const newLanguage = await languagesDataSource.create(language);
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

  deleteLanguage: async (code) => {
    set({ error: null });
    try {
      await languagesDataSource.delete(code);

      set((state) => ({
        languages: state.languages.filter((l) => l.code !== code),
        translations: state.translations.filter((t) => t.languageCode !== code),
        selectedLanguage:
          state.selectedLanguage === code ? "all" : state.selectedLanguage,
        currentPage: 1,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete language",
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

// TYPES

interface TranslationStore {
  // State
  translations: Translation[];
  modules: Module[];
  languages: UiLanguage[];
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
  updateModule: (id: string, module: Partial<Module>) => Promise<void>;
  deleteModule: (id: string) => Promise<void>;

  // Language actions
  fetchLanguages: () => Promise<void>;
  createLanguage: (language: { code: string; name: string }) => Promise<void>;
  deleteLanguage: (code: string) => Promise<void>;

  // Filter actions
  setSearchValue: (value: string) => void;
  setSelectedLanguage: (language: string) => void;
  setSelectedModule: (module: string) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;

  // Clear error
  clearError: () => void;
}
