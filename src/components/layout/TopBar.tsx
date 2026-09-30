// src/components/layout/TopBar.tsx
import React, { useEffect } from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { 
  Database, 
  Check, 
  ArrowLeft,
  Server,
  Sparkles
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const TopBar: React.FC = () => {
  const { 
    setIsLandingPage, 
    setDemoModeQuickJumpOpen,
    migrationIntent
  } = useGlobalStore();

  // Listen for Ctrl+Shift+D or Cmd+Shift+D to trigger demo quick-jump
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setDemoModeQuickJumpOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setDemoModeQuickJumpOpen]);

  return (
    <header className="h-14 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 select-none shadow-2xs font-sans">
      
      {/* Left: Branding & Migration Context */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setIsLandingPage(true)}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors py-1.5 px-2 rounded-md hover:bg-slate-100 cursor-pointer text-xs font-medium whitespace-nowrap"
          title="Return to Landing"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Landing</span>
        </button>

        <div className="h-4 w-px bg-slate-200" />

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
            MP
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900 tracking-tight whitespace-nowrap">
              Production Database Migration
            </span>
            <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono text-slate-600 bg-slate-100 border border-slate-200 whitespace-nowrap">
              #MIG-2026-0928-PROD
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/70 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              {migrationIntent.environment}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Live Cluster Bridge Status */}
      <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-600 whitespace-nowrap">
        <Server className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-mono text-slate-700 font-medium">aws-east-pg01:5432</span>
        <span className="text-slate-400">→</span>
        <Database className="w-3.5 h-3.5 text-emerald-600" />
        <span className="font-mono text-emerald-800 font-medium">pg-cloud-aurora:5432</span>
      </div>

      {/* Right: Autosave Status & Presenter Demo Jumper */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/70 whitespace-nowrap">
          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Draft saved</span>
        </div>

        {/* Demo Mode Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDemoModeQuickJumpOpen(true)}
          className="text-xs bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100 whitespace-nowrap h-8 px-2.5"
          title="Shortcut: Ctrl+Shift+D"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="font-medium">Demo Jump</span>
          <kbd className="hidden sm:inline-block ml-1 text-[10px] px-1 py-0.2 bg-white rounded border border-slate-200 text-slate-500 font-mono">
            Ctrl+⇧+D
          </kbd>
        </Button>
      </div>

    </header>
  );
};

