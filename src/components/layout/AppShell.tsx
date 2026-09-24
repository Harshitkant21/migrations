// src/components/layout/AppShell.tsx
import React from 'react';
import { Header } from './Header';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Single Clear Top Navigation Bar */}
      <Header />

      {/* Main Page Container */}
      <main className="flex-1 overflow-y-auto p-6 relative">
        <div className="max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
