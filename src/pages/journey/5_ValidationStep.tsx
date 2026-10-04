// src/pages/journey/5_ValidationStep.tsx
import React from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { ReadinessScorecard } from '../../components/journey/ReadinessScorecard';
import { Button } from '../../components/ui/Button';
import { ArrowRight, ArrowLeft, PlayCircle, ShieldCheck, Terminal } from 'lucide-react';

export const ValidationStep: React.FC = () => {
  const { setActiveStep, criticalIssuesResolved } = useGlobalStore();

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Step 05
            </span>
            <span className="text-slate-300">•</span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Script Pre-Flight & Dry-Run Validation Mode
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            The backend migration script runs in <code className="font-mono bg-slate-100 text-slate-800 px-1 py-0.2 rounded border border-slate-200">--dry-run --validate</code> mode to test schemas and constraints before live data transfer.
          </p>
        </div>

        <div className="flex items-center gap-2.5 whitespace-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveStep('mapping')}
            icon={ArrowLeft}
            iconPosition="left"
            className="text-xs font-semibold whitespace-nowrap"
          >
            Mapping Workspace
          </Button>

          <Button
            variant="primary"
            size="sm"
            disabled={!criticalIssuesResolved}
            onClick={() => setActiveStep('execution')}
            icon={PlayCircle}
            iconPosition="left"
            className={`text-xs font-bold whitespace-nowrap ${
              criticalIssuesResolved 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            title={!criticalIssuesResolved ? 'Resolve critical conflicts before starting migration' : 'Proceed to Live Execution'}
          >
            Proceed to Execution
          </Button>
        </div>
      </div>

      {/* EXPLANATION BOX: HOW THE SCRIPT HANDLES VALIDATION */}
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm flex items-start gap-3 font-sans">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
          <Terminal className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="font-mono text-sm font-bold text-white flex items-center gap-2">
            <span>Migration Script Execution Pre-Flight Checks</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
              Script --dry-run
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            In your actual migration workflow, the Python/Go migration script performs automated validation checks directly when executed. This stage surfaces the script's initial dry-run results—confirming database connectivity, target table existence, column type casting safety (e.g. <code className="font-mono bg-slate-800 text-emerald-300 px-1 py-0.2 rounded">VARCHAR</code> to <code className="font-mono bg-slate-800 text-emerald-300 px-1 py-0.2 rounded">UUID</code>), and foreign key integrity before starting live row copying in Step 06.
          </p>
        </div>
      </div>

      {/* Primary Readiness Scorecard & Issues Breakdown */}
      <ReadinessScorecard />

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="text-xs font-mono text-slate-600 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Script pre-flight validation passed. Pipeline ready for sequential execution.</span>
        </div>

        <Button
          variant="primary"
          size="md"
          disabled={!criticalIssuesResolved}
          onClick={() => setActiveStep('execution')}
          icon={PlayCircle}
          iconPosition="left"
          className={`font-mono text-xs font-bold whitespace-nowrap ${criticalIssuesResolved ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' : ''}`}
        >
          Proceed to Live Execution
        </Button>
      </div>

    </div>
  );
};
