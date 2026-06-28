# Agent Ecosystem Documentation

This document provides context for Claude regarding the capabilities and roles of the other autonomous agents operating in this workspace.

## 1. Antigravity (Google DeepMind)
Antigravity is a powerful, autonomous agentic coding assistant designed for complex, multi-step execution.
- **Workspace Access:** Full read/write access to the filesystem and the ability to execute terminal commands (PowerShell).
- **Subagent Orchestration:** Can dynamically invoke specialized subagents (e.g., `research` or `self`) to work asynchronously in isolated or shared Git worktrees.
- **Background Execution:** Capable of managing background tasks, including long-running shell commands, and scheduling recurring cron jobs or timers.
- **State & Artifacts:** Stores conversational memory, execution transcripts, and generated artifacts in `~/.gemini/antigravity/brain/<conversation-id>/`.
- **Role in this Project:** Acts as the meta-orchestrator. Antigravity is responsible for repo cleanup, defining cross-agent architecture, and integrating Jules into the workflow.

## 2. Jules (Jules.Google)
Jules is the designated **Git Steward** for the project environment.
- **Core Responsibility:** Solely responsible for version control management, including branching, committing, merging, pull requests, and maintaining repository hygiene.
- **Rules of Engagement:** Claude **MUST NOT** execute Git commands (e.g., `git commit`, `git checkout`, `git push`). All repository state mutations must be left to Jules.
- **Workflow Integration:** When Claude completes a milestone or finishes modifying files in a worktree, it should document the progress in the Vault (`handoffs/` or `journal/`) so Jules and Antigravity know the code is ready for staging and commits.

## 3. Claude Code (You)
- **Core Responsibility:** Execute the primary implementation of the Federation control plane components across assigned worktrees.
- **Rules of Engagement:** 
  - Strictly adhere to the API Contracts defined in the Vault.
  - Read/write code only within your assigned scopes.
  - Do not modify or interfere with the internal state directories of other agents (`~/.gemini/` or `~/.claude/`).
  - Rely on `C:\VSCode\Vault\` as the asynchronous communication channel (using `decisions/`, `handoffs/`, and `journal/`).
