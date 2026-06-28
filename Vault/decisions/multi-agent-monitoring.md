# Multi-Agent Monitoring Preference

**Decision:** When executing complex tasks that require multiple parallel subagents, always invoke a dedicated `monitor` subagent.

**Rationale:** The user runs multi-agent tasks fully autonomously and is unlikely to respond to frequent prompts on time. The parent agent should not bother the user with intermediate updates or get stuck waiting on child agents. 

**Implementation Strategy:**
1. Define a `monitor` subagent (if not already defined) with permissions to check subagent status (`manage_subagents`), send messages (`send_message`), and set timers (`schedule`).
2. Pass the list of active subagent Conversation IDs to the monitor.
3. The monitor will periodically poll the subagents and report a single consolidated success/failure message to the parent agent when all tasks are complete, allowing the parent agent to focus on other work or remain completely silent.
