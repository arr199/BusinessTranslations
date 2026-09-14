import { useEffect, useRef, useState } from "react";
import {
  Sidebar,
  ModulesSidebar,
  Header,
  FilterBar,
  TranslationTable,
  Footer,
  SelectionBar,
  DeleteConfirmModal,
  ConfirmNameModal,
  NewTranslationModal,
  NewLanguageModal,
  NewModuleModal,
  DatabaseSchemaModal,
  ErrorBanner,
} from "../components";
import { useDarkMode } from "../hooks/use-dark-mode";
import { useTranslationStore } from "../stateManagement/translation-store";
import { useInitializeData } from "../hooks/use-Initialize-data";
import { runMigration } from "../../data/migration-service";
import { SettingsPage } from "./settings-page";
import { ToastContainer, toast } from "../components/toast";
import type { Translation } from "../../domain/types";
import {
  exportTranslationsCsv,
  parseCsvFile,
} from "../../data/datasource/csv-service";

export function TranslationDashboard() {
  const [isDarkMode, toggleDarkMode] = useDarkMode();

  const [activeView, setActiveView] = useState<"dashboard" | "settings">(() =>
    window.location.hash === "#settings" ? "settings" : "dashboard",
  );

  useEffect(() => {
    function onHashChange() {
      setActiveView(
        window.location.hash === "#settings" ? "settings" : "dashboard",
      );
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

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
    id: string;
    name: string;
  }>({ isOpen: false, id: "", name: "" });

  // Initialize data from API
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
    bulkDeleteTranslations,
    createTranslation,
    createModule,
    createLanguage,
    updateModule,
    deleteModule,
    deleteLanguage,
    setSelectedModule,
    clearError,
  } = useTranslationStore();

  // Debounced fetch on filter/pagination change
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

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function handleSelectRow(id: string, selected: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleSelectAll(selected: boolean) {
    if (selected) {
      setSelectedIds(new Set(translations.map((t) => t.id)));
    } else {
      setSelectedIds(new Set());
    }
  }

  async function handleBulkDelete() {
    setBulkDeleteModal(true);
  }

  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);

  async function confirmBulkDelete() {
    const ids = [...selectedIds];
    setBulkDeleteModal(false);
    try {
      await bulkDeleteTranslations(ids);
      setSelectedIds(new Set());
      toast.success(`${ids.length} translation(s) deleted.`);
    } catch {
      toast.error("Failed to delete translations.");
    }
  }

  // CSV Export / Import
  function handleExport() {
    if (translations.length === 0) {
      toast.error("No translations to export.");
      return;
    }
    exportTranslationsCsv(translations);
    toast.success("CSV exported.");
  }

  async function handleImport(file: File) {
    try {
      const rows = await parseCsvFile(file);
      let created = 0;

      for (const row of rows) {
        const mod = storeModules.find(
          (m) => m.name.toLowerCase() === row.module.toLowerCase(),
        );
        const lang = storeLanguages.find(
          (l) => l.code.toLowerCase() === row.languageCode.toLowerCase(),
        );

        if (!mod || !lang) continue;

        await createTranslation({
          moduleId: mod.id,
          languageId: lang.id,
          module: mod.name,
          language: lang.name,
          languageCode: lang.code,
          keyName: row.keyName,
          value: row.value,
          status: "pending",
        });
        created++;
      }

      toast.success(`Imported ${created} translation(s).`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed.");
    }
  }

  // Navigation
  function openSettings() {
    window.location.hash = "settings";
  }

  function backToDashboard() {
    history.replaceState(null, "", window.location.pathname);
    setActiveView("dashboard");
  }

  function handleSelectModule(module: string) {
    setSelectedModule(module);
    if (activeView === "settings") backToDashboard();
  }

  // CRUD handlers with toast feedback
  async function handleEdit(id: string, value: string) {
    try {
      await updateTranslation(id, value);
      toast.success("Translation updated.");
    } catch {
      toast.error("Failed to update translation.");
    }
  }

  function handleDelete(id: string, key: string) {
    setDeleteModal({ isOpen: true, id, key });
  }

  async function confirmDelete() {
    try {
      await deleteTranslation(deleteModal.id);
      setDeleteModal({ isOpen: false, id: "", key: "" });
      toast.success("Translation deleted.");
    } catch {
      toast.error("Failed to delete translation.");
    }
  }

  async function confirmDeleteModule() {
    try {
      await deleteModule(deleteModuleModal.id);
      setDeleteModuleModal({ isOpen: false, id: "", name: "" });
      toast.success("Module deleted.");
    } catch {
      toast.error("Failed to delete module.");
    }
  }

  async function confirmDeleteLanguage() {
    try {
      await deleteLanguage(deleteLanguageModal.id);
      setDeleteLanguageModal({ isOpen: false, id: "", name: "" });
      toast.success("Language deleted.");
    } catch {
      toast.error("Failed to delete language.");
    }
  }

  async function handleCreateTranslation(data: Translation) {
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
      toast.success("Translation created.");
    } catch {
      toast.error("Failed to create translation.");
    }
  }

  async function handleCreateLanguage(data: { code: string; name: string }) {
    try {
      await createLanguage({
        code: data.code,
        name: data.name,
      });
      setIsNewLanguageOpen(false);
      toast.success(`Language "${data.name}" added.`);
    } catch {
      toast.error("Failed to create language.");
    }
  }

  async function handleCreateModule(data: { name: string; icon: string }) {
    try {
      await createModule({
        name: data.name,
        icon: data.icon,
        isActive: false,
      });
      setIsNewModuleOpen(false);
      toast.success(`Module "${data.name}" created.`);
    } catch {
      toast.error("Failed to create module.");
    }
  }

  async function handleRunMigration() {
    try {
      const result = await runMigration("/bt");

      if (result.success) {
        setIsSchemaModalOpen(false);
        await Promise.all([fetchModules(), fetchLanguages()]);
        await fetchTranslations();
        toast.success("Database tables created successfully.");
      } else {
        toast.error(`Migration failed: ${result.message}`);
      }
    } catch {
      toast.error("Migration failed. Check console for details.");
    }
  }

  // Derived data for modals and sidebar
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

  const hasActiveFilters =
    searchValue !== "" ||
    selectedLanguage !== "all" ||
    selectedModule !== "all";

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

          <FilterBar onExport={handleExport} onImport={handleImport} />

          {error && <ErrorBanner message={error} onDismiss={clearError} />}

          <TranslationTable
            translations={translations}
            hasActiveFilters={hasActiveFilters}
            isLoading={isLoading}
            selectedIds={selectedIds}
            onSelectRow={handleSelectRow}
            onSelectAll={handleSelectAll}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddTranslation={() => setIsNewTranslationOpen(true)}
          />

          <Footer />

          <SelectionBar
            count={selectedIds.size}
            onDelete={handleBulkDelete}
            onClear={() => handleSelectAll(false)}
          />
        </main>
      ) : (
        <SettingsPage
          modules={storeModules}
          languages={storeLanguages}
          onBack={backToDashboard}
          onAddModule={() => setIsNewModuleOpen(true)}
          onAddLanguage={() => setIsNewLanguageOpen(true)}
          onUpdateModule={async (moduleId, data) => {
            try {
              await updateModule(moduleId, data);
              toast.success("Module updated.");
            } catch {
              toast.error("Failed to update module.");
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
              id: language.id,
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
          setDeleteLanguageModal({ isOpen: false, id: "", name: "" })
        }
        onConfirm={confirmDeleteLanguage}
        itemName={deleteLanguageModal.name}
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

      <DeleteConfirmModal
        isOpen={bulkDeleteModal}
        onClose={() => setBulkDeleteModal(false)}
        onConfirm={confirmBulkDelete}
        itemName={`${selectedIds.size} translation(s)`}
        title="Delete Selected Translations"
        prompt={`Are you sure you want to delete ${selectedIds.size} selected translation(s)?`}
      />

      <ToastContainer />
    </div>
  );
}
