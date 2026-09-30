// src/pages/LandingPage.tsx
import React from 'react';
import { useGlobalStore } from '../state/useGlobalStore';
import { PreviousMigrationsModal } from './PreviousMigrationsModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  ArrowRight, 
  History, 
  Server,
  Database,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { 
    setIsLandingPage, 
    setActiveStep,
    setPreviousMigrationsModalOpen 
  } = useGlobalStore();

  const handleStartNew = () => {
    setActiveStep('setup');
    setIsLandingPage(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-slate-900 selection:text-white relative">
      {/* Subtle architectural background grid */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#0f172a 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Top Header */}
      <header className="px-6 md:px-12 py-5 flex items-center justify-between border-b border-slate-200/70 bg-white/70 backdrop-blur-xs z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs tracking-wider">
            MP
          </div>
          <div className="flex flex-col">
            <span className="font-mono font-bold text-xs tracking-tight text-slate-900">
              MIGRATION PLATFORM
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              Enterprise Orchestration Console
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="neutral" size="sm" dot>
            Engine v2.4 Online
          </Badge>
          <button
            onClick={() => setPreviousMigrationsModalOpen(true)}
            className="text-xs font-mono text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span>Runs (3)</span>
          </button>
        </div>
      </header>

      {/* Center Hero */}
      <main className="flex-1 flex items-center justify-center px-6 py-10 z-10">
        <div className="max-w-xl w-full text-center space-y-7">
          
          {/* Recent Migration Pill */}
          <div 
            onClick={() => setPreviousMigrationsModalOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-mono text-slate-600 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-500">Last Run:</span>
            <span className="font-bold text-slate-800">MIG-2026-0928-PROD</span>
            <span className="text-slate-300">·</span>
            <span className="text-emerald-700 font-bold">94.8% Health</span>
          </div>

          {/* Value Prop */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Database Migration Platform
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-sans leading-relaxed max-w-lg mx-auto">
              Plan, map, execute and validate database migrations from a single workspace.
            </p>
          </div>

          {/* Primary & Secondary Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartNew}
              className="w-full sm:w-auto font-mono text-xs font-bold px-6 py-2.5 shadow-sm bg-slate-900 hover:bg-slate-800 text-white"
            >
              <span>Start New Migration</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setPreviousMigrationsModalOpen(true)}
              className="w-full sm:w-auto font-mono text-xs font-semibold px-5 py-2.5 border-slate-300 hover:bg-white bg-white/80"
            >
              <History className="w-4 h-4 mr-1.5 text-slate-500" />
              <span>View Previous Migrations</span>
            </Button>
          </div>

          {/* Technical Specs Strip */}
          <div className="pt-6 border-t border-slate-200/80 flex items-center justify-center gap-6 text-[11px] font-mono text-slate-500">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>PostgreSQL & MySQL</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span>Zero-Downtime CDC</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Reconciliation Engine</span>
            </div>
          </div>

        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="px-6 md:px-12 py-3 border-t border-slate-200/60 bg-white/50 text-[11px] text-slate-400 font-mono flex items-center justify-between z-10">
        <span>Enterprise Migration Control Plane • V0 Prototype</span>
        <span>Ready for Presentation</span>
      </footer>

      {/* Previous Runs Modal */}
      <PreviousMigrationsModal />
    </div>
  );
};
