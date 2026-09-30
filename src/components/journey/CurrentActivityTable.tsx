// src/components/journey/CurrentActivityTable.tsx
import React from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { Server, AlertTriangle } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const CurrentActivityTable: React.FC = () => {
  const { executionActivities, retryFailedExecution } = useGlobalStore();

  return (
    <div className="space-y-3 font-mono flex flex-col h-full">
      {/* Activity Table Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col flex-1">
        <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
            <Server className="w-3.5 h-3.5 text-slate-500" />
            Active Migration Workload
          </span>
          <span className="text-[10px] text-slate-400">4 Worker Threads</span>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase bg-slate-50/50">
                <th className="py-2 px-3">Table</th>
                <th className="py-2 px-3">Stage</th>
                <th className="py-2 px-3">Batch / Status</th>
                <th className="py-2 px-3 text-right">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {executionActivities.map((act) => (
                <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {act.table}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      act.stage === 'Loading' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60' :
                      act.stage === 'Transforming' ? 'bg-sky-50 text-sky-700 border border-sky-200/60' :
                      act.stage === 'Extracting' ? 'bg-amber-50 text-amber-700 border border-amber-200/60' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    }`}>
                      {act.stage}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                    {act.detail}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div 
                          className="h-full bg-slate-900 rounded-full"
                          style={{ width: `${act.progressPct}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 tabular-nums w-8 text-right">
                        {act.progressPct}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Issue Alert Ticker (Inline Capsule) */}
      <div className="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-amber-900">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="font-bold text-[11px]">DLQ Quarantined:</span>
          <span className="text-[11px] text-amber-800">42.3K rows (orphaned historical FK parent refs)</span>
        </div>
        <button
          onClick={retryFailedExecution}
          className="text-amber-800 font-bold underline hover:text-amber-950 shrink-0 text-[11px] cursor-pointer"
        >
          Retry DLQ
        </button>
      </div>
    </div>
  );
};
