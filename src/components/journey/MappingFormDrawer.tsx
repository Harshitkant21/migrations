// src/components/journey/MappingFormDrawer.tsx
import React, { useState } from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { TransformationType, TableMappingDefinition } from '../../types/models';
import { GitMerge, ArrowRight, Check, Plus } from 'lucide-react';

export const MappingFormDrawer: React.FC = () => {
  const { 
    createMappingDrawerOpen, 
    setCreateMappingDrawerOpen, 
    discoveredTables,
    targetTablesList,
    addMappingRule 
  } = useGlobalStore();

  const [mappingType, setMappingType] = useState<'SINGLE' | 'SPLIT' | 'MERGE' | 'COMPLEX'>('SINGLE');
  const [sourceTable, setSourceTable] = useState('customers');
  const [sourceCol, setSourceCol] = useState('email');
  const [targetTable, setTargetTable] = useState('customer_profile');
  const [targetCol, setTargetCol] = useState('email');
  const [transformation, setTransformation] = useState<TransformationType>('DIRECT');
  const [typeConversion, setTypeConversion] = useState('VARCHAR(255) → VARCHAR(255)');
  const [nullableHandling, setNullableHandling] = useState('Fallback to Default');
  const [defaultValue, setDefaultValue] = useState('');
  const [validationRule, setValidationRule] = useState('RFC 5322 Email Validation');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule: TableMappingDefinition = {
      id: `map-${Date.now()}`,
      mappingType,
      sourceDatabases: ['Production PostgreSQL'],
      sourceTables: [sourceTable],
      targetDatabases: ['PostgreSQL Production'],
      targetTables: [targetTable],
      title: `${sourceTable} → ${targetTable} (${transformation})`,
      description: `Custom mapping from ${sourceTable}.${sourceCol} to ${targetTable}.${targetCol}`,
      status: 'Healthy',
      columnMappings: [
        {
          id: `cm-${Date.now()}`,
          sourceDb: 'Production PostgreSQL',
          sourceTable,
          sourceColumn: sourceCol,
          transformationType: transformation,
          transformationRule: `${transformation} mapping with ${nullableHandling}`,
          targetDb: 'PostgreSQL Production',
          targetTable,
          targetColumn: targetCol,
          sampleBefore: 'sample_val',
          sampleAfter: 'sample_val',
          status: 'Mapped'
        }
      ]
    };
    addMappingRule(newRule);
  };

  return (
    <Drawer
      isOpen={createMappingDrawerOpen}
      onClose={() => setCreateMappingDrawerOpen(false)}
      title="Create Custom Mapping Rule"
      subtitle="Define source-to-target entity projections and column transformations."
      width="xl"
      footer={
        <>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCreateMappingDrawerOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleSubmit}
            className="font-mono text-xs"
          >
            <Check className="w-3.5 h-3.5" />
            Save Mapping Rule
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
        {/* Mapping Cardinality */}
        <div>
          <label className="block text-slate-700 font-bold mb-1">Mapping Pattern</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'SINGLE', label: '1 → 1', desc: 'Direct' },
              { id: 'SPLIT', label: '1 → N', desc: 'Split' },
              { id: 'MERGE', label: 'N → 1', desc: 'Merge' },
              { id: 'COMPLEX', label: 'N → N', desc: 'Matrix' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setMappingType(p.id as any)}
                className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                  mappingType === p.id 
                    ? 'border-slate-900 bg-slate-900 text-white font-bold' 
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="text-xs font-bold">{p.label}</div>
                <div className="text-[10px] opacity-75">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Source Table & Column */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Source Entity Definition</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-500 text-[10px] mb-0.5">SOURCE TABLE</label>
              <select
                value={sourceTable}
                onChange={(e) => setSourceTable(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-mono"
              >
                {discoveredTables.map(t => (
                  <option key={t.id} value={t.name}>{t.schema}.{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-500 text-[10px] mb-0.5">SOURCE COLUMN</label>
              <input
                type="text"
                value={sourceCol}
                onChange={(e) => setSourceCol(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Target Table & Column */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Target Entity Definition</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-500 text-[10px] mb-0.5">TARGET TABLE</label>
              <select
                value={targetTable}
                onChange={(e) => setTargetTable(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-mono"
              >
                {targetTablesList.map(t => (
                  <option key={t.id} value={t.name}>{t.schema}.{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-500 text-[10px] mb-0.5">TARGET COLUMN</label>
              <input
                type="text"
                value={targetCol}
                onChange={(e) => setTargetCol(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Transformation Operator */}
        <div>
          <label className="block text-slate-700 font-bold mb-1">Transformation Rule</label>
          <select
            value={transformation}
            onChange={(e) => setTransformation(e.target.value as TransformationType)}
            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800"
          >
            <option value="DIRECT">DIRECT — 1:1 Identity Projection</option>
            <option value="RENAME">RENAME — Attribute label change</option>
            <option value="CAST">CAST — Data type conversion</option>
            <option value="NORMALIZE">NORMALIZE — Standardized format (Phone/Date/Address)</option>
            <option value="CONCAT">CONCAT — String concatenation with delimiter</option>
            <option value="SPLIT">SPLIT — Break delimited/JSON payload into attributes</option>
            <option value="LOOKUP">LOOKUP — Relational foreign-key reference</option>
            <option value="MERGE_KEY">MERGE_KEY — Entity join root key</option>
          </select>
        </div>

        {/* Data Type Conversion & Nullable Handling */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Type Conversion</label>
            <input
              type="text"
              value={typeConversion}
              onChange={(e) => setTypeConversion(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">Nullable Handling</label>
            <select
              value={nullableHandling}
              onChange={(e) => setNullableHandling(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
            >
              <option value="Preserve NULL">Preserve NULL</option>
              <option value="Fallback to Default">Fallback to Default</option>
              <option value="Reject and Quarantine">Reject and Quarantine (DLQ)</option>
            </select>
          </div>
        </div>

        {/* Default Value & Validation Rule */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Default Fallback</label>
            <input
              type="text"
              placeholder="e.g. CURRENT_TIMESTAMP or 'N/A'"
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">Validation Constraint</label>
            <input
              type="text"
              value={validationRule}
              onChange={(e) => setValidationRule(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
            />
          </div>
        </div>

      </form>
    </Drawer>
  );
};
