// src/pages/MigrationStatus.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { mockApi } from '../data/mockApi';
import { useGlobalStore } from '../state/useGlobalStore';
import { EntityMetadata, DatabaseInfo } from '../types/models';
import { Pagination } from '../components/ui/Pagination';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, targetDbFilter]);

  const paginatedEntities = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEntities.slice(start, start + pageSize);
  }, [filteredEntities, currentPage, pageSize]);

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
    <div className="space-y-4 w-full font-sans">
      
      {/* Target DB Scope Filter Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Target Database Scope:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setTargetDbFilter('ALL')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              targetDbFilter === 'ALL' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            All Target DBs ({entities.length})
          </button>
          {targetDbs.map(db => (
            <button
              key={db.id}
              onClick={() => setTargetDbFilter(db.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                targetDbFilter === db.id ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {db.id} ({entities.filter(e => e.targetDatabase === db.id).length})
            </button>
          ))}
        </div>
      </div>

      {/* Header & Minimal Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Migration Status Directory
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing tables partitioned for <strong className="text-slate-900">{targetDbFilter === 'ALL' ? 'All Production Databases' : targetDbFilter}</strong>
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-medium whitespace-nowrap">
            <span className="text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded">
              ✓ {filteredEntities.filter(e => e.status === 'Healthy').length} Migrated
            </span>
            <span className="text-red-800 bg-red-50 border border-red-200/70 px-2.5 py-0.5 rounded">
              ! {filteredEntities.filter(e => e.status === 'Critical').length} Failed
            </span>
          </div>
        </div>

        {/* 2 Simple Controls: Search & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-0.5">
          
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search table name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-xs outline-none focus:border-slate-400 font-sans"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium outline-none cursor-pointer"
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
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200/80 text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-semibold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="px-5 py-3 whitespace-nowrap">Source Table</th>
                <th className="px-5 py-3 whitespace-nowrap">Target Database & Table</th>
                <th className="px-5 py-3 text-center whitespace-nowrap">Status</th>
                <th className="px-5 py-3 text-right whitespace-nowrap">Progress</th>
                <th className="px-5 py-3 text-right whitespace-nowrap">Source Rows ➔ Target Rows</th>
                <th className="px-5 py-3 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-sans">
                    Loading directory...
                  </td>
                </tr>
              ) : paginatedEntities.length > 0 ? (
                paginatedEntities.map((ent) => {
                  const sourceTableName = `LEGACY_${ent.id.toUpperCase()}`;
                  return (
                    <tr key={ent.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Source Table */}
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 font-mono">{sourceTableName}</div>
                        <div className="text-[10px] text-slate-400">{ent.sourceDatabase}</div>
                      </td>

                      {/* Target Table & DB */}
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 font-mono">{ent.name}</div>
                        <div className="text-[10px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded inline-block mt-0.5">
                          {ent.targetDatabase}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3 text-center whitespace-nowrap">
                        {ent.status === 'Healthy' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs text-emerald-800 bg-emerald-50 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ✓ Migrated
                          </span>
                        )}
                        {ent.status === 'Warning' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs text-amber-800 bg-amber-50 border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            ◐ In Progress
                          </span>
                        )}
                        {ent.status === 'Critical' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs text-rose-800 bg-rose-50 border border-rose-200">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                            ! Failed
                          </span>
                        )}
                        {ent.status === 'Pending' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs text-slate-600 bg-slate-100 border border-slate-200">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            ○ Pending
                          </span>
                        )}
                      </td>

                      {/* Progress Bar & % */}
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                            <div 
                              className={`h-full ${ent.status === 'Healthy' ? 'bg-emerald-500' : ent.status === 'Warning' ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${ent.migrationPct}%` }}
                            />
                          </div>
                          <span className="font-mono tabular-nums font-medium">{ent.migrationPct.toFixed(1)}%</span>
                        </div>
                      </td>

                      {/* Source Rows ➔ Expected Rows */}
                      <td className="px-5 py-3 text-right text-xs font-mono whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                            Src: {ent.sourceCount.toLocaleString()}
                          </span>
                          <span className="text-slate-400">➔</span>
                          <span className="text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
                            Target: {ent.prodCount.toLocaleString()}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenMapping(ent.id, ent.sourceDatabase, ent.targetDatabase)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap"
                          >
                            <GitCompare className="w-3 h-3 text-slate-600" />
                            <span>Mapping</span>
                          </button>
                          <button
                            onClick={() => handleOpenDetails(ent.id, ent.targetDatabase)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap"
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
                  <td colSpan={6} className="text-center py-10 text-slate-400 font-sans">
                    No tables match target DB selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Working Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredEntities.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="tables"
        />
      </div>

    </div>
  );
};
