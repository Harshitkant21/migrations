// src/pages/EntityExplorer.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { mockApi } from '../data/mockApi';
import { useGlobalStore } from '../state/useGlobalStore';
import { EntityMetadata, TableSchema, DataQualityError, AuthorAuditRecord } from '../types/models';
import { Search, Database, Columns, GitBranch, ArrowLeftRight, AlertOctagon, History, ArrowRight } from 'lucide-react';

export const EntityExplorer: React.FC = () => {
  const { environment, activePage, setActivePage, selectedEntityId, setSelectedEntityId, setSelectedErrorId } = useGlobalStore();

  const [entities, setEntities] = useState<EntityMetadata[]>([]);
  const [activeTab, setActiveTab] = useState<'metadata' | 'schema' | 'datagrid' | 'mapping' | 'dependencies' | 'errors' | 'changes'>('metadata');
  
  // Active schema and dependencies states
  const [schema, setSchema] = useState<TableSchema | null>(null);
  const [errors, setErrors] = useState<DataQualityError[]>([]);
  const [audits, setAudits] = useState<AuthorAuditRecord[]>([]);
  const [loadingSchema, setLoadingSchema] = useState(false);

  // Search filter for select dropdown
  const [searchQuery, setSearchQuery] = useState('');

  // Load basic entities catalog
  useEffect(() => {
    const loadEntities = async () => {
      const result = await mockApi.getEntities(environment);
      setEntities(result);
      // Set default entity if none is selected
      if (!selectedEntityId && result.length > 0) {
        setSelectedEntityId('pcs_procedures'); // Standard GM procedure table as default anchor
      }
    };
    loadEntities();
  }, [environment]);

  // Load detailed schema metadata whenever selected entity changes
  useEffect(() => {
    if (!selectedEntityId) return;

    const loadSchemaDetails = async () => {
      setLoadingSchema(true);
      const schemaData = await mockApi.getSchema(selectedEntityId);
      const errorData = await mockApi.getErrors({ entityId: selectedEntityId });
      const auditData = await mockApi.getAuthorChanges(selectedEntityId);
      
      setSchema(schemaData || null);
      setErrors(errorData);
      setAudits(auditData);
      setLoadingSchema(false);
    };

    loadSchemaDetails();
  }, [selectedEntityId]);

  // Active Entity details derived
  const activeEntity = useMemo(() => {
    return entities.find(e => e.id === selectedEntityId);
  }, [entities, selectedEntityId]);

  // Autocomplete suggestions
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery) return [];
    return entities.filter(e => 
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.id.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [entities, searchQuery]);

  const handleSelectEntity = (id: string) => {
    setSelectedEntityId(id);
    setSearchQuery('');
  };

  const tabs = [
    { id: 'metadata', name: 'Overview', icon: Database },
    { id: 'schema', name: 'Columns & Types', icon: Columns },
    { id: 'datagrid', name: 'Data Grid Explorer', icon: Database },
    { id: 'mapping', name: 'Source Mapping', icon: ArrowLeftRight },
    { id: 'dependencies', name: 'Lineage & Keys', icon: GitBranch },
    { id: 'errors', name: `DQ Errors (${errors.length})`, icon: AlertOctagon },
    { id: 'changes', name: `Author Audits (${audits.length})`, icon: History }
  ] as const;

  return (
    <div className="space-y-6">
      
      {/* Top Search Autocomplete bar */}
      <div className="relative bg-surface border border-slate-200/80 rounded-lg px-5 py-4 shadow-premium flex flex-col md:flex-row gap-4 items-center justify-between z-10">
        <div className="flex-1 w-full max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search entity, table or ID (e.g. PCS Subsystems)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs outline-none hover:border-slate-300 focus:border-brand focus:bg-surface font-medium"
          />
          {/* Autocomplete suggestions popover */}
          {filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-slate-200 shadow-xl rounded-lg overflow-hidden z-20">
              {filteredSuggestions.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSelectEntity(s.id)}
                  className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 border-b last:border-0 border-slate-100 flex items-center justify-between"
                >
                  <span className="text-slate-800">{s.name}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest">{s.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Entity quick status block */}
        {activeEntity && (
          <div className="flex items-center gap-4 text-right">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">ACTIVE TABLE</span>
              <span className="text-sm font-bold text-slate-800 font-display">{activeEntity.name}</span>
            </div>
            <Badge type="status" value={activeEntity.status} />
          </div>
        )}
      </div>

      {/* Main Grid: Left Catalog Navigation / Right Tabs content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Side List: Fast Entity selector */}
        <Card className="lg:col-span-1" title="Entities Catalog" subtitle="Click table to load metadata">
          <div className="space-y-1 max-h-[500px] overflow-y-auto -mx-2 px-2">
            {entities.map(e => {
              const isSelected = e.id === selectedEntityId;
              return (
                <button
                  key={e.id}
                  onClick={() => handleSelectEntity(e.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between border
                    ${isSelected 
                      ? 'bg-brand-50 border-brand-200 text-brand shadow-sm' 
                      : 'border-transparent text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <span className="truncate">{e.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono tabular-nums leading-none">
                    {e.prodCount.toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Right Side: Tabbed Viewer */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tab Navigation header */}
          <div className="flex border-b border-slate-200 overflow-x-auto gap-2 bg-surface px-4 py-2 border rounded-lg shadow-premium">
            {tabs.map(t => {
              const Icon = t.icon;
              const isSelected = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border leading-none transition-all whitespace-nowrap
                    ${isSelected 
                      ? 'bg-brand text-white border-brand font-bold shadow-premium' 
                      : 'text-slate-500 bg-transparent border-transparent hover:bg-slate-50 hover:text-slate-800'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.name}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Canvas */}
          {loadingSchema ? (
            <Card children={
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2 animate-pulse">
                <div className="w-8 h-8 rounded-full border-2 border-brand-200 border-t-brand animate-spin" />
                <span className="text-xs font-semibold">Loading technical definitions...</span>
              </div>
            } />
          ) : activeEntity ? (
            <>
              {/* Tab 1: OVERVIEW METADATA */}
              {activeTab === 'metadata' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card title="Counts Verification" subtitle="Staged vs target reconciliations">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-xs text-slate-500 font-semibold">Source Database:</span>
                        <span className="text-sm font-bold font-mono text-slate-800 tabular-nums">{activeEntity.sourceCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-xs text-slate-500 font-semibold">Staging (STG):</span>
                        <span className="text-sm font-bold font-mono text-slate-400 tabular-nums">{activeEntity.stgCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-xs text-slate-500 font-semibold">Production (PROD):</span>
                        <span className="text-sm font-bold font-mono text-slate-500 tabular-nums">{activeEntity.prodCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-xs text-slate-500 font-semibold">Outstanding Gaps:</span>
                        <span className={`text-sm font-bold font-mono tabular-nums ${activeEntity.difference > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          {activeEntity.difference.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-xs text-slate-500 font-semibold">Migration Success Rate:</span>
                        <span className="text-sm font-bold font-mono text-slate-800 tabular-nums">{activeEntity.migrationPct.toFixed(2)}%</span>
                      </div>
                    </div>
                  </Card>
                  
                  <Card title="Properties & Settings" subtitle="Structural properties in target DB">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-xs text-slate-500 font-semibold">Logical Namespace:</span>
                        <span className="text-xs font-mono font-bold text-brand bg-brand-50 px-2 py-0.5 rounded uppercase">{activeEntity.category}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-xs text-slate-500 font-semibold">Primary Keys:</span>
                        <span className="text-xs font-mono font-semibold text-slate-700">
                          {schema?.primaryKeys.join(', ') || 'None'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-xs text-slate-500 font-semibold">Active Key Constraints:</span>
                        <span className="text-xs font-mono font-semibold text-slate-700">
                          {schema?.foreignKeys.length || 0} Foreign Keys
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Tab 2: SCHEMA COLUMNS */}
              {activeTab === 'schema' && (
                <Card children={
                  <div className="overflow-x-auto -mx-5 -my-4">
                    <table className="min-w-full divide-y divide-slate-100 text-left">
                      <thead className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                        <tr>
                          <th className="px-5 py-3 font-display">Column Name</th>
                          <th className="px-5 py-3 font-display">Data Type</th>
                          <th className="px-5 py-3 font-display">Nullable</th>
                          <th className="px-5 py-3 font-display">Key Constraints</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600 bg-surface">
                        {schema?.columns.map((col, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-5 py-3 font-mono font-bold text-slate-800">{col.name}</td>
                            <td className="px-5 py-3 font-mono text-slate-400">{col.dataType}</td>
                            <td className="px-5 py-3 font-semibold text-slate-500">{col.isNullable ? 'YES' : 'NO'}</td>
                            <td className="px-5 py-3">
                              {col.isPrimaryKey && <span className="bg-blue-50 text-blue-700 font-bold border border-blue-200 px-1.5 py-0.5 rounded text-[10px] mr-1 font-mono uppercase">PK</span>}
                              {col.isForeignKey && (
                                <span className="bg-purple-50 text-purple-700 font-bold border border-purple-200 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase">
                                  FK → {col.referencedTable}.{col.referencedColumn}
                                </span>
                              )}
                              {!col.isPrimaryKey && !col.isForeignKey && <span className="text-slate-300">—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                } />
              )}

              {/* Tab 3: VISUAL COLUMN MAPPING STUDIO CANVAS */}
              {activeTab === 'mapping' && (
                <Card title="Visual Column Mapping Studio Canvas" subtitle="Field-to-field ETL transformation node visualizer">
                  <div className="space-y-4">
                    {schema?.mappingRules.map((map, idx) => (
                      <div key={idx} className="p-4 border border-slate-200/80 bg-surface rounded-xl shadow-premium space-y-3">
                        
                        {/* Mapping Connector Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                          {/* Source Field Card */}
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block font-sans">SOURCE COLUMN (LHS)</span>
                            <span className="text-xs font-mono font-bold text-slate-800 block">{map.sourceTable}.{map.sourceColumn}</span>
                            <span className="text-[10px] text-slate-400 font-mono">VARCHAR(50) • Legacy Oracle</span>
                          </div>

                          {/* Transformation Rule Card Node */}
                          <div className="p-3 bg-brand-50/50 border border-brand-200/60 rounded-lg text-center space-y-1">
                            <span className="text-[9px] font-extrabold text-brand uppercase tracking-widest block font-sans">ETL TRANSFORMATION NODE</span>
                            <span className="text-xs font-semibold text-brand-900 block">{map.transformationRule}</span>
                            <span className="inline-block text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-sans">100% Rule Confidence</span>
                          </div>

                          {/* Target Field Card */}
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-right">
                            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block font-sans">TARGET COLUMN (RHS)</span>
                            <span className="text-xs font-mono font-bold text-brand block">{activeEntity?.name || 'Table'}.{map.targetColumn}</span>
                            <span className="text-[10px] text-slate-400 font-mono">VARCHAR(50) • Snowflake PROD</span>
                          </div>
                        </div>

                        {/* Live Sample Preview Box */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-600 bg-slate-50/50 p-2.5 rounded-lg">
                          <span className="text-slate-400 font-sans text-[10px] font-bold uppercase">Sample Before / After Preview:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-700 bg-surface border border-slate-200 px-2 py-0.5 rounded">PUNE-X7-2026</span>
                            <ArrowRight className="w-3.5 h-3.5 text-brand" />
                            <span className="text-brand font-bold bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">X7-2026</span>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Tab 2.5: DATA GRID EXPLORER */}
              {activeTab === 'datagrid' && (
                <Card title={`${schema?.entityId.toUpperCase().replace('_', ' ') || 'TABLE'} Record Grid & Column Pinning`} subtitle="Interactive row-level LHS vs RHS staging comparison">
                  <div className="space-y-4">
                    
                    {/* Controls Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SHOWING STAGING DATA:</span>
                        <span className="font-mono text-brand font-bold">{entities.find(e => e.id === selectedEntityId)?.sourceCount.toLocaleString() || '42,500'} records</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">✓ Column Pinning Active</span>
                        <span className="text-[10px] font-bold font-mono text-brand bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">LHS vs RHS Diff On</span>
                      </div>
                    </div>

                    {/* Interactive Table Grid */}
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="min-w-full divide-y divide-slate-200 text-left">
                        <thead className="bg-slate-100 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider font-mono">
                          <tr>
                            <th className="px-4 py-3 sticky left-0 bg-slate-100 border-r border-slate-200 shadow-sm z-10">
                              {schema?.columns[0]?.name || 'id'} 📌 (Pinned PK)
                            </th>
                            <th className="px-4 py-3">Legacy Source Value (LHS)</th>
                            <th className="px-4 py-3">Staging Target Value (RHS)</th>
                            <th className="px-4 py-3">Reconciliation Status</th>
                            <th className="px-4 py-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-mono text-slate-700 bg-surface">
                          <tr className="hover:bg-slate-50">
                            <td className="px-4 py-2.5 font-bold text-slate-900 sticky left-0 bg-surface border-r border-slate-200">GMV-2967</td>
                            <td className="px-4 py-2.5 text-slate-500 font-semibold">PUNE-X7-2026</td>
                            <td className="px-4 py-2.5 text-red-600 font-bold">X7-2026 (Mismatch)</td>
                            <td className="px-4 py-2.5"><span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-sans text-[10px] font-bold">DISCREPANCY</span></td>
                            <td className="px-4 py-2.5 text-center font-sans">
                              <button onClick={() => { setSelectedErrorId('ERR-2967'); setActivePage('errors'); }} className="text-brand hover:underline font-bold">Inspect Fix</button>
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="px-4 py-2.5 font-bold text-slate-900 sticky left-0 bg-surface border-r border-slate-200">GMV-1713</td>
                            <td className="px-4 py-2.5 text-slate-500 font-semibold">VHC-1713-US-EAST</td>
                            <td className="px-4 py-2.5 text-amber-600 font-bold">GMV-1713 (Duplicate)</td>
                            <td className="px-4 py-2.5"><span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-sans text-[10px] font-bold">DUPLICATE</span></td>
                            <td className="px-4 py-2.5 text-center font-sans">
                              <button onClick={() => { setSelectedErrorId('ERR-1713'); setActivePage('errors'); }} className="text-brand hover:underline font-bold">Inspect Fix</button>
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="px-4 py-2.5 font-bold text-slate-900 sticky left-0 bg-surface border-r border-slate-200">GMV-1750</td>
                            <td className="px-4 py-2.5 text-slate-500 font-semibold">VHC-1750-EXCLUDED</td>
                            <td className="px-4 py-2.5 text-slate-400">GMV-1750 (Orphan)</td>
                            <td className="px-4 py-2.5"><span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-sans text-[10px] font-bold">ORPHAN</span></td>
                            <td className="px-4 py-2.5 text-center font-sans">
                              <button onClick={() => { setSelectedErrorId('ERR-1750'); setActivePage('errors'); }} className="text-brand hover:underline font-bold">Inspect Fix</button>
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="px-4 py-2.5 font-bold text-slate-900 sticky left-0 bg-surface border-r border-slate-200">GMV-2001</td>
                            <td className="px-4 py-2.5 text-slate-500 font-semibold">GMV-2001-EU</td>
                            <td className="px-4 py-2.5 text-emerald-600 font-bold">GMV-2001-EU</td>
                            <td className="px-4 py-2.5"><span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-sans text-[10px] font-bold">RECONCILED</span></td>
                            <td className="px-4 py-2.5 text-center font-sans text-slate-400">✓ Synced</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                  </div>
                </Card>
              )}
              {activeTab === 'dependencies' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Upstream parent references */}
                  <Card title="Upstream Dependencies" subtitle="Parent tables referenced by foreign keys">
                    <div className="space-y-3">
                      {schema && schema.upstreamDeps.length > 0 ? (
                        schema.upstreamDeps.map((dep, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => handleSelectEntity(dep)}
                            className="p-3 border border-slate-100 hover:border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer flex justify-between items-center transition-all"
                          >
                            <span className="text-xs font-bold text-slate-700 font-display">{dep.toUpperCase().replace('_', ' ')}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-slate-400 text-xs">No upstream parents detected (Root-level reference schema).</div>
                      )}
                    </div>
                  </Card>

                  {/* Downstream child references */}
                  <Card title="Downstream Dependencies" subtitle="Child tables pointing to this table">
                    <div className="space-y-3">
                      {schema && schema.downstreamDeps.length > 0 ? (
                        schema.downstreamDeps.map((dep, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => handleSelectEntity(dep)}
                            className="p-3 border border-slate-100 hover:border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer flex justify-between items-center transition-all"
                          >
                            <span className="text-xs font-bold text-slate-700 font-display">{dep.toUpperCase().replace('_', ' ')}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-slate-400 text-xs">No downstream children tables.</div>
                      )}
                    </div>
                  </Card>
                </div>
              )}

              {/* Tab 5: DQ ERRORS */}
              {activeTab === 'errors' && (
                <Card children={
                  <div className="overflow-x-auto -mx-5 -my-4">
                    <table className="min-w-full divide-y divide-slate-100 text-left">
                      <thead className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                        <tr>
                          <th className="px-5 py-3 font-display">Error ID</th>
                          <th className="px-5 py-3 font-display">Category</th>
                          <th className="px-5 py-3 font-display">Root Cause</th>
                          <th className="px-5 py-3 font-display text-right">Affected Records</th>
                          <th className="px-5 py-3 font-display text-center">Severity</th>
                          <th className="px-5 py-3 font-display text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600 bg-surface">
                        {errors.length > 0 ? (
                          errors.map(err => (
                            <tr 
                              key={err.id} 
                              onClick={() => {
                                setSelectedErrorId(err.id);
                                if (err.category === 'Missing Vehicle') {
                                  setActivePage('cascade');
                                } else {
                                  setActivePage('errors');
                                }
                              }}
                              className="hover:bg-slate-50/50 cursor-pointer"
                            >
                              <td className="px-5 py-3 font-bold text-brand font-mono">{err.id}</td>
                              <td className="px-5 py-3 font-semibold text-slate-700">{err.category}</td>
                              <td className="px-5 py-3 text-slate-400 max-w-xs truncate">{err.rootCause}</td>
                              <td className="px-5 py-3 text-right font-mono tabular-nums">{err.affectedRecords.toLocaleString()}</td>
                              <td className="px-5 py-3 text-center"><Badge type="severity" value={err.severity} /></td>
                              <td className="px-5 py-3 text-center"><Badge type="status" value={err.status === 'Open' ? 'Critical' : 'Warning'} /></td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-slate-400">
                              No active data-quality errors logged on this entity.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                } />
              )}

              {/* Tab 6: CHANGES / AUDITS */}
              {activeTab === 'changes' && (
                <Card children={
                  <div className="overflow-x-auto -mx-5 -my-4">
                    <table className="min-w-full divide-y divide-slate-100 text-left">
                      <thead className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                        <tr>
                          <th className="px-5 py-3 font-display">Log ID</th>
                          <th className="px-5 py-3 font-display">Record Ref</th>
                          <th className="px-5 py-3 font-display">Field</th>
                          <th className="px-5 py-3 font-display">Author Modification</th>
                          <th className="px-5 py-3 font-display">Modified By</th>
                          <th className="px-5 py-3 font-display text-center">Audit Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600 bg-surface">
                        {audits.length > 0 ? (
                          audits.map(aud => (
                            <tr 
                              key={aud.id} 
                              onClick={() => setActivePage('authoring')}
                              className="hover:bg-slate-50/50 cursor-pointer"
                            >
                              <td className="px-5 py-3 font-mono font-bold text-slate-800">{aud.id}</td>
                              <td className="px-5 py-3 font-mono text-slate-400">{aud.recordKey}</td>
                              <td className="px-5 py-3 font-mono font-bold text-slate-700">{aud.field}</td>
                              <td className="px-5 py-3 text-emerald-600 max-w-xs truncate font-semibold">
                                {aud.currentValue}
                              </td>
                              <td className="px-5 py-3 text-slate-500 font-semibold">{aud.changedBy.split(' ')[0]}</td>
                              <td className="px-5 py-3 text-center"><Badge type="audit" value={aud.status} /></td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-slate-400">
                              No manual author modifications recorded for this table.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                } />
              )}
            </>
          ) : (
            <Card children={<div className="text-center py-12 text-slate-400">No entity selected.</div>} />
          )}
        </div>
      </div>
    </div>
  );
};

