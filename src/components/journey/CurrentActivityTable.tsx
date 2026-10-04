// src/components/journey/CurrentActivityTable.tsx
import React from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { Server, AlertTriangle, CheckCircle2, Clock, PlayCircle } from 'lucide-react';

export const CurrentActivityTable: React.FC = () => {
  const { retryFailedExecution } = useGlobalStore();

  const sequentialPipeline = [
    {
      order: 1,
      table: 'legacy_makes',
      status: 'Completed',
      operation: 'Verified 5 rows (100% reconciled)',
      progressPct: 100
    },
    {
      order: 2,
      table: 'legacy_models',
      status: 'Completed',
      operation: 'Verified 17 rows (100% reconciled)',
      progressPct: 100
    },
    {
      order: 3,
      table: 'legacy_vehicles',
      status: 'Running',
      operation: 'Splitting into vehicles & vehicle_specifications',
      progressPct: 68.4
    },
    {
      order: 4,
      table: 'pcs_procedures',
      status: 'Queued',
      operation: 'Waiting on parent vehicle FK completion',
      progressPct: 0
    }
  ];

  return (
    <div className="space-y-3 font-mono flex flex-col h-full">
      {/* Sequential Activity Table Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col flex-1">
        <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
            <Server className="w-3.5 h-3.5 text-slate-500" />
            Sequential Pipeline Execution
          </span>
          <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Sequential (Table-by-Table Order)
          </span>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase bg-slate-50/50">
                <th className="py-2 px-3 text-center">Order</th>
                <th className="py-2 px-3">Table Name</th>
                <th className="py-2 px-3 text-center">Status</th>
                <th className="py-2 px-3">Current Operation</th>
                <th className="py-2 px-3 text-right">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {sequentialPipeline.map((act) => (
                <tr key={act.order} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                    #{act.order}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {act.table}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {act.status === 'Completed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                      </span>
                    )}
                    {act.status === 'Running' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand border border-brand-200 animate-pulse">
                        <PlayCircle className="w-3 h-3 text-brand" /> Running
                      </span>
                    )}
                    {act.status === 'Queued' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        <Clock className="w-3 h-3 text-slate-400" /> Queued
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                    {act.operation}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div 
                          className={`h-full rounded-full ${act.status === 'Completed' ? 'bg-emerald-500' : 'bg-brand'}`}
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

      {/* Live Issue Alert Ticker */}
      <div className="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-amber-900">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="font-bold text-[11px]">DLQ Quarantined:</span>
          <span className="text-[11px] text-amber-800">42.3K rows (orphaned historical FK parent refs)</span>
        </div>
        <button
          onClick={retryFailedExecution}
          className="text-amber-800 font-bold underline hover:text-amber-950 shrink-0 text-[11px] cursor-pointer font-sans"
        >
          Retry DLQ
        </button>
      </div>
    </div>
  );
};
