// src/pages/journey/3_TargetDefinition.tsx
import React, { useState } from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { Button } from '../../components/ui/Button';
import { 
  ArrowRight, 
  ArrowLeft, 
  Database, 
  Table, 
  CheckCircle2, 
  Search, 
  Layers,
  ShieldCheck,
  Info
} from 'lucide-react';

export const TargetDefinitionStep: React.FC = () => {
  const { setActiveStep, targetTablesList } = useGlobalStore();
  const [selectedTableId, setSelectedTableId] = useState<string>(targetTablesList[0]?.id || 'tgt-customer-profile');
  const [searchQuery, setSearchQuery] = useState('');

  const activeTable = targetTablesList.find(t => t.id === selectedTableId) || targetTablesList[0];

  const filteredTables = targetTablesList.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.schema.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 font-sans max-w-full">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Step 03
            </span>
            <span className="text-slate-300">•</span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Target Database Schema Discovery & Inspection
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-discovered target PostgreSQL database schema and tables ready for source-to-target mapping.
          </p>
        </div>

        <div className="flex items-center gap-2.5 whitespace-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveStep('discovery')}
            className="text-xs h-9 px-3 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Source Discovery</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveStep('mapping')}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-xs h-9 px-4 font-bold flex items-center gap-1.5"
          >
            <span>Proceed to Mapping Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Target Discovery Summary Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Database className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="font-bold text-emerald-950 flex items-center gap-2">
              <span>Target Schema Discovered: pg-cloud-aurora.internal:5432</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-200">
                PostgreSQL Target Ready
              </span>
            </div>
            <div className="text-[11px] text-emerald-800 font-sans mt-0.5">
              Discovered 221 target tables across target production databases (<strong className="font-mono">prod_db_01</strong> & <strong className="font-mono">prod_db_02</strong>).
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs font-bold text-emerald-900 bg-white px-3 py-1 rounded-md border border-emerald-200 shadow-2xs inline-block">
            221 Target Tables Cataloged
          </span>
        </div>
      </div>

      {/* Read-Only Target Schema Explorer (2-Pane Inspection Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-mono">
        
        {/* Left Pane: Target Table Selector */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-[11px] font-bold uppercase text-slate-700">Discovered Target Tables ({filteredTables.length})</span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search target tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-8 pr-2 text-xs outline-none focus:bg-white focus:border-slate-900"
            />
          </div>

          <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
            {filteredTables.map(t => {
              const isSelected = selectedTableId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTableId(t.id)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs">{t.name}</div>
                    <div className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      {t.schema}.{t.name} • {t.columns.length} cols
                    </div>
                  </div>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-300'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Target Schema Table Details & Columns Inspector */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-brand" />
                <h2 className="text-sm font-black text-slate-900 uppercase">
                  {activeTable.schema}.{activeTable.name}
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Target table structure discovered from PostgreSQL target connection.
              </p>
            </div>

            <span className="text-xs font-bold text-brand bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-md">
              {activeTable.columns.length} Discovered Columns
            </span>
          </div>

          {/* Schema Notice */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2 text-xs font-sans text-slate-600">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <strong>Target Schema Protection:</strong> Target database schemas are discovered directly from the destination PostgreSQL instance. Structural schema modifications are governed by backend migration DDL drivers during execution.
            </div>
          </div>

          {/* Column Schema Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Column Name</th>
                  <th className="px-4 py-2.5">Data Type</th>
                  <th className="px-4 py-2.5">Nullable</th>
                  <th className="px-4 py-2.5 text-center">Constraints</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                {activeTable.columns.map((col, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="px-4 py-2 font-bold text-slate-900">{col.name}</td>
                    <td className="px-4 py-2 text-brand font-semibold">{col.dataType}</td>
                    <td className="px-4 py-2 text-slate-500">{col.isNullable ? 'YES' : 'NO'}</td>
                    <td className="px-4 py-2 text-center">
                      {col.isPrimaryKey && <span className="bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded text-[10px] font-bold mr-1">PK</span>}
                      {col.isForeignKey && <span className="bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded text-[10px] font-bold">FK</span>}
                      {!col.isPrimaryKey && !col.isForeignKey && <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
