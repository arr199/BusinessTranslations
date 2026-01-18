import React from "react";

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  onDismiss,
}) => {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mx-8 my-3 rounded-r-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500">error</span>
          <p className="text-sm text-red-700 dark:text-red-400 font-medium">
            {message}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        )}
      </div>
    </div>
  );
};
