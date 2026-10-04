// src/pages/journey/4_MappingWorkspace.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { MappingFormDrawer } from '../../components/journey/MappingFormDrawer';
import { JsonImportModal } from '../../components/journey/JsonImportModal';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { 
  Upload, 
  Download,
  Plus, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Search,
  FileCode,
  Database,
  Server,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  FileCheck
} from 'lucide-react';

export const MappingWorkspaceStep: React.FC = () => {
  const { 
    relationshipFilter, 
    setRelationshipFilter,
    tableMappings, 
    setCreateMappingDrawerOpen, 
    setUploadJsonModalOpen,
    setActiveStep,
    addToast
  } = useGlobalStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [sourceDbFilter, setSourceDbFilter] = useState<string>('ALL');
  const [targetDbFilter, setTargetDbFilter] = useState<string>('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleDownloadSample = () => {
    const link = document.createElement('a');
    link.href = '/samples/sample-migration-config.json';
    link.download = 'sample-migration-config.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Downloaded single source of truth sample-migration-config.json file', 'success');
  };

  // Flatten column mappings with template validation status
  const allColumnMappings = useMemo(() => {
    let rows: {
      parentRuleId: string;
      parentTitle: string;
      mappingType: string;
      sourceDb: string;
      sourceTable: string;
      sourceColumn: string;
      transformationType: string;
      transformationRule: string;
      targetDb: string;
      targetTable: string;
      targetColumn: string;
      dataTypeChange: string;
      templateValidation: {
        status: 'valid' | 'warning' | 'error';
        message: string;
      };
    }[] = [];

    tableMappings.forEach(rule => {
      rule.columnMappings.forEach(cm => {
        const srcDb = cm.sourceDb || rule.sourceDatabases[0] || 'legacy_db_01';
        const tgtDb = cm.targetDb || rule.targetDatabases[0] || 'prod_db_01';

        if (sourceDbFilter !== 'ALL' && srcDb !== sourceDbFilter) return;
        if (targetDbFilter !== 'ALL' && tgtDb !== targetDbFilter) return;

        const matchesSearch = searchQuery.trim() === '' ||
          cm.sourceTable.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cm.sourceColumn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cm.targetTable.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cm.targetColumn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          srcDb.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tgtDb.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cm.transformationType.toLowerCase().includes(searchQuery.toLowerCase());

        if (matchesSearch) {
          // Determine template validation status per row
          let valStatus: 'valid' | 'warning' | 'error' = 'valid';
          let valMsg = '✓ Validated against schema template';

          if (cm.sourceDataType === 'VARCHAR(50)' && cm.targetDataType === 'VARCHAR(20)') {
            valStatus = 'warning';
            valMsg = '⚠️ Type Length Warning: VARCHAR(50) to (20) requires truncate rule';
          } else if (cm.sourceDataType === 'TEXT' && cm.targetDataType === 'JSONB' && cm.transformationType !== 'SPLIT') {
            valStatus = 'error';
            valMsg = '✕ Template Schema Error: TEXT to JSONB requires JSON parse rule';
          }

          rows.push({
            parentRuleId: rule.id,
            parentTitle: rule.title,
            mappingType: rule.mappingType,
            sourceDb: srcDb,
            sourceTable: cm.sourceTable,
            sourceColumn: cm.sourceColumn,
            transformationType: cm.transformationType,
            transformationRule: cm.transformationRule,
            targetDb: tgtDb,
            targetTable: cm.targetTable,
            targetColumn: cm.targetColumn,
            dataTypeChange: `${cm.sourceDataType || 'VARCHAR'} → ${cm.targetDataType || 'VARCHAR'}`,
            templateValidation: {
              status: valStatus,
              message: valMsg
            }
          });
        }
      });
    });

    return rows;
  }, [tableMappings, sourceDbFilter, targetDbFilter, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sourceDbFilter, targetDbFilter, searchQuery]);

  const paginatedMappings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allColumnMappings.slice(start, start + pageSize);
  }, [allColumnMappings, currentPage, pageSize]);

  return (
    <div className="space-y-5 font-sans max-w-full">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Step 04
            </span>
            <span className="text-slate-300">•</span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Table Configuration & Mapping Workspace
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload, edit, and validate table mapping JSON configs against pre-flight database template schemas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 whitespace-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveStep('definition')}
            icon={ArrowLeft}
            iconPosition="left"
            className="text-xs font-semibold whitespace-nowrap"
          >
            Target Discovery
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveStep('validation')}
            icon={ArrowRight}
            iconPosition="right"
            className="text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-xs font-bold whitespace-nowrap"
          >
            Proceed to Validation
          </Button>
        </div>
      </div>

      {/* SINGLE SOURCE OF TRUTH: UPLOADED CONFIG FILE CARD */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-mono flex-wrap">
                <span className="text-sm font-bold text-white">Active Single Source of Truth Config JSON</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/30 whitespace-nowrap inline-flex items-center gap-1 shrink-0 font-bold">
                  ⚡ Auto-Saved
                </span>
              </div>
              <div className="text-xs text-slate-300 font-sans mt-1">
                The backend migration engine reads this master file (<strong className="font-mono text-emerald-300">sample-migration-config.json</strong>) to execute table splits, joins, and column projections across all source & target databases.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="dark"
              size="sm"
              onClick={handleDownloadSample}
              icon={Download}
              iconPosition="left"
              className="font-mono text-xs whitespace-nowrap"
            >
              Download Template JSON
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setUploadJsonModalOpen(true)}
              icon={Upload}
              iconPosition="left"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold whitespace-nowrap"
            >
              Upload / Edit Config JSON
            </Button>
          </div>
        </div>

        {/* Uploaded File Meta Details Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono bg-slate-800/80 p-3 rounded-lg border border-slate-700">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">File Name:</span>
            <span className="font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
              sample-migration-config.json
            </span>
            <span className="text-slate-400">Size:</span>
            <span className="text-slate-200">4.2 KB</span>
            <span className="text-slate-400">Total Rules:</span>
            <span className="text-slate-200 font-bold">{allColumnMappings.length} Column Mappings</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Template Schema Validated
            </span>
            <button
              onClick={() => setUploadJsonModalOpen(true)}
              className="ml-2 text-xs font-sans text-slate-300 hover:text-white underline cursor-pointer flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" /> Edit Raw JSON
            </button>
          </div>
        </div>

      </div>

      {/* FILTER TOOLBAR: DB SCOPE & SEARCH */}
      <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3 font-mono text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Source DB Filter */}
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-slate-700" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Source DB:</span>
            <div className="flex gap-1">
              {['ALL', 'legacy_db_01', 'legacy_db_02'].map(db => (
                <button
                  key={db}
                  onClick={() => setSourceDbFilter(db)}
                  className={`px-2 py-0.5 rounded text-xs font-bold cursor-pointer ${
                    sourceDbFilter === db ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {db}
                </button>
              ))}
            </div>
          </div>

          {/* Target DB Filter */}
          <div className="flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Target DB:</span>
            <div className="flex gap-1">
              {['ALL', 'prod_db_01', 'prod_db_02'].map(db => (
                <button
                  key={db}
                  onClick={() => setTargetDbFilter(db)}
                  className={`px-2 py-0.5 rounded text-xs font-bold cursor-pointer ${
                    targetDbFilter === db ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {db}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tables or columns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-white border border-slate-300 rounded text-xs focus:outline-hidden font-sans"
            />
          </div>

        </div>
      </div>

      {/* TABLE MAPPING GRID WITH TEMPLATE VALIDATION */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden text-xs">
        
        <div className="overflow-x-auto font-mono">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3 whitespace-nowrap">Source DB & Table</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Source Column</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Rule</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Target DB & Table</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Target Column</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Type Conversion</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Template Schema Validation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedMappings.map((row, idx) => (
                <tr key={`${row.parentRuleId}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Source DB & Table */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="font-bold text-slate-900">{row.sourceTable}</div>
                    <div className="text-[10px] text-slate-400">{row.sourceDb}</div>
                  </td>

                  {/* Source Column */}
                  <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                    {row.sourceColumn}
                  </td>

                  {/* Transformation Rule */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-mono font-bold border border-slate-200">
                      {row.transformationType}
                    </span>
                  </td>

                  {/* Target DB & Table */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="font-bold text-emerald-800">{row.targetTable}</div>
                    <div className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1 py-0.2 rounded inline-block">
                      {row.targetDb}
                    </div>
                  </td>

                  {/* Target Column */}
                  <td className="py-2.5 px-3 font-bold text-emerald-800 whitespace-nowrap">
                    {row.targetColumn}
                  </td>

                  {/* Type Conversion */}
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {row.dataTypeChange}
                  </td>

                  {/* Template Schema Error / Validation Status */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                      row.templateValidation.status === 'valid'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : row.templateValidation.status === 'warning'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200 font-bold'
                    }`}>
                      {row.templateValidation.message}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={allColumnMappings.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="table mapping rules"
        />

      </div>

      <MappingFormDrawer />
      <JsonImportModal />

    </div>
  );
};
