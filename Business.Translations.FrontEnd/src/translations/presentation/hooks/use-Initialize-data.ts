import { useEffect } from "react";
import { useTranslationStore } from "../stateManagement/translation-store";

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
      await Promise.all([fetchModules(), fetchLanguages()]);
      await fetchTranslations();
    };

    initializeData();
  }, [fetchTranslations, fetchLanguages, fetchModules]);

  return {
    translations,
    modules,
    languages,
    isLoading: isLoadingTranslations || isLoadingModules || isLoadingLanguages,
    error,
  };
}
