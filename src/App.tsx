// src/App.tsx
import React from 'react';
import { AppShell } from './components/layout/AppShell';
import { useGlobalStore } from './state/useGlobalStore';

// 4 Primary Screen Imports
import { Overview } from './pages/Overview';
import { MigrationStatus } from './pages/MigrationStatus';
import { Mapping } from './pages/Mapping';
import { TableDetails } from './pages/TableDetails';

export default function App() {
  const { activePage } = useGlobalStore();

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <Overview />;
      case 'status':
        return <MigrationStatus />;
      case 'mapping':
        return <Mapping />;
      case 'details':
        return <TableDetails />;
      default:
        return <Overview />;
    }
  };

  return (
    <AppShell>
      {renderPage()}
    </AppShell>
  );
}
