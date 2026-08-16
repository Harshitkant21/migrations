// src/pages/CascadeAnalysis.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { mockApi } from '../data/mockApi';
import { useGlobalStore } from '../state/useGlobalStore';
import { CascadeNode, DataQualityError } from '../types/models';
import { Network, ArrowRight, AlertTriangle, PlayCircle, Layers, FileSpreadsheet, AlertOctagon } from 'lucide-react';
import ReactFlow, { 
  Background, 
  Controls, 
  Node, 
  Edge, 
  MarkerType,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';

export const CascadeAnalysis: React.FC = () => {
  const { selectedErrorId, setSelectedErrorId, setActivePage, setSelectedEntityId } = useGlobalStore();

  const [activeErrorId, setActiveErrorId] = useState<string>('ERR-2967'); // Default
  const [errorDetails, setErrorDetails] = useState<DataQualityError | null>(null);
  const [cascadeNodes, setCascadeNodes] = useState<CascadeNode[]>([]);
  const [amplification, setAmplification] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedErrorId) {
      setActiveErrorId(selectedErrorId);
    }
  }, [selectedErrorId]);

  useEffect(() => {
    const loadCascadeData = async () => {
      setLoading(true);
      const err = await mockApi.getError(activeErrorId);
      const graph = await mockApi.getCascadeData(activeErrorId);
      
      setErrorDetails(err || null);
      setCascadeNodes(graph.nodes);
      setAmplification(graph.amplification);
      setLoading(false);
      
      if (graph.nodes.length > 0) {
        setSelectedNodeId(graph.nodes[graph.nodes.length - 1].id);
      }
    };
    loadCascadeData();
  }, [activeErrorId]);

  const flowData = useMemo(() => {
    if (cascadeNodes.length === 0) return { nodes: [], edges: [] };

    // Standard horizontal placement coordinates
    const nodes: Node[] = cascadeNodes.map((n, idx) => {
      const isSelected = n.id === selectedNodeId;
      
      let borderClass = 'border-slate-200 bg-surface';
      let textClass = 'text-slate-800';
      if (isSelected) {
        borderClass = 'border-brand ring-2 ring-brand-100 bg-brand-50/20';
        textClass = 'text-brand font-bold';
      }

      return {
        id: n.id,
        position: { x: idx * 220 + 30, y: 120 },
        data: {
          label: (
            <div className="flex flex-col text-left py-0.5 min-w-[140px]">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                {n.category === 'Root' ? 'ROOT CAUSE' : n.category}
              </span>
              <span className={`text-xs mt-1 font-bold font-display ${textClass}`}>{n.name}</span>
              
              <div className="mt-2.5 flex justify-between items-center text-[9px] border-t border-slate-100 pt-1.5 font-mono">
                <span className="text-slate-500 font-semibold">Affected:</span>
                <span className="font-bold text-slate-800 tabular-nums">{n.affectedCount.toLocaleString()} rows</span>
              </div>
            </div>
          )
        },
        style: {
          border: '1px solid',
          borderRadius: '6px',
          padding: '8px 10px',
          boxShadow: isSelected ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : '0 1px 2px 0 rgba(0,0,0,0.02)'
        },
        className: borderClass,
        sourcePosition: Position.Right,
        targetPosition: Position.Left
      };
    });

    const edges: Edge[] = [];
    for (let i = 0; i < cascadeNodes.length - 1; i++) {
      const isHighlighted = selectedNodeId === cascadeNodes[i + 1].id || selectedNodeId === cascadeNodes[i].id;
      edges.push({
        id: `edge-${i}`,
        source: cascadeNodes[i].id,
        target: cascadeNodes[i + 1].id,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isHighlighted ? '#005B94' : '#CBD5E1',
          width: 12,
          height: 12
        },
        style: {
          stroke: isHighlighted ? '#005B94' : '#CBD5E1',
          strokeWidth: isHighlighted ? 2 : 1
        }
      });
    }

    return { nodes, edges };
  }, [cascadeNodes, selectedNodeId]);

  const activeNodeDetails = useMemo(() => {
    return cascadeNodes.find(n => n.id === selectedNodeId);
  }, [cascadeNodes, selectedNodeId]);

  const otherVehicleErrors = [
    { id: 'ERR-2967', label: 'Vehicle 2967 (PCS Blockers)' },
    { id: 'ERR-1713', label: 'Vehicle 1713 (Duplicate Configs)' },
    { id: 'ERR-1750', label: 'Vehicle 1750 (Generic Make Mappings)' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Selector and Amplification Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Selector */}
        <Card className="lg:col-span-1" title="Active Investigation Root" subtitle="Choose vehicle anomaly to test">
          <div className="flex flex-col gap-2">
            {otherVehicleErrors.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedErrorId(item.id);
                  setActiveErrorId(item.id);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold border transition-all flex items-center justify-between
                  ${activeErrorId === item.id 
                    ? 'bg-brand-50 border-brand-200 text-brand font-bold' 
                    : 'bg-surface hover:bg-slate-50 border-slate-200/80 text-slate-600'
                  }`}
              >
                <span>{item.label}</span>
                <PlayCircle className="w-3.5 h-3.5 opacity-50" />
              </button>
            ))}
          </div>
        </Card>

        {/* Amplification factor banner */}
        <div className="lg:col-span-2 bg-red-50 border border-red-200/60 rounded-lg p-5 flex flex-col md:flex-row items-center justify-between shadow-sm">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center justify-center md:justify-start gap-1">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Cascade Amplification Factor
            </span>
            <p className="text-xs text-red-800 leading-relaxed max-w-md font-medium">
              Data quality errors at the reference vehicle layer propagate exponentially down related schemas, blocking database record publishing.
            </p>
          </div>
          <div className="text-center mt-4 md:mt-0 bg-white border border-red-200 px-6 py-3.5 rounded-lg shadow-sm">
            <span className="text-3xl font-extrabold font-mono text-red-600 leading-none block tabular-nums">
              {amplification.toFixed(0)}×
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-1">
              MULTIPLIER GROWTH
            </span>
          </div>
        </div>

      </div>

      {/* Main Workspace Layout: Canvas and Side Panel side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* Left/Center Graph canvas (occupies 3/4) */}
        <div className="lg:col-span-3 bg-surface border border-slate-200/80 rounded-lg shadow-premium h-[420px] overflow-hidden relative flex flex-col">
          <div className="absolute top-4 left-4 z-10 bg-surface/85 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-slate-500 flex items-center justify-between gap-4 w-[calc(100%-2rem)]">
            <div className="flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-brand" /> 
              <span>Multi-Tier Domino Effect Tree (Click nodes for blast radius)</span>
            </div>

            {/* Export Diagram Button */}
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
                link.download = `nexus_cascade_domino_${activeErrorId}_diagram.svg`;
                link.click();
              }}
              className="px-2.5 py-1 bg-brand-50 border border-brand-200 hover:bg-brand-100 text-brand text-[10px] font-bold rounded transition-all flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <span>📷 Export Domino Diagram (SVG/PNG)</span>
            </button>
          </div>
          <div className="flex-1 h-full min-h-[350px]">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs animate-pulse">
                Generating dependency flow...
              </div>
            ) : (
              <ReactFlow
                nodes={flowData.nodes}
                edges={flowData.edges}
                onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                fitView
                fitViewOptions={{ padding: 0.1 }}
              >
                <Background color="#94a3b8" gap={16} size={1} />
                <Controls />
              </ReactFlow>
            )}
          </div>
        </div>

        {/* Right side: Node Impact Inspector (occupies 1/4) */}
        <div className="lg:col-span-1">
          {activeNodeDetails ? (
            <Card 
              className="h-full flex flex-col"
              title="Impact Inspector" 
              subtitle={`Focus: ${activeNodeDetails.name}`}
            >
              <div className="space-y-5 flex-1 flex flex-col justify-between">
                
                {/* Node details */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">SCHEMA SECTION</span>
                    <span className="text-xs font-bold text-slate-800 font-display mt-0.5 block">{activeNodeDetails.category}</span>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">RELATIONSHIP TYPE</span>
                    <span className="text-xs font-semibold text-slate-600 mt-0.5 block">{activeNodeDetails.relationshipType || '1-to-Many Cascade'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-b border-slate-100 py-3 font-mono">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">AFFECTED ROWS</span>
                      <span className="text-sm font-bold text-slate-800 tabular-nums block mt-0.5">
                        {activeNodeDetails.affectedCount.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">TOTAL IMPACT</span>
                      <span className="text-sm font-bold text-slate-800 block mt-0.5 tabular-nums">
                        {activeNodeDetails.impactPct.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">SEVERITY</span>
                    <div className="mt-1">
                      <Badge type="severity" value={activeNodeDetails.severity === 'Healthy' ? 'Low' : activeNodeDetails.severity} />
                    </div>
                  </div>
                </div>

                {/* Operations links */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">ACTIONS</span>
                  
                  <button
                    onClick={() => {
                      if (activeNodeDetails.id !== 'root') {
                        setSelectedEntityId(activeNodeDetails.id);
                        setActivePage('entity');
                      } else {
                        setActivePage('errors');
                      }
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-slate-700 text-xs font-semibold rounded-lg transition-all"
                  >
                    <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-slate-400" /> View Columns Schema</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedErrorId(activeErrorId);
                      setActivePage('errors');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-slate-700 text-xs font-semibold rounded-lg transition-all"
                  >
                    <span className="flex items-center gap-1.5"><AlertOctagon className="w-3.5 h-3.5 text-slate-400" /> View Related Error</span>
                  </button>

                  <button
                    onClick={() => {
                      if (activeNodeDetails.id !== 'root') {
                        setSelectedEntityId(activeNodeDetails.id);
                        setActivePage('schema');
                      }
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-slate-700 text-xs font-semibold rounded-lg transition-all"
                  >
                    <span className="flex items-center gap-1.5"><Network className="w-3.5 h-3.5 text-slate-400" /> Trace Lineage Graph</span>
                  </button>
                </div>

              </div>
            </Card>
          ) : (
            <Card children={<div className="text-center py-20 text-slate-400 text-xs">Select node to open Inspector.</div>} />
          )}
        </div>

      </div>

    </div>
  );
};
