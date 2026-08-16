// src/pages/Dashboard.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { mockApi } from '../data/mockApi';
import { useGlobalStore } from '../state/useGlobalStore';
import { EntityMetadata, DataQualityError } from '../types/models';
import { ShieldCheck, AlertCircle, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { environment, setActivePage, setSelectedEntityId, setSelectedErrorId } = useGlobalStore();
  const [entities, setEntities] = useState<EntityMetadata[]>([]);
  const [errors, setErrors] = useState<DataQualityError[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const entResult = await mockApi.getEntities(environment);
      const errResult = await mockApi.getErrors();
      setEntities(entResult);
      setErrors(errResult);
      setLoading(false);
    };
    loadData();
  }, [environment]);

  // Derived stats
  const stats = useMemo(() => {
    const totalSource = entities.reduce((acc, curr) => acc + curr.sourceCount, 0);
    const totalProd = entities.reduce((acc, curr) => acc + curr.prodCount, 0);
    const successPct = totalSource > 0 ? (totalProd / totalSource) * 100 : 94.8;
    const openErrors = errors.filter(e => e.status !== 'Resolved' && e.status !== 'Rejected');
    const totalDiff = entities.reduce((acc, curr) => acc + curr.difference, 0);

    return {
      successPct,
      openErrors,
      totalDiff
    };
  }, [entities, errors]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-surface border border-slate-200/80 rounded-xl animate-pulse p-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-surface border border-slate-200/80 rounded-xl animate-pulse p-4" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Level 1 Header: Migration Health & Primary Action */}
      <div className="bg-surface border border-slate-200/80 rounded-xl p-6 shadow-premium flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-display">
              Migration Health
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Healthy (94.8%)
            </span>
          </div>
          
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
              94.8%
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Overall database migration accuracy across Velocity Motors target schemas
            </p>
          </div>

          {/* 1-Line Progress Bar */}
          <div className="pt-2 space-y-1.5 max-w-xl">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>92% Complete</span>
              <span className="text-[11px] text-slate-400 font-mono">221 / 245 tables migrated</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
              <div className="bg-brand h-full rounded-full transition-all duration-500" style={{ width: '92%' }} />
              <div className="bg-amber-400 h-full transition-all duration-500" style={{ width: '5.5%' }} />
              <div className="bg-red-500 h-full transition-all duration-500" style={{ width: '2.5%' }} />
            </div>
            <div className="flex items-center gap-4 text-[10px] text-slate-400 font-medium pt-0.5">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand" /> 221 Migrated</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> 18 In Progress</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> 6 Require Attention</span>
            </div>
          </div>
        </div>

        {/* Primary Call to Action */}
        <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setActivePage('errors')}
            className="px-5 py-3 bg-brand hover:bg-brand-700 text-white font-bold text-xs rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Review 6 Issues</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Four Primary Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Tables */}
        <Card interactive onClick={() => setActivePage('health')}>
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Tables</span>
            <h4 className="text-2xl font-extrabold font-mono text-slate-800 tabular-nums">221 / 245</h4>
            <p className="text-[10px] text-slate-400 font-medium pt-1">24 tables remaining in queue</p>
          </div>
        </Card>

        {/* Metric 2: Total Records */}
        <Card>
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Records</span>
            <h4 className="text-2xl font-extrabold font-mono text-slate-800 tabular-nums">18.4M</h4>
            <p className="text-[10px] text-slate-400 font-medium pt-1">Total legacy target rows</p>
          </div>
        </Card>

        {/* Metric 3: Successful */}
        <Card>
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Successful</span>
            <h4 className="text-2xl font-extrabold font-mono text-emerald-600 tabular-nums">18.1M</h4>
            <p className="text-[10px] text-emerald-600 font-medium pt-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Reconciled & Verified
            </p>
          </div>
        </Card>

        {/* Metric 4: Failed / Attention */}
        <Card interactive onClick={() => setActivePage('errors')}>
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Failed / Blocked</span>
            <h4 className="text-2xl font-extrabold font-mono text-red-600 tabular-nums">42.3K</h4>
            <p className="text-[10px] text-red-600 font-medium pt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Requires Human Action
            </p>
          </div>
        </Card>

      </div>

      {/* Main Workspace Layout: Needs Attention (Left) & Recent Activity (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* "Needs Attention" Area (Occupies 2/3) */}
        <div className="lg:col-span-2 space-y-4">
          <Card 
            title="Needs Attention" 
            subtitle="Data quality issues requiring human investigation and remediation"
          >
            <div className="divide-y divide-slate-100">
              
              {/* Item 1: Vehicles */}
              <div className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-50 border border-amber-200/60 rounded-lg text-amber-600 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-800 font-display">Vehicles Catalog Reference</h4>
                      <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">High Severity</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Engine mapping mismatch • <strong className="text-slate-700 font-mono">42,381 records affected</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedErrorId('ERR-2967');
                    setActivePage('errors');
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 text-slate-700 hover:text-brand text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <span>Investigate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Item 2: Warranty Claims */}
              <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-50 border border-amber-200/60 rounded-lg text-amber-600 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-800 font-display">Warranty Claims Assembly</h4>
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">Medium Severity</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Datatype mismatch • <strong className="text-slate-700 font-mono">1,284 records affected</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedErrorId('ERR-1713');
                    setActivePage('errors');
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 text-slate-700 hover:text-brand text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <span>Investigate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Item 3: MCS Procedures */}
              <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-50 border border-red-200/60 rounded-lg text-red-600 mt-0.5">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-800 font-display">MCS Procedures Drafts</h4>
                      <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">Blocked</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Foreign key deletion block • <strong className="text-slate-700 font-mono">521,878 records affected</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedErrorId('ERR-3091');
                    setActivePage('errors');
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 text-slate-700 hover:text-brand text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <span>Investigate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Item 4: Customers Catalog */}
              <div className="py-4 last:pb-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 border border-emerald-200/60 rounded-lg text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 font-display">Customers Catalog</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Validation completed • <strong className="text-emerald-700 font-mono">100% reconciled</strong>
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
                  Resolved
                </span>
              </div>

            </div>
          </Card>
        </div>

        {/* Recent Activity Feed (Occupies 1/3) */}
        <div className="lg:col-span-1">
          <Card title="Recent Activity" subtitle="Real-time migration event log">
            <div className="space-y-4">
              
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-700 font-medium leading-tight">Customer migration completed</p>
                  <span className="text-[10px] text-slate-400">2 minutes ago</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-700 font-medium leading-tight">Orders validation passed</p>
                  <span className="text-[10px] text-slate-400">8 minutes ago</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-700 font-medium leading-tight">Vehicle mapping requires attention</p>
                  <span className="text-[10px] text-slate-400">12 minutes ago</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-700 font-medium leading-tight">Inventory migration completed</p>
                  <span className="text-[10px] text-slate-400">18 minutes ago</span>
                </div>
              </div>

            </div>
          </Card>
        </div>

      </div>

    </div>
  );
};
