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
  ChevronRight,
  FolderKanban,
  X
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
    criticalIssuesResolved,
    projectName,
    projectDescription
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

  const handleStepClick = (stepId: WorkspaceStep) => {
    setActiveStep(stepId);
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  };

  return (
    <aside 
      className={`bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-200 select-none shrink-0 font-sans z-40 md:z-30 h-full max-h-full ${
        sidebarCollapsed 
          ? 'hidden md:flex md:w-16 overflow-visible' 
          : 'fixed inset-y-0 left-0 md:relative md:flex w-64 shadow-xl md:shadow-none overflow-hidden'
      }`}
    >
      {/* Top Header */}
      <div className="flex flex-col shrink-0 border-b border-slate-100">
        {!sidebarCollapsed ? (
          <div className="px-3.5 py-3 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider">
                <FolderKanban className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span>Active Project</span>
              </div>
              <div 
                className="text-xs font-bold text-slate-900 truncate mt-0.5" 
                title={projectDescription ? `${projectName} — ${projectDescription}` : projectName}
              >
                {projectName || 'Migration Project'}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-mono">
                {currentStepIndex + 1}/8
              </span>
              {/* Close button for mobile drawer */}
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 md:hidden cursor-pointer"
                title="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="py-3 flex flex-col items-center justify-center gap-1 relative group">
            <div 
              className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors"
              title={`Project: ${projectName}`}
              onClick={() => setSidebarCollapsed(false)}
            >
              <FolderKanban className="w-4 h-4 text-slate-600" />
            </div>
            <span className="text-[9px] font-mono font-bold text-slate-400">
              {currentStepIndex + 1}/8
            </span>
            <div className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 hidden group-hover:flex items-center bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-md shadow-2xl z-50 pointer-events-none whitespace-nowrap font-sans border border-slate-800">
              <span className="font-semibold text-slate-100">{projectName || 'Migration Project'}</span>
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 border-l border-b border-slate-800" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Step Items - Compact, Clean, Overflow-visible when collapsed */}
      <nav className={`p-2 space-y-0.5 flex-1 min-h-0 ${
        sidebarCollapsed 
          ? 'overflow-visible' 
          : 'overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'
      }`}>
        {steps.map((step, idx) => {
          const isActive = activeStep === step.id;
          const isCompleted = idx < currentStepIndex;
          const Icon = step.icon;

          return (
            <button
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              title={sidebarCollapsed ? `${step.number}. ${step.label}` : undefined}
              className={`w-full flex items-center rounded-lg text-left transition-all cursor-pointer group relative ${
                sidebarCollapsed ? 'justify-center p-2' : 'gap-2 px-2.5 py-1.5'
              } ${
                isActive 
                  ? 'bg-slate-900 text-white font-bold shadow-xs' 
                  : isCompleted
                  ? 'text-slate-800 hover:bg-slate-100 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50 font-medium hover:text-slate-900'
              }`}
            >
              {sidebarCollapsed ? (
                /* Collapsed Icon View with Unclipped Floating Tooltip */
                <>
                  <div className="flex items-center justify-center">
                    {isCompleted ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                    ) : (
                      <Icon className={`w-4 h-4 ${
                        isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'
                      }`} />
                    )}
                    {isActive && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                    )}
                  </div>

                  {/* Floating Unclipped Tooltip */}
                  <div className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-md shadow-2xl z-50 pointer-events-none whitespace-nowrap font-sans border border-slate-800">
                    <span className="font-mono text-emerald-400 font-bold">{step.number}.</span>
                    <span className="font-semibold text-slate-100">{step.label}</span>
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 border-l border-b border-slate-800" />
                  </div>
                </>
              ) : (
                /* Expanded View - Sleek & Compact */
                <>
                  <div className="shrink-0 flex items-center justify-center">
                    {isCompleted ? (
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        isActive ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                      </div>
                    ) : (
                      <span className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                        isActive 
                          ? 'bg-slate-800 text-slate-200 font-bold' 
                          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                      }`}>
                        {step.number}
                      </span>
                    )}
                  </div>

                  <Icon className={`w-3.5 h-3.5 shrink-0 ${
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

      {/* Bottom Rail Collapse Toggle - Clean, Sleek, No Clumsy Text */}
      <div className="p-2 border-t border-slate-100 font-sans shrink-0 bg-white">
        {!sidebarCollapsed ? (
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] text-slate-400 font-mono">v2.4 Engine</span>
          </div>
        ) : (
          <div className="flex justify-center relative group">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 hidden group-hover:flex items-center bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-md shadow-2xl z-50 pointer-events-none whitespace-nowrap font-sans border border-slate-800">
              <span className="font-semibold text-slate-100">Expand Sidebar</span>
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 border-l border-b border-slate-800" />
            </div>
          </div>
        )}
      </div>

    </aside>
  );
};
