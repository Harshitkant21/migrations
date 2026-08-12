// src/state/useGlobalStore.ts
import { create } from 'zustand';
import { Environment, CopilotMessage } from '../types/models';

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

  // AI Copilot Drawer states
  copilotOpen: boolean;
  setCopilotOpen: (open: boolean) => void;
  copilotMessages: CopilotMessage[];
  addCopilotMessage: (message: CopilotMessage) => void;
  clearCopilotMessages: () => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  // Defaults
  environment: 'PROD',
  activePage: 'dashboard',
  selectedEntityId: null,
  selectedErrorId: null,
  selectedVehicleId: null,
  sidebarCollapsed: false,
  copilotOpen: false,
  copilotMessages: [
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am your AI Governance Copilot. Ask me questions about database mismatches, cascade impacts, or legacy system schemas.',
      timestamp: new Date().toISOString()
    }
  ],

  setEnvironment: (env) => set({ environment: env }),
  setActivePage: (page) => set({ activePage: page }),
  
  setSelectedEntityId: (id) => set((state) => {
    // Automatically transition activePage if desired or handled by caller
    return { selectedEntityId: id };
  }),
  
  setSelectedErrorId: (id) => set({ selectedErrorId: id }),
  setSelectedVehicleId: (id) => set({ selectedVehicleId: id }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setCopilotOpen: (open) => set({ copilotOpen: open }),
  
  addCopilotMessage: (message) => set((state) => ({ 
    copilotMessages: [...state.copilotMessages, message] 
  })),
  
  clearCopilotMessages: () => set({ 
    copilotMessages: [
      {
        id: 'welcome',
        sender: 'assistant',
        text: 'Hello! I am your AI Governance Copilot. Ask me questions about database mismatches, cascade impacts, or legacy system schemas.',
        timestamp: new Date().toISOString()
      }
    ] 
  })
}));
