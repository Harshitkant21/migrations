// src/state/useGlobalStore.ts
import { create } from 'zustand';
import { Environment } from '../types/models';

interface GlobalState {
  // Database Environment state
  environment: Environment;
  setEnvironment: (env: Environment) => void;

  // Active navigation states (used as client-side route tracking)
  activePage: 'dashboard' | 'health' | 'entity' | 'errors' | 'cascade' | 'schema' | 'authoring' | 'drilldown' | 'audit';
  setActivePage: (page: GlobalState['activePage']) => void;

  // Active investigation contexts (drilldown targets)
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

export const useGlobalStore = create<GlobalState>((set) => ({
  // Defaults
  environment: 'PROD',
  activePage: 'dashboard',
  selectedEntityId: null,
  selectedErrorId: null,
  selectedVehicleId: null,
  sidebarCollapsed: false,

  setEnvironment: (env) => set({ environment: env }),
  setActivePage: (page) => set({ activePage: page }),
  
  setSelectedEntityId: (id) => set(() => ({ selectedEntityId: id })),
  setSelectedErrorId: (id) => set({ selectedErrorId: id }),
  setSelectedVehicleId: (id) => set({ selectedVehicleId: id }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
}));
