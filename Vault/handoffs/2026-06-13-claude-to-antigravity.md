# Handoff: Federated Agent Control Plane — Claude → Antigravity

**Date:** 2026-06-13  
**From:** Claude Code (claude-sonnet-4-6)  
**To:** Antigravity  
**Status:** Day 1 complete — ready for peer review and next-phase planning

---

## What this is

A read-only observability dashboard that watches Claude Code sessions and Antigravity
sessions in real time and displays them in a React web UI. Nothing is written to
either system's data — purely a reader/normalizer/display.

The project lives at `C:\VSCode\Federation\`.

---

## How to run it

Open 4 PowerShell terminals, one command each:

```powershell
# Terminal 1 — Backend (Fastify API + SQLite + SSE)
cd C:\VSCode\Federation\core
$env:NODE_OPTIONS="--experimental-sqlite"; npx tsx src/index.ts

# Terminal 2 — Claude collector (watches ~/.claude)
cd C:\VSCode\Federation\collectors\claude
npx tsx src/index.ts

# Terminal 3 — Antigravity collector (watches ~/.gemini/antigravity/conversations)
cd C:\VSCode\Federation\collectors\agy
$env:NODE_OPTIONS="--experimental-sqlite"; npx tsx src/index.ts

# Terminal 4 — Frontend (React/Vite)
cd C:\VSCode\Federation\frontend
npm run dev
```

Then open: **http://localhost:5173**

Wait ~10 seconds for collectors to scan existing sessions before refreshing.

---

## Architecture

```
Federation/
├── contracts/types.ts          ← Shared TypeScript types (the "contract")
├── core/                       ← Fastify 5 backend, port 3001
│   ├── src/index.ts            ← Server entry, binds 127.0.0.1 only
│   ├── src/db.ts               ← node:sqlite (Node 24 built-in)
│   ├── src/broadcaster.ts      ← SSE fan-out to all connected browsers
│   ├── src/routes/agents.ts    ← GET /agents, GET /agents/:id
│   ├── src/routes/tasks.ts     ← GET /tasks?agentId=
│   ├── src/routes/events.ts    ← GET /events, GET /events/stream (SSE)
│   ├── src/routes/ingest.ts    ← POST /ingest/agent, /ingest/event, /ingest/task
│   └── schema.sql              ← SQLite tables: agents, tasks, events
├── collectors/
│   ├── claude/src/index.ts     ← chokidar watches ~/.claude/projects/ (dir, not glob)
│   ├── claude/src/parser.ts    ← JSONL → AgentEvent[] (tool_use per-block)
│   ├── claude/src/emitter.ts   ← POST to /ingest/*
│   ├── agy/src/index.ts        ← watches ~/.gemini/antigravity/conversations/ + ide/
│   ├── agy/src/reader.ts       ← node:sqlite reads steps table, extracts cwd from blob
│   └── agy/src/emitter.ts      ← POST to /ingest/*
└── frontend/
    ├── src/App.tsx              ← 3-panel layout, REST fetch on mount, SSE subscription
    ├── src/components/AgentList.tsx   ← left panel, event count badges
    ├── src/components/TaskTree.tsx    ← middle panel, recursive task tree
    └── src/components/EventFeed.tsx   ← right panel, relative timestamps
```

---

## What's working

- **32 agents ingested** on startup: 20 Claude sessions + 4 Antigravity sessions
  (including `antigravity-ide`), + subagents detected separately
- **500+ events classified**: `tool_use`, `tool_result`, `message`, `session_start`,
  `hook_trigger` — correct type breakdown verified
- **Historical data loads on page mount** via `GET /agents` + `GET /events?limit=200`
  — dashboard is populated immediately, not waiting for SSE
- **SSE fan-out live**: new ingest events broadcast to all open browser tabs in real time
- **Antigravity `cwd` extracted** from protobuf blob via `file:///` URI regex —
  confirmed working for sessions with a workspace root
- **Tool-use events** per-block: one `AgentEvent` per tool use in an assistant turn,
  not one per assistant message
- **Subagent detection**: files under `.../subagents/*.jsonl` get `claude-subagent-`
  prefix instead of colliding with parent session IDs
- **13 Antigravity step type codes mapped** from reverse-engineering the `.db` files
  (queried `SELECT DISTINCT step_type, COUNT(*) FROM steps GROUP BY step_type`)

---

## Known issues — please review

### P1 — SSE shows DISCONNECTED on initial load
**What:** The SSE status dot in the header shows `disconnected` when the page first
loads, even when the backend is running.  
**Why:** Race condition — the browser connects and gets refused before the backend's
SSE handler is fully listening, then backs off 5 seconds before retry.  
**Suggested fix:** Delay SSE subscription by 500ms after mount, or make the retry
interval shorter (1s instead of 5s) for the first attempt.

### P2 — Antigravity event descriptions show "X"
**What:** EventFeed's `describePayload` returns "X" for Antigravity events.  
**Why:** The helper doesn't know the `{ stepType, status, hasSubtrajectory }` payload
shape. It's looking for string fields that don't exist.  
**Suggested fix:** Add a case for `{ stepType: number }` and render something like
`step #N (tool_result)` or map the step type code to a human label.

### P3 — Task panel shows mock data
**What:** The middle Tasks panel always shows the static mock tasks from
`src/mock/data.ts`, never real data.  
**Why:** No collector currently reads Claude Code's task graph and pushes to
`POST /ingest/task`. The endpoint exists and works; nothing feeds it.  
**Where to start:** Claude Code's JSONL contains `TaskCreate` tool events. The
Claude collector already sees these (they come through as `tool_use` events with
`toolName: "TaskCreate"`). A post-processing step could turn them into `TaskNode`
objects.

### P4 — All agents show `status: "active"`
**What:** Every agent in the left panel has a green dot. Sessions from months ago
show as `active`.  
**Why:** Collectors set `status: "active"` on first encounter and never update it.  
**Suggested fix:** Mark an agent `idle` if its JSONL file hasn't changed in 5 minutes;
`stopped` when it hasn't changed in 24 hours (or when a `session_end` event is seen).

### P5 — No startup script
**What:** User must manually open 4 terminal windows.  
**Suggested fix:** A `Federation/start.ps1` that opens all four in one command, and
a matching `stop.ps1`.

### P6 — chokidar glob patterns don't work on Windows
**What/Why:** chokidar v4 on Windows silently drops glob patterns like `**/*.jsonl`.
Both collectors work around this by watching the directory and filtering by extension
in the `add` handler. This should be documented so it's not reverted.

---

## API reference

### Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | `{ ok: true }` |
| GET | `/agents` | All `AgentNode[]` |
| GET | `/agents/:id` | Single `AgentNode` or 404 |
| GET | `/tasks?agentId=` | All `TaskNode[]`, optional filter |
| GET | `/events?agentId=&limit=` | Recent `AgentEvent[]` |
| GET | `/events/stream` | SSE — streams `SseMessage` |
| POST | `/ingest/agent` | Upsert an `AgentNode` |
| POST | `/ingest/event` | Insert an `AgentEvent` |
| POST | `/ingest/task` | Upsert a `TaskNode` |

### Unified Data Model (`contracts/types.ts`)

```typescript
export type AgentSource = 'claude' | 'antigravity';
export type AgentStatus = 'active' | 'idle' | 'stopped';

export interface AgentNode {
  id: string;           // e.g. "claude-<sessionId>" or "agy-<cascadeId>"
  source: AgentSource;
  name: string;
  status: AgentStatus;
  sessionId: string;
  cwd: string;
  startedAt: string;    // ISO 8601
  lastSeenAt: string;   // ISO 8601
  metadata: Record<string, unknown>;
}

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface TaskNode {
  id: string;
  agentId: string;
  parentTaskId?: string;
  description: string;
  status: TaskStatus;
  startedAt: string;
  completedAt?: string;
  metadata: Record<string, unknown>;
}

export type AgentEventType =
  | 'session_start' | 'session_end'
  | 'tool_use' | 'tool_result'
  | 'message'
  | 'task_create' | 'task_update' | 'task_complete' | 'task_fail'
  | 'hook_trigger' | 'error';

export interface AgentEvent {
  id: string;
  agentId: string;
  taskId?: string;
  type: AgentEventType;
  timestamp: string;
  payload: unknown;
}

export type SseMessage =
  | { kind: 'agent_upsert'; agent: AgentNode }
  | { kind: 'task_upsert'; task: TaskNode }
  | { kind: 'event'; event: AgentEvent }
  | { kind: 'heartbeat'; ts: string };
```

---

## Suggested next phase priorities

1. **`start.ps1` / `stop.ps1`** — one-command launch; unblocks daily use
2. **SSE reconnection fix** — the status dot should go green
3. **Task ingestion** — wire `TaskCreate` tool events from Claude JSONL into `POST /ingest/task`
4. **Agent status detection** — idle/stopped based on file staleness
5. **Antigravity event descriptions** — make the EventFeed show meaningful text for agy events
6. **`~/.gemini/antigravity/brain/` investigation** — may contain model name, token counts, richer metadata
7. **Protobuf decoding** — the `.db` step payloads are protobuf BLOBs; richer decoding would give tool names, arguments, and outputs from Antigravity

---

## Notes for Antigravity

- The `node:sqlite` built-in (requires `NODE_OPTIONS="--experimental-sqlite"`) was
  chosen over `better-sqlite3` to avoid C++ build tool requirements on Windows.
  This is a Node 24+ feature.
- The Antigravity collector opens `.db` files **read-only** at the SQLite level
  (no writes). WAL mode means concurrent reads don't block Antigravity's writes.
- All servers bind to `127.0.0.1` only — no LAN exposure.
- The Vault (`C:\VSCode\Vault\`) is the async communication channel:
  `decisions/` for contract changes, `handoffs/` for agent-to-agent state,
  `journal/` for human-readable progress.
