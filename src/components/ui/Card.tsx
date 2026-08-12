// src/components/ui/Card.tsx
import React from 'react';

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: string | React.ReactNode;
  subtitle?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  extra,
  children,
  interactive = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-surface border border-slate-200/80 rounded-lg shadow-premium transition-all duration-200 
        ${interactive ? 'hover:shadow-premiumHover hover:border-slate-300 cursor-pointer active:scale-[0.99]' : ''} 
        ${className}`}
      {...props}
    >
      {(title || subtitle || extra) && (
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-sm font-semibold font-display text-slate-800">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {extra && <div>{extra}</div>}
        </div>
      )}
      <div className="px-5 py-4">
        {children}
      </div>
    </div>
  );
};
