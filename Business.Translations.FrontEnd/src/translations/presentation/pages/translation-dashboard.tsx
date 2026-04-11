import { useEffect, useRef, useState } from "react";
import {
  Sidebar,
  ModulesSidebar,
  Header,
  FilterBar,
  TranslationTable,
  Footer,
  DeleteConfirmModal,
  ConfirmNameModal,
  NewTranslationModal,
  NewLanguageModal,
  NewModuleModal,
  DatabaseSchemaModal,
  TableSkeleton,
  ErrorBanner,
} from "../components";
import { useDarkMode } from "../hooks/use-dark-mode";
import { useTranslationStore } from "../stateManagement/translation-store";
import { useInitializeData } from "../hooks/use-Initialize-data";
import { runMigration } from "../../data/migration-service";
import { SettingsPage } from "./settings-page";
import type { Translation } from "../../domain/types";

export function TranslationDashboard() {
  const [isDarkMode, toggleDarkMode] = useDarkMode();

  const [activeView, setActiveView] = useState<"dashboard" | "settings">(
    "dashboard",
  );

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
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [deleteModuleModal, setDeleteModuleModal] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
  }>({ isOpen: false, id: "", name: "" });
  const [deleteLanguageModal, setDeleteLanguageModal] = useState<{
    isOpen: boolean;
    code: string;
    name: string;
  }>({ isOpen: false, code: "", name: "" });

  // Initialize data from API or mock
  const {
    modules: storeModules,
    languages: storeLanguages,
    isLoading,
    error,
    tablesNotReady,
  } = useInitializeData();

  useEffect(() => {
    if (tablesNotReady) {
      setIsSchemaModalOpen(true);
    }
  }, [tablesNotReady]);

  const {
    translations,
    totalCount,
    fetchTranslations,
    fetchModules,
    fetchLanguages,
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
    updateModule,
    deleteModule,
    deleteLanguage,
    setSearchValue,
    setSelectedLanguage,
    setSelectedModule,
    setCurrentPage,
    setItemsPerPage,
    clearError,
  } = useTranslationStore();

  const didMountRef = useRef(false);
  const prevRef = useRef({
    searchValue,
    selectedLanguage,
    selectedModule,
    currentPage,
    itemsPerPage,
  });

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      prevRef.current = {
        searchValue,
        selectedLanguage,
        selectedModule,
        currentPage,
        itemsPerPage,
      };
      return;
    }

    const prev = prevRef.current;
    const searchChanged = prev.searchValue !== searchValue;
    const otherChanged =
      prev.selectedLanguage !== selectedLanguage ||
      prev.selectedModule !== selectedModule ||
      prev.currentPage !== currentPage ||
      prev.itemsPerPage !== itemsPerPage;

    prevRef.current = {
      searchValue,
      selectedLanguage,
      selectedModule,
      currentPage,
      itemsPerPage,
    };

    if (searchChanged && !otherChanged) {
      const timer = window.setTimeout(() => {
        fetchTranslations();
      }, 350);

      return () => window.clearTimeout(timer);
    }

    fetchTranslations();
  }, [
    searchValue,
    selectedLanguage,
    selectedModule,
    currentPage,
    itemsPerPage,
    fetchTranslations,
  ]);

  const openSettings = () => setActiveView("settings");
  const backToDashboard = () => setActiveView("dashboard");

  const handleSelectModule = (module: string) => {
    setSelectedModule(module);
    if (activeView === "settings") backToDashboard();
  };

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

  const confirmDeleteModule = async () => {
    try {
      await deleteModule(deleteModuleModal.id);
      setDeleteModuleModal({ isOpen: false, id: "", name: "" });
    } catch (error) {
      console.error("Failed to delete module:", error);
    }
  };

  const confirmDeleteLanguage = async () => {
    try {
      await deleteLanguage(deleteLanguageModal.code);
      setDeleteLanguageModal({ isOpen: false, code: "", name: "" });
    } catch (error) {
      console.error("Failed to delete language:", error);
    }
  };

  const handleCreateTranslation = async (data: Translation) => {
    try {
      await createTranslation({
        module: data.module,
        keyName: data.keyName,
        language: data.language,
        languageCode: data.languageCode,
        value: data.value,
        status: "pending",
        languageId: data.languageId,
        moduleId: data.moduleId,
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

  const handleRunMigration = async () => {
    try {
      const result = await runMigration("/bt");

      if (result.success) {
        setIsSchemaModalOpen(false);
        await Promise.all([fetchModules(), fetchLanguages()]);
        await fetchTranslations();
      } else {
        alert(`Migration failed: ${result.message}`);
      }
    } catch (error) {
      console.error("Migration error:", error);
      alert("Migration failed. Check console for details.");
    }
  };

  // Filter options for dropdowns
  const moduleFilterOptions = storeModules.map((m) => ({
    value: m.name,
    label: m.name,
  }));

  const languageFilterOptions = storeLanguages.map((l) => ({
    value: l.code,
    label: l.name,
  }));

  // Dropdown options for modals
  const moduleOptions = storeModules.map((m) => ({
    value: m.id,
    label: m.name,
  }));
  const languageOptions = storeLanguages.map((l) => ({
    value: l.id,
    label: l.name,
  }));

  const modulesWithAll = [
    { id: "all", name: "All Modules", icon: "apps" },
    ...storeModules,
  ];

  return (
    <div className="bg-slate-50 dark:bg-[#0b1219] text-slate-900 dark:text-slate-100 min-h-screen flex overflow-hidden">
      <Sidebar
        activeView={activeView}
        onOpenDashboard={backToDashboard}
        onOpenSettings={openSettings}
      />

      <ModulesSidebar
        modules={modulesWithAll}
        progress={82}
        onAddModule={() => setIsNewModuleOpen(true)}
        selectedModule={selectedModule}
        onSelectModule={handleSelectModule}
      />

      {activeView === "dashboard" ? (
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <Header
            title="Translations"
            version="v1.0.0"
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
            onAddLanguage={() => setIsNewLanguageOpen(true)}
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
            onRefresh={() => fetchTranslations()}
          />

          {error && <ErrorBanner message={error} onDismiss={clearError} />}

          {isLoading ? (
            <TableSkeleton />
          ) : (
            <TranslationTable
              translations={translations}
              onEdit={updateTranslation}
              onStatusChange={(id, status) => {
                const t = translations.find((t) => t.id === id);
                if (t) updateTranslation(id, t.value, status);
              }}
              onDelete={handleDelete}
            />
          )}

          <Footer
            currentPage={currentPage}
            totalItems={totalCount}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </main>
      ) : (
        <SettingsPage
          modules={storeModules}
          languages={storeLanguages}
          onBack={backToDashboard}
          onAddModule={() => setIsNewModuleOpen(true)}
          onAddLanguage={() => setIsNewLanguageOpen(true)}
          onRenameModule={async (moduleId, newName) => {
            try {
              await updateModule(moduleId, { name: newName });
            } catch (error) {
              console.error("Failed to update module:", error);
            }
          }}
          onRequestDeleteModule={(module) =>
            setDeleteModuleModal({
              isOpen: true,
              id: module.id,
              name: module.name,
            })
          }
          onRequestDeleteLanguage={(language) =>
            setDeleteLanguageModal({
              isOpen: true,
              code: language.code,
              name: language.name,
            })
          }
        />
      )}

      {/* Modals */}
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
        onRunMigration={handleRunMigration}
      />

      {/* Confirm modals last so they stack above other modals */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: "", key: "" })}
        onConfirm={confirmDelete}
        itemName={deleteModal.key}
      />

      <DeleteConfirmModal
        isOpen={deleteLanguageModal.isOpen}
        onClose={() =>
          setDeleteLanguageModal({ isOpen: false, code: "", name: "" })
        }
        onConfirm={confirmDeleteLanguage}
        itemName={`${deleteLanguageModal.code} — ${deleteLanguageModal.name}`}
        title="Delete Language"
        prompt="Are you sure you want to delete this language?"
      />

      <ConfirmNameModal
        isOpen={deleteModuleModal.isOpen}
        onClose={() =>
          setDeleteModuleModal({ isOpen: false, id: "", name: "" })
        }
        onConfirm={confirmDeleteModule}
        title="Delete Module"
        prompt="This will permanently delete the module and may remove related translations."
        requiredText={deleteModuleModal.name}
      />
    </div>
  );
}
