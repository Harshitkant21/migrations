// src/pages/ErrorCentre.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Drawer } from '../components/ui/Drawer';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { ImpactPreview } from '../components/ui/ImpactPreview';
import { mockApi } from '../data/mockApi';
import { useGlobalStore } from '../state/useGlobalStore';
import { DataQualityError, ImpactPreviewResult, RemediationJob } from '../types/models';
import { 
  Search, AlertTriangle, User, Calendar, ExternalLink, ShieldCheck, 
  ChevronRight, Trash2, CheckCircle2, RefreshCw, Layers, Terminal
} from 'lucide-react';

export const ErrorCentre: React.FC = () => {
  const { setActivePage, setSelectedErrorId, selectedErrorId, setSelectedVehicleId } = useGlobalStore();

  const [errors, setErrors] = useState<DataQualityError[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [remediationFilter, setRemediationFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Checklist multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer Anomaly details
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedError, setSelectedError] = useState<DataQualityError | null>(null);

  // Pipeline execution state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewAction, setPreviewAction] = useState<'FIX' | 'DELETE' | 'RESTORE' | 'RELINK' | 'UPDATE'>('FIX');
  const [activePreviewIds, setActivePreviewIds] = useState<string[]>([]);
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmWarning, setConfirmWarning] = useState('');
  const [confirmJob, setConfirmJob] = useState<RemediationJob | null>(null);
  const [selectedPushType, setSelectedPushType] = useState<'BATCH' | 'SINGLE'>('BATCH');

  const [activeJob, setActiveJob] = useState<RemediationJob | null>(null);
  const [jobRunning, setJobRunning] = useState(false);

  // Legacy comparison & Override states
  const [sourceCompareData, setSourceCompareData] = useState<{ column: string; sourceValue: string; targetValue: string; status: string }[]>([]);
  const [loadingSource, setLoadingSource] = useState(false);
  const [overrideValue, setOverrideValue] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  const loadErrors = async () => {
    setLoading(true);
    const data = await mockApi.getErrors();
    setErrors(data);
    setLoading(false);
  };

  useEffect(() => {
    loadErrors();
  }, []);

  // Sync drawer to global selection
  useEffect(() => {
    if (selectedErrorId) {
      const err = errors.find(e => e.id === selectedErrorId);
      if (err) {
        setSelectedError(err);
        setDrawerOpen(true);
      }
    }
  }, [selectedErrorId, errors]);

  useEffect(() => {
    if (selectedError) {
      setOverrideValue(selectedError.evidence?.expectedReference || '');
      setSourceCompareData([]);
      setSaveStatus('');
    }
  }, [selectedError]);

  const handleQuerySource = async () => {
    if (!selectedError) return;
    setLoadingSource(true);
    const result = await mockApi.getSourceCompare(selectedError.id);
    setSourceCompareData(result);
    setLoadingSource(false);
  };

  const handleImportSourceVal = (val: string) => {
    const cleanVal = val.split('-').slice(0, 2).join('-').replace('VHC', 'GMV');
    setOverrideValue(cleanVal);
  };

  const handleSaveOverride = async () => {
    if (!selectedError) return;
    const updated = await mockApi.updateErrorEvidence(
      selectedError.id,
      overrideValue,
      `Linked vehicle parent reference has been manually set to "${overrideValue}" after comparing with legacy source catalogs.`
    );
    if (updated) {
      setSelectedError({ ...selectedError, ...updated });
      loadErrors(); // Reload counts
      setSaveStatus('Remediation override value saved in memory. Ready to Validate in STG.');
    }
  };

  // Aggregate Category Counts
  const categorySummaries = useMemo(() => {
    const counts: Record<string, number> = {
      'Missing Vehicle': 0,
      'Missing FK': 0,
      'Orphan Records': 0,
      'Transformation Error': 0
    };
    errors.forEach(err => {
      const cat = err.category;
      if (counts[cat] !== undefined) counts[cat]++;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [errors]);

  // Filter and Search Errors
  const filteredErrors = useMemo(() => {
    let result = [...errors];
    
    if (selectedCategory !== 'ALL') {
      result = result.filter(e => e.category === selectedCategory);
    }

    if (remediationFilter !== 'ALL') {
      result = result.filter(e => e.remediationCategory === remediationFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e => 
        e.id.toLowerCase().includes(q) || 
        e.entityId.toLowerCase().includes(q) || 
        e.rootCause.toLowerCase().includes(q)
      );
    }

    return result;
  }, [errors, selectedCategory, remediationFilter, search]);

  // Handle row selection checkboxes
  const handleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredErrors.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredErrors.map(e => e.id));
    }
  };

  const handleRowClick = (err: DataQualityError) => {
    setSelectedError(err);
    setSelectedErrorId(err.id);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedError(null);
    setSelectedErrorId(null);
    setActiveJob(null);
  };

  // Launch Staging preview script
  const triggerPreview = (ids: string[], action: typeof previewAction) => {
    setActivePreviewIds(ids);
    setPreviewAction(action);
    setPreviewOpen(true);
  };

  // Launch Staging Dry-run Execution (Stage 1)
  const handleProceedStg = async (previewResult: ImpactPreviewResult) => {
    setPreviewOpen(false);
    setDrawerOpen(true);
    setJobRunning(true);
    
    // Simulate dry run
    const job = await mockApi.executeStgRemediation(
      previewResult.errorIds, 
      previewResult.action,
      `Executing remediation job for: ${previewResult.errorIds.join(', ')}`
    );

    setActiveJob(job);
    setJobRunning(false);
  };

  // Trigger Promotion to Production Modal (Stage 2)
  const triggerProdPromotion = (pushMode: 'BATCH' | 'SINGLE') => {
    if (!activeJob) return;
    setSelectedPushType(pushMode);
    setConfirmTitle(pushMode === 'BATCH' ? 'Batch Production Promotion' : 'Isolate Production Mutation');
    setConfirmWarning(pushMode === 'BATCH' 
      ? `WARNING: You are performing a BATCH PUSH to Production. This will compile all verified staging modifications and write them in a SINGLE atomic transaction block, minimizing connection loads and locking tables for the shortest possible duration.`
      : `WARNING: You are performing a SINGLE PUSH to Production. This will isolate only the changes related to job ${activeJob.id} into a separate thread. Recommended only if adjacent tables require immediate validation bypass.`
    );
    setConfirmJob(activeJob);
    setConfirmOpen(true);
  };

  // Execute promotion commit
  const handleConfirmProd = async (reason: string, pushType: 'BATCH' | 'SINGLE') => {
    if (!confirmJob) return;
    setConfirmOpen(false);
    setJobRunning(true);

    const updatedJob = await mockApi.promoteToProd(confirmJob.id);
    if (updatedJob) {
      updatedJob.prodExecutionResult?.logs.unshift(
        `Target execution thread configuration: ${pushType} TRANSACTION PUSH MODE.`
      );
      setActiveJob(updatedJob);
      loadErrors(); // Reload table counts
      setSelectedIds([]); // Clear selection
    }
    setJobRunning(false);
  };

  // Bulk action loops
  const handleBulkInvestigate = async () => {
    setLoading(true);
    for (const id of selectedIds) {
      await mockApi.updateErrorStatus(id, 'Investigating');
    }
    await loadErrors();
    setSelectedIds([]);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Category summaries bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categorySummaries.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          return (
            <div
              key={cat.name}
              onClick={() => setSelectedCategory(isSelected ? 'ALL' : cat.name)}
              className={`p-3 border rounded-lg shadow-premium cursor-pointer transition-all text-center
                ${isSelected 
                  ? 'bg-brand text-white border-brand font-bold scale-[1.02]' 
                  : 'bg-surface hover:bg-slate-50 border-slate-200/80 hover:border-slate-300'
                }`}
            >
              <span className={`text-[10px] uppercase font-bold tracking-wider block
                ${isSelected ? 'text-brand-100' : 'text-slate-400'}`}>
                {cat.name}
              </span>
              <span className={`text-xl font-extrabold font-mono mt-1 block tabular-nums
                ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                {cat.count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Primary Grid Area */}
      <div className="grid grid-cols-1 gap-6 relative">
        
        {/* Table filters and classifications row */}
        <Card children={
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search */}
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search error code, table or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs outline-none hover:border-slate-300 focus:border-brand focus:bg-surface font-medium"
              />
            </div>
            
            {/* Remediation category filters */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Eligibility:
              </span>
              <div className="flex bg-slate-100 border border-slate-200/60 p-0.5 rounded-lg text-[10px] font-semibold text-slate-500 shadow-sm">
                {(['ALL', 'FIXABLE', 'DELETE_CANDIDATE', 'BLOCKED'] as const).map(cat => {
                  const isSelected = remediationFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setRemediationFilter(cat)}
                      className={`px-3 py-1 rounded-md transition-all leading-none uppercase
                        ${isSelected 
                          ? 'bg-surface text-slate-800 font-bold shadow-sm' 
                          : 'hover:text-slate-800 hover:bg-slate-50'
                        }`}
                    >
                      {cat.replace('_CANDIDATE', '').replace('ALL', 'ALL ELIGIBLE')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        } />

        {/* Anomaly list grid */}
        <Card children={
          <div className="overflow-x-auto -mx-5 -my-4">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-center w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredErrors.length && filteredErrors.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-brand focus:ring-brand w-3.5 h-3.5"
                    />
                  </th>
                  <th className="px-5 py-3 font-display">Error ID</th>
                  <th className="px-5 py-3 font-display">Table Schema</th>
                  <th className="px-5 py-3 font-display">Diagnostic Category</th>
                  <th className="px-5 py-3 font-display">Root Cause Anomaly</th>
                  <th className="px-5 py-3 font-display text-right">Affected rows</th>
                  <th className="px-5 py-3 font-display text-center">Dependent Impact</th>
                  <th className="px-5 py-3 font-display text-center">Safety Rating</th>
                  <th className="px-5 py-3 font-display text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600 bg-surface">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-400">
                      Loading Data Quality Workbench...
                    </td>
                  </tr>
                ) : filteredErrors.length > 0 ? (
                  filteredErrors.map((err) => {
                    const isChecked = selectedIds.includes(err.id);
                    const isResolved = err.status === 'Resolved';
                    return (
                      <tr
                        key={err.id}
                        onClick={() => handleRowClick(err)}
                        className={`hover:bg-slate-50/50 cursor-pointer transition-colors
                          ${isChecked ? 'bg-brand-50/20' : ''}
                          ${isResolved ? 'opacity-50' : ''}`}
                      >
                        <td className="px-5 py-3.5 text-center" onClick={(e) => handleSelectRow(err.id, e)}>
                          {!isResolved && (
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="rounded border-slate-300 text-brand focus:ring-brand w-3.5 h-3.5"
                            />
                          )}
                        </td>
                        <td className="px-5 py-3.5 font-bold font-mono text-brand">
                          {err.id}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-800 font-display">
                          {err.entityId.toUpperCase().replace('_', ' ')}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-400">
                          {err.category}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate">
                          {err.rootCause}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono tabular-nums font-bold text-slate-700">
                          {err.affectedRecords.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-center font-mono font-bold text-slate-500 tabular-nums">
                          {err.evidence ? `${err.evidence.downstreamCount.toLocaleString()} rows` : err.affectedRecords > 0 ? `${err.affectedRecords.toLocaleString()} rows` : '0 (Safe)'}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border
                            ${err.remediationCategory === 'FIXABLE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              err.remediationCategory === 'DELETE_CANDIDATE' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              err.remediationCategory === 'BLOCKED' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {err.remediationCategory.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <Badge type="status" value={err.status === 'Open' ? 'Critical' : err.status === 'Resolved' ? 'Healthy' : 'Warning'} />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-400">
                      No errors matching selection filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        } />

        {/* Floating Bulk Operations Toolbar */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-full px-6 py-3 flex items-center gap-5 shadow-2xl z-40 border border-slate-800 animate-slide-up">
            <span className="text-xs font-bold font-display">
              Selected: <span className="text-brand-300 font-mono text-sm">{selectedIds.length}</span> errors
            </span>
            <span className="w-px h-4 bg-slate-800" />
            <div className="flex gap-2">
              <button
                onClick={() => triggerPreview(selectedIds, 'FIX')}
                className="bg-brand hover:bg-brand-600 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Fix Selected
              </button>
              
              <button
                onClick={() => triggerPreview(selectedIds, 'DELETE')}
                className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Candidates
              </button>

              <button
                onClick={handleBulkInvestigate}
                className="bg-slate-800 hover:bg-slate-700 px-4 py-1.5 rounded-full text-xs font-semibold active:scale-95 transition-all text-slate-300"
              >
                Mark Investigating
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="hover:bg-slate-800 p-1.5 rounded-full text-xs font-semibold text-slate-400"
              >
                Clear
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Side drawer for selected error detail & pipeline runs */}
      <Drawer
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        title={selectedError ? `Error Diagnostic Report: ${selectedError.id}` : ''}
        subtitle="Validation audit and remediation workbench"
        widthClass="max-w-xl"
      >
        {selectedError && (
          <div className="space-y-6">
            
            {/* Conditional view: Display Pipeline status logs if running, otherwise show standard info */}
            {activeJob ? (
              <div className="space-y-5 bg-slate-900 text-slate-300 p-5 rounded-lg border border-slate-800 shadow-inner font-mono">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pipeline validation log</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded
                    ${activeJob.status === 'PROD_SUCCESS' ? 'bg-emerald-950 text-emerald-400' :
                      activeJob.status === 'STG_SUCCESS' ? 'bg-blue-950 text-blue-400' :
                      activeJob.status === 'STG_FAILED' ? 'bg-red-950 text-red-400' :
                      'bg-slate-800 text-slate-400'}`}>
                    {activeJob.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-brand-400">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>$ cat /remediation/pipeline/{activeJob.id}.log</span>
                  </div>
                  {/* Validation steps log output */}
                  <div className="space-y-1 max-h-48 overflow-y-auto bg-black/40 p-2.5 border border-slate-950 rounded text-slate-400 text-[11px] leading-tight">
                    {activeJob.stgValidationResult?.logs.map((log, idx) => (
                      <p key={idx}>{log}</p>
                    ))}
                    {activeJob.prodExecutionResult?.logs.map((log, idx) => (
                      <p key={idx} className="text-emerald-400">{log}</p>
                    ))}
                    {jobRunning && (
                      <p className="animate-pulse text-blue-400">Executing transaction validation script...</p>
                    )}
                  </div>
                </div>

                {/* Promotional Timeline details */}
                <div className="space-y-3 pt-3 border-t border-slate-800 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pipeline ID:</span>
                    <span className="text-slate-300 font-bold">{activeJob.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Staging verification:</span>
                    <span className={activeJob.stgValidationResult?.success ? 'text-emerald-400 font-bold' : 'text-red-400'}>
                      {activeJob.stgValidationResult?.success ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  {activeJob.prodExecutionResult && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Production promotion:</span>
                      <span className="text-emerald-400 font-bold">COMMITTED</span>
                    </div>
                  )}
                </div>

                {/* Pipeline promotion actions */}
                <div className="pt-2 space-y-2">
                  {activeJob.status === 'STG_SUCCESS' && (
                    <>
                      <button
                        onClick={() => triggerProdPromotion('BATCH')}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Batch Push to PROD (Recommended)</span>
                      </button>
                      <button
                        onClick={() => triggerProdPromotion('SINGLE')}
                        className="w-full py-2.5 bg-slate-700 hover:bg-slate-800 text-slate-100 text-xs font-semibold rounded shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Single Push to PROD (Isolate Commit)</span>
                      </button>
                    </>
                  )}
                  {activeJob.status === 'STG_FAILED' && (
                    <div className="text-center p-3 bg-red-950/40 border border-red-900/60 rounded text-xs text-red-400 font-bold">
                      PROD Promotion BLOCKED. Please fix constraints.
                    </div>
                  )}
                  {activeJob.status === 'PROD_SUCCESS' && (
                    <div className="text-center p-3 bg-emerald-950/40 border border-emerald-900/60 rounded text-xs text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Remediation Completed & Audited.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Standard Anomaly Details */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">AFFECTED SCHEMA</span>
                    <span className="text-sm font-bold text-slate-800 font-display mt-0.5 block">
                      {selectedError.entityId.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">REMEDIATION CATEGORY</span>
                    <span className="text-xs font-semibold text-slate-700 mt-0.5 block">
                      {selectedError.category} ({selectedError.remediationCategory})
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">ROOT CAUSE</span>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                      {selectedError.rootCause}
                    </p>
                  </div>

                  {selectedError.evidence && (
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">DIAGNOSTIC EVIDENCE</span>
                      <div className="text-xs text-slate-600 leading-relaxed mt-1 p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-2 font-medium">
                        <p>{selectedError.evidence.explanation}</p>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[11px] font-mono">
                          <div>
                            <span className="text-slate-400">Upstream references:</span>{' '}
                            <span className="font-bold text-slate-800">{selectedError.evidence.upstreamCount}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Downstream dependents:</span>{' '}
                            <span className="font-bold text-slate-800">{selectedError.evidence.downstreamCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Downstream Reference Tree */}
                  <div className="border-t border-slate-100 pt-4">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">DOWNSTREAM DEPENDENCY IMPACT</span>
                    <div className="mt-1.5 p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs leading-relaxed text-slate-600 font-medium">
                      This record is referenced by the following dependent hierarchies:
                      <ul className="list-disc pl-5 mt-1.5 space-y-1 font-semibold text-slate-700">
                        {selectedError.id === 'ERR-2967' && (
                          <>
                            <li>73 PCS headers</li>
                            <li>1,298 PCS Systems</li>
                            <li>5,126 PCS Subsystems</li>
                            <li>150,610 PCS terminal procedures (Leafs)</li>
                          </>
                        )}
                        {selectedError.id === 'ERR-1713' && (
                          <>
                            <li>18 PCS Systems</li>
                            <li>88 PCS Subsystems</li>
                            <li>1,298 PCS terminal procedures (Leafs)</li>
                          </>
                        )}
                        {selectedError.id === 'ERR-1750' && (
                          <li className="text-emerald-600">0 Child Dependents. Direct delete is safe.</li>
                        )}
                        {selectedError.id === 'ERR-3091' && (
                          <>
                            <li>521,878 MCS terminal procedure drafts</li>
                            <li className="text-red-600">⚠ Action BLOCKED by foreign key constraint checks.</li>
                          </>
                        )}
                        {!['ERR-2967', 'ERR-1713', 'ERR-1750', 'ERR-3091'].includes(selectedError.id) && (
                          <li>{selectedError.affectedRecords.toLocaleString()} child records in {selectedError.entityId}</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Legacy Source DB Reference Query */}
                  <div className="border-t border-slate-100 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">LEGACY SOURCE DB REFERENCE</span>
                      <button
                        type="button"
                        onClick={handleQuerySource}
                        className="text-[10px] text-brand hover:text-brand-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        {loadingSource ? 'Querying Legacy DB...' : '🔍 Compare with Legacy DB'}
                      </button>
                    </div>

                    {sourceCompareData.length > 0 && (
                      <div className="mt-2 border border-slate-200/80 rounded-lg overflow-hidden text-[10px] bg-slate-50">
                        <table className="min-w-full divide-y divide-slate-100 text-left">
                          <thead className="bg-slate-100 text-[8px] font-extrabold uppercase text-slate-400 tracking-wider">
                            <tr>
                              <th className="px-3 py-1.5">Column</th>
                              <th className="px-3 py-1.5">Legacy Src</th>
                              <th className="px-3 py-1.5">Staging Val</th>
                              <th className="px-3 py-1.5">Status</th>
                              <th className="px-3 py-1.5 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-slate-600 bg-surface">
                            {sourceCompareData.map((row, idx) => (
                              <tr key={idx}>
                                <td className="px-3 py-1.5 font-mono text-slate-800">{row.column}</td>
                                <td className="px-3 py-1.5 text-slate-500 font-semibold">{row.sourceValue}</td>
                                <td className="px-3 py-1.5 font-mono text-brand font-bold">{row.targetValue}</td>
                                <td className="px-3 py-1.5 text-slate-400 font-semibold">{row.status}</td>
                                <td className="px-3 py-1.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleImportSourceVal(row.sourceValue)}
                                    className="text-brand hover:underline font-bold"
                                  >
                                    Import
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Value Override Editor Form */}
                  {selectedError.remediationCategory === 'FIXABLE' && (
                    <div className="border-t border-slate-100 pt-4 space-y-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">REMEDIATION VALUE OVERRIDE EDITOR</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type value to override mismatch..."
                          value={overrideValue}
                          onChange={(e) => setOverrideValue(e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded py-1.5 px-3 text-xs outline-none hover:border-slate-300 focus:border-brand focus:bg-surface font-mono font-bold"
                        />
                        <button
                          type="button"
                          onClick={handleSaveOverride}
                          className="bg-brand text-white hover:bg-brand-700 px-4 py-1.5 rounded text-xs font-bold active:scale-95 transition-all cursor-pointer"
                        >
                          Save Value
                        </button>
                      </div>
                      {saveStatus && (
                        <p className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded p-1.5 leading-tight">
                          ✓ {saveStatus}
                        </p>
                      )}
                    </div>
                  )}

                </div>

                {/* Impact details & Action Button */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  {selectedError.category === 'Missing Vehicle' && (
                    <button
                      onClick={() => {
                        setSelectedVehicleId(selectedError.vehicleId || null);
                        setSelectedErrorId(selectedError.id);
                        setActivePage('cascade');
                        setDrawerOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
                    >
                      <span className="flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5 text-slate-400" /> Analyze Downstream Cascade</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  )}

                  {/* Remediation triggers based on safety eligibility */}
                  {selectedError.status !== 'Resolved' && (
                    <div className="pt-2">
                      {selectedError.remediationCategory === 'FIXABLE' && (
                        <button
                          onClick={() => triggerPreview([selectedError.id], 'FIX')}
                          className="w-full py-2.5 bg-brand hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                        >
                          Preview and Run Fix
                        </button>
                      )}
                      
                      {selectedError.remediationCategory === 'DELETE_CANDIDATE' && (
                        <button
                          onClick={() => triggerPreview([selectedError.id], 'DELETE')}
                          className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                        >
                          Preview and Safe Delete
                        </button>
                      )}

                      {selectedError.remediationCategory === 'BLOCKED' && (
                        <div className="p-3 bg-red-50 border border-red-200/60 text-red-800 text-xs font-bold text-center rounded-lg">
                          ⚠ DELETION BLOCKED. Referential constraints require investigation.
                        </div>
                      )}

                      {selectedError.remediationCategory === 'INVESTIGATE' && (
                        <div className="p-3 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold text-center rounded-lg">
                          Requires technical character encoding investigation.
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </>
            )}

          </div>
        )}
      </Drawer>

      {/* Dynamic Impact preview dialog */}
      <ImpactPreview
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        errorIds={activePreviewIds}
        action={previewAction}
        onProceed={handleProceedStg}
      />

      {/* Promotion confirmation modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={(reason, pushType) => handleConfirmProd(reason, pushType)}
        title={confirmTitle}
        warningText={confirmWarning}
        requireEnvironmentInput={true}
        defaultPushType={selectedPushType}
      />

    </div>
  );
};
