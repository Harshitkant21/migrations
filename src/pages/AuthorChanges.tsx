// src/pages/AuthorChanges.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Drawer } from '../components/ui/Drawer';
import { Timeline } from '../components/ui/Timeline';
import { mockApi } from '../data/mockApi';
import { useGlobalStore } from '../state/useGlobalStore';
import { AuthorAuditRecord } from '../types/models';
import { History, User, Calendar, Edit3, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

export const AuthorChanges: React.FC = () => {
  const { environment } = useGlobalStore();

  const [audits, setAudits] = useState<AuthorAuditRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Active drawer audit details
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<AuthorAuditRecord | null>(null);

  const loadAudits = async () => {
    setLoading(true);
    const data = await mockApi.getAuthorChanges();
    setAudits(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAudits();
  }, []);

  const handleRowClick = (aud: AuthorAuditRecord) => {
    setSelectedAudit(aud);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedAudit(null);
  };

  const handleStatusChange = async (id: string, status: AuthorAuditRecord['status']) => {
    const updated = await mockApi.updateAuditStatus(id, status);
    if (updated) {
      loadAudits();
      setSelectedAudit(updated);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Overview stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card title="Pending Author Reviews" subtitle="Draft updates awaiting QA review">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-slate-800 font-mono tabular-nums">
              {audits.filter(a => a.status === 'Pending').length}
            </span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <History className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card title="Approved Modifications" subtitle="Successfully validated and queueing for PROD">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-slate-800 font-mono tabular-nums">
              {audits.filter(a => a.status === 'Approved').length}
            </span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card title="Rejected Revisions" subtitle="Overwritten updates that failed constraint reviews">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-slate-800 font-mono tabular-nums">
              {audits.filter(a => a.status === 'Rejected').length}
            </span>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main audit grid */}
      <Card children={
        <div className="overflow-x-auto -mx-5 -my-4">
          <table className="min-w-full divide-y divide-slate-100 text-left">
            <thead className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="px-5 py-3 font-display">Audit ID</th>
                <th className="px-5 py-3 font-display">Target Schema</th>
                <th className="px-5 py-3 font-display">Field</th>
                <th className="px-5 py-3 font-display">Change Type</th>
                <th className="px-5 py-3 font-display">Current Draft Value</th>
                <th className="px-5 py-3 font-display">Modified By</th>
                <th className="px-5 py-3 font-display text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600 bg-surface">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Loading audit trails...
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
                    <td className="px-5 py-3.5 font-bold text-slate-800 font-display">
                      {aud.entityId.toUpperCase().replace('_', ' ')}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-400">
                      {aud.field}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {aud.changeType}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-emerald-600 max-w-xs truncate">
                      {aud.currentValue}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {aud.changedBy.split(' ')[0]}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Badge type="audit" value={aud.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      } />

      {/* Side drawer detail page */}
      <Drawer
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        title={selectedAudit ? `Audit Log details: ${selectedAudit.id}` : ''}
        subtitle="Manual modifications log viewer"
        widthClass="max-w-xl"
      >
        {selectedAudit && (
          <div className="space-y-6">
            
            {/* Value comparisons */}
            <Card title="Record Differences" subtitle="Side-by-side value modifications">
              <div className="space-y-4 text-xs font-semibold">
                
                {/* Original (Legacy GM source) */}
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Original Value (Legacy Source)</span>
                  <span className="text-slate-500 mt-1 block font-mono leading-relaxed truncate">{selectedAudit.originalValue}</span>
                </div>

                {/* Migrated (ETL postproc) */}
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Migrated Value (Post-ETL)</span>
                  <span className="text-slate-600 mt-1 block font-mono leading-relaxed truncate">{selectedAudit.migratedValue}</span>
                </div>

                {/* Current Value (Author update) */}
                <div className="p-3 bg-brand-50/20 border border-brand-100 rounded-lg">
                  <span className="text-[9px] font-bold text-brand uppercase tracking-widest block">Current Value (Author Modification)</span>
                  <span className="text-brand-900 font-bold mt-1 block font-mono leading-relaxed truncate">{selectedAudit.currentValue}</span>
                </div>

              </div>
            </Card>

            {/* Change details */}
            <div className="space-y-3">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">CHANGE REASON</span>
                <p className="text-xs text-slate-600 leading-relaxed mt-1 p-3 bg-slate-50 border border-slate-100 rounded-lg font-medium">
                  {selectedAudit.reason}
                </p>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Modified By
                </span>
                <span className="text-slate-700 font-bold">{selectedAudit.changedBy}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Date Modified
                </span>
                <span className="text-slate-700 font-bold font-mono">
                  {new Date(selectedAudit.changedAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-4">MIGRATION TO PUBLICATION TIMELINE</span>
              <Timeline events={selectedAudit.timeline} />
            </div>

            {/* Administrative Actions */}
            {selectedAudit.status === 'Pending' && (
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">ADMINISTRATIVE ACTION</span>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button
                    onClick={() => handleStatusChange(selectedAudit.id, 'Approved')}
                    className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                  >
                    Approve Change
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedAudit.id, 'Rejected')}
                    className="py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                  >
                    Reject Change
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </Drawer>

    </div>
  );
};
