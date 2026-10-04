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
    { id: 'setup', number: '01', label: 'Migration Setup', icon: Settings, description: 'Source & Target DB Connections' },
    { id: 'discovery', number: '02', label: 'Source Discovery', icon: Search, description: 'Source Schema Metadata' },
    { id: 'definition', number: '03', label: 'Target Discovery', icon: Table, description: 'Discovered Target Schema' },
    { id: 'mapping', number: '04', label: 'Mapping Workspace', icon: GitMerge, description: 'Table & Field Config JSON' },
    { id: 'validation', number: '05', label: 'Validation Check', icon: CheckCircle2, description: 'Pre-Flight Readiness Check' },
    { id: 'execution', number: '06', label: 'Sequential Execution', icon: PlayCircle, description: 'Live Migration Pipeline' },
    { id: 'dashboard', number: '07', label: 'Migration Dashboard', icon: LayoutDashboard, description: 'Reconciliation Directory' },
    { id: 'report', number: '08', label: 'Final Migration Report', icon: FileText, description: 'Audit Report Summary' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === activeStep);

  return (
    <aside 
      className={`bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-200 select-none shrink-0 font-sans z-20 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header & Progress Bar */}
      <div className="flex flex-col">
        {!sidebarCollapsed ? (
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between font-sans">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans">
              Migration Workflow
            </span>
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono">
              {currentStepIndex + 1} / 8
            </span>
          </div>
        ) : (
          <div className="py-3 border-b border-slate-100 text-center font-mono text-[10px] font-bold text-slate-400">
            {currentStepIndex + 1}/8
          </div>
        )}

        {/* Navigation Step Items */}
        <nav className="p-2 space-y-1">
          {steps.map((step, idx) => {
            const isActive = activeStep === step.id;
            const isCompleted = idx < currentStepIndex;
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`w-full flex items-center rounded-lg text-left transition-all cursor-pointer group relative ${
                  sidebarCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'
                } ${
                  isActive 
                    ? 'bg-slate-900 text-white font-bold shadow-xs' 
                    : isCompleted
                    ? 'text-slate-800 hover:bg-slate-100 font-semibold'
                    : 'text-slate-500 hover:bg-slate-50 font-medium hover:text-slate-900'
                }`}
              >
                {sidebarCollapsed ? (
                  /* Collapsed Icon View with Single Sleek Tooltip */
                  <div className="relative flex items-center justify-center">
                    {isCompleted ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    ) : (
                      <Icon className={`w-5 h-5 ${
                        isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'
                      }`} />
                    )}
                    {isActive && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                    )}

                    {/* Single Sleek Floating UI Tooltip */}
                    <div className="absolute left-12 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md shadow-lg z-50 pointer-events-none whitespace-nowrap font-sans border border-slate-800">
                      <span className="font-mono text-emerald-400 font-bold">{step.number}.</span>
                      <span className="font-semibold text-slate-100">{step.label}</span>
                    </div>
                  </div>
                ) : (
                  /* Expanded View */
                  <>
                    <div className="shrink-0 flex items-center justify-center">
                      {isCompleted ? (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          isActive ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        </div>
                      ) : (
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isActive 
                            ? 'bg-slate-800 text-slate-200 font-bold' 
                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                        }`}>
                          {step.number}
                        </span>
                      )}
                    </div>

                    <Icon className={`w-4 h-4 shrink-0 ${
                      isActive 
                        ? 'text-white' 
                        : isCompleted 
                        ? 'text-slate-700' 
                        : 'text-slate-400 group-hover:text-slate-700'
                    }`} />

                    <div className="flex-1 min-w-0">
                      <div className="text-xs truncate font-bold text-inherit flex items-center justify-between">
                        <span className="truncate">{step.label}</span>
                        {step.id === 'validation' && criticalIssuesResolved && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 ml-1" />
                        )}
                      </div>
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Rail Collapse Toggle */}
      <div className="p-2 border-t border-slate-100 font-sans">
        {!sidebarCollapsed ? (
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <span>Collapse Sidebar</span>
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </button>
        ) : (
          <div className="relative group flex justify-center">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute left-12 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md shadow-lg z-50 pointer-events-none whitespace-nowrap font-sans border border-slate-800">
              <span className="font-semibold">Expand Sidebar</span>
            </div>
          </div>
        )}
      </div>

    </aside>
  );
};
