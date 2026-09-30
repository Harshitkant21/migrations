// src/pages/journey/8_MigrationReport.tsx
import React from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { ReconciliationDiff } from '../../components/journey/ReconciliationDiff';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  FileText, 
  Download, 
  Share2, 
  FileCode, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Server,
  Layers,
  Database
} from 'lucide-react';

export const MigrationReportStep: React.FC = () => {
  const { setActiveStep, addToast } = useGlobalStore();

  const handleDownloadPdf = () => {
    addToast('Generating PDF audit report — MIG-2026-0928-PROD.pdf downloaded', 'success');
  };

  const handleExportJson = () => {
    addToast('Audit manifest exported as JSON specification', 'info');
  };

  const handleShareReport = () => {
    addToast('Report access link copied to clipboard: https://platform.internal/reports/MIG-2026-0928-PROD', 'success');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header & Export Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            STAGE 08 OF 08
          </span>
          <h1 className="text-xl font-bold font-mono text-slate-900 tracking-tight mt-0.5">
            Final Migration Audit Report & Reconciliation
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Comprehensive compliance manifest, execution verification, and variance reconciliation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => setActiveStep('dashboard')}
            className="font-mono text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={handleExportJson}
            className="font-mono text-xs"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={handleShareReport}
            className="font-mono text-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Report</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleDownloadPdf}
            className="font-mono text-xs shadow-xs bg-slate-900 hover:bg-slate-800 text-white"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </Button>
        </div>
      </div>

      {/* Official Audit Document Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8 space-y-8 font-sans">
        
        {/* Document Header & Seal */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-slate-500 mb-1">
              <span>ENTERPRISE DATABASE MIGRATION SYSTEM</span>
              <span>•</span>
              <span>OFFICIAL RUN MANIFEST</span>
            </div>
            <h2 className="text-2xl font-black font-mono text-slate-900 tracking-tight">
              Production Database Migration
            </h2>
            <div className="flex items-center gap-2 mt-2 font-mono">
              <Badge variant="neutral" size="sm">ID: MIG-2026-0928-PROD</Badge>
              <Badge variant="success" size="sm" dot>Environment: Production</Badge>
              <Badge variant="warning" size="sm">Completed with Warnings</Badge>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-right font-mono text-xs space-y-1">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Health & Confidence Index</div>
            <div className="text-2xl font-black text-emerald-700">94.8%</div>
            <div className="text-[11px] text-slate-500">Net Success Rate: 98.37%</div>
          </div>
        </div>

        {/* Section 1: Migration Summary & Provenance */}
        <div className="space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-slate-500" />
              1. Migration Run Specification & Provenance
            </span>
            <span className="text-[10px] text-slate-400">Environment: Production (VPC-East)</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Source Cluster</div>
              <div className="font-bold text-slate-900 mt-0.5">PostgreSQL 14.9</div>
              <div className="text-[10px] text-slate-500">aws-east-pg01:5432</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase">Target Destination</div>
              <div className="font-bold text-emerald-800 mt-0.5">Aurora PG 16.2</div>
              <div className="text-[10px] text-slate-500">pg-cloud-aurora:5432</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase">Migration Mode</div>
              <div className="font-bold text-slate-900 mt-0.5">Schema + Data</div>
              <div className="text-[10px] text-slate-500">CDC Zero-Downtime</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase">Execution Window</div>
              <div className="font-bold text-slate-900 mt-0.5">03h 12m 15s</div>
              <div className="text-[10px] text-slate-500">2026-09-28 08:30 → 11:42 UTC</div>
            </div>
          </div>
        </div>

        {/* Section 2: Object Results Table */}
        <div className="space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              2. Schema Object Results
            </span>
            <span className="text-[10px] text-slate-400">Total Scope: 245 Tables</span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] uppercase">
                  <th className="py-2 px-3">Object Category</th>
                  <th className="py-2 px-3 text-right">Table Count</th>
                  <th className="py-2 px-3">Resolution Status</th>
                  <th className="py-2 px-3">Audit Operational Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-bold text-slate-900">Discovered</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-800 tabular-nums">245</td>
                  <td className="py-2 px-3"><Badge variant="neutral" size="sm">Cataloged</Badge></td>
                  <td className="py-2 px-3 text-slate-600 font-sans text-xs">All user tables discovered in public and operational schemas</td>
                </tr>
                <tr className="hover:bg-slate-50 bg-emerald-50/20">
                  <td className="py-2 px-3 font-bold text-emerald-950">Migrated</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-800 tabular-nums">221</td>
                  <td className="py-2 px-3"><Badge variant="success" size="sm">100% Verified</Badge></td>
                  <td className="py-2 px-3 text-slate-600 font-sans text-xs">Direct structural match; constraints and foreign keys validated</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-bold text-slate-700">Skipped</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-700 tabular-nums">18</td>
                  <td className="py-2 px-3"><Badge variant="neutral" size="sm">Rule Excluded</Badge></td>
                  <td className="py-2 px-3 text-slate-600 font-sans text-xs">Ephemeral session caches and staging log tables excluded by configuration</td>
                </tr>
                <tr className="hover:bg-slate-50 bg-rose-50/20">
                  <td className="py-2 px-3 font-bold text-rose-950">Failed</td>
                  <td className="py-2 px-3 text-right font-bold text-rose-800 tabular-nums">6</td>
                  <td className="py-2 px-3"><Badge variant="error" size="sm">Blocked DLQ</Badge></td>
                  <td className="py-2 px-3 text-slate-600 font-sans text-xs">Circular foreign key constraints requiring deferred schema patch</td>
                </tr>
                <tr className="hover:bg-slate-50 bg-purple-50/20">
                  <td className="py-2 px-3 font-bold text-purple-950">Merged</td>
                  <td className="py-2 px-3 text-right font-bold text-purple-800 tabular-nums">4</td>
                  <td className="py-2 px-3"><Badge variant="info" size="sm">N → 1 Merged</Badge></td>
                  <td className="py-2 px-3 text-slate-600 font-sans text-xs">Denormalized legacy orders + order_items into unified customer transactions</td>
                </tr>
                <tr className="hover:bg-slate-50 bg-indigo-50/20">
                  <td className="py-2 px-3 font-bold text-indigo-950">Split</td>
                  <td className="py-2 px-3 text-right font-bold text-indigo-800 tabular-nums">7</td>
                  <td className="py-2 px-3"><Badge variant="info" size="sm">1 → N Partitioned</Badge></td>
                  <td className="py-2 px-3 text-slate-600 font-sans text-xs">Normalized legacy monolithic customer table into separate profile and auth tables</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Data Reconciliation Diff & Root Cause Analysis */}
        <ReconciliationDiff />

        {/* Section 4: Mapping & Rules Validation Summary */}
        <div className="space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              4. Validation & Governance Summary
            </span>
            <span className="text-[10px] text-emerald-700 font-bold">Readiness Score: 100% Remediated</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Complete Mappings</div>
              <div className="font-bold text-emerald-800 mt-0.5">238 Tables (97.1%)</div>
              <div className="text-[10px] text-slate-500">5 Partial, 2 Custom</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase">Transformations Executed</div>
              <div className="font-bold text-slate-900 mt-0.5">18 Active Rules</div>
              <div className="text-[10px] text-slate-500">Type casts, hashes, normalizers</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase">Reconciliation Integrity</div>
              <div className="font-bold text-emerald-800 mt-0.5">99.77% Match</div>
              <div className="text-[10px] text-slate-500">Checksum & row count validated</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase">Target Constraints</div>
              <div className="font-bold text-slate-900 mt-0.5">98.2% Enforced</div>
              <div className="text-[10px] text-slate-500">PKs, FKs, Unique & Checks</div>
            </div>
          </div>
        </div>

        {/* Section 6: Grouped Errors & Warnings */}
        <div className="space-y-3 font-mono text-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            5. Grouped Issues & Remediation Trail
          </h3>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="p-3.5 flex items-start justify-between gap-3 bg-rose-50/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="error" size="sm">CRITICAL RESOLVED</Badge>
                  <span className="font-bold text-slate-900">Type Cast Conflict: orders.discount_code</span>
                </div>
                <p className="text-xs text-slate-600 font-sans">
                  Applied automated SAFE_DISCOUNT_LOOKUP rule converting alphanumeric discount vouchers to NUMERIC(10,2) format with 0.00 default fallback.
                </p>
              </div>
              <Badge variant="success" size="sm">Remediated</Badge>
            </div>

            <div className="p-3.5 flex items-start justify-between gap-3 bg-amber-50/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="warning" size="sm">WARNING</Badge>
                  <span className="font-bold text-slate-900">240 Missing Foreign-Key References in orders</span>
                </div>
                <p className="text-xs text-slate-600 font-sans">
                  Archived pre-2018 records referencing deleted customer IDs quarantined in dlq_orders_unresolved.
                </p>
              </div>
              <Badge variant="warning" size="sm">Quarantined</Badge>
            </div>

            <div className="p-3.5 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="info" size="sm">INFO</Badge>
                  <span className="font-bold text-slate-900">12,110 Customer Records Deduplicated</span>
                </div>
                <p className="text-xs text-slate-600 font-sans">
                  Merged duplicate customer accounts sharing identical E.164 phone numbers during 1:N table split.
                </p>
              </div>
              <Badge variant="success" size="sm">Consolidated</Badge>
            </div>
          </div>
        </div>

        {/* Auditor Sign-off Footer */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-slate-500">
          <div>
            Generated by <strong className="text-slate-900">Enterprise Database Migration Platform v2.4</strong>
          </div>
          <div>
            Cryptographic SHA-256 Digest: <span className="font-mono text-slate-700 font-bold">8f92a10b4c81...e42</span>
          </div>
        </div>

      </div>

    </div>
  );
};
