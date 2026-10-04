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
  CheckCircle2, 
  Lock, 
  RefreshCw,
  Plus,
  FileCode,
  Download,
  Upload,
  Check,
  Globe,
  Key,
  ShieldCheck,
  Edit2
} from 'lucide-react';

interface ExtendedDatabaseInfo {
  id: string;
  name: string;
  type: 'PostgreSQL' | 'MySQL' | 'Oracle' | 'SQL Server';
  environment: 'Source' | 'Target';
  host: string;
  port: string;
  database: string;
  username: string;
  sslMode: string;
  tableCount: number;
  description: string;
}

export const MigrationSetupStep: React.FC = () => {
  const { 
    setActiveStep,
    addToast
  } = useGlobalStore();

  const [sourceDbs, setSourceDbs] = useState<ExtendedDatabaseInfo[]>([
    {
      id: 'legacy_db_01',
      name: 'legacy_db_01',
      type: 'PostgreSQL',
      environment: 'Source',
      host: 'aws-east-pg01.internal',
      port: '5432',
      database: 'legacy_db_01',
      username: 'migration_admin',
      sslMode: 'require',
      tableCount: 8,
      description: 'Legacy database storing vehicle reference catalogs & assembly headers.'
    },
    {
      id: 'legacy_db_02',
      name: 'legacy_db_02',
      type: 'PostgreSQL',
      environment: 'Source',
      host: 'aws-east-pg02.internal',
      port: '5432',
      database: 'legacy_db_02',
      username: 'migration_readonly',
      sslMode: 'require',
      tableCount: 5,
      description: 'Legacy PostgreSQL database storing control systems & procedure catalogs.'
    }
  ]);

  const [targetDbs, setTargetDbs] = useState<ExtendedDatabaseInfo[]>([
    {
      id: 'prod_db_01',
      name: 'prod_db_01',
      type: 'PostgreSQL',
      environment: 'Target',
      host: 'pg-cloud-aurora01.internal',
      port: '5432',
      database: 'prod_db_01',
      username: 'prod_migrator',
      sslMode: 'verify-full',
      tableCount: 6,
      description: 'Target production PostgreSQL database storing core vehicle reference catalogs.'
    },
    {
      id: 'prod_db_02',
      name: 'prod_db_02',
      type: 'PostgreSQL',
      environment: 'Target',
      host: 'pg-cloud-aurora02.internal',
      port: '5432',
      database: 'prod_db_02',
      username: 'prod_migrator',
      sslMode: 'verify-full',
      tableCount: 8,
      description: 'Target production PostgreSQL database storing assembly line procedures and logs.'
    }
  ]);

  const [addSourceModalOpen, setAddSourceModalOpen] = useState(false);
  const [addTargetModalOpen, setAddTargetModalOpen] = useState(false);

  // Connection form state
  const [dbId, setDbId] = useState('');
  const [dbType, setDbType] = useState<'PostgreSQL' | 'MySQL' | 'Oracle' | 'SQL Server'>('PostgreSQL');
  const [dbHost, setDbHost] = useState('');
  const [dbPort, setDbPort] = useState('5432');
  const [dbName, setDbName] = useState('');
  const [dbUsername, setDbUsername] = useState('');
  const [dbPassword, setDbPassword] = useState('');
  const [dbSslMode, setDbSslMode] = useState('require');

  const resetForm = () => {
    setDbId('');
    setDbType('PostgreSQL');
    setDbHost('');
    setDbPort('5432');
    setDbName('');
    setDbUsername('');
    setDbPassword('');
    setDbSslMode('require');
  };

  const handleAddSourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbName.trim() || !dbHost.trim()) {
      addToast('Please enter database name and host endpoint.', 'error');
      return;
    }
    const cleanId = (dbId || dbName).toLowerCase().replace(/\s+/g, '_');
    const newDb: ExtendedDatabaseInfo = {
      id: cleanId,
      name: cleanId,
      type: dbType,
      environment: 'Source',
      host: dbHost,
      port: dbPort || '5432',
      database: dbName,
      username: dbUsername || 'db_user',
      sslMode: dbSslMode,
      tableCount: 4,
      description: `Source ${dbType} node storing catalog tables.`
    };
    setSourceDbs([...sourceDbs, newDb]);
    resetForm();
    setAddSourceModalOpen(false);
    addToast(`Connected & Added Source DB: ${cleanId}`, 'success');
  };

  const handleAddTargetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbName.trim() || !dbHost.trim()) {
      addToast('Please enter database name and host endpoint.', 'error');
      return;
    }
    const cleanId = (dbId || dbName).toLowerCase().replace(/\s+/g, '_');
    const newDb: ExtendedDatabaseInfo = {
      id: cleanId,
      name: cleanId,
      type: dbType,
      environment: 'Target',
      host: dbHost,
      port: dbPort || '5432',
      database: dbName,
      username: dbUsername || 'prod_user',
      sslMode: dbSslMode,
      tableCount: 4,
      description: `Target ${dbType} node for production migration.`
    };
    setTargetDbs([...targetDbs, newDb]);
    resetForm();
    setAddTargetModalOpen(false);
    addToast(`Connected & Added Target DB: ${cleanId}`, 'success');
  };

  const handleDownloadConfig = () => {
    const link = document.createElement('a');
    link.href = '/samples/sample-migration-config.json';
    link.download = 'sample-migration-config.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Downloaded single source of truth sample-migration-config.json', 'success');
  };

  return (
    <div className="space-y-6 font-sans max-w-full">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Step 01
            </span>
            <span className="text-slate-300">•</span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Migration Setup: Multi-Database Connections Credentials
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure full database connection credentials for multiple source and target nodes driven by the Single Source JSON.
          </p>
        </div>

        <div className="flex items-center gap-2.5 whitespace-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadConfig}
            icon={Download}
            iconPosition="left"
            className="text-xs font-semibold border-slate-300 whitespace-nowrap"
          >
            Download Config JSON
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveStep('discovery')}
            icon={ArrowRight}
            iconPosition="right"
            className="text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-xs font-bold whitespace-nowrap"
          >
            Proceed to Source Discovery
          </Button>
        </div>
      </div>

      {/* SINGLE SOURCE OF TRUTH JSON BANNER */}
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <span>SINGLE SOURCE OF TRUTH: Migration Config JSON</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                Active Config
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-sans mt-0.5">
              The migration script executes strictly based on the defined Migration Config JSON (<strong className="font-mono text-slate-200">sample-migration-config.json</strong>) containing database connection strings & table rules.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="dark"
            size="sm"
            onClick={handleDownloadConfig}
            icon={Download}
            iconPosition="left"
            className="font-mono text-xs whitespace-nowrap"
          >
            Download JSON
          </Button>
        </div>
      </div>

      {/* MULTI-DATABASE CONNECTION MANAGEMENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SOURCE DATABASES PANEL */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-900" />
              <h2 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                Source Databases ({sourceDbs.length} Connected)
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { resetForm(); setAddSourceModalOpen(true); }}
              icon={Plus}
              iconPosition="left"
              className="text-xs font-bold border-slate-300 text-slate-800 bg-slate-50 hover:bg-slate-100 whitespace-nowrap"
            >
              Add Source DB
            </Button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {sourceDbs.map((db) => (
              <div key={db.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-bold text-slate-900 text-sm">{db.id}</span>
                    <span className="text-[10px] text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded font-semibold">{db.type}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    ✓ Connected ({db.tableCount} Tables)
                  </span>
                </div>
                
                <div className="text-[11px] text-slate-600 font-sans">{db.description}</div>
                
                {/* Full Connection Credentials Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Host & Port</span>
                    <span className="text-slate-800 font-medium">{db.host}:{db.port}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Database Name</span>
                    <span className="text-slate-800 font-medium">{db.database}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">User Credential</span>
                    <span className="text-slate-800 font-medium">{db.username}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">SSL Mode</span>
                    <span className="text-emerald-700 font-bold">{db.sslMode}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TARGET DATABASES PANEL */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                Target Databases ({targetDbs.length} Connected)
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { resetForm(); setAddTargetModalOpen(true); }}
              icon={Plus}
              iconPosition="left"
              className="text-xs font-bold border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 whitespace-nowrap"
            >
              Add Target DB
            </Button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {targetDbs.map((db) => (
              <div key={db.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-bold text-slate-900 text-sm">{db.id}</span>
                    <span className="text-[10px] text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded font-semibold">{db.type}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    ✓ Connected ({db.tableCount} Tables)
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 font-sans">{db.description}</div>
                
                {/* Full Connection Credentials Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Host & Port</span>
                    <span className="text-slate-800 font-medium">{db.host}:{db.port}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Database Name</span>
                    <span className="text-slate-800 font-medium">{db.database}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">User Credential</span>
                    <span className="text-slate-800 font-medium">{db.username}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">SSL Mode</span>
                    <span className="text-emerald-700 font-bold">{db.sslMode}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MODAL FOR ADDING SOURCE DB WITH FULL CREDENTIALS */}
      <Modal
        isOpen={addSourceModalOpen}
        onClose={() => setAddSourceModalOpen(false)}
        title="Add Source Database Connection"
        subtitle="Configure full database connection credentials for the source node."
        maxWidth="lg"
      >
        <form onSubmit={handleAddSourceSubmit} className="space-y-4 font-sans text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Database Alias / Identifier</label>
              <input
                type="text"
                placeholder="e.g. legacy_db_03"
                value={dbId}
                onChange={(e) => setDbId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Database Engine / Type</label>
              <select
                value={dbType}
                onChange={(e) => setDbType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-mono"
              >
                <option value="PostgreSQL">PostgreSQL</option>
                <option value="MySQL">MySQL</option>
                <option value="Oracle">Oracle</option>
                <option value="SQL Server">SQL Server</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-slate-700 font-bold mb-1">Host Endpoint / IP Address</label>
              <input
                type="text"
                placeholder="e.g. aws-east-pg03.internal"
                value={dbHost}
                onChange={(e) => setDbHost(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Port</label>
              <input
                type="text"
                placeholder="5432"
                value={dbPort}
                onChange={(e) => setDbPort(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Database Name</label>
              <input
                type="text"
                placeholder="e.g. legacy_catalog_db"
                value={dbName}
                onChange={(e) => setDbName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">SSL Security Mode</label>
              <select
                value={dbSslMode}
                onChange={(e) => setDbSslMode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-mono"
              >
                <option value="require font-mono">require (Encrypted SSL)</option>
                <option value="verify-full">verify-full (Strict CA Verification)</option>
                <option value="prefer">prefer</option>
                <option value="disable">disable</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Username Credential</label>
              <input
                type="text"
                placeholder="e.g. migration_user"
                value={dbUsername}
                onChange={(e) => setDbUsername(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={dbPassword}
                onChange={(e) => setDbPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setAddSourceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-bold">
              Test Connection & Save Source DB
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL FOR ADDING TARGET DB WITH FULL CREDENTIALS */}
      <Modal
        isOpen={addTargetModalOpen}
        onClose={() => setAddTargetModalOpen(false)}
        title="Add Target Database Connection"
        subtitle="Configure full database connection credentials for the production target node."
        maxWidth="lg"
      >
        <form onSubmit={handleAddTargetSubmit} className="space-y-4 font-sans text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Database Alias / Identifier</label>
              <input
                type="text"
                placeholder="e.g. prod_db_03"
                value={dbId}
                onChange={(e) => setDbId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Database Engine / Type</label>
              <select
                value={dbType}
                onChange={(e) => setDbType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-mono"
              >
                <option value="PostgreSQL">PostgreSQL</option>
                <option value="MySQL">MySQL</option>
                <option value="Oracle">Oracle</option>
                <option value="SQL Server">SQL Server</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-slate-700 font-bold mb-1">Host Endpoint / IP Address</label>
              <input
                type="text"
                placeholder="e.g. pg-cloud-aurora03.internal"
                value={dbHost}
                onChange={(e) => setDbHost(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Port</label>
              <input
                type="text"
                placeholder="5432"
                value={dbPort}
                onChange={(e) => setDbPort(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Database Name</label>
              <input
                type="text"
                placeholder="e.g. prod_master_db"
                value={dbName}
                onChange={(e) => setDbName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">SSL Security Mode</label>
              <select
                value={dbSslMode}
                onChange={(e) => setDbSslMode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-mono"
              >
                <option value="verify-full">verify-full (Strict CA Verification)</option>
                <option value="require">require (Encrypted SSL)</option>
                <option value="prefer">prefer</option>
                <option value="disable">disable</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Username Credential</label>
              <input
                type="text"
                placeholder="e.g. prod_migrator"
                value={dbUsername}
                onChange={(e) => setDbUsername(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={dbPassword}
                onChange={(e) => setDbPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setAddTargetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              Test Connection & Save Target DB
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

