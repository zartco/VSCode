# Federated Agent Control Plane - Execution Plan

This plan is optimized for ingestion by **Claude Code Agent Teams**. It builds upon the MVP plan to ensure strict boundaries, LLM-friendly workflows, and parallel execution. *(Note: Git stewardship and repo management will be handled externally by Antigravity).*

## User Review Required
> [!IMPORTANT]
> **Antigravity State Location**: The path for Antigravity (`agy`) transcripts is currently undocumented. M0 (Spike) must find this before the Antigravity Collector can be fully built.
> **Vault Integration**: Ensure Claude Agent Teams has explicit access to `C:\VSCode\Vault\` to read/write `decisions/`, `journal/`, and `spec/`.

## Open Questions
- Do you want Antigravity to initialize the Git repository and Worktrees manually right now before handing this off to Claude?
- For the Antigravity spike, should we prioritize finding the `agy` transcripts, or immediately jump to building the optional Python SDK sidecar?

## Proposed Multi-Agent Architecture

To optimize for LLMs, we implement strict **Context Isolation** and **Contract-First Development**.

### The Team Roster
1. **Claude Team Lead (Architect)**: Owns the Unified Data Model. Delegates tasks, maintains the central Task Graph, and ensures teammates adhere to the API contract.
2. **Teammate A (Core/Backend)**: Builds Fastify API, SQLite store, SSE. Works in `core-backend` worktree.
3. **Teammate B (Claude Collector)**: Builds `~/.claude` watcher and normalizer. Works in `claude-collector` worktree.
4. **Teammate C (Antigravity Collector)**: Executes the M0 spike, builds `agy` watcher. Works in `ag-collector` worktree.
5. **Teammate D (Frontend)**: Builds React/Vite dashboard against Mock Data. Works in `frontend` worktree.

## LLM Best Practices for the Team

> [!TIP]
> **Context Window Management**: Agents should only read files relevant to their component. The Team Lead relies on the Vault for high-level state, rather than reading all code files.

1. **Contract First**: Teammate A must define and commit the TypeScript interfaces (`AgentNode`, `TaskNode`, `AgentEvent`) before Teammates B, C, and D begin writing implementation code.
2. **Mock Data Parallelization**: Teammate D (Frontend) will build the entire UI using a static mock JSON file that matches the API contract. They do not wait for the backend to be finished.
3. **Vault as the Source of Truth**: Agents will use `C:\VSCode\Vault\` to communicate asynchronously:
   - `Vault/decisions/` - For API contract changes.
   - `Vault/handoffs/` - When a subagent stops, it writes a summary of what it finished and what's next.
   - `Vault/journal/` - High-level progress for the user to read.

## Implementation Steps (Feed to Claude Lead)

**Prompt for Claude Code Team Lead:**
> "You are the Team Lead for the Federated Agent Control Plane. Your goal is to coordinate your teammates to build a read-only observability dashboard watching Claude Code and Antigravity.
> 
> **Phase 1: Foundation (Sequential)**
> 1. Establish the API Contract (Unified Model) in TypeScript.
> 2. Initialize the SQLite DB schema and Fastify skeleton.
> 3. Merge these contracts to the main branch before proceeding.
> 
> **Phase 2: Parallel Execution**
> Assign the following tasks in parallel to your teammates using Git Worktrees:
> - **Teammate Frontend**: Build the React/Vite dashboard using mock data adhering to the contract.
> - **Teammate Claude**: Build the `~/.claude` filesystem watcher and hook adapter.
> - **Teammate Antigravity**: Spike the location of `agy` transcripts and build the adapter.
> 
> **Rules of Engagement:**
> - NEVER write to `~/.claude` or Antigravity state. Read-only.
> - Log all architectural decisions to the Obsidian Vault (`decisions/`).
> - Bind all servers to `127.0.0.1` only."

## Verification Plan
### Automated Tests
- Teammates must write mock event generators to stream fake data through their respective collectors to verify normalization.
### Manual Verification
- Launch the unified Fastify server and Vite frontend.
- Trigger a dummy task in Claude Code and observe it appearing in the React dashboard via SSE.
