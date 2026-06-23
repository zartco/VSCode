export type OrchestratorId = "claude-code" | "antigravity";
export type RunState = "queued" | "running" | "blocked" | "succeeded" | "failed" | "idle";

export interface AgentNode {
  id: string;
  orchestrator: OrchestratorId;
  role: string;
  parentId?: string;
  title: string;
  state: RunState;
  currentTaskId?: string;
  model?: string;
  tokens?: { input: number; output: number };
  updatedAt: string;
}

export interface TaskNode {
  id: string;
  orchestrator: OrchestratorId;
  title: string;
  state: RunState;
  assigneeId?: string;
  parentTaskId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentEvent {
  id: string;
  orchestrator: OrchestratorId;
  ts: string;
  kind: "session_start" | "task_update" | "tool_use" | "subagent_stop" | "session_stop" | "message" | "error";
  agentId?: string;
  taskId?: string;
  summary: string;
  raw?: unknown;
}

export interface Collector {
  id: OrchestratorId;
  backfill(): Promise<{ agents: AgentNode[]; tasks: TaskNode[] }>;
  start(emit: (e: AgentEvent) => void,
        upsert: (n: AgentNode | TaskNode) => void): Promise<void>;
  stop(): Promise<void>;
}
