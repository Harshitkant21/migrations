// src/pages/TableDetails.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { mockApi } from '../data/mockApi';
import { useGlobalStore } from '../state/useGlobalStore';
import { 
  TableDetailsMetadata, 
  EntityMetadata, 
  DatabaseInfo 
} from '../types/models';
import { 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Database
} from 'lucide-react';

export const TableDetails: React.FC = () => {
  const { 
    selectedTargetTable, 
    setSelectedTargetTable,
    selectedTargetDb,
    setSelectedTargetDb,
    setSelectedEntityId,
    setActivePage
  } = useGlobalStore();

  const [entities, setEntities] = useState<EntityMetadata[]>([]);
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const [tableDetails, setTableDetails] = useState<TableDetailsMetadata | null>(null);
  const [targetDbFilter, setTargetDbFilter] = useState<string>(selectedTargetDb || 'production_db_01');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      mockApi.getEntities('PROD'),
      mockApi.getDatabases()
    ]).then(([entData, dbData]) => {
      if (mounted) {
        setEntities(entData);
        setDatabases(dbData);
        
        // Find default table for target DB if active table doesn't belong to it
        const currentTargetDb = selectedTargetDb || 'production_db_01';
        setTargetDbFilter(currentTargetDb);
        const validTables = entData.filter(e => e.targetDatabase === currentTargetDb);
        const activeTable = validTables.find(e => e.id === selectedTargetTable) || validTables[0] || entData[0];
        
        mockApi.getTableDetails(activeTable.id).then(details => {
          if (mounted) {
            setTableDetails(details);
            setLoading(false);
          }
        });
      }
    });
    return () => { mounted = false; };
  }, [selectedTargetTable, selectedTargetDb]);

  const targetDbs = useMemo(() => databases.filter(d => d.environment === 'Target'), [databases]);

  // Tables belonging strictly to active Target DB
  const filteredTables = useMemo(() => {
    return entities.filter(e => e.targetDatabase === targetDbFilter);
  }, [entities, targetDbFilter]);

  const handleTargetDbSwitch = async (dbId: string) => {
    setTargetDbFilter(dbId);
    setSelectedTargetDb(dbId);
    const validTables = entities.filter(e => e.targetDatabase === dbId);
    if (validTables.length > 0) {
      const firstTableId = validTables[0].id;
      setSelectedTargetTable(firstTableId);
      setSelectedEntityId(firstTableId);
      setLoading(true);
      const details = await mockApi.getTableDetails(firstTableId);
      setTableDetails(details);
      setLoading(false);
    }
  };

  const handleTableChange = async (tableId: string) => {
    setSelectedTargetTable(tableId);
    setSelectedEntityId(tableId);
    setLoading(true);
    const details = await mockApi.getTableDetails(tableId);
    setTableDetails(details);
    setLoading(false);
  };

  if (loading || !tableDetails) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-4 animate-pulse font-sans">
        <div className="h-28 bg-slate-100 rounded-2xl" />
        <div className="h-64 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 font-sans">
      
      {/* 1. TARGET DATABASE SCOPE SELECTOR */}
      <div className="bg-surface border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-brand" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Target Database Scope:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {targetDbs.map(db => (
            <button
              key={db.id}
              onClick={() => handleTargetDbSwitch(db.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                targetDbFilter === db.id ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {db.id} ({entities.filter(e => e.targetDatabase === db.id).length} Tables)
            </button>
          ))}
        </div>
      </div>

      {/* 2. TABLE PROFILE HEADER */}
      <div className="bg-surface border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        
        {/* Top Controls & Selectors */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-4 font-mono">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              TABLE PROFILE
            </span>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
              {tableDetails.databaseName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Table:</span>
            <select
              value={tableDetails.id}
              onChange={(e) => handleTableChange(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-900 outline-none cursor-pointer"
            >
              {filteredTables.map(ent => <option key={ent.id} value={ent.id}>{ent.name}</option>)}
            </select>

            <button
              onClick={() => setActivePage('mapping')}
              className="px-3 py-1 bg-brand hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <span>View Mapping</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title & Compact Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 font-mono">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {tableDetails.tableName}
              </h1>
              
              {/* Status Badge */}
              {tableDetails.migrationStatus === 'Healthy' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ✓ Migrated
                </span>
              )}
              {tableDetails.migrationStatus === 'Warning' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> ◐ In Progress
                </span>
              )}
              {tableDetails.migrationStatus === 'Critical' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" /> ! Failed
                </span>
              )}
            </div>
          </div>

          {/* Compact Stats Row */}
          <div className="flex items-center gap-4 text-xs font-mono font-bold text-slate-700">
            <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg">
              {tableDetails.recordCount.toLocaleString()} rows
            </span>
            <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg">
              {tableDetails.columns.length} columns
            </span>
            <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg">
              {tableDetails.foreignKeys.length} relationships
            </span>
          </div>
        </div>

      </div>

      {/* 3. SOURCE -> TARGET MIGRATION CONTEXT */}
      <div className="bg-surface border border-slate-200/80 rounded-2xl p-4 shadow-sm font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">MIGRATED FROM:</span>
        <div className="flex items-center gap-2 font-bold">
          <span className="text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
            {tableDetails.sourceTables.join(' + ')}
          </span>
          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-brand bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-md">
            {targetDbFilter}.{tableDetails.tableName}
          </span>
        </div>
      </div>

      {/* 4. SCHEMA COLUMNS TABLE */}
      <div className="bg-surface border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm space-y-3 p-5">
        <div className="text-xs font-extrabold uppercase text-slate-400 font-mono tracking-wider">
          COLUMNS SCHEMA ({tableDetails.columns.length})
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200/80 text-left">
            <thead className="bg-slate-50 text-[10px] font-extrabold font-mono uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="px-4 py-3">Column Name</th>
                <th className="px-4 py-3">Data Type</th>
                <th className="px-4 py-3">Length</th>
                <th className="px-4 py-3 text-center">Key</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-mono font-medium text-slate-700">
              {tableDetails.columns.map((col, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80">
                  
                  <td className="px-4 py-2.5 font-bold text-slate-900">
                    {col.name}
                  </td>

                  <td className="px-4 py-2.5 text-slate-700 font-semibold">
                    {col.dataType}
                  </td>

                  <td className="px-4 py-2.5 text-slate-400">
                    {col.length || '—'}
                  </td>

                  <td className="px-4 py-2.5 text-center">
                    {col.isPrimaryKey && (
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded text-[10px] font-bold">PK</span>
                    )}
                    {col.isForeignKey && (
                      <span className="bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded text-[10px] font-bold">FK</span>
                    )}
                    {!col.isPrimaryKey && !col.isForeignKey && <span className="text-slate-300">—</span>}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. RELATIONSHIPS & DEPENDENCIES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-surface border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3 font-mono">
          <div className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
            RELATIONSHIPS
          </div>

          <div className="space-y-2 text-xs">
            {tableDetails.foreignKeys.length > 0 ? (
              tableDetails.foreignKeys.map((fk, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="font-bold text-slate-800">{fk.column}</span>
                  <span className="text-slate-500 font-semibold">→ {fk.referencedTable}.{fk.referencedColumn}</span>
                </div>
              ))
            ) : (
              <div className="text-slate-400 text-xs py-2">No foreign key relationships.</div>
            )}
          </div>
        </div>

        <div className="bg-surface border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 font-mono">
          <div className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
            DEPENDENCIES
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">DEPENDS ON:</span>
              <div className="flex flex-wrap gap-1.5">
                {tableDetails.dependsOn.length > 0 ? (
                  tableDetails.dependsOn.map((dep, idx) => (
                    <span key={idx} onClick={() => handleTableChange(dep)} className="bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-1 rounded text-slate-800 font-bold cursor-pointer">
                      {dep}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400">None</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">USED BY:</span>
              <div className="flex flex-wrap gap-1.5">
                {tableDetails.usedBy.length > 0 ? (
                  tableDetails.usedBy.map((dep, idx) => (
                    <span key={idx} onClick={() => handleTableChange(dep)} className="bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-1 rounded text-slate-800 font-bold cursor-pointer">
                      {dep}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400">None</span>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
