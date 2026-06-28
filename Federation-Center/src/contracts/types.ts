// ============================================================
// Federated Agent Control Plane — Unified Data Model v1
// All collectors normalize their source data to these types.
// The backend stores them; the frontend displays them.
// ============================================================

/** Which system the agent is running in. */
export type AgentSource = 'claude' | 'antigravity';

/** Lifecycle state of an agent process. */
export type AgentStatus = 'active' | 'idle' | 'stopped';

/**
 * Represents a single agent session (one Claude Code run, one agy run, etc.).
 * Each session gets its own node so the dashboard can show all concurrent agents.
 */
export interface AgentNode {
  id: string;           // Unique across all sources (e.g. "claude-<sessionId>")
  source: AgentSource;
  name: string;         // Human-readable label (e.g. "claude-sonnet-4-6")
  status: AgentStatus;
  sessionId: string;    // The raw session ID from the source system
  cwd: string;          // Working directory the agent was launched from
  startedAt: string;    // ISO 8601
  lastSeenAt: string;   // ISO 8601 — updated on every event from this agent
  metadata: Record<string, unknown>;
}

/** Lifecycle state of a single task. */
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

/**
 * Represents one discrete unit of work an agent is doing or has done.
 * Tasks can be nested: a parent task may spawn child tasks.
 */
export interface TaskNode {
  id: string;
  agentId: string;      // Foreign key → AgentNode.id
  parentTaskId?: string; // Set if this is a sub-task
  description: string;
  status: TaskStatus;
  startedAt: string;    // ISO 8601
  completedAt?: string; // ISO 8601 — only set when status is 'completed' or 'failed'
  metadata: Record<string, unknown>;
}

/** All possible event types that can flow through the system. */
export type AgentEventType =
  | 'session_start'
  | 'session_end'
  | 'tool_use'
  | 'tool_result'
  | 'message'
  | 'task_create'
  | 'task_update'
  | 'task_complete'
  | 'task_fail'
  | 'hook_trigger'
  | 'error';

/**
 * A single streaming event. This is the unit that flows over SSE
 * from the backend to the frontend in real time.
 */
export interface AgentEvent {
  id: string;                 // Monotonically increasing within a session
  agentId: string;            // Foreign key → AgentNode.id
  taskId?: string;            // Foreign key → TaskNode.id (if event belongs to a task)
  type: AgentEventType;
  timestamp: string;          // ISO 8601
  payload: unknown;           // Source-specific data; shape varies by type
}

// ============================================================
// API Response Envelopes (used by the Fastify backend)
// ============================================================

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
}

export interface ApiError {
  ok: false;
  error: string;
  code?: string;
}

// ============================================================
// SSE Message Format (what the frontend subscribes to)
// ============================================================

/**
 * Every SSE message is one of these shapes.
 * The frontend switches on `kind` to update the right slice of state.
 */
export type SseMessage =
  | { kind: 'agent_upsert'; agent: AgentNode }
  | { kind: 'task_upsert'; task: TaskNode }
  | { kind: 'event'; event: AgentEvent }
  | { kind: 'heartbeat'; ts: string };
