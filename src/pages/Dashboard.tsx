// src/pages/Dashboard.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { HealthRing } from '../components/ui/HealthRing';
import { mockApi } from '../data/mockApi';
import { useGlobalStore } from '../state/useGlobalStore';
import { EntityMetadata, DataQualityError } from '../types/models';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldCheck, AlertCircle, ArrowUpRight, TrendingUp, HelpCircle } from 'lucide-react';

// Trend data for data quality progress over the past 2 weeks
const trendData = [
  { day: 'Aug 01', quality: 95.8, discrepancies: 120 },
  { day: 'Aug 03', quality: 96.1, discrepancies: 115 },
  { day: 'Aug 05', quality: 96.4, discrepancies: 110 },
  { day: 'Aug 07', quality: 96.8, discrepancies: 98 },
  { day: 'Aug 09', quality: 97.2, discrepancies: 92 },
  { day: 'Aug 11', quality: 97.9, discrepancies: 85 },
  { day: 'Aug 13', quality: 98.2, discrepancies: 82 }
];

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

  // Calculations derived programmatically
  const stats = useMemo(() => {
    if (entities.length === 0) return { successPct: 0, totalDiff: 0, openErrorsCount: 0 };
    
    const totalSource = entities.reduce((acc, curr) => acc + curr.sourceCount, 0);
    const totalProd = entities.reduce((acc, curr) => {
      if (environment === 'Source') return acc + curr.sourceCount;
      if (environment === 'STG') return acc + curr.stgCount;
      return acc + curr.prodCount;
    }, 0);

    const successPct = totalSource > 0 ? (totalProd / totalSource) * 100 : 100;
    const totalDiff = entities.reduce((acc, curr) => acc + curr.difference, 0);
    const openErrorsCount = errors.filter(e => e.status !== 'Resolved' && e.status !== 'Rejected').length;

    return {
      successPct,
      totalDiff,
      openErrorsCount
    };
  }, [entities, errors, environment]);

  // Group entities by category
  const categories = useMemo(() => {
    const groups: Record<EntityMetadata['category'], EntityMetadata[]> = {
      Reference: [],
      MCS: [],
      PCS: [],
      Authoring: []
    };

    entities.forEach(ent => {
      groups[ent.category].push(ent);
    });

    return Object.entries(groups).map(([cat, list]) => {
      const catSource = list.reduce((acc, curr) => acc + curr.sourceCount, 0);
      const catProd = list.reduce((acc, curr) => {
        if (environment === 'Source') return acc + curr.sourceCount;
        if (environment === 'STG') return acc + curr.stgCount;
        return acc + curr.prodCount;
      }, 0);
      
      const pct = catSource > 0 ? (catProd / catSource) * 100 : 100;
      
      // Category overall status: if any is Critical -> Critical, else if any Warning -> Warning, else Healthy
      let status: EntityMetadata['status'] = 'Healthy';
      if (list.some(e => e.status === 'Critical')) {
        status = 'Critical';
      } else if (list.some(e => e.status === 'Warning')) {
        status = 'Warning';
      }

      return {
        name: cat as EntityMetadata['category'],
        pct,
        status,
        tablesCount: list.length,
        diffCount: list.reduce((acc, curr) => acc + curr.difference, 0)
      };
    });
  }, [entities, environment]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-white rounded-lg border border-slate-200 animate-pulse p-5">
              <div className="h-4 bg-slate-100 rounded w-1/3" />
              <div className="h-8 bg-slate-100 rounded w-2/3 mt-4" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 h-96 bg-white rounded-lg border border-slate-200 animate-pulse" />
          <div className="lg:col-span-2 h-96 bg-white rounded-lg border border-slate-200 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KPI 1: Migration Success */}
        <Card interactive onClick={() => setActivePage('health')}>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Migration Success
              </span>
              <h4 className="text-2xl font-extrabold text-slate-800 font-mono mt-1 leading-none tabular-nums">
                {stats.successPct.toFixed(2)}%
              </h4>
              <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Reconciled across {entities.length} tables</span>
              </p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* KPI 2: Open DQ Errors */}
        <Card interactive onClick={() => setActivePage('errors')}>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Active Data Errors
              </span>
              <h4 className="text-2xl font-extrabold text-slate-800 font-mono mt-1 leading-none tabular-nums">
                {stats.openErrorsCount}
              </h4>
              <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                <span>Blocking {stats.totalDiff.toLocaleString()} PROD records</span>
              </p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* KPI 3: Data Quality Index */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Data Quality Index
              </span>
              <h4 className="text-2xl font-extrabold text-slate-800 font-mono mt-1 leading-none tabular-nums">
                98.20%
              </h4>
              <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                <span>Exceeds GM 95.0% threshold</span>
              </p>
            </div>
            <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </Card>

      </div>

      {/* Main Row: Health Indicator + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Radial Anchor */}
        <Card title="Migration Health Index" subtitle="Overall completeness & schema validation metrics">
          <div className="py-6 flex flex-col items-center justify-center">
            <HealthRing migrationPct={stats.successPct} dataQualityPct={98.2} />
            <div className="mt-6 grid grid-cols-2 gap-4 w-full border-t border-slate-100 pt-4 text-center">
              <div>
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Completeness
                </span>
                <span className="text-sm font-bold text-slate-700 font-mono tabular-nums">
                  {stats.successPct.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Accuracy
                </span>
                <span className="text-sm font-bold text-slate-700 font-mono tabular-nums">
                  98.2%
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Column: Category Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Business Domain Coverage" subtitle="Status and count aggregates across GM structural sections">
            <div className="divide-y divide-slate-100">
              {categories.map((cat) => (
                <div key={cat.name} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-slate-800 font-display">
                      {cat.name}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{cat.tablesCount} Tables</span>
                      <span>•</span>
                      <span className="tabular-nums">{cat.diffCount.toLocaleString()} Diff</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-700 font-mono block tabular-nums">
                        {cat.pct.toFixed(2)}%
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                        COMPLETENESS
                      </span>
                    </div>
                    <Badge type="status" value={cat.status} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>

      {/* Bottom Row: Trend Line & Critical Table Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quality Trend Chart */}
        <Card className="lg:col-span-2" title="Data Quality Trend" subtitle="Progress curve of accuracy rating vs open anomalies">
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#005B94" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#005B94" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <YAxis domain={[94, 100]} tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }}
                  labelClassName="font-display font-semibold text-slate-800"
                />
                <Area type="monotone" dataKey="quality" stroke="#005B94" strokeWidth={2} fillOpacity={1} fill="url(#colorQuality)" name="Data Quality %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Critical Discrepancies Checklist */}
        <Card title="Priority Discrepancies" subtitle="Largest gaps by raw records difference count">
          <div className="space-y-4">
            {entities
              .filter(e => e.difference > 0)
              .sort((a, b) => b.difference - a.difference)
              .slice(0, 3)
              .map((entity) => (
                <div 
                  key={entity.id} 
                  onClick={() => {
                    setSelectedEntityId(entity.id);
                    setActivePage('entity');
                  }}
                  className="p-3 border border-slate-100 hover:border-slate-200 bg-slate-50 hover:bg-slate-100/50 rounded-lg cursor-pointer flex justify-between items-start transition-all"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-700 font-display">
                      {entity.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                      {entity.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-red-600 block tabular-nums">
                      -{entity.difference.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400 tabular-nums">
                      {entity.migrationPct.toFixed(1)}% success
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </Card>

      </div>

    </div>
  );
};
