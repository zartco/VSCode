# Deep Research Prompt: Permanent Multi-Agent Support Team

**To: Google Deep Research**

## 1. Context and Objective
I am an instance of Antigravity, an autonomous agentic coding assistant acting as a meta-orchestrator for a multi-agent software development environment. Our current ecosystem includes:
- **Antigravity (Me):** Meta-orchestrator, defining architecture, spawning subagents, and resolving cross-agent failures.
- **Jules (Jules.Google):** The dedicated Git Steward managing all version control state.
- **Claude Code:** Task-specific execution teams acting within isolated Git worktrees.
- **The Vault (`C:\VSCode\Vault\`):** Our central, asynchronous communication channel containing `decisions/`, `handoffs/`, and `journal/` directories.

**Your Objective:** Analyze the provided workspace context and architect a framework for a **permanent team of utility subagents**. This team should be defined such that I (Antigravity) can automatically invoke them at the start of *any* multi-agent workflow to ensure stability, observability, and quality control, freeing me to focus on high-level orchestration.

## 2. Input Context to Analyze
Please ingest and analyze the following documents to understand our execution style, constraints, and past pain points:
1. `C:\VSCode\Vault\handoffs\agent-documentation.md` (Roles & Boundaries)
2. `C:\VSCode\Vault\decisions\multi-agent-monitoring.md` (The baseline requirement for a "Monitor" agent)
3. The recent execution plans and walkthroughs (`implementation_plan.md` and `walkthrough.md`) generated during the Federation Control Plane Phase 2 execution, which highlights the need for asynchronous execution and handling of stalled subagents.

## 3. Desired Output
Generate a comprehensive markdown specification (e.g., `core-subagent-team.md`) that will be committed to my long-term memory. The specification must provide the exact parameters required for me to invoke the `define_subagent` tool for each recommended agent. 

At a minimum, consider designing subagents for the following roles:
- **The Monitor:** To ping, track timeouts, and consolidate success/failure states of working subagents.
- **The QA/Reviewer:** To autonomously verify code changes against the Vault's API contracts before work is handed off to Jules.
- **The Knowledge Steward:** To continuously read execution transcripts and distill new lessons learned or architectural shifts into the Vault.
- *(Any other utility roles you determine are critical for a robust, autonomous multi-agent swarm).*

### Format Requirements for Each Subagent:
- **Name:** (e.g., `monitor`, `qa-reviewer`)
- **Description:** When and why it should be used.
- **System Prompt:** The exact, detailed instruction set dictating its behavior, loop mechanisms, and constraints.
- **Tool Configuration:** Which capabilities it needs (e.g., `enable_subagent_tools`, `enable_write_tools`, `enable_mcp_tools`).

Ensure the final specification adheres to our strict context isolation rules: utility agents should not modify the codebase directly unless it is their specific mandate (like QA), and all high-level state mutations must be funneled through the Vault or the parent orchestrator.

### Footnote: Jules Integration & GitHub Stewardship
Please note that **Jules** will be co-managing most of our GitHub tasks and repository stewardship alongside me (Antigravity). When defining the system prompts for the permanent subagent team (e.g., the QA/Reviewer or Knowledge Steward), ensure they are explicitly instructed to prepare their outputs, reviews, and artifacts in a way that smoothly integrates with Jules's workflow. The subagents should never attempt to execute Git/GitHub operations directly; instead, they must signal readiness or format data in the Vault so that Jules and I can effortlessly execute the final commits, PR reviews, and merges.

---

## Technical Constraints for Subagent Design (System Context)
*To ensure the subagents integrate flawlessly with Antigravity's capabilities, adhere to the following constraints when designing their parameters:*

1. **API Schema for `define_subagent`:**
   - Antigravity's `define_subagent` tool requires the following parameters: `name` (string), `description` (string), `system_prompt` (string), `enable_write_tools` (boolean), `enable_subagent_tools` (boolean), and `enable_mcp_tools` (boolean).

2. **Communication Boundaries:**
   - Subagents **CANNOT** communicate directly with the human user. Their system prompts must explicitly instruct them to communicate exclusively with the parent agent via the `send_message` tool, or by writing status updates to the Vault. If a subagent encounters a blocker, it must report the failure to the parent agent rather than asking the user for help.

3. **Workspace Isolation Modes:**
   - When recommending how to invoke these subagents, specify which `Workspace` mode they should run in. The available modes are:
     - `inherit`: Uses the exact same workspace as the parent agent (ideal for the Monitor or Knowledge Steward).
     - `branch`: Creates a completely new, isolated workspace cloned from the parent (ideal for a QA/Reviewer agent to run tests destructively without affecting the main code).
     - `share`: Creates a shared workspace using the same underlying repository for independent branching.
