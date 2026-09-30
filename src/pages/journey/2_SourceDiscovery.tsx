// src/pages/journey/2_SourceDiscovery.tsx
import React from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { ImpactAnalysisCard } from '../../components/journey/ImpactAnalysisCard';
import { TableExplorer } from '../../components/journey/TableExplorer';
import { Button } from '../../components/ui/Button';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export const SourceDiscoveryStep: React.FC = () => {
  const { impactAnalysis, setActiveStep } = useGlobalStore();

  return (
    <div className="space-y-4 font-sans max-w-full">
      
      {/* Compact Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Step 02
            </span>
            <span className="text-slate-300">•</span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Source Catalog Discovery & Schema Explorer
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-discovered relational catalog with preliminary complexity evaluation.
          </p>
        </div>

        <div className="flex items-center gap-2 whitespace-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveStep('setup')}
            className="text-xs h-8 px-2.5 whitespace-nowrap font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Setup</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveStep('definition')}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-xs h-8 px-3 whitespace-nowrap font-medium"
          >
            <span>Proceed to Target Definition</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* High-Density Impact Analysis & Metadata Header Strip */}
      <ImpactAnalysisCard metrics={impactAnalysis} />

      {/* Dominant Table Explorer Component */}
      <TableExplorer />

    </div>
  );
};
