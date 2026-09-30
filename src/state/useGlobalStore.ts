// src/state/useGlobalStore.ts
import { create } from 'zustand';
import { 
  Environment,
  WorkspaceStep,
  DashboardSubTab,
  DatabaseConnectionCard,
  MigrationIntent,
  MigrationConstraints,
  DiscoveredTable,
  ImpactAnalysisMetrics,
  TargetTableDef,
  ValidationIssue,
  ExecutionActivity,
  MigrationLogEntry,
  TableMappingDefinition
} from '../types/models';
import { 
  initialSources, 
  initialTargets, 
  initialIntent, 
  initialConstraints, 
  impactAnalysisData, 
  initialDiscoveredTables, 
  initialTargetTables, 
  journeyTableMappings, 
  initialValidationIssues, 
  executionActivities, 
  initialLogs 
} from '../data/journeyMockData';

export type PrimaryPageId = 
  | 'overview' | 'status' | 'mapping' | 'details' 
  | 'dashboard' | 'health' | 'entity' | 'errors' | 'cascade' | 'schema' | 'authoring' | 'drilldown' | 'audit';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface GlobalState {
  // Navigation State
  isLandingPage: boolean;
  setIsLandingPage: (isLanding: boolean) => void;
  activeStep: WorkspaceStep;
  setActiveStep: (step: WorkspaceStep) => void;
  dashboardTab: DashboardSubTab;
  setDashboardTab: (tab: DashboardSubTab) => void;
  
  // Previous migrations modal
  previousMigrationsModalOpen: boolean;
  setPreviousMigrationsModalOpen: (open: boolean) => void;

  // Demo mode quick-jump
  demoModeQuickJumpOpen: boolean;
  setDemoModeQuickJumpOpen: (open: boolean) => void;

  // Existing Dashboard compatible state
  environment: Environment;
  setEnvironment: (env: Environment) => void;
  activePage: PrimaryPageId;
  setActivePage: (page: PrimaryPageId) => void;
  selectedSourceDb: string;
  setSelectedSourceDb: (db: string) => void;
  selectedTargetDb: string;
  setSelectedTargetDb: (db: string) => void;
  selectedSourceTable: string;
  setSelectedSourceTable: (table: string) => void;
  selectedTargetTable: string;
  setSelectedTargetTable: (table: string) => void;
  selectedEntityId: string | null;
  setSelectedEntityId: (id: string | null) => void;
  selectedErrorId: string | null;
  setSelectedErrorId: (id: string | null) => void;
  selectedVehicleId: string | null;
  setSelectedVehicleId: (id: string | null) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  // Step 1: Setup State
  sources: DatabaseConnectionCard[];
  targets: DatabaseConnectionCard[];
  selectedSourceEngine: string;
  setSelectedSourceEngine: (engine: string) => void;
  connectionForm: {
    host: string;
    port: string;
    database: string;
    username: string;
    ssl: boolean;
    connectionString: string;
  };
  setConnectionForm: (patch: Partial<GlobalState['connectionForm']>) => void;
  connectionTesting: boolean;
  connectionConnected: boolean;
  connectSource: () => Promise<void>;
  migrationIntent: MigrationIntent;
  setMigrationIntent: (patch: Partial<MigrationIntent>) => void;
  migrationConstraints: MigrationConstraints;
  setMigrationConstraints: (patch: Partial<MigrationConstraints>) => void;
  isDraftSaved: boolean;
  setIsDraftSaved: (saved: boolean) => void;
  addSourceModalOpen: boolean;
  setAddSourceModalOpen: (open: boolean) => void;
  addTargetModalOpen: boolean;
  setAddTargetModalOpen: (open: boolean) => void;

  // Step 2: Discovery State
  discoveredTables: DiscoveredTable[];
  impactAnalysis: ImpactAnalysisMetrics;
  tableSearchQuery: string;
  setTableSearchQuery: (query: string) => void;
  schemaFilter: string;
  setSchemaFilter: (schema: string) => void;
  verificationFilter: 'ALL' | 'VERIFIED' | 'NEEDS_REVIEW' | 'INVALID';
  setVerificationFilter: (filter: 'ALL' | 'VERIFIED' | 'NEEDS_REVIEW' | 'INVALID') => void;
  toggleIncludeTable: (id: string) => void;
  verifyTable: (id: string, status: 'VERIFIED' | 'NEEDS_REVIEW' | 'INVALID') => void;
  verifyAllTables: () => void;
  excludeInvalidTables: () => void;

  // Step 3: Target Definition State
  targetTablesList: TargetTableDef[];
  activeTargetTableId: string;
  setActiveTargetTableId: (id: string) => void;
  createTargetTableModalOpen: boolean;
  setCreateTargetTableModalOpen: (open: boolean) => void;
  editTargetTableModalOpen: boolean;
  setEditTargetTableModalOpen: (open: boolean) => void;
  addTargetTable: (table: TargetTableDef) => void;
  updateTargetTable: (tableId: string, patch: Partial<TargetTableDef>) => void;
  addColumnToTargetTable: (tableId: string, col: TargetTableDef['columns'][0]) => void;

  // Step 4: Mapping State
  mappingStrategy: 'preserve' | 'optimize' | 'custom';
  setMappingStrategy: (strat: 'preserve' | 'optimize' | 'custom') => void;
  relationshipFilter: 'ALL' | '1:1' | '1:N' | 'N:1' | 'N:N';
  setRelationshipFilter: (filter: 'ALL' | '1:1' | '1:N' | 'N:1' | 'N:N') => void;
  tableMappings: TableMappingDefinition[];
  createMappingDrawerOpen: boolean;
  setCreateMappingDrawerOpen: (open: boolean) => void;
  uploadJsonModalOpen: boolean;
  setUploadJsonModalOpen: (open: boolean) => void;
  importMappingJson: (jsonStr: string) => void;
  addMappingRule: (rule: TableMappingDefinition) => void;
  applySuggestedMappings: () => void;

  // Step 5: Validation State
  readinessScore: number;
  validationIssues: ValidationIssue[];
  criticalIssuesResolved: boolean;
  fixIssues: () => void;

  // Step 6: Execution State
  executionStatus: 'running' | 'paused' | 'stopped' | 'completed';
  executionProgress: number;
  executionActivities: ExecutionActivity[];
  executionLogs: MigrationLogEntry[];
  logFilter: 'ALL' | 'SUCCESS' | 'WARNING' | 'ERROR';
  setLogFilter: (filter: 'ALL' | 'SUCCESS' | 'WARNING' | 'ERROR') => void;
  pauseExecution: () => void;
  resumeExecution: () => void;
  retryFailedExecution: () => void;
  stopExecution: () => void;
  completeExecution: () => void;
}

export const useGlobalStore = create<GlobalState>((set, get) => ({
  // Navigation Defaults
  isLandingPage: true,
  setIsLandingPage: (isLanding) => set({ isLandingPage: isLanding }),
  activeStep: 'setup',
  setActiveStep: (step) => {
    set({ activeStep: step });
    // Keep activePage in sync if navigating to dashboard
    if (step === 'dashboard') {
      const currentTab = get().dashboardTab;
      if (currentTab === 'overview') set({ activePage: 'overview' });
      else if (currentTab === 'status') set({ activePage: 'status' });
      else if (currentTab === 'mapping_view') set({ activePage: 'mapping' });
      else if (currentTab === 'details') set({ activePage: 'details' });
    }
  },
  dashboardTab: 'overview',
  setDashboardTab: (tab) => {
    set({ dashboardTab: tab });
    if (tab === 'overview') set({ activePage: 'overview' });
    else if (tab === 'status') set({ activePage: 'status' });
    else if (tab === 'mapping_view') set({ activePage: 'mapping' });
    else if (tab === 'details') set({ activePage: 'details' });
  },

  previousMigrationsModalOpen: false,
  setPreviousMigrationsModalOpen: (open) => set({ previousMigrationsModalOpen: open }),

  demoModeQuickJumpOpen: false,
  setDemoModeQuickJumpOpen: (open) => set({ demoModeQuickJumpOpen: open }),

  // Existing Dashboard backwards compatibility
  environment: 'PROD',
  setEnvironment: (env) => set({ environment: env }),
  activePage: 'overview',
  setActivePage: (page) => {
    if (page === 'overview') set({ activePage: 'overview', dashboardTab: 'overview' });
    else if (page === 'status') set({ activePage: 'status', dashboardTab: 'status' });
    else if (page === 'mapping') set({ activePage: 'mapping', dashboardTab: 'mapping_view' });
    else if (page === 'details') set({ activePage: 'details', dashboardTab: 'details' });
    else set({ activePage: 'overview', dashboardTab: 'overview' });
  },
  selectedSourceDb: 'aws-east-pg01.internal',
  setSelectedSourceDb: (db) => set({ selectedSourceDb: db }),
  selectedTargetDb: 'pg-cloud-aurora.internal',
  setSelectedTargetDb: (db) => set({ selectedTargetDb: db }),
  selectedSourceTable: 'orders',
  setSelectedSourceTable: (table) => set({ selectedSourceTable: table }),
  selectedTargetTable: 'orders',
  setSelectedTargetTable: (table) => set({ selectedTargetTable: table }),
  selectedEntityId: 'orders',
  setSelectedEntityId: (id) => set({ selectedEntityId: id, selectedTargetTable: id || 'orders' }),
  selectedErrorId: null,
  setSelectedErrorId: (id) => set({ selectedErrorId: id }),
  selectedVehicleId: null,
  setSelectedVehicleId: (id) => set({ selectedVehicleId: id }),
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  // Toasts
  toasts: [],
  addToast: (message, type = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },

  // Step 1: Setup State
  sources: initialSources,
  targets: initialTargets,
  selectedSourceEngine: 'PostgreSQL',
  setSelectedSourceEngine: (engine) => set({ selectedSourceEngine: engine }),
  connectionForm: {
    host: 'aws-east-pg01.internal',
    port: '5432',
    database: 'production_core_db',
    username: 'migrator_svc',
    ssl: true,
    connectionString: 'postgresql://migrator_svc:••••••••@aws-east-pg01.internal:5432/production_core_db?sslmode=require'
  },
  setConnectionForm: (patch) => {
    set((state) => ({
      connectionForm: { ...state.connectionForm, ...patch },
      isDraftSaved: true
    }));
  },
  connectionTesting: false,
  connectionConnected: true,
  connectSource: async () => {
    set({ connectionTesting: true });
    await new Promise(resolve => setTimeout(resolve, 900));
    set({ connectionTesting: false, connectionConnected: true });
    get().addToast('Connected successfully to aws-east-pg01.internal:5432 (PostgreSQL 14.9)', 'success');
  },
  migrationIntent: initialIntent,
  setMigrationIntent: (patch) => {
    set((state) => ({
      migrationIntent: { ...state.migrationIntent, ...patch },
      isDraftSaved: true
    }));
  },
  migrationConstraints: initialConstraints,
  setMigrationConstraints: (patch) => {
    set((state) => ({
      migrationConstraints: { ...state.migrationConstraints, ...patch },
      isDraftSaved: true
    }));
  },
  isDraftSaved: true,
  setIsDraftSaved: (saved) => set({ isDraftSaved: saved }),
  addSourceModalOpen: false,
  setAddSourceModalOpen: (open) => set({ addSourceModalOpen: open }),
  addTargetModalOpen: false,
  setAddTargetModalOpen: (open) => set({ addTargetModalOpen: open }),

  // Step 2: Discovery State
  discoveredTables: initialDiscoveredTables,
  impactAnalysis: impactAnalysisData,
  tableSearchQuery: '',
  setTableSearchQuery: (query) => set({ tableSearchQuery: query }),
  schemaFilter: 'ALL',
  setSchemaFilter: (schema) => set({ schemaFilter: schema }),
  verificationFilter: 'ALL',
  setVerificationFilter: (filter) => set({ verificationFilter: filter }),
  toggleIncludeTable: (id) => {
    set((state) => ({
      discoveredTables: state.discoveredTables.map(t => 
        t.id === id ? { ...t, isIncluded: !t.isIncluded } : t
      ),
      isDraftSaved: true
    }));
  },
  verifyTable: (id, status) => {
    set((state) => ({
      discoveredTables: state.discoveredTables.map(t => 
        t.id === id ? { ...t, status } : t
      ),
      isDraftSaved: true
    }));
    get().addToast(`Table updated to ${status}`, 'info');
  },
  verifyAllTables: () => {
    set((state) => ({
      discoveredTables: state.discoveredTables.map(t => ({ ...t, status: 'VERIFIED', isIncluded: true })),
      isDraftSaved: true
    }));
    get().addToast('All 245 discovered tables marked as Verified', 'success');
  },
  excludeInvalidTables: () => {
    set((state) => ({
      discoveredTables: state.discoveredTables.map(t => 
        t.status === 'INVALID' ? { ...t, isIncluded: false } : t
      ),
      isDraftSaved: true
    }));
    get().addToast('Excluded invalid tables from migration scope', 'info');
  },

  // Step 3: Target Definition State
  targetTablesList: initialTargetTables,
  activeTargetTableId: 'tgt-customer-profile',
  setActiveTargetTableId: (id) => set({ activeTargetTableId: id }),
  createTargetTableModalOpen: false,
  setCreateTargetTableModalOpen: (open) => set({ createTargetTableModalOpen: open }),
  editTargetTableModalOpen: false,
  setEditTargetTableModalOpen: (open) => set({ editTargetTableModalOpen: open }),
  addTargetTable: (table) => {
    set((state) => ({
      targetTablesList: [...state.targetTablesList, table],
      activeTargetTableId: table.id,
      isDraftSaved: true
    }));
    get().addToast(`Target table ${table.name} created`, 'success');
  },
  updateTargetTable: (tableId, patch) => {
    set((state) => ({
      targetTablesList: state.targetTablesList.map(t => 
        t.id === tableId ? { ...t, ...patch } : t
      ),
      isDraftSaved: true
    }));
    get().addToast('Target table updated', 'success');
  },
  addColumnToTargetTable: (tableId, col) => {
    set((state) => ({
      targetTablesList: state.targetTablesList.map(t => 
        t.id === tableId ? { ...t, columns: [...t.columns, col] } : t
      ),
      isDraftSaved: true
    }));
    get().addToast(`Column ${col.name} added to table`, 'success');
  },

  // Step 4: Mapping State
  mappingStrategy: 'optimize',
  setMappingStrategy: (strat) => {
    set({ mappingStrategy: strat, isDraftSaved: true });
    get().addToast(`Mapping strategy set to ${strat}`, 'info');
  },
  relationshipFilter: 'ALL',
  setRelationshipFilter: (filter) => set({ relationshipFilter: filter }),
  tableMappings: journeyTableMappings,
  createMappingDrawerOpen: false,
  setCreateMappingDrawerOpen: (open) => set({ createMappingDrawerOpen: open }),
  uploadJsonModalOpen: false,
  setUploadJsonModalOpen: (open) => set({ uploadJsonModalOpen: open }),
  importMappingJson: (_jsonStr) => {
    set({ uploadJsonModalOpen: false, isDraftSaved: true });
    get().addToast('Mapping imported successfully: 245 mappings, 18 transformations, 4 merge rules, 7 split rules', 'success');
  },
  addMappingRule: (rule) => {
    set((state) => ({
      tableMappings: [rule, ...state.tableMappings],
      createMappingDrawerOpen: false,
      isDraftSaved: true
    }));
    get().addToast(`Created mapping rule: ${rule.title}`, 'success');
  },
  applySuggestedMappings: () => {
    set({ isDraftSaved: true });
    get().addToast('Applied 238 suggested mappings with 98% heuristic confidence', 'success');
  },

  // Step 5: Validation State
  readinessScore: 92,
  validationIssues: initialValidationIssues,
  criticalIssuesResolved: false,
  fixIssues: () => {
    set((state) => ({
      readinessScore: 100,
      criticalIssuesResolved: true,
      validationIssues: state.validationIssues.map(issue => 
        issue.severity === 'Critical' 
          ? { ...issue, isResolved: true, severity: 'Passed' as const } 
          : issue
      )
    }));
    get().addToast('Remediation applied: 2 critical type conflicts resolved. Readiness is now 100%.', 'success');
  },

  // Step 6: Execution State
  executionStatus: 'running',
  executionProgress: 68.4,
  executionActivities: executionActivities,
  executionLogs: initialLogs,
  logFilter: 'ALL',
  setLogFilter: (filter) => set({ logFilter: filter }),
  pauseExecution: () => {
    set({ executionStatus: 'paused' });
    get().addToast('Migration pipeline paused by operator', 'warning');
  },
  resumeExecution: () => {
    set({ executionStatus: 'running' });
    get().addToast('Migration pipeline resumed', 'info');
  },
  retryFailedExecution: () => {
    const retryLog: MigrationLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      table: 'customers',
      step: 'Loading',
      status: 'success',
      message: 'Retried 42,381 quarantined records with normalized FK fallback'
    };
    set((state) => ({
      executionLogs: [retryLog, ...state.executionLogs]
    }));
    get().addToast('Retry scheduled for 42.3K quarantined records', 'info');
  },
  stopExecution: () => {
    set({ executionStatus: 'stopped' });
    get().addToast('Migration aborted gracefully', 'error');
  },
  completeExecution: () => {
    set({ executionStatus: 'completed', executionProgress: 100 });
    get().addToast('Migration complete: 221 tables migrated successfully', 'success');
    get().setActiveStep('dashboard');
  }
}));
