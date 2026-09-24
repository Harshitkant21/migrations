// src/pages/MigrationStatus.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { mockApi } from '../data/mockApi';
import { useGlobalStore } from '../state/useGlobalStore';
import { EntityMetadata, DatabaseInfo } from '../types/models';
import { 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  GitCompare, 
  TableProperties,
  Database
} from 'lucide-react';

export const MigrationStatus: React.FC = () => {
  const { 
    environment, 
    setActivePage, 
    setSelectedTargetTable,
    setSelectedSourceDb,
    setSelectedTargetDb,
    setSelectedEntityId
  } = useGlobalStore();

  const [entities, setEntities] = useState<EntityMetadata[]>([]);
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [targetDbFilter, setTargetDbFilter] = useState<string>('ALL');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      mockApi.getEntities(environment),
      mockApi.getDatabases()
    ]).then(([entData, dbData]) => {
      if (mounted) {
        setEntities(entData);
        setDatabases(dbData);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [environment]);

  const targetDbs = useMemo(() => databases.filter(d => d.environment === 'Target'), [databases]);

  const filteredEntities = useMemo(() => {
    let result = [...entities];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e => 
        e.name.toLowerCase().includes(q) || 
        e.id.toLowerCase().includes(q) ||
        e.sourceDatabase.toLowerCase().includes(q) ||
        e.targetDatabase.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(e => e.status === statusFilter);
    }

    if (targetDbFilter !== 'ALL') {
      result = result.filter(e => e.targetDatabase === targetDbFilter);
    }

    return result;
  }, [entities, search, statusFilter, targetDbFilter]);

  const handleOpenMapping = (tableId: string, sourceDb: string, targetDb: string) => {
    setSelectedTargetTable(tableId);
    setSelectedSourceDb(sourceDb);
    setSelectedTargetDb(targetDb);
    setSelectedEntityId(tableId);
    setActivePage('mapping');
  };

  const handleOpenDetails = (tableId: string, targetDb: string) => {
    setSelectedTargetTable(tableId);
    setSelectedTargetDb(targetDb);
    setSelectedEntityId(tableId);
    setActivePage('details');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 font-sans">
      
      {/* Target DB Scope Filter Tabs */}
      <div className="bg-surface border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-brand" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Target Database Scope:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setTargetDbFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              targetDbFilter === 'ALL' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            All Target DBs ({entities.length})
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

      {/* Header & Minimal Filters */}
      <div className="bg-surface border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Migration Status Directory
            </h1>
            <p className="text-xs text-slate-500 font-medium font-sans mt-0.5">
              Showing tables partitioned for <strong className="text-slate-900 font-mono">{targetDbFilter === 'ALL' ? 'All Production Databases' : targetDbFilter}</strong>
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              ✓ {filteredEntities.filter(e => e.status === 'Healthy').length} Migrated
            </span>
            <span className="text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
              ! {filteredEntities.filter(e => e.status === 'Critical').length} Failed
            </span>
          </div>
        </div>

        {/* 2 Simple Controls: Search & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 font-mono">
          
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search table name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-8 pr-3 text-xs outline-none focus:border-brand font-medium"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-bold outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Healthy">✓ Migrated</option>
            <option value="Warning">◐ In Progress / Warning</option>
            <option value="Critical">! Failed</option>
            <option value="Pending">○ Pending</option>
          </select>

        </div>
      </div>

      {/* Primary Table */}
      <div className="bg-surface border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200/80 text-left">
            <thead className="bg-slate-50 text-[10px] font-extrabold font-mono uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Source Table</th>
                <th className="px-5 py-3.5">Target Database & Table</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Progress</th>
                <th className="px-5 py-3.5 text-right">Records</th>
                <th className="px-5 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    Loading directory...
                  </td>
                </tr>
              ) : filteredEntities.length > 0 ? (
                filteredEntities.map((ent) => {
                  const sourceTableName = `LEGACY_${ent.id.toUpperCase()}`;
                  return (
                    <tr key={ent.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Source Table */}
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{sourceTableName}</div>
                        <div className="text-[10px] text-slate-400">{ent.sourceDatabase}</div>
                      </td>

                      {/* Target Table & DB */}
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-brand">{ent.name}</div>
                        <div className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded inline-block mt-0.5">
                          {ent.targetDatabase}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 text-center font-bold">
                        {ent.status === 'Healthy' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs text-emerald-700 bg-emerald-50 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ✓ Migrated
                          </span>
                        )}
                        {ent.status === 'Warning' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs text-amber-700 bg-amber-50 border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            ◐ In Progress
                          </span>
                        )}
                        {ent.status === 'Critical' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs text-red-700 bg-red-50 border border-red-200">
                            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                            ! Failed
                          </span>
                        )}
                        {ent.status === 'Pending' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs text-slate-600 bg-slate-100 border border-slate-200">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            ○ Pending
                          </span>
                        )}
                      </td>

                      {/* Progress Bar & % */}
                      <td className="px-5 py-3.5 text-right font-bold">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full ${ent.status === 'Healthy' ? 'bg-emerald-500' : ent.status === 'Warning' ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${ent.migrationPct}%` }}
                            />
                          </div>
                          <span>{ent.migrationPct.toFixed(1)}%</span>
                        </div>
                      </td>

                      {/* Records */}
                      <td className="px-5 py-3.5 text-right text-[11px]">
                        <span className="text-slate-500">{ent.sourceCount.toLocaleString()}</span> / <strong className="text-slate-900">{ent.prodCount.toLocaleString()}</strong>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenMapping(ent.id, ent.sourceDatabase, ent.targetDatabase)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <GitCompare className="w-3 h-3 text-brand" />
                            <span>Mapping</span>
                          </button>
                          <button
                            onClick={() => handleOpenDetails(ent.id, ent.targetDatabase)}
                            className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <TableProperties className="w-3 h-3" />
                            <span>Details</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No tables match target DB selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
