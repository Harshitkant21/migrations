// src/state/useGlobalStore.ts
import { create } from 'zustand';
import { Environment } from '../types/models';

export type PrimaryPageId = 
  | 'overview' | 'status' | 'mapping' | 'details' 
  | 'dashboard' | 'health' | 'entity' | 'errors' | 'cascade' | 'schema' | 'authoring' | 'drilldown' | 'audit';

interface GlobalState {
  // Database Environment state
  environment: Environment;
  setEnvironment: (env: Environment) => void;

  // Active navigation states (4 primary screens)
  activePage: PrimaryPageId;
  setActivePage: (page: PrimaryPageId) => void;

  // Multi-database selection context
  selectedSourceDb: string;
  setSelectedSourceDb: (db: string) => void;
  selectedTargetDb: string;
  setSelectedTargetDb: (db: string) => void;

  // Table selection context
  selectedSourceTable: string;
  setSelectedSourceTable: (table: string) => void;
  selectedTargetTable: string;
  setSelectedTargetTable: (table: string) => void;

  // Active investigation contexts (cross-navigation targets)
  selectedEntityId: string | null;
  setSelectedEntityId: (id: string | null) => void;

  selectedErrorId: string | null;
  setSelectedErrorId: (id: string | null) => void;

  selectedVehicleId: string | null;
  setSelectedVehicleId: (id: string | null) => void;

  // Layout UI states
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const mapPageAlias = (page: PrimaryPageId): PrimaryPageId => {
  if (page === 'dashboard' || page === 'overview') return 'overview';
  if (page === 'health' || page === 'status') return 'status';
  if (page === 'entity' || page === 'schema' || page === 'mapping') return 'mapping';
  if (page === 'errors' || page === 'cascade' || page === 'authoring' || page === 'audit' || page === 'drilldown' || page === 'details') return 'details';
  return 'overview';
};

export const useGlobalStore = create<GlobalState>((set) => ({
  // Defaults
  environment: 'PROD',
  activePage: 'overview',
  
  selectedSourceDb: 'legacy_db_01',
  selectedTargetDb: 'prod_db_01',
  selectedSourceTable: 'LEGACY_VHCLS',
  selectedTargetTable: 'vehicles',

  selectedEntityId: 'vehicles',
  selectedErrorId: null,
  selectedVehicleId: null,
  sidebarCollapsed: false,

  setEnvironment: (env) => set({ environment: env }),
  setActivePage: (page) => set({ activePage: mapPageAlias(page) }),
  
  setSelectedSourceDb: (db) => set({ selectedSourceDb: db }),
  setSelectedTargetDb: (db) => set({ selectedTargetDb: db }),
  setSelectedSourceTable: (table) => set({ selectedSourceTable: table }),
  setSelectedTargetTable: (table) => set({ selectedTargetTable: table }),

  setSelectedEntityId: (id) => set({ selectedEntityId: id, selectedTargetTable: id || 'vehicles' }),
  setSelectedErrorId: (id) => set({ selectedErrorId: id }),
  setSelectedVehicleId: (id) => set({ selectedVehicleId: id }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
}));

