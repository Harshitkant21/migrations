// src/components/layout/AppShell.tsx
import React from 'react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { TopBar } from './TopBar';
import { SidebarNav } from './SidebarNav';
import { DemoJumperModal } from './DemoJumperModal';
import { ToastContainer } from '../ui/ToastContainer';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { sidebarCollapsed, setSidebarCollapsed } = useGlobalStore();

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-slate-50 flex flex-col font-sans relative">
      {/* Top Bar Navigation */}
      <TopBar />

      {/* Main Workspace with Persistent Left Sidebar */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* Mobile Backdrop when sidebar drawer is open */}
        {!sidebarCollapsed && (
          <div 
            onClick={() => setSidebarCollapsed(true)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden transition-opacity"
            aria-hidden="true"
          />
        )}

        {/* Sidebar Navigation */}
        <SidebarNav />

        {/* Scrollable Work Area with responsive margins */}
        <main className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 md:p-8 w-full max-w-full">
          <div className="max-w-[1440px] mx-auto space-y-5 pb-12 w-full max-w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Global Presentation Helpers */}
      <DemoJumperModal />
      <ToastContainer />
    </div>
  );
};
