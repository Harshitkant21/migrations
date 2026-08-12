// src/pages/PageDrilldown.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { mockApi } from '../data/mockApi';
import { useGlobalStore } from '../state/useGlobalStore';
import { EntityMetadata, EntityCategory } from '../types/models';
import { Layers, Database, ArrowRight, Activity, ShieldCheck, HelpCircle } from 'lucide-react';

export const PageDrilldown: React.FC = () => {
  const { environment, setActivePage, setSelectedEntityId } = useGlobalStore();

  const [entities, setEntities] = useState<EntityMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<EntityMetadata | null>(null);
  const [colCount, setColCount] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);

  useEffect(() => {
    const loadEntities = async () => {
      setLoading(true);
      const data = await mockApi.getEntities(environment);
      setEntities(data);
      if (data.length > 0) {
        // Set default preview selected entity
        setSelectedEntity(data[0]);
      }
      setLoading(false);
    };
    loadEntities();
  }, [environment]);

  // Load preview counts (columns and errors) for right-hand preview panel
  useEffect(() => {
    if (!selectedEntity) return;

    const loadSchemaStats = async () => {
      const sch = await mockApi.getSchema(selectedEntity.id);
      const errs = await mockApi.getErrors({ entityId: selectedEntity.id });
      setColCount(sch ? sch.columns.length : 0);
      setErrorCount(errs.length);
    };
    loadSchemaStats();
  }, [selectedEntity]);

  // Group entities by category
  const categoriesGrouped = useMemo(() => {
    const groups: Record<EntityCategory, EntityMetadata[]> = {
      Reference: [],
      MCS: [],
      PCS: [],
      Authoring: []
    };

    entities.forEach(ent => {
      groups[ent.category].push(ent);
    });

    return Object.entries(groups) as [EntityCategory, EntityMetadata[]][];
  }, [entities]);

  const handleEntitySelect = (ent: EntityMetadata) => {
    setSelectedEntity(ent);
  };

  const handleDrillAction = (page: 'entity' | 'schema' | 'errors' | 'authoring') => {
    if (!selectedEntity) return;
    setSelectedEntityId(selectedEntity.id);
    setActivePage(page);
  };

  return (
    <div className="space-y-6">
      
      {/* Category listing grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Column: Business Categories & Cards */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="text-center py-20 text-slate-400 text-xs animate-pulse">
              Loading drilldown catalog...
            </div>
          ) : (
            categoriesGrouped.map(([cat, list]) => (
              <Card 
                key={cat} 
                title={`${cat.toUpperCase()} SCHEMA SECTION`}
                subtitle={`Verification maps across ${list.length} database tables`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  {list.map(ent => {
                    const isSelected = selectedEntity?.id === ent.id;
                    return (
                      <div
                        key={ent.id}
                        onClick={() => handleEntitySelect(ent)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center justify-between
                          ${isSelected 
                            ? 'bg-brand-50 border-brand-200 ring-1 ring-brand-100 shadow-sm' 
                            : 'bg-surface hover:bg-slate-50 border-slate-200/80 hover:border-slate-300'
                          }`}
                      >
                        <div className="space-y-1">
                          <span className={`text-xs font-bold font-display block
                            ${isSelected ? 'text-brand' : 'text-slate-700'}`}>
                            {ent.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block tabular-nums">
                            {ent.prodCount.toLocaleString()} rows
                          </span>
                        </div>
                        <Badge type="status" value={ent.status} />
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Right Column: Metadata preview summary panel */}
        <div className="lg:col-span-1">
          {selectedEntity ? (
            <Card 
              className="sticky top-20"
              title={`${selectedEntity.name} Preview`} 
              subtitle="Quick stats and navigation pathways"
            >
              <div className="space-y-6">
                
                {/* Stats Table */}
                <div className="space-y-3.5 border-b border-slate-100 pb-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Database Category:</span>
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded uppercase">
                      {selectedEntity.category}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Total Columns count:</span>
                    <span className="text-xs font-bold font-mono text-slate-800 tabular-nums">{colCount} columns</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Active Data Errors:</span>
                    <span className={`text-xs font-bold font-mono tabular-nums ${errorCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {errorCount} open
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Migration Success:</span>
                    <span className="text-xs font-bold font-mono text-slate-800 tabular-nums">{selectedEntity.migrationPct.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Integration Navigation triggers */}
                <div className="space-y-2.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    DRILL DOWN MODULES
                  </span>
                  
                  <button
                    onClick={() => handleDrillAction('entity')}
                    className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-all"
                  >
                    <span className="flex items-center gap-1.5"><Database className="w-4 h-4 text-slate-400" /> Open Entity Metadata Explorer</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleDrillAction('schema')}
                    className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-all"
                  >
                    <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-slate-400" /> View ER Lineage diagram</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleDrillAction('errors')}
                    className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-all"
                  >
                    <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-slate-400" /> Inspect Validation errors</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleDrillAction('authoring')}
                    className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-all"
                  >
                    <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-slate-400" /> Review Author audit logs</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>

              </div>
            </Card>
          ) : (
            <Card children={<div className="text-center py-20 text-slate-400">Select table to view preview card.</div>} />
          )}
        </div>

      </div>

    </div>
  );
};
