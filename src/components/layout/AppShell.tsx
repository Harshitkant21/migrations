// src/components/layout/AppShell.tsx
import React from 'react';
import { TopBar } from './TopBar';
import { SidebarNav } from './SidebarNav';
import { DemoJumperModal } from './DemoJumperModal';
import { ToastContainer } from '../ui/ToastContainer';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <TopBar />

      {/* Main Workspace with Persistent Left Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <SidebarNav />

        {/* Scrollable Work Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-[1440px] mx-auto space-y-6">
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
