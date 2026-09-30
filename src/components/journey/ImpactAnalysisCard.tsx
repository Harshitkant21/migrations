// src/components/journey/ImpactAnalysisCard.tsx
import React from 'react';
import { ImpactAnalysisMetrics } from '../../types/models';
import { Database, Server, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface ImpactAnalysisCardProps {
  metrics: ImpactAnalysisMetrics;
}

export const ImpactAnalysisCard: React.FC<ImpactAnalysisCardProps> = ({ metrics }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 space-y-2.5 font-sans">
      {/* Top Source Identification Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <Database className="w-3.5 h-3.5 text-slate-600" />
          <span className="font-semibold text-slate-900 whitespace-nowrap">PostgreSQL 14.9</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-600 font-mono text-[11px] whitespace-nowrap">production_core_db</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-400 font-mono text-[11px] whitespace-nowrap">aws-east-pg01.internal:5432</span>
        </div>

        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/70">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Connected & Introspected
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Reflected in 1.4s
          </span>
        </div>
      </div>

      {/* Compact Horizontal KPI Strip */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
        <div className="p-2 rounded bg-slate-50 border border-slate-200/70">
          <div className="text-[10px] text-slate-400 uppercase font-medium whitespace-nowrap">Tables</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono tabular-nums">{metrics.totalTables}</div>
        </div>

        <div className="p-2 rounded bg-slate-50 border border-slate-200/70">
          <div className="text-[10px] text-slate-400 uppercase font-medium whitespace-nowrap">Records</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono tabular-nums">{metrics.totalRecords}</div>
        </div>

        <div className="p-2 rounded bg-slate-50 border border-slate-200/70">
          <div className="text-[10px] text-slate-400 uppercase font-medium whitespace-nowrap">Schemas</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono tabular-nums">{metrics.totalSchemas}</div>
        </div>

        <div className="p-2 rounded bg-slate-50 border border-slate-200/70">
          <div className="text-[10px] text-slate-400 uppercase font-medium whitespace-nowrap">Columns</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono tabular-nums">{metrics.totalColumns.toLocaleString()}</div>
        </div>

        <div className="p-2 rounded bg-slate-50 border border-slate-200/70">
          <div className="text-[10px] text-slate-400 uppercase font-medium whitespace-nowrap">Indexes</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono tabular-nums">{metrics.totalIndexes}</div>
        </div>

        <div className="p-2 rounded bg-slate-50 border border-slate-200/70">
          <div className="text-[10px] text-slate-400 uppercase font-medium whitespace-nowrap">Foreign Keys</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono tabular-nums">{metrics.totalForeignKeys}</div>
        </div>
      </div>

      {/* Compact Visual Impact Analysis Breakdown */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider shrink-0 whitespace-nowrap">
          Impact Analysis:
        </div>

        <div className="flex flex-wrap items-center gap-1.5 flex-1 justify-start sm:justify-end">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/80 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <strong className="font-mono tabular-nums">{metrics.directMappings}</strong>
            <span className="text-[11px] text-emerald-700">Direct 1:1</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200/80 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
            <strong className="font-mono tabular-nums">{metrics.transformations}</strong>
            <span className="text-[11px] text-sky-700">Transformations</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200/80 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            <strong className="font-mono tabular-nums">{metrics.tableSplits}</strong>
            <span className="text-[11px] text-purple-700">Splits (1:N)</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200/80 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            <strong className="font-mono tabular-nums">{metrics.tableMerges}</strong>
            <span className="text-[11px] text-indigo-700">Merges (N:1)</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200/80 whitespace-nowrap">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <strong className="font-mono tabular-nums">{metrics.potentialConflicts}</strong>
            <span className="text-[11px] text-rose-700">Conflicts</span>
          </div>
        </div>
      </div>
    </div>
  );
};
