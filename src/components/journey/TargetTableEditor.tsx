// src/components/journey/TargetTableEditor.tsx
import React, { useState } from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { TargetTableDef, TargetColumnDef } from '../../types/models';
import { 
  Table, 
  Plus, 
  Code, 
  Key, 
  Layers, 
  ArrowRight, 
  Check, 
  FolderTree, 
  Database,
  ChevronRight,
  Info
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export const TargetTableEditor: React.FC = () => {
  const { 
    targetTablesList, 
    activeTargetTableId, 
    setActiveTargetTableId,
    setCreateTargetTableModalOpen,
    addColumnToTargetTable,
    selectedTargetDb,
    setSelectedTargetDb,
    setActiveStep
  } = useGlobalStore();

  const [selectedColumnName, setSelectedColumnName] = useState<string | null>(null);
  const [showDdlModal, setShowDdlModal] = useState(false);
  const [newColumnModalOpen, setNewColumnModalOpen] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColType, setNewColType] = useState('VARCHAR(100)');
  const [newColNullable, setNewColNullable] = useState(true);

  const activeTable = targetTablesList.find(t => t.id === activeTargetTableId) || targetTablesList[0];
  const selectedCol = activeTable.columns.find(c => c.name === selectedColumnName) || activeTable.columns[0];

  // Group tables by schema
  const schemas = Array.from(new Set(targetTablesList.map(t => t.schema)));

  const handleAddColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    addColumnToTargetTable(activeTable.id, {
      name: newColName.trim().toLowerCase(),
      dataType: newColType,
      isNullable: newColNullable,
      isPrimaryKey: false,
      isForeignKey: false,
      isUnique: false,
      hasCheck: false,
      indexes: []
    });
    setNewColName('');
    setNewColumnModalOpen(false);
  };

  return (
    <div className="space-y-3 font-sans max-w-full">
      
      {/* 3-Pane Database Schema Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[580px]">
        
        {/* PANE 1: Schema & Entity Tree (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col overflow-hidden">
          {/* Tree Header */}
          <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 tracking-tight">
              <FolderTree className="w-3.5 h-3.5 text-slate-500" />
              <span>Target Schemas</span>
            </div>
            <button
              onClick={() => setCreateTargetTableModalOpen(true)}
              className="p-1 rounded hover:bg-slate-200/60 text-slate-600 cursor-pointer transition-colors"
              title="Add New Target Table"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Database Target Selector */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/40">
            <select
              value={selectedTargetDb}
              onChange={(e) => setSelectedTargetDb(e.target.value)}
              className="w-full px-2 py-1 text-xs font-medium bg-white border border-slate-300 rounded text-slate-800"
            >
              <option value="pg-cloud-aurora.internal">pg-cloud-aurora (PostgreSQL 16)</option>
              <option value="dw-cluster.internal">dw-cluster (Analytics DW)</option>
            </select>
          </div>

          {/* Schema Tree List */}
          <div className="p-2 space-y-3 overflow-y-auto flex-1 text-xs">
            {schemas.map((schema) => {
              const tablesInSchema = targetTablesList.filter(t => t.schema === schema);
              return (
                <div key={schema} className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>{schema} schema</span>
                    <span className="font-mono text-slate-500">{tablesInSchema.length}</span>
                  </div>

                  <div className="space-y-0.5">
                    {tablesInSchema.map((t) => {
                      const isActive = t.id === activeTable.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            setActiveTargetTableId(t.id);
                            setSelectedColumnName(null);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                            isActive 
                              ? 'bg-slate-900 text-white font-medium shadow-xs' 
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Table className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                            <span className="truncate font-mono text-xs">{t.name}</span>
                          </div>
                          <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                            isActive ? 'bg-slate-800 text-slate-300' : 'text-slate-400'
                          }`}>
                            {t.columns.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-2 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={() => setCreateTargetTableModalOpen(true)}
              className="w-full py-1.5 px-2 border border-dashed border-slate-300 hover:border-slate-500 rounded text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Target Table</span>
            </button>
          </div>
        </div>

        {/* PANE 2: Center Table & Columns Grid (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col overflow-hidden">
          {/* Active Table Toolbar */}
          <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-900">
                {activeTable.schema}.{activeTable.name}
              </span>
              <Badge variant="neutral" size="sm">
                {activeTable.columns.length} Columns
              </Badge>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNewColumnModalOpen(true)}
                className="font-sans font-medium text-xs px-2.5 py-1 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Column
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDdlModal(true)}
                className="font-sans font-medium text-xs px-2.5 py-1 whitespace-nowrap"
              >
                <Code className="w-3.5 h-3.5 mr-1" />
                View DDL
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveStep('mapping')}
                className="font-sans font-medium text-xs px-2.5 py-1 whitespace-nowrap"
              >
                <span>Mapping</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>

          {/* Columns Grid */}
          <div className="overflow-x-auto flex-1 text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/60 border-b border-slate-200 text-slate-600 text-[11px] font-semibold">
                  <th className="py-2.5 px-3 whitespace-nowrap">Column</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Type</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap">Null</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Constraints</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Default</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeTable.columns.map((col) => {
                  const isSelected = selectedCol.name === col.name;
                  return (
                    <tr
                      key={col.name}
                      onClick={() => setSelectedColumnName(col.name)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-slate-100/80 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                        {col.isPrimaryKey ? (
                          <Key className="w-3 h-3 text-amber-600 shrink-0" />
                        ) : (
                          <span className="w-3" />
                        )}
                        <span>{col.name}</span>
                      </td>

                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                          {col.dataType}{col.length ? `(${col.length})` : ''}
                        </span>
                      </td>

                      <td className="py-2 px-3 text-center">
                        <span className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                          col.isNullable ? 'text-slate-500' : 'text-rose-700 bg-rose-50'
                        }`}>
                          {col.isNullable ? 'NULL' : 'NOT NULL'}
                        </span>
                      </td>

                      <td className="py-2 px-3">
                        <div className="flex flex-wrap gap-1">
                          {col.isPrimaryKey && <Badge variant="warning" size="sm">PK</Badge>}
                          {col.isForeignKey && <Badge variant="info" size="sm">FK</Badge>}
                          {col.isUnique && <Badge variant="neutral" size="sm">UQ</Badge>}
                          {col.hasCheck && <Badge variant="outline" size="sm">CHK</Badge>}
                          {!col.isPrimaryKey && !col.isForeignKey && !col.isUnique && !col.hasCheck && <span className="text-slate-300">—</span>}
                        </div>
                      </td>

                      <td className="py-2 px-3 text-slate-400 text-[11px] truncate max-w-[120px]">
                        {col.defaultValue || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>Target Engine: <strong>PostgreSQL 16 Compatible</strong></span>
            <span className="text-emerald-700 font-bold">✓ Synced</span>
          </div>
        </div>

        {/* PANE 3: Selected Column / DDL Quick Inspector (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col overflow-hidden text-xs font-sans">
          <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <span className="font-bold text-slate-800 text-xs tracking-tight">Field Inspector</span>
            <Badge variant="neutral" size="sm">{selectedCol.name}</Badge>
          </div>

          <div className="p-3 space-y-3 overflow-y-auto flex-1">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Column Identity</span>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900">{selectedCol.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{selectedCol.dataType}{selectedCol.length ? `(${selectedCol.length})` : ''}</div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Constraints</span>
              <div className="p-2 rounded bg-slate-50 border border-slate-200 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Primary Key:</span>
                  <span className="font-bold">{selectedCol.isPrimaryKey ? 'YES' : 'NO'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Foreign Key:</span>
                  <span className="font-bold">{selectedCol.isForeignKey ? `YES (${selectedCol.referencedTable})` : 'NO'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nullable:</span>
                  <span className="font-bold">{selectedCol.isNullable ? 'YES' : 'NO'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Unique Constraint:</span>
                  <span className="font-bold">{selectedCol.isUnique ? 'YES' : 'NO'}</span>
                </div>
              </div>
            </div>

            {/* In-place DDL preview snippet */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Table DDL Script</span>
              <pre className="p-2.5 rounded bg-slate-950 text-emerald-400 text-[10px] overflow-x-auto leading-relaxed border border-slate-800 max-h-36">
                {activeTable.ddlPreview || `CREATE TABLE ${activeTable.schema}.${activeTable.name};`}
              </pre>
            </div>
          </div>

          <div className="p-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Indexed:</span>
            <span className="font-bold text-slate-800">{selectedCol.indexes.length > 0 ? selectedCol.indexes.join(', ') : 'None'}</span>
          </div>
        </div>

      </div>

      {/* DDL Full Modal */}
      <Modal
        isOpen={showDdlModal}
        onClose={() => setShowDdlModal(false)}
        title={`Target DDL Preview — ${activeTable.schema}.${activeTable.name}`}
        subtitle="Generated PostgreSQL DDL script based on configured columns and constraints."
        maxWidth="2xl"
      >
        <div className="space-y-3 font-mono">
          <pre className="p-4 rounded-lg bg-slate-950 text-emerald-400 text-xs overflow-x-auto leading-relaxed border border-slate-800">
            {activeTable.ddlPreview}
          </pre>
          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowDdlModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Column Modal */}
      <Modal
        isOpen={newColumnModalOpen}
        onClose={() => setNewColumnModalOpen(false)}
        title={`Add Column to ${activeTable.name}`}
        subtitle="Define new attribute field on the target schema."
        maxWidth="md"
      >
        <form onSubmit={handleAddColumnSubmit} className="space-y-3 font-mono text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Column Name</label>
            <input
              type="text"
              placeholder="e.g. metadata_json"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Data Type</label>
            <select
              value={newColType}
              onChange={(e) => setNewColType(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
            >
              <option value="VARCHAR(100)">VARCHAR(100)</option>
              <option value="VARCHAR(255)">VARCHAR(255)</option>
              <option value="TEXT">TEXT</option>
              <option value="INT">INT</option>
              <option value="BIGINT">BIGINT</option>
              <option value="NUMERIC(12,2)">NUMERIC(12,2)</option>
              <option value="UUID">UUID</option>
              <option value="JSONB">JSONB</option>
              <option value="TIMESTAMPTZ">TIMESTAMPTZ</option>
              <option value="BOOLEAN">BOOLEAN</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={newColNullable}
              onChange={(e) => setNewColNullable(e.target.checked)}
              className="rounded border-slate-300 text-slate-900"
            />
            <span className="text-slate-700 text-xs">Allow NULL values (Nullable)</span>
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setNewColumnModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Column
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
