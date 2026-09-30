// src/components/journey/ReconciliationDiff.tsx
import React from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const ReconciliationDiff: React.FC = () => {
  const sourceRecords = 18420331;
  const targetRecords = 18377912;
  const diff = sourceRecords - targetRecords; // 42,419

  const diffCategories = [
    {
      category: 'Orphaned Foreign-Key Records',
      count: 28140,
      pct: 66.3,
      reason: 'Historical pre-2018 order line items referencing deleted or purged customer IDs. Quarantined in archive schema.',
      severity: 'warning'
    },
    {
      category: 'Identity Deduplication Merges',
      count: 12110,
      pct: 28.5,
      reason: 'Consolidated customer accounts with duplicate E.164 phone numbers and normalized emails into unified customer profiles.',
      severity: 'info'
    },
    {
      category: 'Malformed UTF-8 DLQ Quarantined',
      count: 2169,
      pct: 5.2,
      reason: 'Unescaped byte sequences in audit_log.payload quarantined to Dead-Letter Queue for secondary sanitization.',
      severity: 'error'
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold text-slate-900 font-mono tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            RECORD RECONCILIATION & VARIANCE ANALYSIS
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Audit-grade cross-database verification comparing source extract vs target committed records.
          </p>
        </div>
        <Badge variant="success" size="sm">
          Reconciliation Rate: 99.77%
        </Badge>
      </div>

      {/* Top 3-Box Stats Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Total Source Records</div>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {sourceRecords.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">aws-east-pg01 (PostgreSQL 14.9)</div>
        </div>

        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-lg">
          <div className="text-[10px] text-emerald-700 font-bold uppercase">Total Target Records</div>
          <div className="text-xl font-bold text-emerald-950 mt-1 tabular-nums">
            {targetRecords.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-700 mt-0.5">pg-cloud-aurora (PostgreSQL 16.2)</div>
        </div>

        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg">
          <div className="text-[10px] text-amber-800 font-bold uppercase">Total Difference / Variance</div>
          <div className="text-xl font-bold text-amber-950 mt-1 tabular-nums">
            {diff.toLocaleString()}
          </div>
          <div className="text-[10px] text-amber-800 mt-0.5">100% Accounted with root causes</div>
        </div>
      </div>

      {/* Root Cause Explanations Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 text-[10px] uppercase">
              <th className="py-2 px-3">Variance Category</th>
              <th className="py-2 px-3 text-right">Variance Count</th>
              <th className="py-2 px-3 text-right">% of Diff</th>
              <th className="py-2 px-3">Technical Explanation & Resolution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {diffCategories.map((cat) => (
              <tr key={cat.category} className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    cat.severity === 'warning' ? 'bg-amber-500' :
                    cat.severity === 'info' ? 'bg-sky-500' : 'bg-rose-500'
                  }`} />
                  <span>{cat.category}</span>
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-800 tabular-nums">
                  {cat.count.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-500 tabular-nums">
                  {cat.pct}%
                </td>
                <td className="py-2.5 px-3 text-slate-600 font-sans text-xs">
                  {cat.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
