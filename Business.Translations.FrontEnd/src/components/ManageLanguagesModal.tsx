import type { UiLanguage } from "../types";
import { Modal } from "./Modal";

interface ManageLanguagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  languages: UiLanguage[];
  onDeleteLanguage: (language: UiLanguage) => void;
}

export function ManageLanguagesModal({
  isOpen,
  onClose,
  languages,
  onDeleteLanguage,
}: ManageLanguagesModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Languages">
      <div className="p-6">
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Delete languages you no longer need. This may also remove related
          translations.
        </p>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          {languages.length === 0 ? (
            <div className="p-4 text-sm text-slate-500 dark:text-slate-400">
              No languages found.
            </div>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {languages.map((language) => (
                <li
                  key={language.code}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-primary">
                        {language.code}
                      </span>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                        {language.name}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteLanguage(language)}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-red-400 transition-colors"
                    title="Delete language"
                  >
                    <span className="material-symbols-outlined text-lg">
                      delete
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
