// src/components/journey/JsonImportModal.tsx
import React, { useState } from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { sampleMappingJson } from '../../data/journeyMockData';
import { Upload, FileCode, Check, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const JsonImportModal: React.FC = () => {
  const { 
    uploadJsonModalOpen, 
    setUploadJsonModalOpen, 
    importMappingJson 
  } = useGlobalStore();

  const [jsonText, setJsonText] = useState(sampleMappingJson);
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    setImporting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setImporting(false);
    importMappingJson(jsonText);
  };

  return (
    <Modal
      isOpen={uploadJsonModalOpen}
      onClose={() => setUploadJsonModalOpen(false)}
      title="Import Migration Mapping JSON"
      subtitle="Upload or paste schema mapping definitions and transformation specifications."
      maxWidth="3xl"
      footer={
        <>
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
            className="font-mono text-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            Import Mapping Specification
          </Button>
        </>
      }
    >
      <div className="space-y-4 font-sans text-xs">
        {/* Schema validation summary bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-emerald-50 border border-emerald-200/80 rounded-lg font-mono">
          <div className="flex items-center gap-2 text-emerald-800">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="font-bold">Specification Valid:</span>
            <span>245 Mappings • 18 Transformations • 4 Merge Rules • 7 Split Rules</span>
          </div>
          <Badge variant="success" size="sm">Schema v2 Verified</Badge>
        </div>

        {/* JSON Editor Preview */}
        <div>
          <label className="block text-slate-700 font-mono font-bold mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-slate-500" />
              JSON Payload Preview (Editable)
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

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 font-mono text-[11px]">
          ℹ Importing will update the active migration draft and merge with existing auto-suggested rules.
        </div>
      </div>
    </Modal>
  );
};
