---
status: active
type: project
---
# Federation Control Plane

```text
  ___ ___ ___  ___ ___   _ _____ ___ ___  _  _ 
 | __| __|   \| __| _ \ /_\_   _|_ _/ _ \| \| |
 | _|| _|| |) | _||   // _ \| |  | | (_) | .` |
 |_| |___|___/|___|_|_\_/ \_\_| |___\___/|_|\_|
```

## System Overview
A read-only, real-time observability dashboard that aggregates execution state, events, and task graphs from multiple autonomous agents (Claude Code and Antigravity) running on the local machine.

## Components
- **Core Backend**: Node 24 + Fastify 5 + SQLite
- **Frontend**: React 18 + Vite 5 + TypeScript
- **Collectors**: Headless Node scripts parsing agent logs.

## Quality Assurance & Testing Pipeline
- Active `node:test` integration is deployed across `core` and `collectors` via `npm test`.
- Functional tests verify the SSE broadcaster mechanisms (`broadcaster.test.ts`).
- Dummy scripts and obsolete file watchers have been purged from `collectors/agy` and `collectors/claude` to reduce technical debt.

*Note: See `Vault/spec/Federation-Architecture-Spec.md` for strict data models and APIs.*
