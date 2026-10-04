// src/pages/journey/7_DashboardStep.tsx
import React from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { DashboardSubTab } from '../../types/models';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  LayoutDashboard, 
  CheckSquare, 
  GitCompare, 
  TableProperties, 
  ArrowRight, 
  ArrowLeft,
  FileText,
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

// Existing 4 Primary Screens
import { Overview } from '../Overview';
import { MigrationStatus } from '../MigrationStatus';
import { Mapping } from '../Mapping';
import { TableDetails } from '../TableDetails';

export const DashboardStep: React.FC = () => {
  const { 
    dashboardTab, 
    setDashboardTab, 
    setActiveStep 
  } = useGlobalStore();

  const tabs: { id: DashboardSubTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'status', label: 'Table Migration Status', icon: CheckSquare },
    { id: 'mapping_view', label: 'Source → Target Mapping View', icon: GitCompare },
    { id: 'details', label: 'Table Details Drilldown', icon: TableProperties }
  ];

  const renderActiveTabContent = () => {
    switch (dashboardTab) {
      case 'overview':
        return <Overview />;
      case 'status':
        return <MigrationStatus />;
      case 'mapping_view':
        return <Mapping />;
      case 'details':
        return <TableDetails />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Section Header with Global Health Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            STAGE 07 OF 08
          </span>
          <h1 className="text-xl font-bold font-mono text-slate-900 tracking-tight mt-0.5">
            Migration Monitoring Dashboard
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Real-time migration health, table verification statuses, relational mappings, and record reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => setActiveStep('execution')}
            className="font-mono text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Execution</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setActiveStep('report')}
            className="font-mono text-xs shadow-xs bg-slate-900 hover:bg-slate-800"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Migration Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Global Health KPI Banner */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm border border-emerald-300 shrink-0 whitespace-nowrap">
            94.8%
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">MIGRATION HEALTH</div>
            <div className="text-slate-900 font-bold text-sm mt-0.5 whitespace-nowrap truncate">Optimal Execution</div>
          </div>
        </div>

        <div>
          <div className="text-[10px] text-slate-400 font-medium">TABLES MIGRATED</div>
          <div className="text-slate-900 font-bold text-sm mt-0.5 tabular-nums">221 / 245 Tables</div>
          <div className="text-[10px] text-slate-500 mt-0.5">90.2% Complete</div>
        </div>

        <div>
          <div className="text-[10px] text-slate-400 font-medium">TOTAL RECORDS PROCESSED</div>
          <div className="text-slate-900 font-bold text-sm mt-0.5 tabular-nums">18.4M Records</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">18.1M Successful</div>
        </div>

        <div>
          <div className="text-[10px] text-slate-400 font-medium">BLOCKED / QUARANTINED</div>
          <div className="text-rose-700 font-bold text-sm mt-0.5 tabular-nums">42.3K Records</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Routed to DLQ</div>
        </div>
      </div>

      {/* 4 Dashboard Primary Tabs Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-2xs">
        <nav className="flex flex-wrap items-center gap-1 font-mono text-xs">
          {tabs.map((tab) => {
            const isActive = dashboardTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setDashboardTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Embedded Rich Dashboard Screen Content */}
      <div className="transition-all">
        {renderActiveTabContent()}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
          <span>Live telemetry streaming from cluster targets</span>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setActiveStep('report')}
          className="font-mono text-xs shadow-xs bg-slate-900 hover:bg-slate-800"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Generate Final Migration Report</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

    </div>
  );
};
