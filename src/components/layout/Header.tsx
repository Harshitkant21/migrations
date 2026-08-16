// src/components/layout/Header.tsx
import React, { useState } from 'react';
import { Search, Bell, Database, Command, UserCheck } from 'lucide-react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { Environment } from '../../types/models';

export const Header: React.FC = () => {
  const { 
    activePage, 
    setActivePage,
    environment, 
    setEnvironment,
    selectedEntityId,
    selectedErrorId,
    selectedVehicleId,
    setSelectedEntityId,
    setSelectedErrorId,
    setSelectedVehicleId
  } = useGlobalStore();

  const [searchFocused, setSearchFocused] = useState(false);

  // Dynamic breadcrumb generation
  const renderBreadcrumbs = () => {
    const items: { label: string; action?: () => void }[] = [];

    // Base segment
    switch (activePage) {
      case 'dashboard':
        items.push({ label: 'Executive Dashboard' });
        break;
      case 'health':
        items.push({ label: 'Migration Health', action: () => {
          setSelectedEntityId(null);
          setActivePage('health');
        }});
        break;
      case 'entity':
        items.push({ label: 'Entity Explorer', action: () => setActivePage('entity') });
        if (selectedEntityId) {
          items.push({ label: selectedEntityId.toUpperCase().replace('_', ' ') });
        }
        break;
      case 'errors':
        items.push({ label: 'Error Centre', action: () => {
          setSelectedErrorId(null);
          setActivePage('errors');
        }});
        if (selectedErrorId) {
          items.push({ label: selectedErrorId });
        }
        break;
      case 'cascade':
        items.push({ label: 'Cascade Analysis', action: () => setActivePage('cascade') });
        if (selectedErrorId) {
          items.push({ label: selectedErrorId });
        }
        if (selectedVehicleId) {
          items.push({ label: selectedVehicleId });
        }
        break;
      case 'schema':
        items.push({ label: 'Schema Explorer', action: () => setActivePage('schema') });
        if (selectedEntityId) {
          items.push({ label: selectedEntityId.toUpperCase().replace('_', ' ') });
        }
        break;
      case 'authoring':
        items.push({ label: 'Author Changes', action: () => setActivePage('authoring') });
        break;
      case 'audit':
        items.push({ label: 'Audit Logs', action: () => setActivePage('audit') });
        break;
      case 'drilldown':
        items.push({ label: 'Page Drilldown', action: () => setActivePage('drilldown') });
        break;
    }

    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <span className="cursor-pointer hover:text-slate-600" onClick={() => setActivePage('dashboard')}>GM Intelligence</span>
        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            <span>/</span>
            <span 
              onClick={item.action} 
              className={`truncate font-medium ${item.action ? 'cursor-pointer hover:text-slate-600' : 'text-slate-600 font-semibold'}`}
            >
              {item.label}
            </span>
          </React.Fragment>
        ))}
      </div>
    );
  };

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard': return 'Governance & Migration Overview';
      case 'health': return 'Migration Health & Reconciliation';
      case 'entity': return 'Entity Explorer';
      case 'errors': return 'Data Quality Error Centre';
      case 'cascade': return 'Cascade Impact & Root Cause';
      case 'schema': return 'Technical Schema Explorer';
      case 'authoring': return 'Authoring Audits & Change Logs';
      case 'drilldown': return 'Page Drilldown Directory';
      case 'audit': return 'Operational Audit Logs';
      default: return 'GM Intelligence';
    }
  };

  return (
    <header className="h-16 bg-surface border-b border-slate-200/80 sticky top-0 z-20 flex items-center justify-between px-6 select-none">
      
      {/* Context & Title */}
      <div className="flex flex-col">
        {renderBreadcrumbs()}
        <h1 className="text-lg font-bold font-display text-slate-800 tracking-tight leading-none mt-1">
          {getPageTitle()}
        </h1>
      </div>

      {/* Global Controls */}
      <div className="flex items-center gap-4">
        
        {/* Dynamic environment toggle controls */}
        <div className="flex items-center bg-slate-100 border border-slate-200/60 p-0.5 rounded-lg text-[11px] font-semibold text-slate-600 shadow-sm">
          {(['Source', 'STG', 'PROD'] as Environment[]).map((env) => {
            const isSelected = environment === env;
            return (
              <button
                key={env}
                onClick={() => setEnvironment(env)}
                className={`px-3 py-1 rounded-md transition-all duration-150 leading-none
                  ${isSelected 
                    ? 'bg-surface text-slate-800 font-bold shadow-sm border border-slate-200/40' 
                    : 'hover:text-slate-800 hover:bg-slate-50'
                  }`}
              >
                {env === 'Source' ? 'Source DB' : env}
              </button>
            );
          })}
        </div>

        {/* Muted search widget */}
        <div className="relative w-48 md:w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tables, errors, IDs..."
            className={`w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-xs text-slate-700 outline-none transition-all
              ${searchFocused ? 'border-brand ring-1 ring-brand-100 bg-surface' : 'hover:border-slate-300'}`}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        {/* Divider */}
        <span className="w-px h-6 bg-slate-200" />

        {/* Notifications and Profile */}
        <div className="flex items-center gap-3">
          <button className="text-slate-400 hover:text-slate-600 relative p-1 hover:bg-slate-50 rounded">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-brand rounded-full ring-2 ring-surface" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-brand font-display">
              AH
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-[10px] font-bold text-slate-700 leading-none">A. Howard</span>
              <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">ADMIN</span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
