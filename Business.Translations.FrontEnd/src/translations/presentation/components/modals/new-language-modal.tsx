import { useState, type FormEvent } from "react";
import { Modal } from "./modal";

interface NewLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { code: string; name: string }) => void;
}

export function NewLanguageModal({
  isOpen,
  onClose,
  onSave,
}: NewLanguageModalProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ code: "", name: "" });
    onClose();
  };

  const isValid = formData.code && formData.name;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Language">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Language Code
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value.toUpperCase() })
            }
            placeholder="e.g., EN, ES, FR"
            maxLength={3}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none uppercase"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            2-3 letter ISO code
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Language Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., English, Spanish, French"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
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
            Add Language
          </button>
        </div>
      </form>
    </Modal>
  );
}
