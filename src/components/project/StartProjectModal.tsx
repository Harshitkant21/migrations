// src/components/project/StartProjectModal.tsx
import React, { useState, useEffect } from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { 
  FolderKanban, 
  ArrowRight
} from 'lucide-react';

export const StartProjectModal: React.FC = () => {
  const {
    startProjectModalOpen,
    setStartProjectModalOpen,
    startNewProject,
    projectName: currentName,
    projectDescription: currentDesc
  } = useGlobalStore();

  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [error, setError] = useState('');

  // Sync state when modal opens
  useEffect(() => {
    if (startProjectModalOpen) {
      setProjectName(currentName || '');
      setProjectDescription(currentDesc || '');
      setError('');
    }
  }, [startProjectModalOpen, currentName, currentDesc]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setError('Please enter a project name.');
      return;
    }
    setError('');
    // Auto-generate project ID silently in background
    const autoId = `PRJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    startNewProject(projectName.trim(), projectDescription.trim(), autoId);
  };

  return (
    <Modal
      isOpen={startProjectModalOpen}
      onClose={() => setStartProjectModalOpen(false)}
      title="Create Migration Project"
      subtitle="Define your project details to begin orchestrating this database migration."
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStartProjectModalOpen(false)}
            className="text-xs font-semibold text-slate-600"
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            icon={ArrowRight}
            iconPosition="right"
            className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2"
          >
            Start Migration
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
        {/* Project Name Field */}
        <div className="space-y-1.5">
          <label className="block font-bold text-slate-700">
            Project Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <FolderKanban className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              autoFocus
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Core Billing & Accounts Modernization"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
            />
          </div>
          {error && <p className="text-[11px] text-rose-600 font-semibold">{error}</p>}
        </div>

        {/* Project Description Field */}
        <div className="space-y-1.5">
          <label className="block font-bold text-slate-700">
            Description
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Brief description of the migration scope, source systems, and destination..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all resize-none font-sans"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
