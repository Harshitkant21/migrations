// src/components/journey/ExecutionControlBar.tsx
import React from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { 
  Play, 
  Pause, 
  RotateCw, 
  Square, 
  ArrowRight, 
  Activity,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const ExecutionControlBar: React.FC = () => {
  const { 
    executionStatus, 
    executionProgress, 
    pauseExecution, 
    resumeExecution, 
    retryFailedExecution, 
    stopExecution, 
    completeExecution
  } = useGlobalStore();

  const isRunning = executionStatus === 'running';
  const isPaused = executionStatus === 'paused';

  return (
    <div className="space-y-3 font-sans">
      
      {/* Top Operations Header Ribbon */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold font-mono text-slate-900 tracking-tight">
                Production Database Migration
              </h2>
              <Badge 
                variant={isRunning ? 'success' : isPaused ? 'warning' : 'error'} 
                size="sm" 
                dot
              >
                {executionStatus.toUpperCase()}
              </Badge>
              <span className="text-[11px] font-mono text-slate-400">
                • Slot: pgoutput_repl_01 • Engine: PostgreSQL 14.9 → Aurora 16.2
              </span>
            </div>
          </div>

          {/* Interactive Pipeline Action Controls */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            {isRunning ? (
              <Button
                variant="outline"
                size="sm"
                onClick={pauseExecution}
                className="text-xs border-amber-300 text-amber-900 hover:bg-amber-50 h-7 px-2.5"
              >
                <Pause className="w-3 h-3 text-amber-600" />
                <span>Pause</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={resumeExecution}
                className="text-xs border-emerald-300 text-emerald-900 hover:bg-emerald-50 h-7 px-2.5"
              >
                <Play className="w-3 h-3 text-emerald-600" />
                <span>Resume</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={retryFailedExecution}
              className="text-xs h-7 px-2.5"
            >
              <RotateCw className="w-3 h-3 text-slate-600" />
              <span>Retry DLQ (42.3K)</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={stopExecution}
              className="text-xs text-rose-700 hover:bg-rose-50 border-rose-200 h-7 px-2.5"
            >
              <Square className="w-3 h-3 text-rose-600" />
              <span>Stop</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={completeExecution}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs shadow-xs h-7 px-3"
            >
              <span>Complete & Dashboard</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1 font-mono">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-bold text-[11px] text-slate-700 uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              Pipeline Execution Progress
            </span>
            <span className="text-sm font-bold text-slate-900 tabular-nums">
              {executionProgress.toFixed(1)}%
            </span>
          </div>

          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div 
              className="h-full bg-slate-900 rounded-full transition-all duration-500 relative"
              style={{ width: `${executionProgress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
            </div>
          </div>
        </div>

        {/* Key Real-Time Metrics Strip (Horizontal Compact Ribbon) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="bg-slate-50/80 p-2 rounded border border-slate-200/80">
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider whitespace-nowrap truncate">Tables</div>
            <div className="text-xs font-bold text-slate-900 mt-0.5 font-mono tabular-nums">167 / 245</div>
          </div>

          <div className="bg-slate-50/80 p-2 rounded border border-slate-200/80">
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider whitespace-nowrap truncate">Records</div>
            <div className="text-xs font-bold text-slate-900 mt-0.5 font-mono tabular-nums">12.4M / 18.4M</div>
          </div>

          <div className="bg-emerald-50/60 p-2 rounded border border-emerald-200/60">
            <div className="text-[10px] text-emerald-800 font-medium uppercase tracking-wider whitespace-nowrap truncate">Successful</div>
            <div className="text-xs font-bold text-emerald-950 mt-0.5 font-mono tabular-nums">12,142,500</div>
          </div>

          <div className="bg-rose-50/60 p-2 rounded border border-rose-200/60">
            <div className="text-[10px] text-rose-800 font-medium uppercase tracking-wider whitespace-nowrap truncate">Failed / DLQ</div>
            <div className="text-xs font-bold text-rose-950 mt-0.5 font-mono tabular-nums">42,381</div>
          </div>

          <div className="bg-slate-50/80 p-2 rounded border border-slate-200/80">
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider whitespace-nowrap truncate">Skipped</div>
            <div className="text-xs font-bold text-slate-700 mt-0.5 font-mono tabular-nums">18,120</div>
          </div>

          <div className="bg-slate-50/80 p-2 rounded border border-slate-200/80">
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider whitespace-nowrap truncate">Throughput</div>
            <div className="text-xs font-bold text-slate-900 mt-0.5 font-mono tabular-nums">1,450 /sec</div>
          </div>

          <div className="bg-slate-50/80 p-2 rounded border border-slate-200/80">
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider whitespace-nowrap truncate">Elapsed</div>
            <div className="text-xs font-bold text-slate-800 mt-0.5 font-mono tabular-nums">02:18:42</div>
          </div>

          <div className="bg-slate-50/80 p-2 rounded border border-slate-200/80">
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider whitespace-nowrap truncate">Remaining</div>
            <div className="text-xs font-bold text-slate-800 mt-0.5 font-mono tabular-nums">00:51:12</div>
          </div>
        </div>

      </div>

    </div>
  );
};
