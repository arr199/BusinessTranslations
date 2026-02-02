import { useState, type FormEvent } from "react";
import { Modal } from "./modal";

interface NewModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; icon: string }) => void;
}

export function NewModuleModal({
  isOpen,
  onClose,
  onSave,
}: NewModuleModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    icon: "extension",
  });

  const popularIcons = [
    "extension",
    "apps",
    "lock",
    "public",
    "dashboard",
    "settings",
    "mail",
    "shopping_cart",
    "receipt_long",
    "folder",
    "book",
    "language",
    "code",
    "database",
    "cloud",
    "storage",
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ name: "", icon: "extension" });
    onClose();
  };

  const isValid = formData.name;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Module">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Module Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Authentication, Billing"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Icon
          </label>
          <div className="grid grid-cols-8 gap-2 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 max-h-48 overflow-y-auto">
            {popularIcons.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setFormData({ ...formData, icon })}
                className={`p-2 rounded-lg transition-colors ${
                  formData.icon === icon
                    ? "bg-primary text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
                title={icon}
              >
                <span className="material-symbols-outlined text-xl">
                  {icon}
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Selected: {formData.icon}
          </p>
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
            Add Module
          </button>
        </div>
      </form>
    </Modal>
  );
}
