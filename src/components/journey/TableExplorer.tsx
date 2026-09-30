// src/components/journey/TableExplorer.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { DiscoveredTable } from '../../types/models';
import { 
  Search, 
  ChevronDown, 
  ChevronRight,
  Check, 
  X
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Pagination } from '../ui/Pagination';

export const TableExplorer: React.FC = () => {
  const { 
    discoveredTables, 
    tableSearchQuery, 
    setTableSearchQuery,
    schemaFilter, 
    setSchemaFilter,
    verificationFilter, 
    setVerificationFilter,
    toggleIncludeTable,
    verifyTable,
    verifyAllTables,
    excludeInvalidTables
  } = useGlobalStore();

  const [expandedTableId, setExpandedTableId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Extract unique schemas for filter dropdown
  const uniqueSchemas = useMemo(() => {
    const setOfSchemas = new Set(discoveredTables.map(t => t.schema));
    return ['ALL', ...Array.from(setOfSchemas)];
  }, [discoveredTables]);

  const filteredTables = useMemo(() => {
    return discoveredTables.filter((t) => {
      // Search
      const matchesSearch = tableSearchQuery.trim() === '' || 
        t.name.toLowerCase().includes(tableSearchQuery.toLowerCase()) ||
        t.schema.toLowerCase().includes(tableSearchQuery.toLowerCase()) ||
        t.columnsList?.some(c => c.name.toLowerCase().includes(tableSearchQuery.toLowerCase()));

      // Schema filter
      const matchesSchema = schemaFilter === 'ALL' || t.schema === schemaFilter;

      // Verification filter
      const matchesVerification = verificationFilter === 'ALL' || t.status === verificationFilter;

      return matchesSearch && matchesSchema && matchesVerification;
    });
  }, [discoveredTables, tableSearchQuery, schemaFilter, verificationFilter]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [tableSearchQuery, schemaFilter, verificationFilter]);

  const paginatedTables = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTables.slice(start, start + pageSize);
  }, [filteredTables, currentPage, pageSize]);

  const includedCount = discoveredTables.filter(t => t.isIncluded).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden font-sans">
      
      {/* Control Toolbar */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tables or columns..."
              value={tableSearchQuery}
              onChange={(e) => setTableSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 font-sans"
            />
          </div>

          {/* Schema Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 text-[11px] whitespace-nowrap">Schema:</span>
            <select
              value={schemaFilter}
              onChange={(e) => setSchemaFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-slate-900 font-mono"
            >
              {uniqueSchemas.map(s => (
                <option key={s} value={s}>{s === 'ALL' ? 'All Schemas (15)' : s}</option>
              ))}
            </select>
          </div>

          {/* Verification Status Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 text-[11px] whitespace-nowrap">Status:</span>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value as any)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-slate-900 font-sans"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">✓ Verified</option>
              <option value="NEEDS_REVIEW">○ Needs Review</option>
              <option value="INVALID">✕ Invalid</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-xs text-slate-500 mr-1 hidden sm:inline">
            <strong className="text-slate-900 font-mono tabular-nums">{includedCount}</strong> of {discoveredTables.length} included
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={verifyAllTables}
            className="text-xs h-7 px-2.5 whitespace-nowrap"
          >
            <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" />
            <span>Verify All</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={excludeInvalidTables}
            className="text-xs h-7 px-2.5 whitespace-nowrap"
          >
            <X className="w-3.5 h-3.5 text-rose-600 mr-1" />
            <span>Exclude Invalids</span>
          </Button>
        </div>
      </div>

      {/* Discovered Tables Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-4 w-10 text-center">Inc.</th>
              <th className="py-2.5 px-4">Table Name</th>
              <th className="py-2.5 px-4">Schema</th>
              <th className="py-2.5 px-4 text-right">Rows</th>
              <th className="py-2.5 px-4 text-right">Columns</th>
              <th className="py-2.5 px-4">Primary Key</th>
              <th className="py-2.5 px-4 text-center">Status</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedTables.map((table) => {
              const isExpanded = expandedTableId === table.id;
              const isVerified = table.status === 'VERIFIED';
              const isReview = table.status === 'NEEDS_REVIEW';
              const isInvalid = table.status === 'INVALID';

              return (
                <React.Fragment key={table.id}>
                  <tr className={`hover:bg-slate-50/80 transition-colors ${!table.isIncluded ? 'opacity-50 bg-slate-50/40' : ''}`}>
                    {/* Include Checkbox */}
                    <td className="py-2.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={table.isIncluded}
                        onChange={() => toggleIncludeTable(table.id)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Table Name */}
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setExpandedTableId(isExpanded ? null : table.id)}
                          className="p-1 rounded hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                        <span className="font-mono text-slate-900 font-semibold">{table.name}</span>
                      </div>
                    </td>

                    {/* Schema */}
                    <td className="py-2.5 px-4 text-slate-600">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[11px]">
                        {table.schema}
                      </span>
                    </td>

                    {/* Rows */}
                    <td className="py-2.5 px-4 text-right tabular-nums text-slate-700 font-mono font-medium">
                      {table.rows.toLocaleString()}
                    </td>

                    {/* Column Count */}
                    <td className="py-2.5 px-4 text-right tabular-nums text-slate-600 font-mono">
                      {table.columnCount}
                    </td>

                    {/* Primary Key */}
                    <td className="py-2.5 px-4 text-slate-600 truncate max-w-[160px] font-mono text-[11px]">
                      {table.primaryKey}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      {isVerified && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/70">
                          ✓ Verified
                        </span>
                      )}
                      {isReview && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/70">
                          ○ Needs Review
                        </span>
                      )}
                      {isInvalid && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-800 border border-rose-200/70">
                          ✕ Invalid
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      {isVerified ? (
                        <button
                          onClick={() => verifyTable(table.id, 'NEEDS_REVIEW')}
                          className="text-xs text-slate-500 hover:text-amber-700 underline cursor-pointer"
                        >
                          Review
                        </button>
                      ) : (
                        <button
                          onClick={() => verifyTable(table.id, 'VERIFIED')}
                          className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium cursor-pointer text-xs transition-colors"
                        >
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Expanded Columns Drawer */}
                  {isExpanded && table.columnsList && (
                    <tr className="bg-slate-50/80">
                      <td colSpan={8} className="py-3 px-8">
                        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 pb-1.5 border-b border-slate-100">
                            <span className="font-mono text-[11px]">COLUMNS FOR {table.schema.toUpperCase()}.{table.name.toUpperCase()}</span>
                            <span className="text-slate-400 font-normal text-[11px]">Foreign Keys: {table.foreignKeyCount} • Indexes: {table.indexCount}</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            {table.columnsList.map((col) => (
                              <div key={col.name} className="flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-100">
                                <span className="font-mono text-slate-900 font-medium truncate text-[11px]">
                                  {col.name}
                                  {col.isPk && <span className="ml-1 text-[9px] text-amber-700 font-bold">PK</span>}
                                  {col.isFk && <span className="ml-1 text-[9px] text-sky-700 font-bold">FK</span>}
                                </span>
                                <span className="text-slate-500 font-mono text-[10px] ml-1">{col.dataType}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Reusable Working Pagination Component */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredTables.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        itemLabel="discovered tables"
      />
    </div>
  );
};
