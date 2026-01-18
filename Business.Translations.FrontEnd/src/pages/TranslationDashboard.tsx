import React, { useState } from "react";
import {
  Sidebar,
  ModulesSidebar,
  Header,
  FilterBar,
  TranslationTable,
  Footer,
  DeleteConfirmModal,
  NewTranslationModal,
  NewLanguageModal,
  NewModuleModal,
  DatabaseSchemaModal,
  TableSkeleton,
  ErrorBanner,
} from "../components";
import { useDarkMode } from "../hooks/useDarkMode";
import { useTranslationStore } from "../store/translationStore";
import { useInitializeData } from "../hooks/useInitializeData";
import { SAMPLE_MODULES } from "../data/sampleData";

export const TranslationDashboard: React.FC = () => {
  const [isDarkMode, toggleDarkMode] = useDarkMode();

  // Modal states
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    key: string;
  }>({
    isOpen: false,
    id: "",
    key: "",
  });
  const [isNewTranslationOpen, setIsNewTranslationOpen] = useState(false);
  const [isNewLanguageOpen, setIsNewLanguageOpen] = useState(false);
  const [isNewModuleOpen, setIsNewModuleOpen] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(true);

  // Initialize data from API or mock
  const {
    modules: storeModules,
    languages: storeLanguages,
    isLoading,
    error,
  } = useInitializeData();

  const {
    translations,
    searchValue,
    selectedLanguage,
    selectedModule,
    currentPage,
    itemsPerPage,
    updateTranslation,
    deleteTranslation,
    createTranslation,
    createModule,
    createLanguage,
    setSearchValue,
    setSelectedLanguage,
    setSelectedModule,
    setCurrentPage,
    setItemsPerPage,
    clearError,
  } = useTranslationStore();

  // Modal handlers
  const handleDelete = (id: string, key: string) => {
    setDeleteModal({ isOpen: true, id, key });
  };

  const confirmDelete = async () => {
    try {
      await deleteTranslation(deleteModal.id);
      setDeleteModal({ isOpen: false, id: "", key: "" });
    } catch (error) {
      console.error("Failed to delete translation:", error);
    }
  };

  const handleCreateTranslation = async (data: {
    module: string;
    key: string;
    language: string;
    languageCode: string;
    value: string;
  }) => {
    try {
      await createTranslation({
        module: data.module,
        key: data.key,
        language: data.language,
        languageCode: data.languageCode,
        value: data.value,
        status: "pending",
      });
      setIsNewTranslationOpen(false);
    } catch (error) {
      console.error("Failed to create translation:", error);
    }
  };

  const handleCreateLanguage = async (data: { code: string; name: string }) => {
    try {
      await createLanguage({
        code: data.code,
        name: data.name,
      });
      setIsNewLanguageOpen(false);
    } catch (error) {
      console.error("Failed to create language:", error);
    }
  };

  const handleCreateModule = async (data: { name: string; icon: string }) => {
    try {
      await createModule({
        name: data.name,
        icon: data.icon,
        isActive: false,
      });
      setIsNewModuleOpen(false);
    } catch (error) {
      console.error("Failed to create module:", error);
    }
  };

  // Filter options for dropdowns
  const moduleFilterOptions = storeModules
    .filter((m) => m.name !== "All Modules")
    .map((m) => ({ value: m.name, label: m.name }));

  const languageFilterOptions = storeLanguages.map((l) => ({
    value: l.code,
    label: l.name,
  }));

  // Dropdown options for modals (use store or fallback to SAMPLE_MODULES)
  const moduleOptions = (
    storeModules.length > 0 ? storeModules : SAMPLE_MODULES
  ).map((m) => ({
    value: m.id || m.name,
    label: m.name,
  }));
  const languageOptions = storeLanguages.map((l) => ({
    value: l.code,
    label: l.name,
  }));

  // Get filtered translations (computed in component for reactivity)
  const filteredTranslations = React.useMemo(() => {
    let filtered = translations;

    // Filter by search
    if (searchValue) {
      const search = searchValue.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.key.toLowerCase().includes(search) ||
          t.value.toLowerCase().includes(search),
      );
    }

    // Filter by language
    if (selectedLanguage !== "all") {
      filtered = filtered.filter((t) => t.languageCode === selectedLanguage);
    }

    // Filter by module
    if (selectedModule !== "all") {
      filtered = filtered.filter((t) => t.module === selectedModule);
    }

    return filtered;
  }, [translations, searchValue, selectedLanguage, selectedModule]);

  return (
    <div className="bg-slate-50 dark:bg-[#0b1219] text-slate-900 dark:text-slate-100 min-h-screen flex overflow-hidden">
      <Sidebar userImageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuCkqZqUPgAIcZ6ukMm6kXpj8S4eiJe9hBd7Oiu2-kdV1blhedrK0EC_Kol1us9gGdnbkG7FdcBRX2iLQc3_l9GOj5csKiTlnHEEa0UjfYjaVYpBRbLJkXKyE78FPT5UDjbvo862K8-LhAPXrTTl6ZP_C-MNw9bYr-o66pafejwbSERScyTu3xC13nSwZb4nHDeWMHbCx8Ko-CtI8yhY-89AXxsVjkNESjJsPO7FZIYPCQBg0qnfpoLXWjiXFw_lug6OYcx75V0_UeSH" />

      <ModulesSidebar modules={SAMPLE_MODULES} progress={82} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          title="Translations"
          version="v2.4.0-stable"
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          onAddLanguage={() => setIsNewLanguageOpen(true)}
          onAddModule={() => setIsNewModuleOpen(true)}
          onAddKey={() => setIsNewTranslationOpen(true)}
        />

        <FilterBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          selectedModule={selectedModule}
          onModuleChange={setSelectedModule}
          languages={languageFilterOptions}
          modules={moduleFilterOptions}
          onExport={() => console.log("Export")}
          onRefresh={() => console.log("Refresh")}
          onFilter={() => console.log("Filter")}
        />

        {error && <ErrorBanner message={error} onDismiss={clearError} />}

        {isLoading ? (
          <TableSkeleton />
        ) : (
          <TranslationTable
            translations={filteredTranslations}
            onEdit={updateTranslation}
            onDelete={handleDelete}
          />
        )}

        <Footer
          currentPage={currentPage}
          totalItems={1248}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </main>

      {/* Modals */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: "", key: "" })}
        onConfirm={confirmDelete}
        itemName={deleteModal.key}
      />

      <NewTranslationModal
        isOpen={isNewTranslationOpen}
        onClose={() => setIsNewTranslationOpen(false)}
        onSave={handleCreateTranslation}
        modules={moduleOptions}
        languages={languageOptions}
      />

      <NewLanguageModal
        isOpen={isNewLanguageOpen}
        onClose={() => setIsNewLanguageOpen(false)}
        onSave={handleCreateLanguage}
      />

      <NewModuleModal
        isOpen={isNewModuleOpen}
        onClose={() => setIsNewModuleOpen(false)}
        onSave={handleCreateModule}
      />

      <DatabaseSchemaModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
        onRunMigration={() => {
          console.log("Run migration");
          setIsSchemaModalOpen(false);
        }}
      />
    </div>
  );
};
