// src/components/ui/HealthRing.tsx
import React from 'react';

interface HealthRingProps {
  migrationPct: number;
  dataQualityPct: number;
  size?: number;
  strokeWidth?: number;
}

export const HealthRing: React.FC<HealthRingProps> = ({
  migrationPct,
  dataQualityPct,
  size = 240,
  strokeWidth = 14
}) => {
  const radiusOuter = (size / 2) - strokeWidth;
  const circumferenceOuter = 2 * Math.PI * radiusOuter;
  const strokeDashoffsetOuter = circumferenceOuter - (migrationPct / 100) * circumferenceOuter;

  const strokeWidthInner = strokeWidth - 4;
  const radiusInner = radiusOuter - strokeWidth - 6;
  const circumferenceInner = 2 * Math.PI * radiusInner;
  const strokeDashoffsetInner = circumferenceInner - (dataQualityPct / 100) * circumferenceInner;

  // Determine semantic colors
  const getOuterColor = (pct: number) => {
    if (pct >= 98) return 'text-emerald-500';
    if (pct >= 90) return 'text-amber-500';
    return 'text-red-500';
  };

  const getInnerColor = (pct: number) => {
    if (pct >= 98) return 'text-emerald-400';
    if (pct >= 90) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <svg 
        width={size} 
        height={size} 
        className="transform -rotate-90 filter drop-shadow-sm transition-transform duration-500"
      >
        {/* Outer Circle Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radiusOuter}
          className="stroke-slate-100 fill-transparent"
          strokeWidth={strokeWidth}
        />
        
        {/* Outer Circle Progress (Migration Success) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radiusOuter}
          className={`${getOuterColor(migrationPct)} fill-transparent transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumferenceOuter}
          strokeDashoffset={strokeDashoffsetOuter}
          strokeLinecap="round"
        />

        {/* Inner Circle Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radiusInner}
          className="stroke-slate-100 fill-transparent"
          strokeWidth={strokeWidthInner}
        />

        {/* Inner Circle Progress (Data Quality) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radiusInner}
          className={`${getInnerColor(dataQualityPct)} fill-transparent transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidthInner}
          strokeDasharray={circumferenceInner}
          strokeDashoffset={strokeDashoffsetInner}
          strokeLinecap="round"
        />
      </svg>

      {/* Embedded Text Layer */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-extrabold font-display text-slate-800 tracking-tight leading-none tabular-nums">
          {migrationPct.toFixed(1)}%
        </span>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">
          MIGRATION SCORE
        </span>
        <div className="mt-2 flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 border border-slate-200/60 rounded text-[10px] font-medium text-slate-600">
          <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400`} />
          <span>DQ: {dataQualityPct.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};
