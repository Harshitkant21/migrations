// src/pages/Overview.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { mockApi } from '../data/mockApi';
import { useGlobalStore } from '../state/useGlobalStore';
import { EntityMetadata, DatabaseInfo } from '../types/models';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  Database
} from 'lucide-react';

export const Overview: React.FC = () => {
  const { 
    environment, 
    setActivePage, 
    setSelectedTargetTable,
    setSelectedTargetDb,
    setSelectedEntityId
  } = useGlobalStore();

  const [entities, setEntities] = useState<EntityMetadata[]>([]);
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const [targetDbFilter, setTargetDbFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([
      mockApi.getEntities(environment),
      mockApi.getDatabases()
    ]).then(([entData, dbData]) => {
      if (isMounted) {
        setEntities(entData);
        setDatabases(dbData);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [environment]);

  const targetDbs = useMemo(() => databases.filter(d => d.environment === 'Target'), [databases]);

  const filteredEntities = useMemo(() => {
    if (targetDbFilter === 'ALL') return entities;
    return entities.filter(e => e.targetDatabase === targetDbFilter);
  }, [entities, targetDbFilter]);

  const stats = useMemo(() => {
    const totalTables = filteredEntities.length;
    const migratedTables = filteredEntities.filter(e => e.status === 'Healthy').length;
    const warningTables = filteredEntities.filter(e => e.status === 'Warning').length;
    const failedTables = filteredEntities.filter(e => e.status === 'Critical').length;
    const pendingTables = filteredEntities.filter(e => e.status === 'Pending').length;

    const totalSourceRecords = filteredEntities.reduce((acc, curr) => acc + curr.sourceCount, 0);
    const totalMigratedRecords = filteredEntities.reduce((acc, curr) => acc + curr.prodCount, 0);
    const totalFailedRecords = filteredEntities.reduce((acc, curr) => acc + curr.failedCount, 0);

    const overallPct = totalSourceRecords > 0 ? (totalMigratedRecords / totalSourceRecords) * 100 : 94.8;

    return {
      totalTables,
      migratedTables,
      warningTables,
      failedTables,
      pendingTables,
      totalSourceRecords,
      totalMigratedRecords,
      totalFailedRecords,
      overallPct
    };
  }, [filteredEntities]);

  const handleNavigateToTable = (tableId: string, page: 'mapping' | 'details' | 'status') => {
    const table = entities.find(e => e.id === tableId);
    if (table) {
      setSelectedTargetDb(table.targetDatabase);
    }
    setSelectedTargetTable(tableId);
    setSelectedEntityId(tableId);
    setActivePage(page);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-4 animate-pulse">
        <div className="h-32 bg-slate-100 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 font-sans">
      
      {/* Target Database Selection Bar */}
      <div className="bg-surface border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-brand" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Target Database Filter:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setTargetDbFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              targetDbFilter === 'ALL' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            All Target DBs (14 Tables)
          </button>
          {targetDbs.map(db => (
            <button
              key={db.id}
              onClick={() => setTargetDbFilter(db.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                targetDbFilter === db.id ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {db.id} ({entities.filter(e => e.targetDatabase === db.id).length} Tables)
            </button>
          ))}
        </div>
      </div>

      {/* 1. TOP PROGRESS HERO */}
      <div className="bg-surface border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
              MIGRATION HEALTH ({targetDbFilter === 'ALL' ? 'ALL DATABASES' : targetDbFilter})
            </span>
            <div className="text-4xl font-black font-mono text-slate-900 tracking-tight mt-0.5">
              {stats.overallPct.toFixed(1)}%
            </div>
          </div>
          <div className="text-right sm:text-right">
            <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg inline-block">
              {stats.migratedTables} / {stats.totalTables} Tables Migrated
            </span>
          </div>
        </div>

        {/* Clean Visual Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex shadow-inner">
            <div className="bg-emerald-500 h-full" style={{ width: `${stats.overallPct}%` }} title="Migrated" />
            <div className="bg-amber-400 h-full" style={{ width: `${stats.totalTables > 0 ? (stats.warningTables / stats.totalTables) * 100 : 0}%` }} title="In Progress" />
            <div className="bg-red-500 h-full" style={{ width: `${stats.totalTables > 0 ? (stats.failedTables / stats.totalTables) * 100 : 0}%` }} title="Failed" />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-0.5">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> {stats.migratedTables} Migrated</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> {stats.warningTables} In Progress</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> {stats.failedTables} Failed</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> {stats.pendingTables} Pending</span>
          </div>
        </div>
      </div>

      {/* 2. COMPACT STATISTICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        
        <div className="bg-surface border border-slate-200/80 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">TOTAL TABLES</span>
          <div className="text-2xl font-black text-slate-900">{stats.totalTables}</div>
          <div className="text-[11px] text-slate-500 font-medium font-sans">Tables in {targetDbFilter}</div>
        </div>

        <div className="bg-surface border border-slate-200/80 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">TOTAL RECORDS</span>
          <div className="text-2xl font-black text-slate-900">{(stats.totalSourceRecords / 1000000).toFixed(2)}M</div>
          <div className="text-[11px] text-slate-500 font-medium font-sans">Source dataset scope</div>
        </div>

        <div className="bg-surface border border-slate-200/80 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">MIGRATED RECORDS</span>
          <div className="text-2xl font-black text-emerald-600">{(stats.totalMigratedRecords / 1000000).toFixed(2)}M</div>
          <div className="text-[11px] text-emerald-700 font-medium font-sans">Reconciled in target</div>
        </div>

        <div className="bg-surface border border-slate-200/80 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">FAILED RECORDS</span>
          <div className="text-2xl font-black text-red-600">{(stats.totalFailedRecords / 1000).toFixed(1)}K</div>
          <div className="text-[11px] text-red-600 font-medium font-sans">Requires schema action</div>
        </div>

      </div>

      {/* 3. STATUS SUMMARY GRID */}
      <div className="bg-surface border border-slate-200/80 rounded-2xl p-5 space-y-3 font-mono">
        <div className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
          STATUS BREAKDOWN ({targetDbFilter})
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          
          <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-950">✓ Migrated</span>
            </div>
            <span className="text-base font-black text-emerald-700">{stats.migratedTables}</span>
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-950">◐ In Progress</span>
            </div>
            <span className="text-base font-black text-amber-700">{stats.warningTables}</span>
          </div>

          <div className="p-3 bg-red-50/60 border border-red-200/60 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-bold text-red-950">! Failed</span>
            </div>
            <span className="text-base font-black text-red-700">{stats.failedTables}</span>
          </div>

          <div className="p-3 bg-slate-100/60 border border-slate-200/60 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-800">○ Pending</span>
            </div>
            <span className="text-base font-black text-slate-700">{stats.pendingTables}</span>
          </div>

        </div>
      </div>

      {/* 4. NEEDS ATTENTION */}
      <div className="bg-surface border border-slate-200/80 rounded-2xl p-5 space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
            NEEDS ATTENTION (CRITICAL BLOCKERS)
          </span>
          <button 
            onClick={() => setActivePage('status')}
            className="text-xs font-bold text-brand hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Tables</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredEntities.filter(e => e.status !== 'Healthy').slice(0, 4).map(table => (
            <div key={table.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full shrink-0 ${table.status === 'Critical' ? 'bg-red-500' : 'bg-amber-400'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{table.name}</span>
                    <span className="text-[10px] text-slate-400">({table.targetDatabase})</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${table.status === 'Critical' ? 'text-red-600 bg-red-50 border border-red-200' : 'text-amber-700 bg-amber-50 border border-amber-200'}`}>
                      {table.status === 'Critical' ? '! Failed' : '◐ Warning'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                    {table.failedCount.toLocaleString()} un-reconciled rows ({table.sourceDatabase} → {table.targetDatabase})
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleNavigateToTable(table.id, 'mapping')}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-all cursor-pointer font-mono"
              >
                Fix Mapping →
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
