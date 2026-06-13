import { create } from "zustand";

export type ConnectionStatus = "connecting" | "online" | "offline";

export interface FederationAgent {
  id: string;
  name?: string;
  status?: string;
  currentTask?: string;
  [key: string]: unknown;
}

export interface FederationState {
  status: ConnectionStatus;
  events: string[];
  agents: FederationAgent[];
  isDrawerOpen: boolean;
  setStatus: (status: ConnectionStatus) => void;
  addEvent: (event: string) => void;
  setAgents: (agents: FederationAgent[]) => void;
  updateAgent: (agent: FederationAgent) => void;
  setDrawerOpen: (isOpen: boolean) => void;
}

export const useFederationStore = create<FederationState>((set) => ({
  status: "connecting",
  events: [],
  agents: [],
  isDrawerOpen: false,
  setStatus: (status) => set({ status }),
  addEvent: (event) =>
    set((state) => ({ events: [event, ...state.events].slice(0, 100) })), // Keep last 100 events
  setAgents: (agents) => set({ agents }),
  updateAgent: (agent) =>
    set((state) => {
      const existingIndex = state.agents.findIndex((a) => a.id === agent.id);
      if (existingIndex >= 0) {
        const newAgents = [...state.agents];
        newAgents[existingIndex] = { ...newAgents[existingIndex], ...agent };
        return { agents: newAgents };
      }
      return { agents: [...state.agents, agent] };
    }),
  setDrawerOpen: (isDrawerOpen) => set({ isDrawerOpen }),
}));
