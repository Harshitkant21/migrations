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
            Interactive Schema Map
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Inspect relational columns, mapping metrics, and foreign key flows
          </p>
        </div>

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

      {/* Main workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* Left selector */}
        <Card className="lg:col-span-1" title="Tables Dictionary" subtitle="Select database table">
          <div className="space-y-1 max-h-[500px] overflow-y-auto -mx-2 px-2">
            {entities.map(e => (
              <button
                key={e.id}
                onClick={() => setSelectedEntityId(e.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center justify-between
                  ${e.id === selectedEntityId 
                    ? 'bg-brand-50 border-brand-200 text-brand font-bold' 
                    : 'border-transparent text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <span>{e.name}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">{e.category}</span>
              </button>
            ))}
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
            <div className="flex-1 space-y-6">
              {loading ? (
                <Card children={<div className="text-center py-20 text-slate-400">Loading details...</div>} />
              ) : schema ? (
                <div className="grid grid-cols-1 gap-6">
                  
                  {/* Columns schema grid */}
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
                                {c.isPrimaryKey && <span className="bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded text-[9px] mr-1">PK</span>}
                                {c.isForeignKey && (
                                  <span className="bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded text-[9px]">
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
 
                  {/* Transformation definitions */}
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
