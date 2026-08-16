// src/pages/SchemaExplorer.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { mockApi } from '../data/mockApi';
import { useGlobalStore } from '../state/useGlobalStore';
import { TableSchema, EntityMetadata } from '../types/models';
import { Search, Database, Columns, Network, ArrowRight } from 'lucide-react';
import ReactFlow, { 
  Controls, 
  Background, 
  Node, 
  Edge,
  MarkerType,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';

export const SchemaExplorer: React.FC = () => {
  const { environment, selectedEntityId, setSelectedEntityId } = useGlobalStore();
  
  const [entities, setEntities] = useState<EntityMetadata[]>([]);
  const [schema, setSchema] = useState<TableSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'er' | 'details'>('er');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'Reference' | 'PCS' | 'MCS'>('ALL');
  const [detailTab, setDetailTab] = useState<'Overview' | 'Schema' | 'Data' | 'Relationships' | 'Mapping' | 'Validation' | 'History'>('Overview');

  const filteredEntities = useMemo(() => {
    return entities.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || e.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [entities, searchQuery, categoryFilter]);

  useEffect(() => {
    const loadEntities = async () => {
      const result = await mockApi.getEntities(environment);
      setEntities(result);
      if (!selectedEntityId && result.length > 0) {
        setSelectedEntityId('pcs_subsystems');
      }
    };
    loadEntities();
  }, [environment]);

  useEffect(() => {
    if (!selectedEntityId) return;
    const loadSchemaDetails = async () => {
      setLoading(true);
      const schemaData = await mockApi.getSchema(selectedEntityId);
      setSchema(schemaData || null);
      setLoading(false);
    };
    loadSchemaDetails();
  }, [selectedEntityId]);

  // Setup nodes and edges for the ER diagram based on active entity context
  const erData = useMemo(() => {
    if (entities.length === 0) return { nodes: [], edges: [] };

    // Standard positioning coordinates for hierarchy: Reference -> MCS / PCS -> Procedures
    const nodePositions: Record<string, { x: number; y: number }> = {
      makes: { x: 50, y: 50 },
      models: { x: 50, y: 170 },
      vehicles: { x: 50, y: 290 },
      pcs: { x: 350, y: 50 },
      pcs_systems: { x: 350, y: 170 },
      pcs_subsystems: { x: 350, y: 290 },
      pcs_procedures: { x: 350, y: 410 },
      mcs: { x: 650, y: 50 },
      mcs_systems: { x: 650, y: 170 },
      mcs_subsystems: { x: 650, y: 290 },
      mcs_procedures: { x: 650, y: 410 },
    };

    // Construct nodes
    const nodes: Node[] = Object.keys(nodePositions).map((id) => {
      const ent = entities.find(e => e.id === id);
      const name = ent ? ent.name : id.toUpperCase().replace('_', ' ');
      const isSelected = id === selectedEntityId;
      const isConnected = schema?.upstreamDeps.includes(id) || schema?.downstreamDeps.includes(id);
      
      // Node visual styling: Highlighted vs Normal vs Muted
      let borderClass = 'border-slate-200 bg-surface';
      let textClass = 'text-slate-800';
      if (isSelected) {
        borderClass = 'border-brand ring-2 ring-brand-100 bg-brand-50/20';
        textClass = 'text-brand font-bold';
      } else if (isConnected) {
        borderClass = 'border-slate-400 bg-slate-50';
        textClass = 'text-slate-700';
      } else if (selectedEntityId) {
        // Mute unrelated nodes slightly but keep text readable
        borderClass = 'border-slate-200 bg-slate-50/50 opacity-60';
        textClass = 'text-slate-500';
      }

      // Configure connection port position rules dynamically to prevent messy overlapping loops
      let sourcePosition = Position.Bottom;
      let targetPosition = Position.Top;

      if (id === 'vehicles') {
        sourcePosition = Position.Right; // Outputs Reference horizontally to the right
      } else if (id === 'pcs' || id === 'mcs') {
        targetPosition = Position.Left; // Receives horizontal reference link on the left
      } else if (id === 'makes') {
        targetPosition = undefined as any; // Root node has no input port
      } else if (id === 'pcs_procedures' || id === 'mcs_procedures') {
        sourcePosition = undefined as any; // Terminal nodes have no output port
      }

      return {
        id,
        position: nodePositions[id],
        data: { 
          label: (
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold tracking-wide uppercase text-slate-400">TABLE</span>
              <span className="text-xs font-semibold leading-tight">{name}</span>
            </div>
          ) 
        },
        style: {
          border: '1px solid',
          borderRadius: '8px',
          padding: '8px 12px',
          boxShadow: isSelected ? '0 4px 6px -1px rgba(0,0,0,0.05)' : '0 1px 3px 0 rgba(0,0,0,0.03)',
        },
        className: borderClass,
        sourcePosition,
        targetPosition
      };
    });

    // Construct Edges representing PK relations
    const rawEdges = [
      { source: 'makes', target: 'models' },
      { source: 'models', target: 'vehicles' },
      { source: 'vehicles', target: 'pcs' },
      { source: 'vehicles', target: 'mcs' }, // Added target connection link to MCS table branch
      { source: 'pcs', target: 'pcs_systems' },
      { source: 'pcs_systems', target: 'pcs_subsystems' },
      { source: 'pcs_subsystems', target: 'pcs_procedures' },
      { source: 'mcs', target: 'mcs_systems' },
      { source: 'mcs_systems', target: 'mcs_subsystems' },
      { source: 'mcs_subsystems', target: 'mcs_procedures' }
    ];

    const edges: Edge[] = rawEdges.map((edge, idx) => {
      const isRelatedToSelected = edge.source === selectedEntityId || edge.target === selectedEntityId;
      const strokeColor = isRelatedToSelected ? '#005B94' : '#94A3B8'; // Clearly visible default gray line
      const strokeWidth = isRelatedToSelected ? 2.5 : 1.5; // Thicker lines
      const opacity = selectedEntityId && !isRelatedToSelected ? 0.75 : 1.0; // Clear default visibility

      return {
        id: `e-${idx}`,
        source: edge.source,
        target: edge.target,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
          width: 15,
          height: 15
        },
        style: {
          stroke: strokeColor,
          strokeWidth,
          opacity
        }
      };
    });

    return { nodes, edges };
  }, [entities, selectedEntityId, schema]);

  const onNodeClick = (_: any, node: Node) => {
    setSelectedEntityId(node.id);
  };

  return (
    <div className="space-y-6">
      
      {/* View Options Toggle banner */}
      <div className="bg-surface border border-slate-200/80 rounded-lg px-5 py-4 shadow-premium flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div>
          <h3 className="text-xs font-extrabold text-slate-800 tracking-wider uppercase font-display">
            Interactive Schema Map & Relational Canvas
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Inspect relational columns, PK/FK links, mapping metrics, and high-fidelity schema exports
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* High-Fidelity Diagram Export Buttons */}
          <button
            type="button"
            onClick={() => {
              const element = document.querySelector('.react-flow__viewport');
              if (!element) return;
              const svgData = new XMLSerializer().serializeToString(document.querySelector('.react-flow svg') || element);
              const blob = new Blob([`<svg xmlns="http://www.w3.org/2000/svg">${svgData}</svg>`], { type: 'image/svg+xml;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `nexus_schema_${selectedEntityId || 'complete'}_er_diagram.svg`;
              link.click();
            }}
            className="px-3 py-1.5 bg-brand-50 border border-brand-200 hover:bg-brand-100 text-brand text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>📷 Export High-Res ER Diagram (SVG/PNG)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const ddl = `-- Generated by Nexus Migrate DDL Export Engine
-- Table: ${selectedEntityId || 'vehicles'}
CREATE TABLE ${selectedEntityId || 'vehicles'} (
    ${schema?.columns.map(c => `${c.name} ${c.dataType.toUpperCase()}${c.isPrimaryKey ? ' PRIMARY KEY' : ''}${c.isNullable ? '' : ' NOT NULL'}`).join(',\n    ') || 'vehicle_id VARCHAR(20) PRIMARY KEY'}
);
`;
              const blob = new Blob([ddl], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${selectedEntityId || 'schema'}_ddl.sql`;
              link.click();
            }}
            className="px-3 py-1.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>📄 Export DDL (SQL)</span>
          </button>

          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 shadow-sm text-xs font-semibold text-slate-600">
            <button
              onClick={() => setViewMode('er')}
              className={`px-3 py-1 rounded-md transition-all ${viewMode === 'er' ? 'bg-surface text-slate-800 font-bold shadow-sm' : 'hover:text-slate-800'}`}
            >
              <span className="flex items-center gap-1.5"><Network className="w-3.5 h-3.5" /> ER Canvas</span>
            </button>
            <button
              onClick={() => setViewMode('details')}
              className={`px-3 py-1 rounded-md transition-all ${viewMode === 'details' ? 'bg-surface text-slate-800 font-bold shadow-sm' : 'hover:text-slate-800'}`}
            >
              <span className="flex items-center gap-1.5"><Columns className="w-3.5 h-3.5" /> Mapping details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* Left selector */}
        <Card className="lg:col-span-1" title="Tables Dictionary" subtitle="Filter and select database tables">
          <div className="space-y-3">
            
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search table, column..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 outline-none hover:border-slate-300 focus:border-brand focus:bg-surface font-sans"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg text-[10px] font-semibold text-slate-600">
              {(['ALL', 'Reference', 'PCS', 'MCS'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2 py-0.5 rounded transition-all ${categoryFilter === cat ? 'bg-surface text-brand font-bold shadow-sm' : 'hover:text-slate-800'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Tables List */}
            <div className="space-y-1 max-h-[420px] overflow-y-auto -mx-2 px-2">
              {filteredEntities.map(e => (
                <button
                  key={e.id}
                  onClick={() => setSelectedEntityId(e.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold border transition-all flex flex-col gap-1
                    ${e.id === selectedEntityId 
                      ? 'bg-brand-50 border-brand-200 text-brand font-bold shadow-sm' 
                      : 'border-transparent text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{e.name}</span>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest">{e.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono font-normal">
                    <span>{e.sourceCount.toLocaleString()} rows</span>
                    <span className={`font-bold ${e.status === 'Healthy' ? 'text-emerald-600' : e.status === 'Warning' ? 'text-amber-600' : 'text-red-600'}`}>
                      {e.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>

          </div>
        </Card>

        {/* Right workspace: Graph vs Details */}
        <div className="lg:col-span-3 min-h-[500px] flex">
          {viewMode === 'er' ? (
            <div className="flex-1 bg-surface border border-slate-200/80 rounded-lg shadow-premium overflow-hidden relative flex flex-col">
              <div className="absolute top-4 left-4 z-10 bg-surface/85 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-slate-500">
                Click nodes to inspect columns schema. Proper PK-FK lines are mapped above.
              </div>
              <div className="flex-1 h-full min-h-[500px]">
                <ReactFlow
                  nodes={erData.nodes}
                  edges={erData.edges}
                  onNodeClick={onNodeClick}
                  fitView
                  fitViewOptions={{ padding: 0.15 }}
                >
                  <Background color="#94a3b8" gap={16} size={1} />
                  <Controls />
                </ReactFlow>
              </div>
            </div>
          ) : (
            <div className="flex-1 space-y-4">
              
              {/* 7 Progressive Detail Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/60 shadow-sm text-xs font-semibold text-slate-600 overflow-x-auto">
                {(['Overview', 'Schema', 'Data', 'Relationships', 'Mapping', 'Validation', 'History'] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setDetailTab(tab)}
                    className={`px-3 py-1 rounded-md transition-all whitespace-nowrap ${detailTab === tab ? 'bg-surface text-brand font-bold shadow-sm' : 'hover:text-slate-800'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {loading ? (
                <Card children={<div className="text-center py-20 text-slate-400">Loading details...</div>} />
              ) : schema ? (
                <div className="grid grid-cols-1 gap-6">
                  
                  {/* Tab 1: Overview */}
                  {detailTab === 'Overview' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-surface border border-slate-200/80 rounded-xl shadow-premium">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">TOTAL ROWS</span>
                          <span className="text-xl font-extrabold font-mono text-slate-800 mt-1 block">
                            {entities.find(e => e.id === schema.entityId)?.sourceCount.toLocaleString() || '42,500'}
                          </span>
                        </div>
                        <div className="p-4 bg-surface border border-slate-200/80 rounded-xl shadow-premium">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">COLUMN COUNT</span>
                          <span className="text-xl font-extrabold font-mono text-slate-800 mt-1 block">
                            {schema.columns.length} columns
                          </span>
                        </div>
                        <div className="p-4 bg-surface border border-slate-200/80 rounded-xl shadow-premium">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">SYNC STATUS</span>
                          <span className="text-xl font-extrabold font-mono text-emerald-600 mt-1 block">
                            {entities.find(e => e.id === schema.entityId)?.status || 'Healthy'}
                          </span>
                        </div>
                      </div>

                      <Card title={`${schema.entityId.toUpperCase().replace('_', ' ')} Overview & Description`}>
                        <div className="space-y-3 text-xs text-slate-600 leading-relaxed font-medium">
                          <p>
                            Table <strong className="font-mono text-slate-800">{schema.entityId}</strong> stores core database records within the <span className="font-bold text-brand">{entities.find(e => e.id === schema.entityId)?.category || 'Reference'}</span> domain.
                          </p>
                          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-[11px] font-mono">
                            <div><span className="text-slate-400">Primary Key:</span> <strong className="text-slate-800">{schema.columns.find(c => c.isPrimaryKey)?.name || 'id'}</strong></div>
                            <div><span className="text-slate-400">Foreign Keys:</span> <strong className="text-slate-800">{schema.columns.filter(c => c.isForeignKey).length} key(s)</strong></div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* Tab 2: Schema */}
                  {detailTab === 'Schema' && (
                    <Card title={`${schema.entityId.toUpperCase().replace('_', ' ')} Columns Schema`}>
                      <div className="overflow-x-auto -mx-5 -my-4">
                        <table className="min-w-full divide-y divide-slate-100 text-left">
                          <thead className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                            <tr>
                              <th className="px-5 py-3 font-display">Column</th>
                              <th className="px-5 py-3 font-display">Type</th>
                              <th className="px-5 py-3 font-display">Keys & Mappings</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600 bg-surface">
                            {schema.columns.map((c, idx) => (
                              <tr key={idx}>
                                <td className="px-5 py-3 font-mono text-slate-800 font-bold">{c.name}</td>
                                <td className="px-5 py-3 font-mono text-slate-400">{c.dataType}</td>
                                <td className="px-5 py-3">
                                  {c.isPrimaryKey && <span className="bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded text-[9px] mr-1 font-bold">PK</span>}
                                  {c.isForeignKey && (
                                    <span className="bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                      FK → {c.referencedTable}.{c.referencedColumn}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )}

                  {/* Tab 3: Data */}
                  {detailTab === 'Data' && (
                    <Card title="Staging Sample Data Grid (First 5 Records)">
                      <div className="overflow-x-auto -mx-5 -my-4">
                        <table className="min-w-full divide-y divide-slate-100 text-left">
                          <thead className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider font-mono">
                            <tr>
                              {schema.columns.slice(0, 4).map(c => (
                                <th key={c.name} className="px-4 py-2.5">{c.name}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs font-mono text-slate-700 bg-surface">
                            <tr>
                              <td className="px-4 py-2 font-bold text-slate-900">GMV-2967</td>
                              <td className="px-4 py-2 text-slate-500">1G6ET5</td>
                              <td className="px-4 py-2 text-slate-500">EV-CAD-26</td>
                              <td className="px-4 py-2 text-slate-500">2026</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 font-bold text-slate-900">GMV-1713</td>
                              <td className="px-4 py-2 text-slate-500">1G6ET8</td>
                              <td className="px-4 py-2 text-slate-500">EV-CAD-26</td>
                              <td className="px-4 py-2 text-slate-500">2026</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 font-bold text-slate-900">GMV-1750</td>
                              <td className="px-4 py-2 text-slate-500">2G4AL1</td>
                              <td className="px-4 py-2 text-slate-500">BEV-CHV-25</td>
                              <td className="px-4 py-2 text-slate-500">2025</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )}

                  {/* Tab 4: Relationships */}
                  {detailTab === 'Relationships' && (
                    <Card title="Parent & Dependent Table Relationships">
                      <div className="space-y-3">
                        {schema.columns.filter(c => c.isForeignKey).map((c, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-between">
                            <span className="font-mono text-slate-700">{c.name}</span>
                            <span className="text-purple-700 font-mono font-bold">Refers to {c.referencedTable}.{c.referencedColumn}</span>
                          </div>
                        ))}
                        {schema.columns.filter(c => c.isForeignKey).length === 0 && (
                          <p className="text-xs text-slate-400 font-medium">Root catalog node. No parent foreign key dependencies.</p>
                        )}
                      </div>
                    </Card>
                  )}

                  {/* Tab 5: Mapping */}
                  {detailTab === 'Mapping' && (
                    <Card title="Source ETL Mappings">
                      <div className="space-y-3">
                        {schema.mappingRules.map((rule, idx) => (
                          <div key={idx} className="p-3 border border-slate-100 bg-slate-50 rounded-lg flex items-center justify-between text-xs font-semibold">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 font-mono">{rule.sourceTable}.{rule.sourceColumn}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-brand font-mono">{rule.targetColumn}</span>
                            </div>
                            <span className="text-slate-600 font-medium">{rule.transformationRule}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Tab 6: Validation */}
                  {detailTab === 'Validation' && (
                    <Card title="Data Quality Validation Rules">
                      <div className="space-y-3 text-xs font-medium text-slate-700">
                        <div className="p-3 bg-emerald-50 border border-emerald-200/60 rounded-lg flex justify-between items-center">
                          <span>Primary Key Uniqueness Rule</span>
                          <span className="font-bold text-emerald-700">PASSED</span>
                        </div>
                        <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-lg flex justify-between items-center">
                          <span>Foreign Key Integrity Check</span>
                          <span className="font-bold text-amber-700">1 WARNING</span>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Tab 7: History */}
                  {detailTab === 'History' && (
                    <Card title="Schema Migration History">
                      <div className="space-y-3 text-xs font-medium text-slate-600">
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                          <span>STG Schema Provisioned</span>
                          <span className="font-mono text-slate-400">2026-08-10 14:22 UTC</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Initial Data Ingestion Batch</span>
                          <span className="font-mono text-slate-400">2026-08-11 09:15 UTC</span>
                        </div>
                      </div>
                    </Card>
                  )}

                </div>
              ) : (
                <Card children={<div className="text-center py-20 text-slate-400">No schema loaded.</div>} />
              )}
            </div>
          )}
        </div>
 
      </div>
 
    </div>
  );
};
