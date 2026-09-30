// src/components/journey/ReadinessScorecard.tsx
import React, { useState } from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  ArrowRight,
  ShieldAlert,
  PlayCircle,
  Wrench,
  Check,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const ReadinessScorecard: React.FC = () => {
  const { 
    readinessScore, 
    validationIssues, 
    criticalIssuesResolved,
    fixIssues,
    setActiveStep 
  } = useGlobalStore();

  const [activeTab, setActiveTab] = useState<'critical' | 'warnings' | 'passed'>('critical');
  const [fixing, setFixing] = useState(false);

  const criticalIssues = validationIssues.filter(i => i.severity === 'Critical');
  const warningIssues = validationIssues.filter(i => i.severity === 'Warning');
  const passedCount = 235 + (criticalIssuesResolved ? 2 : 0);

  const canRunMigration = criticalIssues.length === 0 || criticalIssuesResolved;

  const handleFixIssues = async () => {
    setFixing(true);
    await new Promise(resolve => setTimeout(resolve, 700));
    setFixing(false);
    fixIssues();
    setActiveTab('passed');
  };

  return (
    <div className="space-y-4 font-sans max-w-full">
      
      {/* Primary Readiness Visual Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        
        {/* Left: Score Donut & Readiness Status (5 cols) */}
        <div className="lg:col-span-5 flex items-center gap-5 border-b lg:border-b-0 lg:border-r border-slate-100 pb-4 lg:pb-0 lg:pr-5">
          <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border font-mono shrink-0 ${
            canRunMigration
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-amber-50 text-amber-900 border-amber-300'
          }`}>
            <span className="text-3xl font-black tabular-nums">{readinessScore}%</span>
            <span className="text-[9px] font-bold uppercase tracking-wider opacity-75">Ready</span>
          </div>

          <div className="space-y-1 font-mono">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                {canRunMigration ? 'MIGRATION READY' : 'MIGRATION BLOCKED'}
              </h2>
              <Badge variant={canRunMigration ? 'success' : 'error'} size="sm" dot>
                {canRunMigration ? '100% Verified' : '2 Critical Conflicts'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-sans leading-tight">
              {canRunMigration 
                ? 'All structural, relational, and datatype conflicts resolved.' 
                : 'Execution gated until critical datatype conversion rules are applied.'}
            </p>
          </div>
        </div>

        {/* Center: Domain Breakdown Compact Row (4 cols) */}
        <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
          <div className="p-2 rounded bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 block text-[9px] uppercase">Schema</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1">✓ 100%</span>
          </div>
          <div className="p-2 rounded bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 block text-[9px] uppercase">Mappings</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">✓ 97.1%</span>
          </div>
          <div className="p-2 rounded bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 block text-[9px] uppercase">Transformations</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1">✓ 100%</span>
          </div>
          <div className="p-2 rounded bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 block text-[9px] uppercase">Constraints</span>
            <span className="font-bold text-amber-700 flex items-center gap-1">⚠ 8 Warn</span>
          </div>
          <div className={`p-2 rounded col-span-2 sm:col-span-2 border ${
            canRunMigration ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
          }`}>
            <span className="text-slate-400 block text-[9px] uppercase">Data Quality</span>
            <span className={`font-bold flex items-center gap-1 ${
              canRunMigration ? 'text-emerald-800' : 'text-rose-800'
            }`}>
              {canRunMigration ? '✓ 0 Conflicts' : '✕ 2 Critical Conflicts'}
            </span>
          </div>
        </div>

        {/* Right: Primary Run Actions (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          {!canRunMigration ? (
            <Button
              variant="primary"
              size="md"
              onClick={handleFixIssues}
              loading={fixing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-medium text-xs shadow-xs whitespace-nowrap"
            >
              <Wrench className="w-3.5 h-3.5 mr-1.5" />
              <span>Fix Issues (Auto-Remediate)</span>
            </Button>
          ) : null}

          <Button
            variant="primary"
            size="md"
            disabled={!canRunMigration}
            onClick={() => setActiveStep('execution')}
            className={`w-full font-sans font-medium text-xs shadow-xs whitespace-nowrap ${
              canRunMigration 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <PlayCircle className="w-4 h-4 mr-1.5" />
            <span>Run Migration Now</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveStep('execution')}
            disabled={!canRunMigration}
            className="w-full font-sans font-medium text-xs text-slate-600 whitespace-nowrap"
          >
            Continue Anyway (Override Warnings)
          </Button>
        </div>

      </div>

      {/* Structured Issues Table Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden font-sans text-xs">
        
        {/* Issue Categorization Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-4 pt-2">
          <button
            onClick={() => setActiveTab('critical')}
            className={`flex items-center gap-2 px-3 py-2 font-semibold text-xs border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'critical'
                ? 'border-rose-600 text-rose-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Critical Issues</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
              criticalIssues.length > 0 ? 'bg-rose-100 text-rose-800 font-bold' : 'bg-slate-100 text-slate-500'
            }`}>
              {criticalIssues.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('warnings')}
            className={`flex items-center gap-2 px-3 py-2 font-semibold text-xs border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'warnings'
                ? 'border-amber-500 text-amber-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Warnings</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-100 text-amber-800 font-bold">
              {warningIssues.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('passed')}
            className={`flex items-center gap-2 px-3 py-2 font-semibold text-xs border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'passed'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Passed Checks</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold">
              {passedCount}
            </span>
          </button>
        </div>

        {/* Dense Issues Table */}
        <div className="overflow-x-auto">
          {activeTab === 'critical' && (
            criticalIssues.length === 0 ? (
              <div className="py-8 text-center space-y-1">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
                <div className="font-bold text-slate-900 text-xs">All Critical Issues Resolved</div>
                <p className="text-slate-500 text-[11px] font-sans">
                  The migration execution gate is unlocked. Readiness score is 100%.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/60 border-b border-slate-200 text-slate-500 text-[10px] uppercase">
                    <th className="py-2 px-3">Severity</th>
                    <th className="py-2 px-3">Entity Reference</th>
                    <th className="py-2 px-3">Validation Conflict Description</th>
                    <th className="py-2 px-3">Automated Remediation</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {criticalIssues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-rose-50/30">
                      <td className="py-2.5 px-3">
                        <Badge variant="error" size="sm">CRITICAL</Badge>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {issue.entity}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-sans text-xs">
                        <span className="font-bold text-slate-900 font-mono block">{issue.title}</span>
                        <span>{issue.description}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                        {issue.remediation}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleFixIssues}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[11px] px-2.5 py-1"
                        >
                          Fix
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {activeTab === 'warnings' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/60 border-b border-slate-200 text-slate-500 text-[10px] uppercase">
                  <th className="py-2 px-3">Severity</th>
                  <th className="py-2 px-3">Target Entity</th>
                  <th className="py-2 px-3">Warning Advisory</th>
                  <th className="py-2 px-3">Fallback Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {warningIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3">
                      <Badge variant="warning" size="sm">WARNING</Badge>
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      {issue.entity}
                    </td>
                    <td className="py-2 px-3 text-slate-700 font-sans text-xs">
                      {issue.description}
                    </td>
                    <td className="py-2 px-3 text-slate-500 text-[11px]">
                      {issue.remediation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'passed' && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded bg-emerald-50/60 border border-emerald-200/70 text-emerald-900 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>245 source tables verified against target PostgreSQL 16 catalog</span>
              </div>
              <div className="p-2.5 rounded bg-emerald-50/60 border border-emerald-200/70 text-emerald-900 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>18 transformation rules compiled into native engine plans</span>
              </div>
              <div className="p-2.5 rounded bg-emerald-50/60 border border-emerald-200/70 text-emerald-900 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>4 table merge join keys validated for referential integrity</span>
              </div>
              <div className="p-2.5 rounded bg-emerald-50/60 border border-emerald-200/70 text-emerald-900 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>7 table splits configured with surrogate foreign key generators</span>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
