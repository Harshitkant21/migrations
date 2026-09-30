// src/App.tsx
import React from 'react';
import { useGlobalStore } from './state/useGlobalStore';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './pages/LandingPage';

// 8 Workspace Stages
import { MigrationSetupStep } from './pages/journey/1_MigrationSetup';
import { SourceDiscoveryStep } from './pages/journey/2_SourceDiscovery';
import { TargetDefinitionStep } from './pages/journey/3_TargetDefinition';
import { MappingWorkspaceStep } from './pages/journey/4_MappingWorkspace';
import { ValidationStep } from './pages/journey/5_ValidationStep';
import { MigrationExecutionStep } from './pages/journey/6_ExecutionStep';
import { DashboardStep } from './pages/journey/7_DashboardStep';
import { MigrationReportStep } from './pages/journey/8_MigrationReport';

export default function App() {
  const { isLandingPage, activeStep } = useGlobalStore();

  // If on minimal landing screen, render without AppShell
  if (isLandingPage) {
    return <LandingPage />;
  }

  // Inside Workspace: render persistent enterprise AppShell with current step
  const renderStep = () => {
    switch (activeStep) {
      case 'setup':
        return <MigrationSetupStep />;
      case 'discovery':
        return <SourceDiscoveryStep />;
      case 'definition':
        return <TargetDefinitionStep />;
      case 'mapping':
        return <MappingWorkspaceStep />;
      case 'validation':
        return <ValidationStep />;
      case 'execution':
        return <MigrationExecutionStep />;
      case 'dashboard':
        return <DashboardStep />;
      case 'report':
        return <MigrationReportStep />;
      default:
        return <MigrationSetupStep />;
    }
  };

  return (
    <AppShell>
      {renderStep()}
    </AppShell>
  );
}
