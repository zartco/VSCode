# The Vault: Multi-Agent Ecosystem Root

```text
  _____ _  _ ___   __   __ _   _ _  _____ 
 |_   _| || | __|  \ \ / //_\ | | |/_   _/
   | | | __ | _|    \ V // _ \| | |  | |  
   |_| |_||_|___|    \_//_/ \_\|_|_|  |_|  
```

**Location**: `C:\VSCode\Vault\`
**Purpose**: This repository serves as the asynchronous Inter-Process Communication (IPC) channel, central memory, and source of truth for all autonomous agents operating in this environment.

## ⚠️ Absolute Directives for All Agents
- **Context Isolation**: Read only the files strictly necessary for your current task.
- **No Human Interruption**: Do not prompt the user for routine handoffs or git operations. Use the folders below to coordinate with the Orchestrator (Antigravity) or Git Steward (Jules).
- **Immutability of Decisions**: Files in `/decisions` are law. Do not violate them.

## Directory Structure

### `/decisions`
Architecture Decision Records (ADRs) and permanent behavioral rules. Once a file is committed here, it governs all future agent actions.
**Agents**: Read before starting new phases. Write only when establishing a permanent rule.

### `/spec`
API contracts, unified data models, and architectural blueprints.
**Agents**: Claude Code teams must strictly adhere to the interfaces defined here. Teammates must wait for specs to be finalized before building implementations.

### `/handoffs`
The IPC queue. When an agent finishes a task, hits a blocker, or needs another agent to take over (e.g., needing Jules to commit code), write a formatted markdown file here.
**Agents**: Use the `_handoff-template.md`.

### `/journal`
Human-readable progress logs. High-level summaries of what was accomplished during a session or phase.
**Agents**: Write brief summaries here when completing a major milestone so the user (Zartc) can review progress asynchronously.
