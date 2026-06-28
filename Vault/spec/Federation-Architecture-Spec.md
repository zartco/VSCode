# Specification: Federated Agent Control Plane
Version: 1.0.0
Project Path: `C:\VSCode\Federation\`

## System Overview
A read-only, real-time observability dashboard that aggregates execution state, events, and task graphs from multiple autonomous agents (Claude Code and Antigravity) running on the local machine.

## Core Directives
- **Zero-Mutation**: Collectors must never write to `~/.claude` or `~/.gemini`. Database connections to agent state must be explicitly read-only.
- **Local Only**: All Fastify servers, SSE streams, and frontend Vite servers must bind strictly to `127.0.0.1`. No external LAN exposure.

## Component Architecture

### Unified Data Model (`contracts/types.ts`):
The single source of truth. Defines `AgentNode`, `TaskNode`, `AgentEvent`, and `SseMessage`.
*Rule: No component may be built until its data dependencies are finalized here.*

### Core Backend (`core/`):
- Node 24 + Fastify 5 + `node:sqlite`.
- Port: `3001`.
- Handles REST endpoints (`/agents`, `/tasks`, `/events`) and Server-Sent Events (`/events/stream`).

### Collectors (`collectors/claude/`, `collectors/agy/`):
- Headless Node scripts using `chokidar` (watching directories, avoiding Windows glob issues).
- Responsible for normalizing proprietary agent logs into `AgentEvent` payloads and posting to `/ingest/*`.

### Frontend (`frontend/`):
- React 18 + Vite 5 + TypeScript.
- Layout: 3-Panel (Agent List, Task Tree, Event Feed).
