// src/pages/MigrationHealth.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { mockApi } from '../data/mockApi';
import { useGlobalStore } from '../state/useGlobalStore';
import { EntityMetadata } from '../types/models';
import { Search, Filter, AlertCircle, RefreshCw, ChevronDown, CheckCircle } from 'lucide-react';

export const MigrationHealth: React.FC = () => {
  const { environment, setActivePage, setSelectedEntityId } = useGlobalStore();
  const [entities, setEntities] = useState<EntityMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [onlyDiff, setOnlyDiff] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'difference' | 'migrationPct'>('difference');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadData = async () => {
    setLoading(true);
    const data = await mockApi.getEntities(environment);
    setEntities(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [environment]);

  // Handle Sort Toggle
  const requestSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Programmatic filtering and sorting
  const processedEntities = useMemo(() => {
    let result = [...entities];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e => e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q));
    }

    // Category filter
    if (categoryFilter !== 'ALL') {
      result = result.filter(e => e.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(e => e.status === statusFilter);
    }

    // Difference Filter
    if (onlyDiff) {
      result = result.filter(e => e.difference > 0);
    }

    // Sorting logic
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'difference') {
        comparison = a.difference - b.difference;
      } else if (sortField === 'migrationPct') {
        comparison = a.migrationPct - b.migrationPct;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [entities, search, categoryFilter, statusFilter, onlyDiff, sortField, sortOrder]);

  const handleRowClick = (entityId: string) => {
    setSelectedEntityId(entityId);
    setActivePage('entity');
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Summary Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface border border-slate-200/80 rounded-lg px-5 py-4 shadow-premium">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-50 rounded text-brand">
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-slate-800 tracking-wider uppercase font-display">
              Reconciliation Summary
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Sync status between GM Historical Database and Target {environment} Environment
            </p>
          </div>
        </div>

        <div className="flex gap-6 items-center text-center">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Healthy tables: {entities.filter(e => e.status === 'Healthy').length}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-800 border border-red-100 rounded-lg text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Critical anomalies: {entities.filter(e => e.status === 'Critical').length}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Action Strip */}
      <Card children={
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search entity database..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs outline-none hover:border-slate-300 focus:border-brand focus:bg-surface"
            />
          </div>

          {/* Filtering Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Category Select */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Category</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none font-medium"
              >
                <option value="ALL">All Categories</option>
                <option value="Reference">Reference</option>
                <option value="MCS">MCS</option>
                <option value="PCS">PCS</option>
                <option value="Authoring">Authoring</option>
              </select>
            </div>

            {/* Status Select */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="Healthy">Healthy</option>
                <option value="Warning">Warning</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Switch Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none border border-slate-200 bg-slate-50 hover:bg-slate-100/50 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={onlyDiff}
                onChange={(e) => setOnlyDiff(e.target.checked)}
                className="rounded border-slate-300 text-brand focus:ring-brand w-3.5 h-3.5"
              />
              <span>Gaps Only</span>
            </label>

          </div>
        </div>
      } />

      {/* Main Table Grid */}
      <Card children={
        <div className="overflow-x-auto -mx-5 -my-4">
          <table className="min-w-full divide-y divide-slate-200/80 text-left">
            <thead className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4 font-display cursor-pointer hover:text-slate-700" onClick={() => requestSort('name')}>
                  <div className="flex items-center gap-1">
                    <span>Entity / Table Name</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${sortField === 'name' && sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                  </div>
                </th>
                <th className="px-6 py-4 font-display">Category</th>
                <th className="px-6 py-4 font-display text-right">Source DB</th>
                <th className="px-6 py-4 font-display text-right">Staging (STG)</th>
                <th className="px-6 py-4 font-display text-right">Production (PROD)</th>
                <th className="px-6 py-4 font-display text-right cursor-pointer hover:text-slate-700" onClick={() => requestSort('difference')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Difference</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${sortField === 'difference' && sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                  </div>
                </th>
                <th className="px-6 py-4 font-display text-right cursor-pointer hover:text-slate-700" onClick={() => requestSort('migrationPct')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Migration %</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${sortField === 'migrationPct' && sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                  </div>
                </th>
                <th className="px-6 py-4 font-display text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-surface text-xs text-slate-600 font-medium">
              {processedEntities.length > 0 ? (
                processedEntities.map((ent) => {
                  const hasDiscrepancy = ent.difference > 0;
                  const isHighImpact = ent.difference > 100000;
                  
                  return (
                    <tr 
                      key={ent.id}
                      onClick={() => handleRowClick(ent.id)}
                      className={`hover:bg-slate-50/75 cursor-pointer border-l-2 border-transparent hover:border-brand/40 transition-colors
                        ${hasDiscrepancy ? 'bg-slate-50/10' : ''}
                        ${isHighImpact ? 'bg-red-50/5 hover:bg-red-50/10' : ''}`}
                    >
                      {/* Name */}
                      <td className="px-6 py-3.5 font-bold text-slate-800 font-display">
                        {ent.name}
                      </td>
                      
                      {/* Category */}
                      <td className="px-6 py-3.5 text-slate-400">
                        {ent.category}
                      </td>
                      
                      {/* Source */}
                      <td className="px-6 py-3.5 text-right font-mono tabular-nums">
                        {ent.sourceCount.toLocaleString()}
                      </td>
                      
                      {/* STG */}
                      <td className="px-6 py-3.5 text-right font-mono text-slate-400 tabular-nums">
                        {ent.stgCount.toLocaleString()}
                      </td>
                      
                      {/* PROD */}
                      <td className="px-6 py-3.5 text-right font-mono text-slate-500 tabular-nums">
                        {ent.prodCount.toLocaleString()}
                      </td>
                      
                      {/* Difference */}
                      <td className={`px-6 py-3.5 text-right font-mono font-bold tabular-nums
                        ${ent.difference > 10000 ? 'text-red-600' : ent.difference > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {ent.difference > 0 ? `-${ent.difference.toLocaleString()}` : '0'}
                      </td>
                      
                      {/* Percent */}
                      <td className="px-6 py-3.5 text-right font-mono font-semibold tabular-nums">
                        {ent.migrationPct.toFixed(2)}%
                      </td>
                      
                      {/* Status */}
                      <td className="px-6 py-3.5 text-center">
                        <Badge type="status" value={ent.status} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    No matching entities found in current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      } />

    </div>
  );
};
