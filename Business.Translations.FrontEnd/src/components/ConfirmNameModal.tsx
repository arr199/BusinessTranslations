import { useEffect, useMemo, useState } from "react";
import { Modal } from "./Modal";

interface ConfirmNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  prompt: string;
  requiredText: string;
  confirmText?: string;
}

export function ConfirmNameModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  prompt,
  requiredText,
  confirmText = "Delete",
}: ConfirmNameModalProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (isOpen) setValue("");
  }, [isOpen]);

  const canConfirm = useMemo(() => {
    const typed = value.trim().toLowerCase();
    const required = requiredText.trim().toLowerCase();
    return typed.length > 0 && typed === required;
  }, [value, requiredText]);

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
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Type <span className="font-mono font-bold">{requiredText}</span>{" "}
              to confirm.
            </p>
          </div>
        </div>

        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={requiredText}
          className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
        />

        <div className="flex gap-3 justify-end pt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!canConfirm}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
