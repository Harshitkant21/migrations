// src/components/ui/Timeline.tsx
import React from 'react';
import { Calendar, User, Check, Layers, Edit3, ShieldAlert } from 'lucide-react';

interface TimelineEvent {
  stage: 'Migration' | 'Author Change' | 'Review' | 'Approval' | 'Publication';
  timestamp: string;
  user?: string;
  details: string;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export const Timeline: React.FC<TimelineProps> = ({ events }) => {
  const getIcon = (stage: TimelineEvent['stage']) => {
    switch (stage) {
      case 'Migration':
        return <Layers className="w-4 h-4 text-slate-500" />;
      case 'Author Change':
        return <Edit3 className="w-4 h-4 text-brand-600" />;
      case 'Review':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      case 'Approval':
        return <Check className="w-4 h-4 text-emerald-500" />;
      case 'Publication':
        return <Check className="w-4 h-4 text-blue-500" />;
    }
  };

  const getBorderColor = (stage: TimelineEvent['stage']) => {
    switch (stage) {
      case 'Migration':
        return 'border-slate-200';
      case 'Author Change':
        return 'border-brand-200';
      case 'Review':
        return 'border-amber-200';
      case 'Approval':
        return 'border-emerald-200';
      case 'Publication':
        return 'border-blue-200';
    }
  };

  const getBgColor = (stage: TimelineEvent['stage']) => {
    switch (stage) {
      case 'Migration':
        return 'bg-slate-50';
      case 'Author Change':
        return 'bg-brand-50';
      case 'Review':
        return 'bg-amber-50';
      case 'Approval':
        return 'bg-emerald-50';
      case 'Publication':
        return 'bg-blue-50';
    }
  };

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {events.map((event, eventIdx) => (
          <li key={eventIdx}>
            <div className="relative pb-8">
              {/* Vertical connector line */}
              {eventIdx !== events.length - 1 ? (
                <span 
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" 
                  aria-hidden="true" 
                />
              ) : null}
              
              <div className="relative flex space-x-3">
                {/* Event Icon Circle */}
                <div>
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center border ${getBorderColor(event.stage)} ${getBgColor(event.stage)}`}>
                    {getIcon(event.stage)}
                  </span>
                </div>
                
                {/* Event Text Content */}
                <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-800 font-display">
                      {event.stage}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {event.details}
                    </p>
                    {event.user && (
                      <div className="mt-1 flex items-center text-[10px] text-slate-400">
                        <User className="w-3 h-3 mr-1" />
                        <span>{event.user}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Event Timestamp */}
                  <div className="text-right text-[10px] whitespace-nowrap text-slate-400 flex items-center h-fit">
                    <Calendar className="w-3 h-3 mr-1" />
                    <time dateTime={event.timestamp}>
                      {new Date(event.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </time>
                  </div>
                </div>

              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
