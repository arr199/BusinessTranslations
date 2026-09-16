import { useEffect } from "react";
import {
  useToastStore,
  type Toast,
  type ToastType,
} from "../stateManagement/toast-store";

const ICON: Record<ToastType, string> = {
  success: "check_circle",
  error: "error",
  info: "info",
};

const STYLE: Record<ToastType, string> = {
  success:
    "bg-emerald-50 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300",
  error:
    "bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300",
  info: "bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300",
};

function ToastItem({ t }: { t: Toast }) {
  const removeToast = useToastStore((s) => s.removeToast);

  useEffect(() => {
    const el = document.getElementById(`toast-${t.id}`);
    if (el) {
      requestAnimationFrame(() =>
        el.classList.remove("translate-x-full", "opacity-0"),
      );
    }
  }, [t.id]);

  return (
    <div
      id={`toast-${t.id}`}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg text-sm font-medium transition-all duration-300 translate-x-full opacity-0 ${STYLE[t.type]}`}
    >
      <span className="material-symbols-outlined text-lg">{ICON[t.type]}</span>
      <span className="flex-1">{t.message}</span>
      <button
        onClick={() => removeToast(t.id)}
        className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
      >
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <ToastItem key={t.id} t={t} />
      ))}
    </div>
  );
}
