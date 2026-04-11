import { useEffect, useState } from "react";
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

  const [tablesNotReady, setTablesNotReady] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([fetchModules(), fetchLanguages()]);
      await fetchTranslations();

      const { error: initError } = useTranslationStore.getState();
      setTablesNotReady(!!initError);
    };

    initializeData();
  }, [fetchTranslations, fetchLanguages, fetchModules]);

  return {
    translations,
    modules,
    languages,
    isLoading: isLoadingTranslations || isLoadingModules || isLoadingLanguages,
    error,
    tablesNotReady,
  };
}
