# Vault-Web Convergence & Federated Agent Control Plane

This document summarizes the architectural decisions and setup for the new Next.js dashboard (`Vault-Web`) and the multi-agent `Federation` execution plan.

## Overview
The workspace has shifted towards a multi-agent orchestrated setup where an autonomous cloud VM (Jules) and a local orchestrator (Antigravity) collaboratively manage the codebase. To establish transparent observability over these autonomous loops, the `Vault-Web` and `Federation` dashboards have been initialized.

## Architecture Decisions

### 1. Unified Next.js Workspace (`Vault-Web`)
A React/Next.js dashboard acts as the singular window into the multi-agent operations. It provides a visual knowledge graph, file explorer, and an analytics suite that natively reads the local Obsidian Vault.

- **Stack**: React 19, Next.js 16.2.9, Tailwind, `lucide-react`.
- **Purpose**: A local workspace GUI that bridges the gap between the code execution layers and the documentation Vault (`C:\Users\Zartc\Vault`).

### 2. Federated Agent Control Plane
The architecture requires a purely read-only control plane to observe local subagent operations without interrupting their execution contexts. The plan strictly separates the control plane's `Unified Data Model` from the opaque proprietary agent databases.

- **Collectors**: Independent telemetry scripts parsing orchestrator state (Claude hooks or `agy` transcripts) and emitting standardized events.
- **Backend/Store**: Fastify and SQLite (`core-backend`) responsible for persistent event storage and normalization.
- **Frontend**: A React/Vite unified UI for tracking active agents, their task graphs, and full execution logs dynamically via Server-Sent Events (SSE).

### 3. IPC & Memory Storage
`AGENTS.md` was deprecated to eliminate unconstrained, redundant system prompts in the global codebase. The AI agents are now instructed to conduct all inter-process communications (IPC), handoffs, and architectural logging dynamically via the user's local Obsidian Vault (`C:\Users\Zartc\Vault`).

## Setup Instructions

1. **Vault-Web**:
   - `cd Vault-Web`
   - `npm run dev` to access the local dashboard at `localhost:3000`.
   - Ensure the Vault path (`C:\Users\Zartc\Vault`) matches the configured path in `Vault-Web/src/lib/vault.ts`.

2. **Federation Services**:
   - Run the provided `Federation/start.ps1` to launch all core and collector services simultaneously via Windows Terminal panes.
