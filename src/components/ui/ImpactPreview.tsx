// src/components/ui/ImpactPreview.tsx
import React, { useState, useEffect } from 'react';
import { Badge } from './Badge';
import { mockApi } from '../../data/mockApi';
import { ImpactPreviewResult } from '../../types/models';
import { X, Play, AlertTriangle, ArrowRight, Database } from 'lucide-react';

interface ImpactPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  errorIds: string[];
  action: 'FIX' | 'DELETE' | 'RESTORE' | 'RELINK' | 'UPDATE';
  onProceed: (preview: ImpactPreviewResult) => void;
}

export const ImpactPreview: React.FC<ImpactPreviewProps> = ({
  isOpen,
  onClose,
  errorIds,
  action,
  onProceed
}) => {
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<ImpactPreviewResult | null>(null);

  useEffect(() => {
    if (!isOpen || errorIds.length === 0) return;

    const fetchPreview = async () => {
      setLoading(true);
      const result = await mockApi.getImpactPreview(errorIds, action);
      setPreview(result);
      setLoading(false);
    };

    fetchPreview();
  }, [isOpen, errorIds, action]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300" 
        onClick={onClose}
      />

      {/* Modal content wrapper */}
      <div className="relative bg-surface rounded-lg text-left overflow-hidden shadow-2xl transform transition-all max-w-2xl w-full border border-slate-200 z-10 animate-scale-up">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-brand" />
            <h3 className="text-sm font-bold font-display tracking-wide uppercase text-slate-800">
              Remediation Impact Preview
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 rounded p-1 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2 animate-pulse">
              <div className="w-8 h-8 rounded-full border-2 border-brand-200 border-t-brand animate-spin" />
              <span className="text-xs font-semibold">Generating impact analysis script...</span>
            </div>
          ) : preview ? (
            <div className="space-y-5">
              
              {/* Status and Risk summary banner */}
              <div className={`p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3
                ${preview.canExecute 
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">REMEDIATION STATUS</span>
                  <span className="text-xs font-bold block mt-1">
                    {preview.canExecute 
                      ? 'Eligible for staging validation write run' 
                      : 'Blocked: Referential key conflicts detected'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">RISK LEVEL</span>
                  <Badge type="severity" value={preview.riskLevel === 'CRITICAL' ? 'High' : preview.riskLevel === 'LOW' ? 'Low' : 'Medium'} />
                </div>
              </div>

              {/* Validation errors warning panel */}
              {!preview.canExecute && (
                <div className="bg-red-50 border border-red-200/60 rounded-lg p-4 space-y-2">
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-500" /> Blocking Reasons
                  </span>
                  <ul className="list-disc pl-5 text-xs text-red-800 space-y-1 font-medium">
                    {preview.blockingReasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reconcile metrics simulation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="p-3 border border-slate-200/60 rounded-lg text-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">MUTATED RECORDS</span>
                  <span className="text-base font-extrabold text-slate-800 font-mono mt-1 block tabular-nums">
                    {preview.totalDownstreamImpact.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 border border-slate-200/60 rounded-lg text-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">RESOLVED ANOMALIES</span>
                  <span className="text-base font-extrabold text-emerald-600 font-mono mt-1 block tabular-nums">
                    +{preview.errorsResolvedCount}
                  </span>
                </div>

                <div className="p-3 border border-slate-200/60 rounded-lg text-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">EXPECTED GAPS DIFF</span>
                  <span className="text-base font-extrabold text-slate-800 font-mono mt-1 flex items-center justify-center gap-1 tabular-nums">
                    {preview.migrationDiffBefore.toLocaleString()} 
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    {preview.migrationDiffAfter.toLocaleString()}
                  </span>
                </div>

              </div>

              {/* Impact details table */}
              {preview.affectedTables.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    ESTIMATED TABLES AFFECTED
                  </span>
                  <div className="border border-slate-200/80 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-100 text-left">
                      <thead className="bg-slate-50 text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">
                        <tr>
                          <th className="px-4 py-2 font-display">Target Schema</th>
                          <th className="px-4 py-2 font-display text-right">Modified rows count</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600 bg-surface">
                        {preview.affectedTables.map((t, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 font-display text-slate-800">{t.tableName.toUpperCase().replace('_', ' ')}</td>
                            <td className="px-4 py-2 text-right font-mono tabular-nums text-brand">{t.recordsCount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Footer Controls */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                
                {preview.canExecute && (
                  <button
                    type="button"
                    onClick={() => onProceed(preview)}
                    className="px-4 py-2 bg-brand hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Play className="w-3.5 h-3.5" /> Validate in STG Sandbox
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">No preview analysis generated.</div>
          )}
        </div>

      </div>
    </div>
  );
};
