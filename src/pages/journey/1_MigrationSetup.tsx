// src/pages/journey/1_MigrationSetup.tsx
import React, { useState } from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { 
  Database, 
  Server, 
  ArrowRight, 
  Check, 
  Plus, 
  Lock, 
  Sparkles,
  Link,
  ShieldCheck
} from 'lucide-react';
import { MigrationIntentType, TargetEnvironmentType } from '../../types/models';

export const MigrationSetupStep: React.FC = () => {
  const { 
    sources, 
    targets, 
    selectedSourceEngine, 
    setSelectedSourceEngine,
    connectionForm, 
    setConnectionForm, 
    connectionTesting, 
    connectionConnected, 
    connectSource,
    migrationIntent, 
    setMigrationIntent,
    migrationConstraints, 
    setMigrationConstraints,
    setActiveStep,
    addToast
  } = useGlobalStore();

  const [showConnStr, setShowConnStr] = useState(false);
  const [showAddSourceModal, setShowAddSourceModal] = useState(false);
  const [showAddTargetModal, setShowAddTargetModal] = useState(false);

  const engines = [
    { id: 'PostgreSQL', name: 'PostgreSQL', port: '5432' },
    { id: 'MySQL', name: 'MySQL', port: '3306' },
    { id: 'Oracle', name: 'Oracle', port: '1521' },
    { id: 'SQL Server', name: 'SQL Server', port: '1433' },
    { id: 'Other', name: 'Other (JDBC)', port: '5432' }
  ];

  const migrationTypes: MigrationIntentType[] = [
    'Full migration',
    'Partial migration',
    'Schema only',
    'Data only',
    'Schema + Data'
  ];

  const environments: TargetEnvironmentType[] = [
    'Development',
    'Staging',
    'Production'
  ];

  return (
    <div className="space-y-4 font-sans max-w-full">
      
      {/* Compact Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Step 01
            </span>
            <span className="text-slate-300">•</span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Migration Setup & Configuration Workspace
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure source connection parameters and define migration boundary rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5 whitespace-nowrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Draft saved automatically
          </span>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveStep('discovery')}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-xs h-8 px-3 whitespace-nowrap font-medium"
          >
            <span>Continue to Discovery</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* Main 2-Column Structured Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: Source Connection & Multi-Node Topology (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-700" />
              <h2 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                Source Connection Parameters
              </h2>
            </div>
            {connectionConnected ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/70 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Connected: aws-east-pg01:5432
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/70 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                Pending Connection
              </span>
            )}
          </div>

          {/* Engine Selector Chips */}
          <div>
            <label className="block text-[11px] text-slate-500 mb-1.5 font-semibold uppercase tracking-wider">
              Source Database Engine
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {engines.map((eng) => {
                const isSelected = selectedSourceEngine === eng.id;
                return (
                  <button
                    key={eng.id}
                    type="button"
                    onClick={() => {
                      setSelectedSourceEngine(eng.id);
                      setConnectionForm({ port: eng.port });
                    }}
                    className={`px-2 py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-slate-900 bg-slate-900 text-white font-medium shadow-xs' 
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold whitespace-nowrap truncate">{eng.name}</div>
                    <div className={`text-[10px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      Port {eng.port}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Connection Inputs */}
          <div className="space-y-3 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-slate-500 mb-1 font-semibold uppercase">Host / Endpoint</label>
                <input
                  type="text"
                  value={connectionForm.host}
                  onChange={(e) => setConnectionForm({ host: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-slate-900 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-semibold uppercase">Port</label>
                <input
                  type="text"
                  value={connectionForm.port}
                  onChange={(e) => setConnectionForm({ port: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-slate-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-semibold uppercase">Database Name</label>
                <input
                  type="text"
                  value={connectionForm.database}
                  onChange={(e) => setConnectionForm({ database: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-slate-900 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-semibold uppercase">Username</label>
                <input
                  type="text"
                  value={connectionForm.username}
                  onChange={(e) => setConnectionForm({ username: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-slate-900 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-semibold uppercase">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value="••••••••••••"
                    readOnly
                    className="w-full px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-lg text-xs font-mono text-slate-400 tracking-widest"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* SSL & Connection String Toggle */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={connectionForm.ssl}
                  onChange={(e) => setConnectionForm({ ssl: e.target.checked })}
                  className="rounded border-slate-300 text-slate-900"
                />
                <span className="text-slate-700 text-xs">Enable SSL Mode (sslmode=require)</span>
              </label>

              <button
                type="button"
                onClick={() => setShowConnStr(!showConnStr)}
                className="text-slate-500 hover:text-slate-800 text-[11px] underline cursor-pointer"
              >
                {showConnStr ? 'Hide URI' : 'Show Connection URI'}
              </button>
            </div>

            {showConnStr && (
              <div className="p-2 rounded bg-slate-900 text-emerald-400 font-mono text-[11px] break-all border border-slate-800">
                {connectionForm.connectionString}
              </div>
            )}
          </div>

          {/* Test Connection Button & Handshake Result */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={connectSource}
              loading={connectionTesting}
              className="font-sans font-medium text-xs whitespace-nowrap"
            >
              {connectionConnected ? 'Test Connection Again' : 'Connect Source'}
            </Button>

            <span className="text-xs text-slate-400 font-sans">
              Protocol: Native libpq binary handshake
            </span>
          </div>

          {/* Multi-Source / Multi-Target Topology Compact Strip */}
          <div className="pt-3 border-t border-slate-100 space-y-2 font-sans">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="font-semibold text-slate-700">Topology Nodes</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowAddSourceModal(true)}
                  className="text-slate-700 hover:text-slate-900 underline text-xs cursor-pointer whitespace-nowrap"
                >
                  + Add Source
                </button>
                <span className="text-slate-300">|</span>
                <button 
                  onClick={() => setShowAddTargetModal(true)}
                  className="text-slate-700 hover:text-slate-900 underline text-xs cursor-pointer whitespace-nowrap"
                >
                  + Add Target
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 truncate">Production PostgreSQL</div>
                  <div className="text-[11px] text-slate-500">15 schemas • 245 tables</div>
                </div>
                <Badge variant="success" size="sm">Source</Badge>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 truncate">PostgreSQL Production</div>
                  <div className="text-[11px] text-slate-500">12 schemas • 245 tables</div>
                </div>
                <Badge variant="info" size="sm">Target</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Migration Configuration & Intent (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4 font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-700" />
              <h2 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                Migration Intent & Scope
              </h2>
            </div>
            <Badge variant="neutral" size="sm">
              Rules Active
            </Badge>
          </div>

          {/* Migration Type Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Migration Type
            </label>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {migrationTypes.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMigrationIntent({ migrationType: t })}
                  className={`px-2.5 py-1 rounded-md border text-xs cursor-pointer transition-all whitespace-nowrap ${
                    migrationIntent.migrationType === t
                      ? 'bg-slate-900 text-white font-semibold border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Target Environment */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Target Environment
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {environments.map(env => (
                <button
                  key={env}
                  type="button"
                  onClick={() => setMigrationIntent({ environment: env })}
                  className={`py-1 rounded-md border text-center cursor-pointer transition-all whitespace-nowrap ${
                    migrationIntent.environment === env
                      ? 'bg-slate-900 text-white font-semibold border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {env}
                </button>
              ))}
            </div>
          </div>

          {/* Migration Constraints Grid */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5 text-xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Operational Constraints
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">DOWNTIME REQUIREMENT</label>
                <input
                  type="text"
                  value={migrationConstraints.downtimeRequirement}
                  onChange={(e) => setMigrationConstraints({ downtimeRequirement: e.target.value })}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">VALIDATION LEVEL</label>
                <select
                  value={migrationConstraints.validationLevel}
                  onChange={(e) => setMigrationConstraints({ validationLevel: e.target.value as any })}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800"
                >
                  <option value="Basic">Basic (Row Count)</option>
                  <option value="Standard">Standard (Schema + PK)</option>
                  <option value="Strict (Row-by-row + Checksum)">Strict (Row + Checksum)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">DATA TRANSFORMATION</label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setMigrationConstraints({ dataTransformationRequired: true })}
                    className={`flex-1 py-0.5 rounded border text-[11px] font-bold cursor-pointer ${
                      migrationConstraints.dataTransformationRequired ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setMigrationConstraints({ dataTransformationRequired: false })}
                    className={`flex-1 py-0.5 rounded border text-[11px] font-bold cursor-pointer ${
                      !migrationConstraints.dataTransformationRequired ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">PII MASKING</label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setMigrationConstraints({ dataMaskingRequired: true })}
                    className={`flex-1 py-0.5 rounded border text-[11px] font-bold cursor-pointer ${
                      migrationConstraints.dataMaskingRequired ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setMigrationConstraints({ dataMaskingRequired: false })}
                    className={`flex-1 py-0.5 rounded border text-[11px] font-bold cursor-pointer ${
                      !migrationConstraints.dataMaskingRequired ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Objective & Notes */}
          <div className="space-y-2 font-mono text-xs">
            <div>
              <label className="block text-[10px] text-slate-500 mb-0.5 font-semibold uppercase">MIGRATION OBJECTIVE</label>
              <input
                type="text"
                value={migrationIntent.objective}
                onChange={(e) => setMigrationIntent({ objective: e.target.value })}
                className="w-full px-2.5 py-1 bg-slate-50 border border-slate-300 rounded text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 mb-0.5 font-semibold uppercase">OPERATIONAL NOTES</label>
              <input
                type="text"
                value={migrationIntent.notes}
                onChange={(e) => setMigrationIntent({ notes: e.target.value })}
                className="w-full px-2.5 py-1 bg-slate-50 border border-slate-300 rounded text-xs"
              />
            </div>
          </div>

        </div>

      </div>

      {/* Add Source / Target Modals */}
      <Modal
        isOpen={showAddSourceModal}
        onClose={() => setShowAddSourceModal(false)}
        title="Add Source Cluster Node"
        subtitle="Connect another source cluster for multi-database ingestion."
        maxWidth="md"
      >
        <div className="space-y-3 font-mono text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Engine</label>
            <select className="w-full px-3 py-1.5 border border-slate-300 rounded-lg">
              <option>MySQL 8.0</option>
              <option>Oracle Database 19c</option>
              <option>Microsoft SQL Server</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">Host Endpoint</label>
            <input type="text" placeholder="mysql-shard-02.internal" className="w-full px-3 py-1.5 border border-slate-300 rounded-lg" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowAddSourceModal(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={() => {
              setShowAddSourceModal(false);
              addToast('Added secondary source database node', 'success');
            }}>Save Source</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showAddTargetModal}
        onClose={() => setShowAddTargetModal(false)}
        title="Add Target Destination"
        subtitle="Configure additional replica, cache or data warehouse destination."
        maxWidth="md"
      >
        <div className="space-y-3 font-mono text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Target Engine</label>
            <select className="w-full px-3 py-1.5 border border-slate-300 rounded-lg">
              <option>PostgreSQL Analytics Warehouse</option>
              <option>Amazon Aurora Read Replica</option>
              <option>Snowflake Stage</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">Target Host</label>
            <input type="text" placeholder="analytics-dw-stage.internal" className="w-full px-3 py-1.5 border border-slate-300 rounded-lg" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowAddTargetModal(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={() => {
              setShowAddTargetModal(false);
              addToast('Added secondary target destination', 'success');
            }}>Save Target</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
