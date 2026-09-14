import { create } from "zustand";
import type { Translation, UiLanguage } from "../../domain/types";
import type { Module } from "../../domain/types";
import { translationsDataSource } from "../../data/datasource/translation-datasource";
import { modulesDataSource } from "../../data/datasource/module-datasource";
import { languagesDataSource } from "../../data/datasource/language-datasource";

export const useTranslationStore = create<TranslationStore>((set) => ({
  // Initial state
  translations: [],
  totalCount: 0,
  modules: [],
  languages: [],
  searchValue: "",
  selectedLanguage: "all",
  selectedModule: "all",
  currentPage: 1,
  itemsPerPage: 50,
  selectedIds: new Set<string>(),
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

      const result = await translationsDataSource.getAll({
        moduleId,
        languageId,
        keywords: state.searchValue,
        limit: state.itemsPerPage,
        offset: (state.currentPage - 1) * state.itemsPerPage,
      });
      set({
        translations: result.items,
        totalCount: result.totalCount,
        isLoadingTranslations: false,
      });
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
      await translationsDataSource.create(translation);
      await useTranslationStore.getState().fetchTranslations();
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

  updateTranslation: async (id, value, status) => {
    set({ error: null });
    try {
      await translationsDataSource.update(id, value, status);
      set((state) => ({
        translations: state.translations.map((t) =>
          t.id === id ? { ...t, value, ...(status && { status }) } : t,
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

  bulkDeleteTranslations: async (ids) => {
    set({ error: null });
    try {
      await translationsDataSource.bulkDelete(ids);
      set((state) => ({
        translations: state.translations.filter((t) => !ids.includes(t.id)),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete translations",
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
      await modulesDataSource.create(module);
      await useTranslationStore.getState().fetchModules();
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
      await modulesDataSource.update(id, module);
      await useTranslationStore.getState().fetchModules();
      await useTranslationStore.getState().fetchTranslations();
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
      await languagesDataSource.create(language);
      await useTranslationStore.getState().fetchLanguages();
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to create language",
      });
      throw error;
    }
  },

  deleteLanguage: async (id) => {
    set({ error: null });
    try {
      await languagesDataSource.delete(id);
      set({ selectedLanguage: "all", currentPage: 1 });
      await useTranslationStore.getState().fetchLanguages();
      await useTranslationStore.getState().fetchTranslations();
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete language",
      });
      throw error;
    }
  },

  // Filters
  setSearchValue: (searchValue) => set({ searchValue, selectedIds: new Set() }),
  setSelectedLanguage: (selectedLanguage) =>
    set({ selectedLanguage, selectedIds: new Set() }),
  setSelectedModule: (selectedModule) =>
    set({ selectedModule, selectedIds: new Set() }),
  setCurrentPage: (currentPage) => set({ currentPage, selectedIds: new Set() }),
  setItemsPerPage: (itemsPerPage) =>
    set({ itemsPerPage, selectedIds: new Set() }),

  // Bulk selection
  toggleRowSelection: (id, selected) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      if (selected) next.add(id);
      else next.delete(id);
      return { selectedIds: next };
    }),
  selectAllRows: (ids) => set({ selectedIds: new Set(ids) }),
  clearSelection: () => set({ selectedIds: new Set() }),

  clearError: () => set({ error: null }),
}));

// TYPES

interface TranslationStore {
  // State
  translations: Translation[];
  totalCount: number;
  modules: Module[];
  languages: UiLanguage[];
  searchValue: string;
  selectedLanguage: string;
  selectedModule: string;
  currentPage: number;
  itemsPerPage: number;
  selectedIds: Set<string>;

  // Loading states
  isLoadingTranslations: boolean;
  isLoadingModules: boolean;
  isLoadingLanguages: boolean;

  // Error states
  error: string | null;

  // Translation actions
  fetchTranslations: () => Promise<void>;
  createTranslation: (translation: Omit<Translation, "id">) => Promise<void>;
  updateTranslation: (
    id: string,
    value: string,
    status?: Translation["status"],
  ) => Promise<void>;
  deleteTranslation: (id: string) => Promise<void>;
  bulkDeleteTranslations: (ids: string[]) => Promise<void>;

  // Module actions
  fetchModules: () => Promise<void>;
  createModule: (module: Omit<Module, "id">) => Promise<void>;
  updateModule: (id: string, module: Partial<Module>) => Promise<void>;
  deleteModule: (id: string) => Promise<void>;

  // Language actions
  fetchLanguages: () => Promise<void>;
  createLanguage: (language: { code: string; name: string }) => Promise<void>;
  deleteLanguage: (id: string) => Promise<void>;

  // Filter actions
  setSearchValue: (value: string) => void;
  setSelectedLanguage: (language: string) => void;
  setSelectedModule: (module: string) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;

  // Bulk selection actions
  toggleRowSelection: (id: string, selected: boolean) => void;
  selectAllRows: (ids: string[]) => void;
  clearSelection: () => void;

  // Clear error
  clearError: () => void;
}
