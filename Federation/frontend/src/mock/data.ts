import type { AgentNode, TaskNode, AgentEvent } from '@contracts'

// ── Agents ────────────────────────────────────────────────────────────────────

export const mockAgents: AgentNode[] = [
  {
    id: 'claude-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    source: 'claude',
    name: 'claude-sonnet-4-6',
    status: 'active',
    sessionId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    cwd: 'C:\\VSCode',
    startedAt: '2026-06-13T09:00:00.000Z',
    lastSeenAt: '2026-06-13T09:42:15.000Z',
    metadata: {
      model: 'claude-sonnet-4-6',
      pid: 14320,
    },
  },
  {
    id: 'antigravity-b9c8d7e6-f5a4-3210-fedc-ba9876543210',
    source: 'antigravity',
    name: 'agy-worker-01',
    status: 'idle',
    sessionId: 'b9c8d7e6-f5a4-3210-fedc-ba9876543210',
    cwd: 'C:\\VSCode',
    startedAt: '2026-06-13T08:30:00.000Z',
    lastSeenAt: '2026-06-13T09:38:00.000Z',
    metadata: {
      version: '0.4.2',
      pid: 22891,
    },
  },
]

// ── Tasks ─────────────────────────────────────────────────────────────────────

export const mockTasks: TaskNode[] = [
  {
    id: 'task-001',
    agentId: 'claude-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Build React/Vite observability dashboard',
    status: 'running',
    startedAt: '2026-06-13T09:01:00.000Z',
    metadata: { priority: 'high' },
  },
  {
    id: 'task-002',
    agentId: 'claude-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    parentTaskId: 'task-001',
    description: 'Write mock data file conforming to contract types',
    status: 'completed',
    startedAt: '2026-06-13T09:05:00.000Z',
    completedAt: '2026-06-13T09:12:30.000Z',
    metadata: {},
  },
  {
    id: 'task-003',
    agentId: 'claude-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    parentTaskId: 'task-001',
    description: 'Implement three-panel UI layout',
    status: 'running',
    startedAt: '2026-06-13T09:13:00.000Z',
    metadata: {},
  },
  {
    id: 'task-004',
    agentId: 'antigravity-b9c8d7e6-f5a4-3210-fedc-ba9876543210',
    description: 'Collect backend metrics for SSE endpoint',
    status: 'completed',
    startedAt: '2026-06-13T08:31:00.000Z',
    completedAt: '2026-06-13T09:00:00.000Z',
    metadata: { endpoint: '/events/stream' },
  },
  {
    id: 'task-005',
    agentId: 'antigravity-b9c8d7e6-f5a4-3210-fedc-ba9876543210',
    description: 'Idle — awaiting next task dispatch',
    status: 'pending',
    startedAt: '2026-06-13T09:00:01.000Z',
    metadata: {},
  },
]

// ── Events ────────────────────────────────────────────────────────────────────

export const mockEvents: AgentEvent[] = [
  {
    id: 'evt-001',
    agentId: 'claude-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    type: 'session_start',
    timestamp: '2026-06-13T09:00:00.000Z',
    payload: { model: 'claude-sonnet-4-6', cwd: 'C:\\VSCode' },
  },
  {
    id: 'evt-002',
    agentId: 'antigravity-b9c8d7e6-f5a4-3210-fedc-ba9876543210',
    type: 'session_start',
    timestamp: '2026-06-13T08:30:00.000Z',
    payload: { version: '0.4.2', cwd: 'C:\\VSCode' },
  },
  {
    id: 'evt-003',
    agentId: 'claude-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    taskId: 'task-001',
    type: 'task_create',
    timestamp: '2026-06-13T09:01:00.000Z',
    payload: { description: 'Build React/Vite observability dashboard' },
  },
  {
    id: 'evt-004',
    agentId: 'claude-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    taskId: 'task-002',
    type: 'task_create',
    timestamp: '2026-06-13T09:05:00.000Z',
    payload: { description: 'Write mock data file conforming to contract types' },
  },
  {
    id: 'evt-005',
    agentId: 'claude-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    taskId: 'task-001',
    type: 'tool_use',
    timestamp: '2026-06-13T09:06:00.000Z',
    payload: { tool: 'Write', path: 'src/mock/data.ts' },
  },
  {
    id: 'evt-006',
    agentId: 'claude-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    taskId: 'task-001',
    type: 'tool_result',
    timestamp: '2026-06-13T09:06:01.000Z',
    payload: { tool: 'Write', success: true },
  },
  {
    id: 'evt-007',
    agentId: 'antigravity-b9c8d7e6-f5a4-3210-fedc-ba9876543210',
    taskId: 'task-004',
    type: 'message',
    timestamp: '2026-06-13T08:45:00.000Z',
    payload: { text: 'Metrics collection running. 1420 events ingested.' },
  },
  {
    id: 'evt-008',
    agentId: 'antigravity-b9c8d7e6-f5a4-3210-fedc-ba9876543210',
    taskId: 'task-004',
    type: 'task_complete',
    timestamp: '2026-06-13T09:00:00.000Z',
    payload: { summary: 'Collected 1420 events, 0 errors' },
  },
  {
    id: 'evt-009',
    agentId: 'claude-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    taskId: 'task-002',
    type: 'task_complete',
    timestamp: '2026-06-13T09:12:30.000Z',
    payload: { summary: 'Mock data written successfully' },
  },
  {
    id: 'evt-010',
    agentId: 'claude-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    taskId: 'task-003',
    type: 'task_create',
    timestamp: '2026-06-13T09:13:00.000Z',
    payload: { description: 'Implement three-panel UI layout' },
  },
  {
    id: 'evt-011',
    agentId: 'claude-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    taskId: 'task-003',
    type: 'tool_use',
    timestamp: '2026-06-13T09:40:00.000Z',
    payload: { tool: 'Write', path: 'src/App.tsx' },
  },
  {
    id: 'evt-012',
    agentId: 'claude-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    taskId: 'task-003',
    type: 'message',
    timestamp: '2026-06-13T09:42:15.000Z',
    payload: { text: 'Three-panel layout complete. Building EventFeed component.' },
  },
]
