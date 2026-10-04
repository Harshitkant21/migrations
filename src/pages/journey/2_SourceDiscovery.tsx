// src/pages/journey/2_SourceDiscovery.tsx
import React, { useState } from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { ImpactAnalysisCard } from '../../components/journey/ImpactAnalysisCard';
import { TableExplorer } from '../../components/journey/TableExplorer';
import { Button } from '../../components/ui/Button';
import { 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle2, 
  Search, 
  Layers, 
  Key, 
  GitFork,
  Database
} from 'lucide-react';

export const SourceDiscoveryStep: React.FC = () => {
  const { impactAnalysis, setActiveStep, addToast } = useGlobalStore();
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryStage, setDiscoveryStage] = useState<string>('COMPLETED');

  const runDiscoveryOperation = async () => {
    setIsDiscovering(true);
    setDiscoveryStage('Inspecting PostgreSQL database structure...');
    await new Promise(r => setTimeout(r, 600));
    setDiscoveryStage('Cataloging 245 discovered tables across 15 schemas...');
    await new Promise(r => setTimeout(r, 600));
    setDiscoveryStage('Identifying primary keys, foreign key constraints & indexes...');
    await new Promise(r => setTimeout(r, 600));
    setDiscoveryStage('COMPLETED');
    setIsDiscovering(false);
    addToast('Discovered 245 PostgreSQL source tables with 1,840 columns', 'success');
  };

  return (
    <div className="space-y-4 font-sans max-w-full">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Step 02
            </span>
            <span className="text-slate-300">•</span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Source Database Schema & Metadata Discovery
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated structure inspection discovering source PostgreSQL tables, columns, constraints, and indexes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 whitespace-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveStep('setup')}
            className="text-xs h-9 px-3 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Setup</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveStep('definition')}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-xs h-9 px-4 font-bold flex items-center gap-1.5"
          >
            <span>Proceed to Target Discovery</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Operational State Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDiscovering ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
            {isDiscovering ? <RefreshCw className="w-4 h-4 animate-spin text-amber-700" /> : <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
          </div>
          <div>
            <div className="font-bold text-slate-900">
              {isDiscovering ? 'Discovery Operation in Progress' : 'Source Schema Discovery Completed'}
            </div>
            <div className="text-[11px] text-slate-500 font-sans mt-0.5">
              {isDiscovering ? discoveryStage : 'PostgreSQL source database catalog successfully mapped into metadata repository.'}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={runDiscoveryOperation}
          loading={isDiscovering}
          className="text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-100"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isDiscovering ? 'animate-spin' : ''}`} />
          <span>{isDiscovering ? 'Discovering...' : 'Re-Run Source Discovery'}</span>
        </Button>
      </div>

      {/* Discovery Impact Analysis */}
      <ImpactAnalysisCard metrics={impactAnalysis} />

      {/* Table Explorer Grid */}
      <TableExplorer />

    </div>
  );
};
