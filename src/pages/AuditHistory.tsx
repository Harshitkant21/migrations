// src/pages/AuditHistory.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Drawer } from '../components/ui/Drawer';
import { mockApi } from '../data/mockApi';
import { OperationAuditRecord } from '../types/models';
import { ShieldCheck, User, Calendar, FileText, ArrowRight, Eye } from 'lucide-react';

export const AuditHistory: React.FC = () => {
  const [audits, setAudits] = useState<OperationAuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAudit, setSelectedAudit] = useState<OperationAuditRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadAudits = async () => {
    setLoading(true);
    const result = await mockApi.getOperationAudits();
    setAudits(result);
    setLoading(false);
  };

  useEffect(() => {
    loadAudits();
  }, []);

  const handleRowClick = (aud: OperationAuditRecord) => {
    setSelectedAudit(aud);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card title="Total Administrative Actions" subtitle="Immutable database mutations logged">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-slate-800 font-mono tabular-nums">
              {audits.length}
            </span>
            <div className="p-2 bg-brand-50 rounded text-brand">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card title="Mutated Production Records" subtitle="Re-linked reference keys or deduplicated rows">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-slate-800 font-mono tabular-nums text-emerald-600">
              {audits.reduce((acc, curr) => acc + curr.affectedRecords, 0).toLocaleString()}
            </span>
            <div className="p-2 bg-emerald-50 rounded text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main logs grid */}
      <Card children={
        <div className="overflow-x-auto -mx-5 -my-4">
          <table className="min-w-full divide-y divide-slate-100 text-left">
            <thead className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="px-5 py-3 font-display">Log ID</th>
                <th className="px-5 py-3 font-display">Timestamp</th>
                <th className="px-5 py-3 font-display">Target Schema</th>
                <th className="px-5 py-3 font-display">Operation</th>
                <th className="px-5 py-3 font-display text-right">Records mutated</th>
                <th className="px-5 py-3 font-display">Operator</th>
                <th className="px-5 py-3 font-display text-center">Environment</th>
                <th className="px-5 py-3 text-center w-16">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600 bg-surface">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    Loading operation history...
                  </td>
                </tr>
              ) : audits.length > 0 ? (
                audits.map((aud) => (
                  <tr
                    key={aud.id}
                    onClick={() => handleRowClick(aud)}
                    className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 font-bold font-mono text-slate-800">
                      {aud.id}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 font-mono">
                      {new Date(aud.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-800 font-display">
                      {aud.affectedTable.toUpperCase().replace('_', ' ')}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-bold uppercase tracking-wider">
                      {aud.action}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-emerald-600 tabular-nums">
                      {aud.affectedRecords.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {aud.operator.split(' ')[0]}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {aud.environment}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button className="text-slate-400 hover:text-brand p-1 hover:bg-slate-100 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    No actions logged in database history.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      } />

      {/* Audit Detail drawer overlay */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedAudit ? `Operation snapshot: ${selectedAudit.id}` : ''}
        subtitle="Immutable database transaction record"
      >
        {selectedAudit && (
          <div className="space-y-6">
            
            {/* Core details */}
            <div className="space-y-4">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">PIPELINE JOB ID</span>
                <span className="text-xs font-mono font-bold text-slate-800 mt-0.5 block">{selectedAudit.remediationId}</span>
              </div>
              
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">TARGET SCHEMA</span>
                <span className="text-xs font-bold text-slate-800 font-display mt-0.5 block">
                  {selectedAudit.affectedTable.toUpperCase().replace('_', ' ')}
                </span>
              </div>

              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">OPERATION ACTION</span>
                <span className="text-xs font-bold text-brand uppercase tracking-wider mt-0.5 block">{selectedAudit.action}</span>
              </div>
            </div>

            {/* Before After snapshots */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">SCHEMA STATE LOGS</span>
              
              <div className="p-3 bg-red-50/50 border border-red-100 rounded-lg text-xs leading-relaxed text-slate-600 font-medium">
                <span className="text-[8px] font-bold text-red-500 uppercase tracking-wider block mb-1">State before</span>
                {selectedAudit.beforeStateSummary}
              </div>

              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-xs leading-relaxed text-slate-600 font-medium">
                <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-wider block mb-1">State after</span>
                {selectedAudit.afterStateSummary}
              </div>
            </div>

            {/* Verification Metadata */}
            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Operator
                </span>
                <span className="text-slate-800 font-bold">{selectedAudit.operator}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Committed Timestamp
                </span>
                <span className="text-slate-800 font-mono">{new Date(selectedAudit.timestamp).toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Change Reason
                </span>
                <p className="text-[11px] text-slate-600 max-w-[200px] text-right font-medium italic">
                  "{selectedAudit.reason}"
                </p>
              </div>
            </div>

          </div>
        )}
      </Drawer>

    </div>
  );
};
