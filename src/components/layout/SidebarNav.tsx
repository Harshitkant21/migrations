// src/components/layout/SidebarNav.tsx
import React from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { WorkspaceStep } from '../../types/models';
import { 
  Settings, 
  Search, 
  Table, 
  GitMerge, 
  CheckCircle2, 
  PlayCircle, 
  LayoutDashboard, 
  FileText,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface StepItem {
  id: WorkspaceStep;
  number: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const SidebarNav: React.FC = () => {
  const { 
    activeStep, 
    setActiveStep, 
    sidebarCollapsed, 
    setSidebarCollapsed,
    criticalIssuesResolved
  } = useGlobalStore();

  const steps: StepItem[] = [
    { id: 'setup', number: '01', label: 'Migration Setup', icon: Settings, description: 'Source/target connections & intent' },
    { id: 'discovery', number: '02', label: 'Source Discovery', icon: Search, description: 'Discovered schema & impact analysis' },
    { id: 'definition', number: '03', label: 'Target Definition', icon: Table, description: 'Target tables & column DDL' },
    { id: 'mapping', number: '04', label: 'Advanced Mapping', icon: GitMerge, description: '1:1, 1:N, N:1, N:N & JSON import' },
    { id: 'validation', number: '05', label: 'Validation Check', icon: CheckCircle2, description: 'Readiness check & remediation' },
    { id: 'execution', number: '06', label: 'Migration Execution', icon: PlayCircle, description: 'Control plane & live stream logs' },
    { id: 'dashboard', number: '07', label: 'Migration Dashboard', icon: LayoutDashboard, description: 'Monitoring, status & table drilldowns' },
    { id: 'report', number: '08', label: 'Final Migration Report', icon: FileText, description: 'Audit report & reconciliation diff' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === activeStep);

  return (
    <aside 
      className={`bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-200 select-none shrink-0 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top: Section Header & Progress Indicator */}
      <div className="flex flex-col">
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">
              Migration Orchestrator
            </span>
            <span className="text-[11px] font-mono font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
              Step {currentStepIndex + 1} of 8
            </span>
          </div>
        )}

        {/* Step Navigation List */}
        <nav className="p-2 space-y-1">
          {steps.map((step, idx) => {
            const isActive = activeStep === step.id;
            const isCompleted = idx < currentStepIndex;
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer group relative ${
                  isActive 
                    ? 'bg-slate-900 text-white font-semibold shadow-xs' 
                    : isCompleted
                    ? 'text-slate-800 hover:bg-slate-100/80 font-medium'
                    : 'text-slate-500 hover:bg-slate-100/60 font-normal hover:text-slate-800'
                }`}
                title={sidebarCollapsed ? `${step.number}. ${step.label}` : undefined}
              >
                {/* Step indicator: checkmark if completed, number if active/pending */}
                <div className="shrink-0 flex items-center justify-center">
                  {isCompleted ? (
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  ) : (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive 
                        ? 'bg-slate-800 text-slate-300 font-bold' 
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    }`}>
                      {step.number}
                    </span>
                  )}
                </div>

                {/* Icon */}
                <Icon className={`w-4 h-4 shrink-0 ${
                  isActive 
                    ? 'text-white' 
                    : isCompleted 
                    ? 'text-slate-700' 
                    : 'text-slate-400 group-hover:text-slate-600'
                }`} />

                {/* Label & Description */}
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="text-xs truncate font-medium text-inherit flex items-center justify-between">
                      <span className="truncate">{step.label}</span>
                      {step.id === 'validation' && criticalIssuesResolved && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 ml-1" />
                      )}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Collapse Rail Toggle */}
      <div className="p-3 border-t border-slate-100 flex items-center justify-between">
        {!sidebarCollapsed && (
          <div className="text-[11px] font-mono text-slate-400">
            Enterprise V0 Prototype
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer ml-auto"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

    </aside>
  );
};
