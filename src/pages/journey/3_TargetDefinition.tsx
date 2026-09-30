// src/pages/journey/3_TargetDefinition.tsx
import React, { useState } from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { TargetTableEditor } from '../../components/journey/TargetTableEditor';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export const TargetDefinitionStep: React.FC = () => {
  const { 
    setActiveStep,
    createTargetTableModalOpen,
    setCreateTargetTableModalOpen,
    addTargetTable
  } = useGlobalStore();

  const [newTableName, setNewTableName] = useState('');
  const [newTableSchema, setNewTableSchema] = useState('core');
  const [newTablePk, setNewTablePk] = useState('id');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;

    addTargetTable({
      id: `tgt-${newTableName.toLowerCase()}-${Date.now()}`,
      schema: newTableSchema,
      name: newTableName.toLowerCase(),
      isCustom: true,
      ddlPreview: `CREATE TABLE ${newTableSchema}.${newTableName.toLowerCase()} (\n  ${newTablePk.toLowerCase()} UUID PRIMARY KEY,\n  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP\n);`,
      columns: [
        {
          name: newTablePk.toLowerCase(),
          dataType: 'UUID',
          isNullable: false,
          isPrimaryKey: true,
          isForeignKey: false,
          isUnique: true,
          hasCheck: false,
          indexes: [`pk_${newTableName.toLowerCase()}`]
        },
        {
          name: 'created_at',
          dataType: 'TIMESTAMPTZ',
          defaultValue: 'CURRENT_TIMESTAMP',
          isNullable: false,
          isPrimaryKey: false,
          isForeignKey: false,
          isUnique: false,
          hasCheck: false,
          indexes: []
        }
      ]
    });

    setNewTableName('');
    setCreateTargetTableModalOpen(false);
  };

  return (
    <div className="space-y-4 font-sans max-w-full">
      
      {/* Compact Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Step 03
            </span>
            <span className="text-slate-300">•</span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Target Definition & Schema Editor
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Define target entity schemas, normalize structures, and inspect DDL definitions.
          </p>
        </div>

        <div className="flex items-center gap-2 whitespace-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveStep('discovery')}
            className="text-xs h-8 px-2.5 whitespace-nowrap font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Discovery</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveStep('mapping')}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-xs h-8 px-3 whitespace-nowrap font-medium"
          >
            <span>Proceed to Mapping</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* Target Table Workspace Component (3-Pane) */}
      <TargetTableEditor />

      {/* Create Target Table Modal */}
      <Modal
        isOpen={createTargetTableModalOpen}
        onClose={() => setCreateTargetTableModalOpen(false)}
        title="Create Target Table"
        subtitle="Define new relational entity on target PostgreSQL destination."
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-3 font-mono text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Target Schema</label>
            <select
              value={newTableSchema}
              onChange={(e) => setNewTableSchema(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
            >
              <option value="core">core</option>
              <option value="billing">billing</option>
              <option value="analytics">analytics</option>
              <option value="public">public</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Table Name</label>
            <input
              type="text"
              placeholder="e.g. customer_orders"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Primary Key Identifier</label>
            <input
              type="text"
              placeholder="e.g. order_id"
              value={newTablePk}
              onChange={(e) => setNewTablePk(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setCreateTargetTableModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Create Table
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
