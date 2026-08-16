// src/components/layout/AppShell.tsx
import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useGlobalStore } from '../../state/useGlobalStore';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { sidebarCollapsed } = useGlobalStore();

  return (
    <div className="min-h-screen bg-canvas flex flex-row">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Universal Header */}
        <Header />

        {/* Dynamic Page Canvas */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
