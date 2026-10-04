// src/components/layout/DemoJumperModal.tsx
import React from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { WorkspaceStep } from '../../types/models';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { 
  Home, 
  Settings, 
  Search, 
  Table, 
  GitMerge, 
  CheckCircle2, 
  PlayCircle, 
  LayoutDashboard, 
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const DemoJumperModal: React.FC = () => {
  const { 
    demoModeQuickJumpOpen, 
    setDemoModeQuickJumpOpen, 
    setIsLandingPage, 
    setActiveStep,
    setDashboardTab,
    fixIssues,
    criticalIssuesResolved
  } = useGlobalStore();

  const handleJump = (step: WorkspaceStep | 'landing', subtab?: 'overview' | 'status' | 'mapping_view' | 'details') => {
    if (step === 'landing') {
      setIsLandingPage(true);
    } else {
      setIsLandingPage(false);
      setActiveStep(step);
      if (subtab) {
        setDashboardTab(subtab);
      }
    }
    setDemoModeQuickJumpOpen(false);
  };

  const jumpOptions: {
    id: WorkspaceStep | 'landing';
    number: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    subtab?: 'overview' | 'status' | 'mapping_view' | 'details';
    badge?: string;
  }[] = [
    { id: 'landing', number: '00', title: 'Landing Page', description: 'Single-screen minimal entry point', icon: Home },
    { id: 'setup', number: '01', title: 'Migration Setup', description: 'PostgreSQL source & target connections', icon: Settings },
    { id: 'discovery', number: '02', title: 'Source Discovery', description: '245 tables discovered & metadata explorer', icon: Search },
    { id: 'definition', number: '03', title: 'Target Discovery', description: 'Discovered target PostgreSQL schema & tables', icon: Table },
    { id: 'mapping', number: '04', title: 'Mapping Workspace', description: 'Source-to-target field mappings & JSON upload', icon: GitMerge },
    { id: 'validation', number: '05', title: 'Validation Check', description: 'Readiness check ("Is migration ready to run?")', icon: CheckCircle2, badge: 'Readiness Gate' },
    { id: 'execution', number: '06', title: 'Sequential Execution', description: 'Ordered table pipeline execution & live logs', icon: PlayCircle },
    { id: 'dashboard', number: '07', title: 'Migration Dashboard (Overview)', description: 'Overall health (94.8%), reconciliation, alerts', icon: LayoutDashboard, subtab: 'overview' },
    { id: 'dashboard', number: '07', title: 'Migration Dashboard (Table Status)', description: '221/245 table migration statuses', icon: LayoutDashboard, subtab: 'status' },
    { id: 'dashboard', number: '07', title: 'Migration Dashboard (Table Details)', description: 'orders profile drilldown (discrepancy diff)', icon: LayoutDashboard, subtab: 'details' },
    { id: 'report', number: '08', title: 'Final Migration Report', description: 'Audit summary & downloadable report artifact', icon: FileText }
  ];

  return (
    <Modal
      isOpen={demoModeQuickJumpOpen}
      onClose={() => setDemoModeQuickJumpOpen(false)}
      title="Presenter Quick-Jump Navigator"
      subtitle="Instantly jump to any stage during your presentation or walkthrough"
      maxWidth="2xl"
    >
      <div className="space-y-4 font-sans">
        {/* Preset Helpers */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50/70 border border-indigo-200/80 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="font-medium text-indigo-900">
              Demo State Helper:
            </span>
            <span className="text-indigo-700">
              {criticalIssuesResolved ? 'Critical issues already resolved (100% Ready)' : 'Critical issues blocking Run Migration'}
            </span>
          </div>
          {!criticalIssuesResolved && (
            <button
              onClick={() => fixIssues()}
              className="px-2.5 py-1 rounded bg-indigo-600 text-white font-mono text-[11px] font-semibold hover:bg-indigo-700 cursor-pointer"
            >
              Simulate Auto-Fix
            </button>
          )}
        </div>

        {/* Quick jump list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {jumpOptions.map((opt, i) => {
            const Icon = opt.icon;
            return (
              <button
                key={`${opt.id}-${opt.subtab || i}`}
                onClick={() => handleJump(opt.id, opt.subtab)}
                className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all text-left cursor-pointer group"
              >
                <div className="p-2 rounded bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900 group-hover:text-slate-900">
                    <span className="text-slate-400 font-normal">{opt.number}</span>
                    <span className="truncate">{opt.title}</span>
                    {opt.badge && (
                      <Badge variant="warning" size="sm" className="text-[10px] py-0 px-1">
                        {opt.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {opt.description}
                  </p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 shrink-0 mt-1" />
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
