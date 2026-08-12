// src/App.tsx
import React from 'react';
import { AppShell } from './components/layout/AppShell';
import { useGlobalStore } from './state/useGlobalStore';

// Page Imports
import { Dashboard } from './pages/Dashboard';
import { MigrationHealth } from './pages/MigrationHealth';
import { EntityExplorer } from './pages/EntityExplorer';
import { ErrorCentre } from './pages/ErrorCentre';
import { CascadeAnalysis } from './pages/CascadeAnalysis';
import { SchemaExplorer } from './pages/SchemaExplorer';
import { AuthorChanges } from './pages/AuthorChanges';
import { PageDrilldown } from './pages/PageDrilldown';
import { AuditHistory } from './pages/AuditHistory';

export default function App() {
  const { activePage } = useGlobalStore();

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'health':
        return <MigrationHealth />;
      case 'entity':
        return <EntityExplorer />;
      case 'errors':
        return <ErrorCentre />;
      case 'cascade':
        return <CascadeAnalysis />;
      case 'schema':
        return <SchemaExplorer />;
      case 'authoring':
        return <AuthorChanges />;
      case 'drilldown':
        return <PageDrilldown />;
      case 'audit':
        return <AuditHistory />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppShell>
      {renderPage()}
    </AppShell>
  );
}
