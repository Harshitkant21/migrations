// src/components/layout/Header.tsx
import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  GitCompare, 
  TableProperties 
} from 'lucide-react';
import { useGlobalStore, PrimaryPageId } from '../../state/useGlobalStore';

export const Header: React.FC = () => {
  const { activePage, setActivePage } = useGlobalStore();

  const navTabs: { id: PrimaryPageId; number: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', number: '01', label: 'Overview', icon: LayoutDashboard },
    { id: 'status', number: '02', label: 'Migration Status', icon: CheckSquare },
    { id: 'mapping', number: '03', label: 'Mapping', icon: GitCompare },
    { id: 'details', number: '04', label: 'Table Details', icon: TableProperties }
  ];

  return (
    <header className="h-16 bg-surface border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6 shadow-xs select-none">
      
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActivePage('overview')}>
        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center font-mono font-black text-white text-xs">
          M
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-black font-mono text-slate-900 leading-none">
            MIGRATION DASHBOARD
          </span>
          <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider mt-0.5">
            DATABASE INTELLIGENCE
          </span>
        </div>
      </div>

      {/* THE ONLY PRIMARY NAVIGATION BAR (4 TABS) */}
      <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 font-mono">
        {navTabs.map((tab) => {
          const isActive = activePage === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActivePage(tab.id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer
                ${isActive 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
            >
              <span className={`text-[10px] ${isActive ? 'text-slate-400' : 'text-slate-400'}`}>
                {tab.number}
              </span>
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Target DB Scope Indicator */}
      <div className="hidden md:flex items-center gap-2 text-xs font-mono">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-slate-500 font-bold">PostgreSQL Target Active</span>
      </div>

    </header>
  );
};
