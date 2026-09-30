// src/components/journey/ConnectionCard.tsx
import React from 'react';
import { DatabaseConnectionCard } from '../../types/models';
import { Database, Server, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface ConnectionCardProps {
  card: DatabaseConnectionCard;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  card,
  isSelected = false,
  onSelect
}) => {
  const isPostgres = card.type === 'PostgreSQL';
  const isConnected = card.status === 'Connected' || card.status === 'Ready';

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border transition-all text-left relative ${
        isSelected 
          ? 'bg-white border-slate-900 ring-2 ring-slate-900/10 shadow-xs' 
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
      } ${onSelect ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
            isPostgres ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {isPostgres ? 'PG' : 'MY'}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 font-mono tracking-tight flex items-center gap-1.5">
              {card.name}
            </h4>
            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
              <Server className="w-3 h-3 text-slate-400" />
              <span>{card.host}:{card.port}</span>
            </div>
          </div>
        </div>

        <Badge
          variant={isConnected ? 'success' : card.status === 'Testing' ? 'warning' : 'error'}
          size="sm"
          dot
        >
          {card.status}
        </Badge>
      </div>

      {/* Database & Schema / Table Stats */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="bg-slate-50 p-2 rounded-md">
          <div className="text-[10px] text-slate-400 font-medium">SCHEMAS</div>
          <div className="text-slate-900 font-bold mt-0.5">{card.schemaCount}</div>
        </div>
        <div className="bg-slate-50 p-2 rounded-md">
          <div className="text-[10px] text-slate-400 font-medium">TABLES</div>
          <div className="text-slate-900 font-bold mt-0.5">{card.tableCount}</div>
        </div>
      </div>

      <div className="mt-2 text-[10px] font-mono text-slate-400 truncate">
        Database: <span className="text-slate-600 font-medium">{card.database}</span>
      </div>
    </div>
  );
};
