// src/pages/Mapping.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { mockApi } from '../data/mockApi';
import { useGlobalStore } from '../state/useGlobalStore';
import { 
  DatabaseInfo, 
  TableMappingDefinition, 
  EntityMetadata
} from '../types/models';
import { 
  ArrowRight, 
  GitMerge, 
  GitFork, 
  Database,
  CheckCircle2,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';

export const Mapping: React.FC = () => {
  const { 
    selectedTargetDb,
    selectedTargetTable,
    setSelectedSourceDb, 
    setSelectedTargetDb, 
    setSelectedSourceTable,
    setSelectedTargetTable,
    setSelectedEntityId
  } = useGlobalStore();

  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const [entities, setEntities] = useState<EntityMetadata[]>([]);
  const [mappings, setMappings] = useState<TableMappingDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  // Inspection scope: 'TO_BE' (Target Focus) or 'AS_IS' (Source Focus)
  const [inspectMode, setInspectMode] = useState<'TO_BE' | 'AS_IS'>('TO_BE');
  
  // Selected Database & Table states
  const [activeDb, setActiveDb] = useState<string>('prod_db_01');
  const [activeTable, setActiveTable] = useState<string>('vehicles');

  useEffect(() => {
    let mounted = true;
    Promise.all([
      mockApi.getDatabases(),
      mockApi.getEntities('PROD'),
      mockApi.getTableMappings()
    ]).then(([dbData, entData, mapData]) => {
      if (mounted) {
        setDatabases(dbData);
        setEntities(entData);
        setMappings(mapData);

        // Sync initial selection
        const initialTargetDb = selectedTargetDb || 'prod_db_01';
        const initialTargetTable = selectedTargetTable || 'vehicles';
        setActiveDb(initialTargetDb);
        setActiveTable(initialTargetTable);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const sourceDbs = useMemo(() => databases.filter(d => d.environment === 'Source'), [databases]);
  const targetDbs = useMemo(() => databases.filter(d => d.environment === 'Target'), [databases]);

  // Handle Mode Switch (TO-BE Target DB vs AS-IS Source DB)
  const handleModeSwitch = (mode: 'TO_BE' | 'AS_IS') => {
    setInspectMode(mode);
    if (mode === 'TO_BE') {
      const db = 'prod_db_01';
      const tbl = 'vehicles';
      setActiveDb(db);
      setActiveTable(tbl);
      setSelectedTargetDb(db);
      setSelectedTargetTable(tbl);
    } else {
      const db = 'legacy_db_01';
      const tbl = 'LEGACY_VHCLS';
      setActiveDb(db);
      setActiveTable(tbl);
      setSelectedSourceDb(db);
      setSelectedSourceTable(tbl);
    }
  };

  const handleDbChange = (dbId: string) => {
    setActiveDb(dbId);
    if (inspectMode === 'TO_BE') {
      setSelectedTargetDb(dbId);
      const validTables = entities.filter(e => e.targetDatabase === dbId);
      if (validTables.length > 0) {
        const firstTbl = validTables[0].id;
        setActiveTable(firstTbl);
        setSelectedTargetTable(firstTbl);
      }
    } else {
      setSelectedSourceDb(dbId);
      if (dbId === 'legacy_db_01') {
        setActiveTable('LEGACY_VHCLS');
        setSelectedSourceTable('LEGACY_VHCLS');
      } else {
        setActiveTable('LEGACY_MCS_PROC');
        setSelectedSourceTable('LEGACY_MCS_PROC');
      }
    }
  };

  const handleTableChange = (tableId: string) => {
    setActiveTable(tableId);
    if (inspectMode === 'TO_BE') {
      setSelectedTargetTable(tableId);
      setSelectedEntityId(tableId);
    } else {
      setSelectedSourceTable(tableId);
    }
  };

  // Dynamic Mapping Definition Resolver with Row Count Info
  const currentMapping = useMemo<TableMappingDefinition & { sourceRows: number; expectedRows: number; failedRows: number }>(() => {
    let match = mappings.find(m => 
      m.targetTables.includes(activeTable) || 
      m.sourceTables.includes(activeTable) ||
      m.id === `map-${activeTable}`
    );

    const ent = entities.find(e => e.id === activeTable || `LEGACY_${e.id.toUpperCase()}` === activeTable);
    const sourceRows = ent?.sourceCount || (activeTable === 'vehicles' ? 3500 : activeTable.includes('proc') ? 1648344 : 767);
    const expectedRows = ent?.prodCount || (activeTable === 'vehicles' ? 3418 : activeTable.includes('proc') ? 1126466 : 767);
    const failedRows = ent?.failedCount || (activeTable === 'vehicles' ? 82 : activeTable.includes('proc') ? 150610 : 0);

    if (match) {
      return {
        ...match,
        sourceRows,
        expectedRows,
        failedRows
      };
    }

    const targetDb = ent?.targetDatabase || (activeDb.startsWith('prod') ? activeDb : 'prod_db_01');
    const sourceDb = ent?.sourceDatabase || (activeDb.startsWith('legacy') ? activeDb : 'legacy_db_01');
    const tableName = ent?.name || activeTable;
    const targetTableName = ent?.id || activeTable;
    const sourceTableName = `LEGACY_${targetTableName.toUpperCase()}`;

    return {
      id: `map-${targetTableName}`,
      mappingType: ent?.mappingType || 'SINGLE',
      sourceDatabases: [sourceDb],
      sourceTables: [sourceTableName],
      targetDatabases: [targetDb],
      targetTables: [targetTableName],
      title: `${tableName} Ingestion Mapping`,
      description: `Direct schema transformation and field mapping rules from AS-IS (${sourceDb}) to TO-BE (${targetDb}).`,
      status: ent?.status || 'Healthy',
      notes: 'Direct field mapping rule set.',
      sourceRows,
      expectedRows,
      failedRows,
      columnMappings: [
        { 
          id: 'cm-d1', 
          sourceDb, 
          sourceTable: sourceTableName, 
          sourceColumn: 'ID', 
          sourceDataType: 'VARCHAR(50)', 
          transformationType: 'DIRECT', 
          transformationRule: 'Primary identity column mapping', 
          targetDb, 
          targetTable: targetTableName, 
          targetColumn: `${targetTableName.replace(/s$/, '')}_id`, 
          targetDataType: 'VARCHAR(20)', 
          sampleBefore: '1001', 
          sampleAfter: '1001', 
          status: 'Mapped' 
        },
        { 
          id: 'cm-d2', 
          sourceDb, 
          sourceTable: sourceTableName, 
          sourceColumn: 'TITLE', 
          sourceDataType: 'VARCHAR(150)', 
          transformationType: 'NORMALIZE', 
          transformationRule: 'Trim whitespace & strip special characters', 
          targetDb, 
          targetTable: targetTableName, 
          targetColumn: 'name', 
          targetDataType: 'VARCHAR(150)', 
          sampleBefore: ' Sample Title ', 
          sampleAfter: 'Sample Title', 
          status: 'Mapped' 
        },
        { 
          id: 'cm-d3', 
          sourceDb, 
          sourceTable: sourceTableName, 
          sourceColumn: 'STATUS_CD', 
          sourceDataType: 'VARCHAR(20)', 
          transformationType: 'RENAME', 
          transformationRule: 'Rename column to status', 
          targetDb, 
          targetTable: targetTableName, 
          targetColumn: 'status', 
          targetDataType: 'VARCHAR(20)', 
          sampleBefore: 'ACTIVE', 
          sampleAfter: 'ACTIVE', 
          status: 'Mapped' 
        },
        { 
          id: 'cm-d4', 
          sourceDb, 
          sourceTable: sourceTableName, 
          sourceColumn: 'UPDATED_AT', 
          sourceDataType: 'TIMESTAMP', 
          transformationType: 'CAST', 
          transformationRule: 'Cast timestamp format', 
          targetDb, 
          targetTable: targetTableName, 
          targetColumn: 'created_at', 
          targetDataType: 'TIMESTAMPTZ', 
          sampleBefore: '2026-09-24 10:00:00', 
          sampleAfter: '2026-09-24T10:00:00Z', 
          status: 'Mapped' 
        }
      ]
    };
  }, [mappings, entities, activeTable, activeDb, inspectMode]);

  if (loading || !currentMapping) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-4 animate-pulse font-sans">
        <div className="h-20 bg-slate-100 rounded-2xl" />
        <div className="h-64 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  const reconciliationPct = currentMapping.sourceRows > 0 ? ((currentMapping.expectedRows / currentMapping.sourceRows) * 100).toFixed(1) : '100.0';

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 font-sans">
      
      {/* 1. SELECTION CONTROLS & ROW INFO HEADER */}
      <div className="bg-surface border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-brand" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">MAPPING SCOPE:</span>
          </div>

          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              onClick={() => handleModeSwitch('TO_BE')}
              className={`px-3.5 py-1 rounded-md transition-all cursor-pointer ${
                inspectMode === 'TO_BE' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              TO-BE Target State
            </button>
            <button
              onClick={() => handleModeSwitch('AS_IS')}
              className={`px-3.5 py-1 rounded-md transition-all cursor-pointer ${
                inspectMode === 'AS_IS' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AS-IS Legacy State
            </button>
          </div>
        </div>

        {/* Database & Table Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {inspectMode === 'TO_BE' ? 'TO-BE Target Database' : 'AS-IS Legacy Database'}
            </label>
            <select
              value={activeDb}
              onChange={(e) => handleDbChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 outline-none cursor-pointer"
            >
              {inspectMode === 'TO_BE'
                ? targetDbs.map(db => <option key={db.id} value={db.id}>{db.id}</option>)
                : sourceDbs.map(db => <option key={db.id} value={db.id}>{db.id}</option>)
              }
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {inspectMode === 'TO_BE' ? 'TO-BE Target Table' : 'AS-IS Source Table'}
            </label>
            <select
              value={activeTable}
              onChange={(e) => handleTableChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-brand outline-none cursor-pointer"
            >
              {inspectMode === 'TO_BE'
                ? entities.filter(e => e.targetDatabase === activeDb).map(ent => (
                    <option key={ent.id} value={ent.id}>{ent.name} ({ent.id})</option>
                  ))
                : (activeDb === 'legacy_db_01' 
                    ? [<option key="1" value="LEGACY_VHCLS">LEGACY_VHCLS</option>, <option key="2" value="LEGACY_PCS_HDR">LEGACY_PCS_HDR</option>, <option key="3" value="LEGACY_PCS_SYS">LEGACY_PCS_SYS</option>, <option key="4" value="LEGACY_MAKES">LEGACY_MAKES</option>]
                    : [<option key="5" value="LEGACY_MCS_PROC">LEGACY_MCS_PROC</option>]
                  )
              }
            </select>
          </div>

        </div>

        {/* ROW COUNT & RECONCILIATION SUMMARY BAR */}
        <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between text-xs font-bold gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase">AS-IS Source Rows:</span>
            <span className="text-slate-900 font-mono font-black bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {currentMapping.sourceRows.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase">Reconciliation:</span>
            <span className="text-emerald-700 font-mono font-black bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {reconciliationPct}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase">TO-BE Expected Rows:</span>
            <span className="text-brand font-mono font-black bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
              {currentMapping.expectedRows.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase">Failed / Blocked:</span>
            <span className={`font-mono font-black px-2 py-0.5 rounded border ${
              currentMapping.failedRows > 0 ? 'text-red-700 bg-red-50 border-red-200' : 'text-slate-500 bg-slate-100 border-slate-200'
            }`}>
              {currentMapping.failedRows.toLocaleString()}
            </span>
          </div>
        </div>

      </div>

      {/* 2. EXPLICIT "AS-IS -> TRANSFORMATION -> TO-BE" VISUAL FLOW DIAGRAM WITH ROW INFO */}

      {/* MERGE PATTERN (2 AS-IS SOURCE TABLES -> 1 TO-BE TARGET TABLE) */}
      {currentMapping.mappingType === 'MERGE' && (
        <div className="bg-purple-50/50 border border-purple-200/80 rounded-2xl p-6 shadow-sm space-y-6 font-mono">
          <div className="flex items-center justify-between border-b border-purple-200/60 pb-3">
            <span className="text-xs font-extrabold uppercase text-purple-950 tracking-wider flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-purple-700" />
              <span>AS-IS ➔ TRANSFORMATION ➔ TO-BE (TABLE MERGE FLOW)</span>
            </span>
            <span className="text-[10px] font-bold text-purple-800 bg-purple-100 border border-purple-300 px-2 py-0.5 rounded">
              Merge 2 → 1
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            
            {/* Left: AS-IS STATE (2 Source Tables with Source Rows) */}
            <div className="space-y-4 flex flex-col justify-center">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">
                AS-IS STATE (SRC ROWS: {currentMapping.sourceRows.toLocaleString()})
              </div>
              
              <div className="bg-surface border-2 border-purple-300 rounded-xl p-3.5 shadow-sm space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase">AS-IS TABLE 1</span>
                  <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">{currentMapping.sourceDatabases[0]}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black text-slate-900">{currentMapping.sourceTables[0]}</div>
                  <span className="text-[10px] font-bold text-purple-700 font-mono bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded">
                    {currentMapping.sourceRows.toLocaleString()} rows
                  </span>
                </div>
                
                <div className="space-y-1 text-[11px] pt-1">
                  <div className="p-1 bg-purple-50 border border-purple-200 rounded flex justify-between font-bold text-purple-900">
                    <span>PCS_CD</span> <span className="text-[9px] text-purple-700">JOIN KEY</span>
                  </div>
                  <div className="p-1 bg-slate-50 rounded flex justify-between text-slate-700">
                    <span>PCS_DESC</span> <span className="text-[9px] text-slate-400">VARCHAR(250)</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface border-2 border-purple-300 rounded-xl p-3.5 shadow-sm space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase">AS-IS TABLE 2</span>
                  <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">{currentMapping.sourceDatabases[0]}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black text-slate-900">{currentMapping.sourceTables[1] || 'LEGACY_PCS_SYS'}</div>
                  <span className="text-[10px] font-bold text-purple-700 font-mono bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded">
                    {currentMapping.sourceRows.toLocaleString()} rows
                  </span>
                </div>
                
                <div className="space-y-1 text-[11px] pt-1">
                  <div className="p-1 bg-purple-50 border border-purple-200 rounded flex justify-between font-bold text-purple-900">
                    <span>SYS_CD</span> <span className="text-[9px] text-purple-700">JOIN KEY</span>
                  </div>
                  <div className="p-1 bg-slate-50 rounded flex justify-between text-slate-700">
                    <span>SYS_STATUS</span> <span className="text-[9px] text-slate-400">VARCHAR(20)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Center: TRANSFORMATION RULES */}
            <div className="flex flex-col items-center justify-center p-4 bg-purple-100/70 border-2 border-purple-300 rounded-xl space-y-3 text-center shadow-xs">
              <span className="text-[10px] font-extrabold text-purple-900 uppercase tracking-widest">
                TRANSFORMATION
              </span>
              <GitMerge className="w-8 h-8 text-purple-700" />
              <div className="text-xs font-black text-purple-950 uppercase">MERGE JOIN OPERATOR</div>
              <div className="text-[11px] font-bold text-purple-900 bg-surface border border-purple-200 px-2.5 py-1 rounded">
                ON PCS_CD = SYS_CD
              </div>
              <div className="text-[10px] text-purple-900 font-bold bg-purple-200/60 px-2 py-0.5 rounded">
                {currentMapping.sourceRows.toLocaleString()} Src ➔ {currentMapping.expectedRows.toLocaleString()} Expected Tgt
              </div>
            </div>

            {/* Right: TO-BE STATE (Target Expected Rows) */}
            <div className="space-y-4 flex flex-col justify-center">
              <div className="text-[10px] font-extrabold text-purple-700 uppercase tracking-widest text-center">
                TO-BE STATE (EXPECTED: {currentMapping.expectedRows.toLocaleString()})
              </div>

              <div className="bg-surface border-2 border-purple-500 rounded-xl p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                  <span className="text-[9px] font-extrabold text-purple-700 uppercase">TO-BE CONSOLIDATED TABLE</span>
                  <span className="text-[9px] font-bold text-purple-900 bg-purple-100 px-1.5 py-0.2 rounded">{currentMapping.targetDatabases[0]}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-black text-purple-950">{currentMapping.targetTables[0]}</div>
                  <span className="text-[10px] font-bold text-emerald-700 font-mono bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                    {currentMapping.expectedRows.toLocaleString()} rows
                  </span>
                </div>

                <div className="space-y-1 text-[11px] pt-1">
                  <div className="p-1.5 bg-purple-50 border border-purple-200 rounded flex justify-between font-bold text-purple-900">
                    <span>pcs_id</span> <span className="text-[9px] text-purple-700">PRIMARY KEY</span>
                  </div>
                  <div className="p-1.5 bg-purple-50 border border-purple-200 rounded flex justify-between font-bold text-purple-900">
                    <span>system_id</span> <span className="text-[9px] text-purple-700">MERGED ATTR</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SPLIT PATTERN (1 AS-IS SOURCE TABLE -> 2 TO-BE TARGET TABLES) */}
      {currentMapping.mappingType === 'SPLIT' && (
        <div className="bg-blue-50/50 border border-blue-200/80 rounded-2xl p-6 shadow-sm space-y-6 font-mono">
          <div className="flex items-center justify-between border-b border-blue-200/60 pb-3">
            <span className="text-xs font-extrabold uppercase text-blue-950 tracking-wider flex items-center gap-2">
              <GitFork className="w-4 h-4 text-blue-700" />
              <span>AS-IS ➔ TRANSFORMATION ➔ TO-BE (TABLE SPLIT FLOW)</span>
            </span>
            <span className="text-[10px] font-bold text-blue-800 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded">
              Split Ratio: 1 → 2
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            
            {/* Left: AS-IS STATE (Source Rows) */}
            <div className="space-y-4 flex flex-col justify-center">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">
                AS-IS STATE (SRC ROWS: {currentMapping.sourceRows.toLocaleString()})
              </div>

              <div className="bg-surface border-2 border-blue-300 rounded-xl p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase">AS-IS MONOLITHIC TABLE</span>
                  <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">{currentMapping.sourceDatabases[0]}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-black text-slate-900">{currentMapping.sourceTables[0]}</div>
                  <span className="text-[10px] font-bold text-blue-700 font-mono bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                    {currentMapping.sourceRows.toLocaleString()} rows
                  </span>
                </div>

                <div className="space-y-1 text-[11px] pt-1">
                  <div className="p-1 bg-slate-50 rounded flex justify-between text-slate-800 font-bold">
                    <span>VHC_ID</span> <span className="text-[9px] text-slate-400">VARCHAR(50)</span>
                  </div>
                  <div className="p-1 bg-blue-50 border border-blue-200 rounded flex justify-between font-bold text-blue-900">
                    <span>FULL_SPEC</span> <span className="text-[9px] text-blue-700">JSON PAYLOAD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center: TRANSFORMATION RULES */}
            <div className="flex flex-col items-center justify-center p-4 bg-blue-100/70 border-2 border-blue-300 rounded-xl space-y-3 text-center shadow-xs">
              <span className="text-[10px] font-extrabold text-blue-900 uppercase tracking-widest">
                TRANSFORMATION
              </span>
              <GitFork className="w-8 h-8 text-blue-700" />
              <div className="text-xs font-black text-blue-950 uppercase">SPLIT DECOMPOSITION</div>
              <div className="text-[10px] text-blue-900 font-bold bg-blue-200/60 px-2 py-0.5 rounded">
                {currentMapping.sourceRows.toLocaleString()} Src ➔ {currentMapping.expectedRows.toLocaleString()} Expected ({currentMapping.failedRows} Diff)
              </div>
            </div>

            {/* Right: TO-BE STATE (Expected Target Rows) */}
            <div className="space-y-4 flex flex-col justify-center">
              <div className="text-[10px] font-extrabold text-blue-700 uppercase tracking-widest text-center">
                TO-BE STATE (EXPECTED: {currentMapping.expectedRows.toLocaleString()})
              </div>
              
              <div className="bg-surface border-2 border-blue-400 rounded-xl p-3.5 shadow-sm space-y-1">
                <div className="flex items-center justify-between border-b border-blue-100 pb-1">
                  <span className="text-[9px] font-extrabold text-blue-700 uppercase">TO-BE TABLE 1</span>
                  <span className="text-[9px] font-bold text-blue-900 bg-blue-100 px-1.5 py-0.2 rounded">{currentMapping.targetDatabases[0]}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black text-blue-950">{currentMapping.targetTables[0]}</div>
                  <span className="text-[10px] font-bold text-emerald-700 font-mono bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                    {currentMapping.expectedRows.toLocaleString()} rows
                  </span>
                </div>
              </div>

              <div className="bg-surface border-2 border-blue-400 rounded-xl p-3.5 shadow-sm space-y-1">
                <div className="flex items-center justify-between border-b border-blue-100 pb-1">
                  <span className="text-[9px] font-extrabold text-blue-700 uppercase">TO-BE TABLE 2</span>
                  <span className="text-[9px] font-bold text-blue-900 bg-blue-100 px-1.5 py-0.2 rounded">{currentMapping.targetDatabases[0]}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black text-blue-950">{currentMapping.targetTables[1] || 'vehicle_specifications'}</div>
                  <span className="text-[10px] font-bold text-emerald-700 font-mono bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                    {currentMapping.expectedRows.toLocaleString()} rows
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* SINGLE PATTERN (1 AS-IS SOURCE TABLE -> 1 TO-BE TARGET TABLE) */}
      {currentMapping.mappingType === 'SINGLE' && (
        <div className="bg-surface border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6 font-mono">
          <div className="text-xs font-extrabold uppercase text-slate-400 tracking-wider text-center border-b border-slate-100 pb-3">
            AS-IS ➔ TRANSFORMATION ➔ TO-BE (DIRECT 1-TO-1 MAPPING FLOW)
          </div>

          <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
            
            {/* AS-IS */}
            <div className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-xl p-4 text-center space-y-1 shadow-xs">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">AS-IS STATE</span>
              <div className="text-sm font-black text-slate-900">{currentMapping.sourceTables[0]}</div>
              <div className="text-[10px] text-slate-700 font-bold bg-slate-200 px-2 py-0.5 rounded inline-block mt-1">
                {currentMapping.sourceRows.toLocaleString()} Src Rows
              </div>
            </div>

            {/* TRANSFORMATION */}
            <div className="flex flex-col items-center gap-1 shrink-0 px-2">
              <span className="text-[10px] font-bold text-brand bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">
                TRANSFORM
              </span>
              <ArrowRight className="w-5 h-5 text-brand" />
            </div>

            {/* TO-BE */}
            <div className="flex-1 bg-brand-50/50 border-2 border-brand-300 rounded-xl p-4 text-center space-y-1 shadow-xs">
              <span className="text-[9px] font-extrabold text-brand uppercase tracking-widest block">TO-BE STATE</span>
              <div className="text-sm font-black text-brand-950">{currentMapping.targetTables[0]}</div>
              <div className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded inline-block mt-1">
                {currentMapping.expectedRows.toLocaleString()} Expected Rows
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. FIELD-LEVEL "AS-IS FIELD" -> "TRANSFORMATION" -> "TO-BE FIELD" COMPARISON GRID */}
      <div className="bg-surface border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between font-mono text-xs font-extrabold uppercase text-slate-400 tracking-wider">
          <span>AS-IS FIELD (SOURCE)</span>
          <span>TRANSFORMATION RULE</span>
          <span>TO-BE FIELD (TARGET)</span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {currentMapping.columnMappings.map((col) => (
            <div key={col.id} className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* AS-IS Field */}
              <div className="space-y-0.5 md:w-1/3">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase block font-sans">AS-IS</span>
                <div className="font-bold text-slate-900">
                  <span className="text-slate-400 font-normal">{col.sourceTable}.</span>{col.sourceColumn}
                </div>
                <div className="text-[10px] text-slate-400">{col.sourceDataType || 'VARCHAR'}</div>
              </div>

              {/* Transformation Rule */}
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-1 bg-surface border border-slate-200/60 p-2 rounded-lg">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border
                  ${col.transformationType === 'DIRECT' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                    col.transformationType === 'MERGE_KEY' ? 'bg-purple-100 text-purple-900 border-purple-300' :
                    col.transformationType === 'SPLIT' ? 'bg-blue-100 text-blue-900 border-blue-300' :
                    'bg-amber-50 text-amber-800 border-amber-200'}`}
                >
                  {col.transformationType}
                </span>
                <div className="text-[11px] font-sans font-medium text-slate-600">
                  {col.transformationRule}
                </div>
                {col.sampleBefore && col.sampleAfter && (
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono pt-0.5">
                    <span className="bg-slate-100 px-1 py-0.2 rounded text-slate-600">AS-IS: {col.sampleBefore}</span>
                    <span>→</span>
                    <span className="bg-brand-50 text-brand px-1 py-0.2 rounded font-bold">TO-BE: {col.sampleAfter}</span>
                  </div>
                )}
              </div>

              {/* TO-BE Field */}
              <div className="space-y-0.5 md:w-1/3 md:text-right">
                <span className="text-[9px] font-extrabold text-brand uppercase block font-sans">TO-BE</span>
                <div className="font-bold text-brand">
                  <span className="text-brand-300 font-normal">{col.targetTable}.</span>{col.targetColumn}
                </div>
                <div className="text-[10px] text-slate-400">{col.targetDataType || 'VARCHAR'}</div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
