// src/pages/journey/5_ValidationStep.tsx
import React from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { ReadinessScorecard } from '../../components/journey/ReadinessScorecard';
import { Button } from '../../components/ui/Button';
import { ArrowRight, ArrowLeft, PlayCircle, ShieldCheck } from 'lucide-react';

export const ValidationStep: React.FC = () => {
  const { setActiveStep, criticalIssuesResolved } = useGlobalStore();

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Step 05
            </span>
            <span className="text-slate-300">•</span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Validation & Migration Readiness Gate
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-flight schema compilation, data type safety reconciliation, and constraint verification.
          </p>
        </div>

        <div className="flex items-center gap-2 whitespace-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveStep('mapping')}
            className="text-xs h-8 px-2.5 whitespace-nowrap font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Mapping</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            disabled={!criticalIssuesResolved}
            onClick={() => setActiveStep('execution')}
            className={`text-xs h-8 px-3 whitespace-nowrap font-medium ${
              criticalIssuesResolved 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            title={!criticalIssuesResolved ? 'Resolve critical conflicts before starting migration' : 'Proceed to Execution'}
          >
            <PlayCircle className="w-3.5 h-3.5 mr-1" />
            <span>Run Migration</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* Primary Readiness Scorecard & Issues Breakdown */}
      <ReadinessScorecard />

      {/* Bottom Sticky Action Bar */}
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Automated zero-downtime safety gates active</span>
        </div>

        <Button
          variant="primary"
          size="md"
          disabled={!criticalIssuesResolved}
          onClick={() => setActiveStep('execution')}
          className={`font-mono text-xs ${criticalIssuesResolved ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' : ''}`}
        >
          <PlayCircle className="w-4 h-4" />
          <span>Run Migration</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

    </div>
  );
};
