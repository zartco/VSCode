import { randomUUID } from 'node:crypto';
/**
 * Extract all tool_use blocks from an assistant message's content array.
 * Returns an empty array if there are none or if content is not an array.
 */
function extractToolUseBlocks(content) {
    if (!Array.isArray(content))
        return [];
    return content.filter((block) => block.type === 'tool_use');
}
export function parseLine(line, agentId, sessionId) {
    let raw;
    try {
        raw = JSON.parse(line);
    }
    catch {
        return [];
    }
    if (!raw.sessionId || raw.sessionId !== sessionId)
        return [];
    const timestamp = raw.timestamp ?? new Date().toISOString();
    // ── assistant turn ─────────────────────────────────────────────────────────
    if (raw.type === 'assistant') {
        const toolBlocks = extractToolUseBlocks(raw.message?.content);
        if (toolBlocks.length > 0) {
            // One event per tool_use block
            return toolBlocks.map((block, idx) => {
                const input = block.input ?? {};
                const taskId = input.id ?? input.taskId ?? undefined;
                let type = 'tool_use';
                if (block.name === 'TaskCreate')
                    type = 'task_create';
                else if (block.name === 'TaskUpdate')
                    type = 'task_update';
                else if (block.name === 'TaskComplete')
                    type = 'task_complete';
                return {
                    id: idx === 0 ? (raw.uuid ?? randomUUID()) : randomUUID(),
                    agentId,
                    taskId,
                    type,
                    timestamp,
                    payload: { toolName: block.name ?? 'unknown', input },
                };
            });
        }
        // Assistant turn with no tool_use — plain message
        return [
            {
                id: raw.uuid ?? randomUUID(),
                agentId,
                taskId: undefined,
                type: 'message',
                timestamp,
                payload: raw.message ?? null,
            },
        ];
    }
    // ── user turn ──────────────────────────────────────────────────────────────
    if (raw.type === 'user' && raw.message?.role === 'user') {
        return [
            {
                id: raw.uuid ?? randomUUID(),
                agentId,
                taskId: undefined,
                type: 'message',
                timestamp,
                payload: raw.message ?? null,
            },
        ];
    }
    // ── attachment (hooks, tool results) ──────────────────────────────────────
    if (raw.type === 'attachment') {
        const att = raw.attachment;
        if (!att)
            return [];
        let eventType = null;
        if (att.type === 'hook_success' || att.type === 'hook_error')
            eventType = 'hook_trigger';
        else if (att.type === 'tool_result')
            eventType = 'tool_result';
        if (!eventType)
            return [];
        return [
            {
                id: raw.uuid ?? randomUUID(),
                agentId,
                taskId: undefined,
                type: eventType,
                timestamp,
                payload: att,
            },
        ];
    }
    return [];
}
/** Extract session metadata from the first few lines of a JSONL file. */
export function extractSession(lines) {
    for (const line of lines) {
        let raw;
        try {
            raw = JSON.parse(line);
        }
        catch {
            continue;
        }
        if (raw.sessionId && raw.cwd && raw.timestamp) {
            return {
                id: `claude-${raw.sessionId}`,
                source: 'claude',
                name: `claude-${raw.version ?? 'unknown'}`,
                sessionId: raw.sessionId,
                cwd: raw.cwd,
                startedAt: raw.timestamp,
                metadata: { entrypoint: raw.entrypoint ?? 'cli', version: raw.version },
            };
        }
    }
    return null;
}
