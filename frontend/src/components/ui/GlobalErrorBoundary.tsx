import React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-2xl mx-auto flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            We apologize for the inconvenience. An unexpected error has occurred.
          </p>
          
          <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-lg text-left overflow-auto max-h-32 mb-6">
            <code className="text-xs text-red-600 dark:text-red-400 break-words">
              {error.message}
            </code>
          </div>
          
          <button
            onClick={resetErrorBoundary}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

export function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the state of your app so the error doesn't happen again
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
