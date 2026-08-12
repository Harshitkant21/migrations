// src/components/layout/Sidebar.tsx
import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Database, 
  AlertTriangle, 
  GitFork, 
  Network, 
  History, 
  ListCollapse,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { useGlobalStore } from '../../state/useGlobalStore';

export const Sidebar: React.FC = () => {
  const { 
    activePage, 
    setActivePage, 
    sidebarCollapsed, 
    setSidebarCollapsed,
    environment
  } = useGlobalStore();

  const navigationItems = [
    { id: 'dashboard', name: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'health', name: 'Migration Health', icon: CheckSquare },
    { id: 'entity', name: 'Entity Explorer', icon: Database },
    { id: 'errors', name: 'Error Centre', icon: AlertTriangle },
    { id: 'cascade', name: 'Cascade Analysis', icon: GitFork },
    { id: 'schema', name: 'Schema Explorer', icon: Network },
    { id: 'authoring', name: 'Author Changes', icon: History },
    { id: 'audit', name: 'Audit Logs', icon: ShieldCheck },
    { id: 'drilldown', name: 'Page Drilldown', icon: ListCollapse },
  ] as const;

  return (
    <aside 
      className={`bg-surface border-r border-slate-200/80 flex flex-col h-screen sticky top-0 transition-all duration-300 z-30 select-none
        ${sidebarCollapsed ? 'w-[72px]' : 'w-64'}`}
    >
      {/* Brand Header */}
      <div className="h-16 border-b border-slate-100 flex items-center justify-between px-4">
        <div className={`flex items-center gap-2.5 overflow-hidden ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-extrabold font-display text-sm tracking-widest">GM</span>
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-bold font-display text-slate-800 tracking-tight leading-none">MIGRATION</span>
              <span className="text-[9px] font-semibold text-slate-400 tracking-widest mt-0.5">INTELLIGENCE</span>
            </div>
          )}
        </div>
        
        {/* Collapse toggle (only visible on desktop hover or click) */}
        {!sidebarCollapsed && (
          <button 
            onClick={() => setSidebarCollapsed(true)}
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex items-center w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 relative group
                ${isActive 
                  ? 'bg-brand-50 text-brand font-semibold shadow-premium' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
                ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}
              title={sidebarCollapsed ? item.name : undefined}
            >
              {/* Left-edge active indicator line */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-brand" />
              )}
              
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-brand' : 'text-slate-400 group-hover:text-slate-600'}`} />
              
              {!sidebarCollapsed && (
                <span className="truncate leading-none">{item.name}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer context summary */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        {sidebarCollapsed ? (
          <div className="flex justify-center py-2">
            <button 
              onClick={() => setSidebarCollapsed(false)}
              className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">ENVIRONMENT</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded tabular-nums
                ${environment === 'PROD' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  environment === 'STG' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                {environment}
              </span>
            </div>
            <div className="flex items-center text-[10px] text-slate-500 gap-1 mt-1">
              <ShieldAlert className="w-3.5 h-3.5 text-brand" />
              <span className="truncate">Active Workspace: PROD</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
