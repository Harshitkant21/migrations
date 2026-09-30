// src/components/journey/LiveLogTerminal.tsx
import React, { useState } from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { Terminal, Check, AlertTriangle, AlertCircle, Filter, Download } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const LiveLogTerminal: React.FC = () => {
  const { 
    executionLogs, 
    logFilter, 
    setLogFilter,
    addToast 
  } = useGlobalStore();

  const filteredLogs = executionLogs.filter((log) => {
    if (logFilter === 'ALL') return true;
    if (logFilter === 'SUCCESS') return log.status === 'success';
    if (logFilter === 'WARNING') return log.status === 'warning';
    if (logFilter === 'ERROR') return log.status === 'error';
    return true;
  });

  const handleExportLogs = () => {
    addToast('Live execution logs exported as .log format', 'info');
  };

  return (
    <div className="bg-slate-950 text-slate-200 rounded-xl border border-slate-800 shadow-xl overflow-hidden font-mono text-xs flex flex-col h-full min-h-[280px]">
      {/* Terminal Title Bar */}
      <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold text-slate-100 text-[11px] tracking-wider uppercase">Live Telemetry Stream</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
        </div>

        {/* Filter Controls & Export */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px]">
            {(['ALL', 'SUCCESS', 'WARNING', 'ERROR'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setLogFilter(filter)}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  logFilter === filter 
                    ? 'bg-slate-800 text-white font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter === 'ALL' ? 'All' : filter === 'SUCCESS' ? '✓ OK' : filter === 'WARNING' ? '⚠ Warn' : '✕ Err'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportLogs}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Download Logs"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log Entries Stream */}
      <div className="p-3 overflow-y-auto flex-1 max-h-[240px] space-y-1.5 divide-y divide-slate-900/60 font-mono text-[11px] leading-relaxed">
        {filteredLogs.map((log) => {
          const isSuccess = log.status === 'success';
          const isWarning = log.status === 'warning';
          const isError = log.status === 'error';

          return (
            <div key={log.id} className="pt-1.5 flex items-start gap-3">
              <span className="text-slate-500 shrink-0 tabular-nums">
                [{log.timestamp}]
              </span>

              <span className={`w-4 text-center shrink-0 font-bold ${
                isSuccess ? 'text-emerald-400' : isWarning ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {isSuccess ? '✓' : isWarning ? '⚠' : '✕'}
              </span>

              <span className="text-slate-300 font-semibold shrink-0 min-w-[90px]">
                {log.table}
              </span>

              <span className={`px-1.5 py-0.2 rounded text-[10px] shrink-0 ${
                log.step === 'Loading' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' :
                log.step === 'Transforming' ? 'bg-sky-950 text-sky-300 border border-sky-800' :
                log.step === 'Extracting' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {log.step}
              </span>

              <span className={`flex-1 break-all ${
                isError ? 'text-rose-300 font-semibold' : isWarning ? 'text-amber-200' : 'text-slate-300'
              }`}>
                {log.message}
              </span>
            </div>
          );
        })}
      </div>

      {/* Terminal Footer */}
      <div className="px-4 py-2 bg-slate-900/70 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>Log buffer: {filteredLogs.length} events</span>
        <span>Replication Mode: Logical Decoding (pgoutput stream)</span>
      </div>
    </div>
  );
};
