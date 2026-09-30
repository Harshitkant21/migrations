import React, { useState, useMemo, useEffect } from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { MappingFormDrawer } from '../../components/journey/MappingFormDrawer';
import { JsonImportModal } from '../../components/journey/JsonImportModal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { 
  GitMerge, 
  Upload, 
  Plus, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Search
} from 'lucide-react';

export const MappingWorkspaceStep: React.FC = () => {
  const { 
    mappingStrategy, 
    setMappingStrategy, 
    relationshipFilter, 
    setRelationshipFilter,
    tableMappings, 
    setCreateMappingDrawerOpen, 
    setUploadJsonModalOpen,
    applySuggestedMappings,
    setActiveStep 
  } = useGlobalStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Flatten column mappings for the high-density grid
  const allColumnMappings = useMemo(() => {
    let rows: {
      parentRuleId: string;
      parentTitle: string;
      mappingType: string;
      sourceTable: string;
      sourceColumn: string;
      transformationType: string;
      transformationRule: string;
      targetTable: string;
      targetColumn: string;
      dataTypeChange: string;
      sampleBefore: string;
      sampleAfter: string;
      status: string;
    }[] = [];

    tableMappings.forEach(rule => {
      // Filter by relationship
      if (relationshipFilter === '1:1' && rule.mappingType !== 'SINGLE') return;
      if (relationshipFilter === '1:N' && rule.mappingType !== 'SPLIT') return;
      if (relationshipFilter === 'N:1' && rule.mappingType !== 'MERGE') return;
      if (relationshipFilter === 'N:N' && rule.mappingType !== 'COMPLEX') return;

      rule.columnMappings.forEach(cm => {
        const matchesSearch = searchQuery.trim() === '' ||
          cm.sourceTable.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cm.sourceColumn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cm.targetTable.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cm.targetColumn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cm.transformationType.toLowerCase().includes(searchQuery.toLowerCase());

        if (matchesSearch) {
          rows.push({
            parentRuleId: rule.id,
            parentTitle: rule.title,
            mappingType: rule.mappingType,
            sourceTable: cm.sourceTable,
            sourceColumn: cm.sourceColumn,
            transformationType: cm.transformationType,
            transformationRule: cm.transformationRule,
            targetTable: cm.targetTable,
            targetColumn: cm.targetColumn,
            dataTypeChange: `${cm.sourceDataType || 'VARCHAR'} → ${cm.targetDataType || 'VARCHAR'}`,
            sampleBefore: cm.sampleBefore || '—',
            sampleAfter: cm.sampleAfter || '—',
            status: cm.status
          });
        }
      });
    });

    return rows;
  }, [tableMappings, relationshipFilter, searchQuery]);

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [relationshipFilter, searchQuery]);

  const paginatedMappings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allColumnMappings.slice(start, start + pageSize);
  }, [allColumnMappings, currentPage, pageSize]);

  return (
    <div className="space-y-4 font-sans max-w-full">
      
      {/* Compact Page Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Step 04
            </span>
            <span className="text-slate-300">•</span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Advanced Mapping Workspace
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure entity projections, data transformations, and column-level type conversions.
          </p>
        </div>

        <div className="flex items-center gap-2 whitespace-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveStep('definition')}
            className="text-xs h-8 px-2.5 whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Definition</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveStep('validation')}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-xs h-8 px-3 whitespace-nowrap"
          >
            <span>Proceed to Validation</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* Top Compact KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs flex items-center justify-between">
          <span className="text-slate-500 uppercase text-[10px] font-medium whitespace-nowrap">Source Tables</span>
          <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">245</span>
        </div>
        <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/70 rounded-lg shadow-2xs flex items-center justify-between">
          <span className="text-emerald-800 uppercase text-[10px] font-medium whitespace-nowrap">Mapped Entities</span>
          <span className="text-sm font-bold text-emerald-950 font-mono tabular-nums">238 <span className="text-[10px] font-normal text-emerald-700">(97.1%)</span></span>
        </div>
        <div className="p-2.5 bg-amber-50/70 border border-amber-200/70 rounded-lg shadow-2xs flex items-center justify-between">
          <span className="text-amber-800 uppercase text-[10px] font-medium whitespace-nowrap">Partially Mapped</span>
          <span className="text-sm font-bold text-amber-950 font-mono tabular-nums">5 Tables</span>
        </div>
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg shadow-2xs flex items-center justify-between">
          <span className="text-slate-500 uppercase text-[10px] font-medium whitespace-nowrap">Unmapped (Cache)</span>
          <span className="text-sm font-bold text-slate-700 font-mono tabular-nums">2 Tables</span>
        </div>
      </div>

      {/* Primary Workspace Control Bar: Strategy Chips, Relationship Filter, Actions */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Strategy Selector Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-semibold uppercase mr-1 whitespace-nowrap">Strategy:</span>
          {(['preserve', 'optimize', 'custom'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setMappingStrategy(s)}
              className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer whitespace-nowrap ${
                mappingStrategy === s
                  ? 'bg-slate-900 text-white font-medium shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {s === 'preserve' ? 'Preserve Source' : s === 'optimize' ? 'Optimize Target (Auto)' : 'Custom Rules'}
            </button>
          ))}
          <button
            onClick={applySuggestedMappings}
            className="text-xs text-indigo-700 font-medium hover:underline cursor-pointer ml-1 hidden lg:inline whitespace-nowrap"
          >
            Apply Suggested (98% match)
          </button>
        </div>

        {/* Right: Actions (with whitespace-nowrap to avoid breaking into 2 lines!) */}
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUploadJsonModalOpen(true)}
            className="text-xs h-8 px-2.5 whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5 mr-1" />
            <span>Upload JSON</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreateMappingDrawerOpen(true)}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-xs h-8 px-3 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Create Mapping</span>
          </Button>
        </div>

      </div>

      {/* Main High-Density Mapping Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden text-xs">
        
        {/* Table Filter Toolbar */}
        <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          {/* Relationship Filter Tabs */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[11px] text-slate-400 font-semibold uppercase mr-1 whitespace-nowrap">Cardinality:</span>
            {[
              { id: 'ALL', label: 'All' },
              { id: '1:1', label: '1 → 1' },
              { id: '1:N', label: '1 → N Split' },
              { id: 'N:1', label: 'N → 1 Merge' },
              { id: 'N:N', label: 'N → N' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setRelationshipFilter(tab.id as any)}
                className={`px-2 py-0.5 rounded text-xs transition-all cursor-pointer font-medium whitespace-nowrap ${
                  relationshipFilter === tab.id 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Field */}
          <div className="relative min-w-[200px] max-w-xs">
            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter mapping columns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-3 py-1 bg-white border border-slate-300 rounded text-xs focus:outline-hidden font-sans"
            />
          </div>
        </div>

        {/* Structured Column Mapping Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-2 px-3 whitespace-nowrap">Cardinality</th>
                <th className="py-2 px-3 whitespace-nowrap">Source Column</th>
                <th className="py-2 px-3 text-center whitespace-nowrap">Transformation</th>
                <th className="py-2 px-3 whitespace-nowrap">Target Column</th>
                <th className="py-2 px-3 whitespace-nowrap">Type Conversion</th>
                <th className="py-2 px-3 whitespace-nowrap">Sample Transformation</th>
                <th className="py-2 px-3 text-center whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedMappings.map((row, idx) => (
                <tr key={`${row.parentRuleId}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                      row.mappingType === 'SPLIT' ? 'bg-purple-50 text-purple-800 border border-purple-200' :
                      row.mappingType === 'MERGE' ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' :
                      'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}>
                      {row.mappingType === 'SPLIT' ? '1 → N' : row.mappingType === 'MERGE' ? 'N → 1' : '1 → 1'}
                    </span>
                  </td>

                  <td className="py-2 px-3 font-mono text-slate-900 whitespace-nowrap">
                    <span className="text-slate-400">{row.sourceTable}.</span>
                    <span className="font-semibold">{row.sourceColumn}</span>
                  </td>

                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold">
                      {row.transformationType}
                    </span>
                  </td>

                  <td className="py-2 px-3 font-mono text-emerald-800 whitespace-nowrap">
                    <span className="text-slate-400">{row.targetTable}.</span>
                    <span className="font-semibold">{row.targetColumn}</span>
                  </td>

                  <td className="py-2 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {row.dataTypeChange}
                  </td>

                  <td className="py-2 px-3 text-[11px] font-mono text-slate-600 whitespace-nowrap">
                    <span className="bg-slate-100 px-1 py-0.2 rounded">{row.sampleBefore}</span>
                    <span className="text-slate-400 mx-1">→</span>
                    <span className="bg-emerald-50 text-emerald-800 px-1 py-0.2 rounded font-semibold">{row.sampleAfter}</span>
                  </td>

                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Working Pagination Component */}
        <Pagination
          currentPage={currentPage}
          totalItems={allColumnMappings.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="mapping rules"
        />

      </div>

      {/* Drawer & Modal */}
      <MappingFormDrawer />
      <JsonImportModal />

    </div>
  );
};
