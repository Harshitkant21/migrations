// src/components/ui/ConfirmModal.tsx
import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, Layers } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, pushType: 'BATCH' | 'SINGLE') => void;
  title: string;
  warningText: string;
  affectedCount?: number;
  requireEnvironmentInput?: boolean;
  defaultPushType?: 'BATCH' | 'SINGLE';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  warningText,
  affectedCount,
  requireEnvironmentInput = false,
  defaultPushType = 'BATCH'
}) => {
  const [reason, setReason] = useState('');
  const [envConfirm, setEnvConfirm] = useState('');
  const [pushType, setPushType] = useState<'BATCH' | 'SINGLE'>(defaultPushType);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!reason.trim()) {
      setError('Please provide a reason/comment for this database modification.');
      return;
    }

    if (requireEnvironmentInput && envConfirm !== 'PROD') {
      setError('Please type PROD in capital letters to confirm target promotion.');
      return;
    }

    onConfirm(reason, pushType);
    setReason('');
    setEnvConfirm('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop overlay - completely separated branch to prevent mouse click bubbling */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300" 
        onClick={onClose}
      />

      {/* Modal body container */}
      <div className="relative bg-surface rounded-lg text-left overflow-hidden shadow-2xl transform transition-all max-w-lg w-full border border-slate-200 z-10 animate-scale-up">
        
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-sm font-bold font-display tracking-wide uppercase">
              {title}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 rounded p-1 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <p className="text-xs text-slate-600 leading-relaxed bg-red-50 border border-red-100 rounded-lg p-3">
            {warningText}
          </p>

          {/* Transaction Push Mode Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              DB Execution Scope Options
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => setPushType('BATCH')}
                className={`p-3 border rounded-lg cursor-pointer transition-all flex flex-col justify-between
                  ${pushType === 'BATCH' 
                    ? 'border-brand bg-brand-50/10 text-brand ring-1 ring-brand-100' 
                    : 'border-slate-200 hover:border-slate-300 bg-surface text-slate-600'
                  }`}
              >
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">Batch Push</span>
                </div>
                <span className="text-[9px] text-slate-400 mt-1 block">
                  Combine all staging changes into a single transactional commit to minimize DB connection loads.
                </span>
              </div>

              <div 
                onClick={() => setPushType('SINGLE')}
                className={`p-3 border rounded-lg cursor-pointer transition-all flex flex-col justify-between
                  ${pushType === 'SINGLE' 
                    ? 'border-brand bg-brand-50/10 text-brand ring-1 ring-brand-100' 
                    : 'border-slate-200 hover:border-slate-300 bg-surface text-slate-600'
                  }`}
              >
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">Single Push</span>
                </div>
                <span className="text-[9px] text-slate-400 mt-1 block">
                  Isolate this remediation to a standalone execution thread, reducing risk on adjacent tables.
                </span>
              </div>
            </div>
          </div>

          {affectedCount !== undefined && affectedCount > 0 && (
            <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-3 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-semibold">Total records to mutate:</span>
              <span className="font-bold font-mono text-red-600 tabular-nums">{affectedCount.toLocaleString()} rows</span>
            </div>
          )}

          {/* Reason/Comment field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Change Request Reason / Comment (Required)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this change is necessary..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 outline-none hover:border-slate-300 focus:border-brand focus:bg-surface font-medium resize-none"
            />
          </div>

          {/* Environment type verification */}
          {requireEnvironmentInput && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Confirm Database Target: Type <span className="text-red-600 font-bold">PROD</span> to promote
              </label>
              <input
                type="text"
                value={envConfirm}
                onChange={(e) => setEnvConfirm(e.target.value)}
                placeholder="PROD"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-700 outline-none hover:border-slate-300 focus:border-brand focus:bg-surface font-bold uppercase tracking-widest"
              />
            </div>
          )}

          {/* Error notifications */}
          {error && (
            <p className="text-[10px] font-bold text-red-500 bg-red-50/60 p-2 border border-red-100 rounded leading-tight">
              {error}
            </p>
          )}

          {/* Modal Buttons */}
          <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm active:scale-95 transition-all"
            >
              Confirm and Proceed ({pushType === 'BATCH' ? 'Batch Transaction' : 'Single Commit'})
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
