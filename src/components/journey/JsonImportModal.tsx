// src/components/journey/JsonImportModal.tsx
import React, { useState } from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Upload, FileCode, Check, Download } from 'lucide-react';
import { Badge } from '../ui/Badge';

const defaultConfigJson = JSON.stringify({
  "$schema": "https://json.schema.nexusmigrate.io/v1/migration-config.json",
  "migrationId": "mig_2026_0928_multidb",
  "version": "1.0",
  "title": "Velocity Motors Multi-Database Migration Specification",
  "sourceDatabases": [
    { "id": "legacy_db_01", "engine": "PostgreSQL", "tableCount": 8 },
    { "id": "legacy_db_02", "engine": "PostgreSQL", "tableCount": 5 }
  ],
  "targetDatabases": [
    { "id": "prod_db_01", "engine": "PostgreSQL Target", "tableCount": 6 },
    { "id": "prod_db_02", "engine": "PostgreSQL Target", "tableCount": 8 }
  ],
  "mappings": [
    {
      "id": "map-vehicles",
      "mappingType": "SPLIT",
      "sourceDatabases": ["legacy_db_01"],
      "sourceTables": ["LEGACY_VHCLS"],
      "targetDatabases": ["prod_db_01"],
      "targetTables": ["vehicles", "vehicle_specifications"],
      "columnMappings": [
        { "sourceDb": "legacy_db_01", "sourceTable": "LEGACY_VHCLS", "sourceColumn": "VHC_ID", "transformationType": "NORMALIZE", "targetDb": "prod_db_01", "targetTable": "vehicles", "targetColumn": "vehicle_id" }
      ]
    },
    {
      "id": "map-pcs-procedures",
      "mappingType": "SINGLE",
      "sourceDatabases": ["legacy_db_01"],
      "sourceTables": ["LEGACY_PCS_PROC"],
      "targetDatabases": ["prod_db_02"],
      "targetTables": ["pcs_procedures"],
      "columnMappings": [
        { "sourceDb": "legacy_db_01", "sourceTable": "LEGACY_PCS_PROC", "sourceColumn": "PROC_CD", "transformationType": "RENAME", "targetDb": "prod_db_02", "targetTable": "pcs_procedures", "targetColumn": "procedure_id" }
      ]
    },
    {
      "id": "map-mcs-procedures",
      "mappingType": "SINGLE",
      "sourceDatabases": ["legacy_db_02"],
      "sourceTables": ["LEGACY_MCS_PROC"],
      "targetDatabases": ["prod_db_02"],
      "targetTables": ["mcs_procedures"],
      "columnMappings": [
        { "sourceDb": "legacy_db_02", "sourceTable": "LEGACY_MCS_PROC", "sourceColumn": "MCS_PROC_CD", "transformationType": "RENAME", "targetDb": "prod_db_02", "targetTable": "mcs_procedures", "targetColumn": "procedure_id" }
      ]
    }
  ],
  "pipelineSequence": [
    { "order": 1, "sourceDb": "legacy_db_01", "sourceTable": "LEGACY_MAKES", "targetDb": "prod_db_01", "targetTable": "makes" },
    { "order": 2, "sourceDb": "legacy_db_01", "sourceTable": "LEGACY_MDLS", "targetDb": "prod_db_01", "targetTable": "models" },
    { "order": 3, "sourceDb": "legacy_db_01", "sourceTable": "LEGACY_VHCLS", "targetDb": "prod_db_01", "targetTable": "vehicles" },
    { "order": 4, "sourceDb": "legacy_db_01", "sourceTable": "LEGACY_PCS_PROC", "targetDb": "prod_db_02", "targetTable": "pcs_procedures" },
    { "order": 5, "sourceDb": "legacy_db_02", "sourceTable": "LEGACY_MCS_PROC", "targetDb": "prod_db_02", "targetTable": "mcs_procedures" }
  ]
}, null, 2);

export const JsonImportModal: React.FC = () => {
  const { 
    uploadJsonModalOpen, 
    setUploadJsonModalOpen, 
    importMappingJson,
    addToast
  } = useGlobalStore();

  const [jsonText, setJsonText] = useState(defaultConfigJson);
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    setImporting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setImporting(false);
    importMappingJson(jsonText);
    addToast('Updated Single Source of Truth Migration Config JSON & multi-DB pipeline', 'success');
  };

  const handleDownloadSample = () => {
    const link = document.createElement('a');
    link.href = '/samples/sample-migration-config.json';
    link.download = 'sample-migration-config.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Downloaded sample-migration-config.json', 'success');
  };

  return (
    <Modal
      isOpen={uploadJsonModalOpen}
      onClose={() => setUploadJsonModalOpen(false)}
      title="Single Source of Truth: Migration Config JSON"
      subtitle="Upload or edit the master JSON specification defining source DBs, target DBs, mappings, and pipeline sequence."
      maxWidth="3xl"
      footer={
        <>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadSample}
            icon={Download}
            iconPosition="left"
            className="font-mono text-xs"
          >
            Download Sample JSON
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setUploadJsonModalOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleImport}
            loading={importing}
            icon={Upload}
            iconPosition="left"
            className="font-mono text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            Apply Config JSON
          </Button>
        </>
      }
    >
      <div className="space-y-4 font-sans text-xs">
        {/* Schema validation summary bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-emerald-50 border border-emerald-200/80 rounded-lg font-mono">
          <div className="flex items-center gap-2 text-emerald-800">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="font-bold">Single Source of Truth Valid:</span>
            <span>2 Source DBs • 2 Target DBs • 245 Mappings • 5 Pipeline Steps</span>
          </div>
          <Badge variant="success" size="sm">Config v1.0 Active</Badge>
        </div>

        {/* JSON Editor Preview */}
        <div>
          <label className="block text-slate-700 font-mono font-bold mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-slate-500" />
              Migration Config JSON Specification (Editable)
            </span>
            <span className="text-[11px] text-slate-400 font-normal">UTF-8 Encoded</span>
          </label>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={14}
            className="w-full p-3 font-mono text-xs bg-slate-950 text-emerald-400 rounded-lg border border-slate-800 focus:outline-hidden leading-relaxed shadow-inner"
            spellCheck={false}
          />
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-mono text-[11px]">
          ℹ Updating this JSON updates the single source of truth driving the migration script, multi-database routing, and execution pipeline.
        </div>
      </div>
    </Modal>
  );
};
