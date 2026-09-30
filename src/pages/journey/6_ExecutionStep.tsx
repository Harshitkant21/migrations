// src/pages/journey/6_ExecutionStep.tsx
import React from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { ExecutionControlBar } from '../../components/journey/ExecutionControlBar';
import { CurrentActivityTable } from '../../components/journey/CurrentActivityTable';
import { LiveLogTerminal } from '../../components/journey/LiveLogTerminal';
import { Button } from '../../components/ui/Button';
import { ArrowRight, ArrowLeft, Check, Terminal } from 'lucide-react';

export const MigrationExecutionStep: React.FC = () => {
  const { setActiveStep, completeExecution } = useGlobalStore();

  return (
    <div className="space-y-4 font-sans">
      
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Step 06
            </span>
            <span className="text-slate-300">•</span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Migration Execution & Control Plane
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline orchestration, multi-threaded CDC replication, and live telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 whitespace-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveStep('validation')}
            className="text-xs h-8 px-2.5 whitespace-nowrap font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Validation</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={completeExecution}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-xs h-8 px-3 whitespace-nowrap font-medium"
          >
            <span>Complete & Open Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* Primary Execution Control Bar & Compact Metrics Strip */}
      <ExecutionControlBar />

      {/* 2-Column Live Operations Room: Active Workload (Left) & Telemetry Logs (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <CurrentActivityTable />
        </div>
        <div>
          <LiveLogTerminal />
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active logical replication slot streaming at ~1,450 records/sec</span>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setActiveStep('dashboard')}
          className="font-mono text-xs shadow-xs"
        >
          <span>Open Live Migration Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

    </div>
  );
};

