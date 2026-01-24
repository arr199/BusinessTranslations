import { useEffect } from "react";
import { useTranslationStore } from "../store/translationStore";
import {
  SAMPLE_TRANSLATIONS,
  SAMPLE_MODULES,
  SAMPLE_LANGUAGES,
} from "../data/sampleData";

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === "true";

export function useInitializeData() {
  const {
    fetchTranslations,
    fetchModules,
    fetchLanguages,
    translations,
    modules,
    languages,
    isLoadingTranslations,
    isLoadingModules,
    isLoadingLanguages,
    error,
  } = useTranslationStore();

  useEffect(() => {
    const initializeData = async () => {
      if (USE_MOCK_DATA) {
        // Use mock data for development
        useTranslationStore.setState({
          translations: SAMPLE_TRANSLATIONS,
          modules: SAMPLE_MODULES,
          languages: SAMPLE_LANGUAGES,
        });
      } else {
        // Fetch from API
        await Promise.all([
          fetchTranslations(),
          fetchModules(),
          fetchLanguages(),
        ]);
      }
    };

    initializeData();
  }, [fetchTranslations, fetchModules, fetchLanguages]);

  return {
    translations,
    modules,
    languages,
    isLoading: isLoadingTranslations || isLoadingModules || isLoadingLanguages,
    error,
  };
}
