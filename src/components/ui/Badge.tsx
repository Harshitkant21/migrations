// src/components/ui/Badge.tsx
import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { MigrationStatus, SeverityType, AuditStatus } from '../../types/models';

interface BadgeProps {
  type: 'status' | 'severity' | 'audit';
  value: MigrationStatus | SeverityType | AuditStatus | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, value, className = '' }) => {
  let bgClass = 'bg-slate-100 text-slate-800';
  let icon = <Info className="w-3.5 h-3.5 mr-1" />;
  let label = String(value);

  if (type === 'status') {
    switch (value as MigrationStatus) {
      case 'Healthy':
        bgClass = 'bg-emerald-50 text-emerald-800 border-emerald-200/60';
        icon = <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />;
        break;
      case 'Warning':
        bgClass = 'bg-amber-50 text-amber-800 border-amber-200/60';
        icon = <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />;
        break;
      case 'Critical':
        bgClass = 'bg-red-50 text-red-800 border-red-200/60';
        icon = <AlertCircle className="w-3.5 h-3.5 mr-1 text-red-600" />;
        break;
    }
  } else if (type === 'severity') {
    switch (value as SeverityType) {
      case 'Low':
        bgClass = 'bg-slate-50 text-slate-700 border-slate-200/80';
        icon = <Info className="w-3.5 h-3.5 mr-1 text-slate-500" />;
        break;
      case 'Medium':
        bgClass = 'bg-amber-50 text-amber-800 border-amber-200/60';
        icon = <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-500" />;
        break;
      case 'High':
        bgClass = 'bg-red-50 text-red-800 border-red-200/60';
        icon = <AlertCircle className="w-3.5 h-3.5 mr-1 text-red-500" />;
        break;
    }
  } else if (type === 'audit') {
    switch (value as AuditStatus) {
      case 'Pending':
        bgClass = 'bg-amber-50 text-amber-800 border-amber-200/60';
        icon = <Info className="w-3.5 h-3.5 mr-1 text-amber-500" />;
        break;
      case 'Approved':
        bgClass = 'bg-emerald-50 text-emerald-800 border-emerald-200/60';
        icon = <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />;
        break;
      case 'Rejected':
        bgClass = 'bg-red-50 text-red-800 border-red-200/60';
        icon = <AlertCircle className="w-3.5 h-3.5 mr-1 text-red-500" />;
        break;
      case 'Published':
        bgClass = 'bg-blue-50 text-blue-800 border-blue-200/60';
        icon = <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-blue-500" />;
        break;
    }
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${bgClass} ${className}`}>
      {icon}
      {label}
    </span>
  );
};
