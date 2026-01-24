import { Modal } from "./Modal";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  title?: string;
  prompt?: string;
  confirmText?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  title = "Delete Translation",
  prompt = "Are you sure you want to delete this translation?",
  confirmText = "Delete",
}: DeleteConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl">
              warning
            </span>
          </div>
          <div className="flex-1">
            <p className="text-slate-700 dark:text-slate-300 mb-2">{prompt}</p>
            <code className="text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-primary">
              {itemName}
            </code>
          </div>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          This action cannot be undone.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
