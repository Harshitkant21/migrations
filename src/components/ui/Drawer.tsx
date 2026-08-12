// src/components/ui/Drawer.tsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  widthClass?: string; // e.g. "max-w-md" or "max-w-xl"
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  widthClass = 'max-w-md'
}) => {
  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        {/* Dark overlay backdrop */}
        <div 
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300" 
          onClick={onClose}
          aria-hidden="true"
        />

        <div className="pointer-events-none fixed inset-y-0 right-0 flex pl-10">
          <div className={`pointer-events-auto w-screen ${widthClass} transform transition-transform duration-300 ease-in-out`}>
            <div className="flex h-full flex-col overflow-y-scroll bg-surface shadow-2xl border-l border-slate-200">
              
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-start justify-between">
                <div className="pr-4">
                  <h2 className="text-base font-semibold font-display text-slate-800" id="slide-over-title">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-xs text-slate-400 mt-1">
                      {subtitle}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className="rounded-md text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand"
                  onClick={onClose}
                >
                  <span className="sr-only">Close panel</span>
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="relative flex-1 px-6 py-5 overflow-y-auto">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
