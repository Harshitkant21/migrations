// src/pages/PreviousMigrationsModal.tsx
import React from 'react';
import { useGlobalStore } from '../state/useGlobalStore';
import { previousMigrations } from '../data/journeyMockData';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Database, Calendar, CheckCircle2, ArrowRight, FileText, LayoutDashboard } from 'lucide-react';

export const PreviousMigrationsModal: React.FC = () => {
  const { 
    previousMigrationsModalOpen, 
    setPreviousMigrationsModalOpen, 
    setIsLandingPage, 
    setActiveStep 
  } = useGlobalStore();

  const handleOpenMigration = (step: 'dashboard' | 'report') => {
    setIsLandingPage(false);
    setActiveStep(step);
    setPreviousMigrationsModalOpen(false);
  };

  return (
    <Modal
      isOpen={previousMigrationsModalOpen}
      onClose={() => setPreviousMigrationsModalOpen(false)}
      title="Previous Migration Runs"
      subtitle="Historical database migrations executed in this workspace."
      maxWidth="2xl"
    >
      <div className="space-y-3 font-sans">
        {previousMigrations.map((m) => (
          <div
            key={m.id}
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3 shadow-2xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 font-mono tracking-tight">{m.title}</h4>
                  <Badge variant="neutral" size="sm">{m.id}</Badge>
                  <Badge 
                    variant={m.status === 'Completed' ? 'success' : 'warning'} 
                    size="sm"
                    dot
                  >
                    {m.status}
                  </Badge>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                  <span>{m.source}</span>
                  <span className="text-slate-400">→</span>
                  <span>{m.target}</span>
                </div>
              </div>

              <div className="text-right font-mono">
                <div className="text-xs font-bold text-emerald-700">{m.health}% Health</div>
                <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                  <Calendar className="w-3 h-3" />
                  <span>{m.completedAt}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs font-mono">
              <span className="text-slate-600">
                <strong className="text-slate-900">{m.tables}</strong> tables • <strong className="text-slate-900">{m.records}</strong> records
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenMigration('dashboard')}
                  className="font-mono text-xs"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenMigration('report')}
                  className="font-mono text-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Report
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};
