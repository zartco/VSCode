# Decision: Git Operations & Repository Stewardship
Date: 2026-06-13 Status: Enforced Applies to: Antigravity, Claude Code, All Subagents

## Context
Multiple agents attempting to manage Git state (committing, branching, resolving merge conflicts) simultaneously leads to race conditions, corrupted worktrees, and split-brain repositories.

## Decision
Jules (Jules.Google) is the sole designated Git Steward for this ecosystem.

## Rules of Engagement

- **Total Ban on Git Mutators**: Antigravity, Claude Code, and all utility subagents are strictly forbidden from executing `git commit`, `git push`, `git merge`, `git checkout -b`, or `git rebase`.
- **Read-Only Git**: Agents may run read-only commands like `git status`, `git diff`, or `git log` to understand their current context.
- **The Jules Handoff**: When an agent completes a feature, fixes a bug, or finishes a milestone, it must:
  - Stop modifying files.
  - Create a handoff document in `C:\VSCode\Vault\handoffs\` (e.g., `ready-for-jules-federation-ui.md`).
  - Describe exactly what was changed and the intended commit message theme.
  - Terminate its active loop or notify the parent orchestrator.
- **Jules Execution**: Jules will monitor the `handoffs/` directory, review the diffs, batch the changes into logical commits, handle any necessary branching, and push to the remote repository.
- **Conflict Resolution**: The current local structure is considered superior when faced with a merge or conflict. The user will manually sort out what should be deleted after the fact and then inform Jules.
