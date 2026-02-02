import { useState, type FormEvent } from "react";
import { Modal } from "./modal";
import { Dropdown } from "../dropdown";

interface NewTranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    module: string;
    key: string;
    language: string;
    languageCode: string;
    value: string;
  }) => void;
  modules: Array<{ value: string; label: string }>;
  languages: Array<{ value: string; label: string }>;
}

export function NewTranslationModal({
  isOpen,
  onClose,
  onSave,
  modules,
  languages,
}: NewTranslationModalProps) {
  const [formData, setFormData] = useState({
    module: "",
    key: "",
    language: "",
    languageCode: "",
    value: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({
      module: "",
      key: "",
      language: "",
      languageCode: "",
      value: "",
    });
    onClose();
  };

  const isValid = formData.module && formData.key && formData.language;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Translation">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Module
          </label>
          <Dropdown
            options={modules}
            value={formData.module}
            onChange={(value) => setFormData({ ...formData, module: value })}
            placeholder="Select module"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Translation Key
          </label>
          <input
            type="text"
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            placeholder="e.g., login_welcome_header"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Language
          </label>
          <Dropdown
            options={languages}
            value={formData.languageCode}
            onChange={(value) => {
              const selectedLang = languages.find((l) => l.value === value);
              setFormData({
                ...formData,
                languageCode: value,
                language: selectedLang?.label || value,
              });
            }}
            placeholder="Select language"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Translation Value
          </label>
          <textarea
            value={formData.value}
            onChange={(e) =>
              setFormData({ ...formData, value: e.target.value })
            }
            placeholder="Enter translation text..."
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
          />
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-primary hover:bg-primary/90 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Translation
          </button>
        </div>
      </form>
    </Modal>
  );
}
