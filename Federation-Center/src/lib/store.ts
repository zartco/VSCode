import { create } from "zustand";
import { AgentNode, TaskNode, AgentEvent } from "@/contracts/types";

export type ConnectionStatus = "connecting" | "online" | "offline";

export interface FederationAgent extends AgentNode {
  currentTask?: string;
}

export interface FederationState {
  status: ConnectionStatus;
  events: string[]; // string logs for backward compatibility in Drawer
  agents: FederationAgent[];
  tasks: TaskNode[];
  rawEvents: AgentEvent[];
  selectedAgentId: string | null;
  isDrawerOpen: boolean;
  
  setStatus: (status: ConnectionStatus) => void;
  addEvent: (event: string) => void;
  setEvents: (events: string[]) => void;
  
  setAgents: (agents: FederationAgent[]) => void;
  updateAgent: (agent: FederationAgent) => void;
  
  setTasks: (tasks: TaskNode[]) => void;
  updateTask: (task: TaskNode) => void;
  
  setRawEvents: (events: AgentEvent[]) => void;
  addRawEvent: (event: AgentEvent) => void;
  
  setSelectedAgentId: (id: string | null) => void;
  setDrawerOpen: (isOpen: boolean) => void;
}

export const useFederationStore = create<FederationState>((set) => ({
  status: "connecting",
  events: [],
  agents: [],
  tasks: [],
  rawEvents: [],
  selectedAgentId: null,
  isDrawerOpen: false,
  
  setStatus: (status) => set({ status }),
  
  addEvent: (event) =>
    set((state) => ({ events: [event, ...state.events].slice(0, 100) })),
    
  setEvents: (events) => set({ events }),
  
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
    
  setTasks: (tasks) => set({ tasks }),
  
  updateTask: (task) =>
    set((state) => {
      const existingIndex = state.tasks.findIndex((t) => t.id === task.id);
      const newAgents = [...state.agents];
      // Update agent's currentTask if status is running
      const agentIndex = newAgents.findIndex((a) => a.id === task.agentId);
      if (agentIndex >= 0) {
        if (task.status === "running") {
          newAgents[agentIndex] = {
            ...newAgents[agentIndex],
            currentTask: task.description,
          };
        } else if (
          task.status === "completed" ||
          task.status === "failed"
        ) {
          if (newAgents[agentIndex].currentTask === task.description) {
            newAgents[agentIndex] = {
              ...newAgents[agentIndex],
              currentTask: undefined,
            };
          }
        }
      }
      
      if (existingIndex >= 0) {
        const newTasks = [...state.tasks];
        newTasks[existingIndex] = { ...newTasks[existingIndex], ...task };
        return { tasks: newTasks, agents: newAgents };
      }
      return { tasks: [...state.tasks, task], agents: newAgents };
    }),
    
  setRawEvents: (rawEvents) => set({ rawEvents }),
  
  addRawEvent: (event) =>
    set((state) => {
      // Deduplicate events by ID
      if (state.rawEvents.some((e) => e.id === event.id && e.agentId === event.agentId)) {
        return {};
      }
      return { rawEvents: [event, ...state.rawEvents] };
    }),
    
  setSelectedAgentId: (selectedAgentId) => set({ selectedAgentId }),
  
  setDrawerOpen: (isDrawerOpen) => set({ isDrawerOpen }),
}));
