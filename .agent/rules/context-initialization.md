# Agent Rule: Startup Context & Vault Initialization
**Target:** Antigravity, Claude Code, and all agents operating in this workspace.
**Priority:** Critical / Startup Rule

## Objective
Upon initialization of a new session or CLI access, the agent must immediately locate the Obsidian Vault and build context from the central memory before executing any user instructions.

## Mandated Initialization Sequence
Before responding to the user's first prompt or executing any task:
1. **Locate the Vault:** Verify the presence of the Obsidian Vault at `C:\VSCode\Vault`.
2. **Review Central Memory:**
   - Read the Vault `README.md` and `Start Here.md` to understand layout.
   - Read `decisions/Memory-Directive.md` and `decisions/ADR-001-Git-Stewardship.md` to load the immutable system and agent coordination rules.
   - Scan the `handoffs/` folder for any recent task handoffs, blockers, or ready-to-commit status reports.
   - Read the recent entries in `journal/` to understand the latest project activities and timeline.
   - Inspect active project definitions in `Projects/` to identify the system topology.
3. **Acknowledge and Summarize:**
   - In the first response, provide a brief, high-level acknowledgment of the loaded context (e.g., active project states, current roles, and outstanding objectives) to confirm alignment.
