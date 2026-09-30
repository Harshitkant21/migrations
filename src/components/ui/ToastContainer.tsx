// src/components/ui/ToastContainer.tsx
import React from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useGlobalStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        const borderClass = isSuccess 
          ? 'border-emerald-300 bg-emerald-50/95 text-emerald-900' 
          : isWarning 
          ? 'border-amber-300 bg-amber-50/95 text-amber-900' 
          : isError
          ? 'border-rose-300 bg-rose-50/95 text-rose-900'
          : 'border-slate-300 bg-white/95 text-slate-900';

        const Icon = isSuccess 
          ? CheckCircle2 
          : isWarning 
          ? AlertTriangle 
          : isError 
          ? AlertCircle 
          : Info;

        const iconColor = isSuccess 
          ? 'text-emerald-600' 
          : isWarning 
          ? 'text-amber-600' 
          : isError 
          ? 'text-rose-600' 
          : 'text-sky-600';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg backdrop-blur-xs transition-all animate-in fade-in slide-in-from-bottom-2 text-xs font-mono ${borderClass}`}
          >
            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 font-medium leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-sm opacity-60 hover:opacity-100 hover:bg-black/5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
