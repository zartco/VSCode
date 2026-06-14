import type { FederationAgent } from "./store";

export interface FederationAgentEvent {
  id: string;
  agentId: string;
  taskId?: string;
  type: string;
  timestamp: string;
  payload: unknown;
}

export type FederationSseUpdate =
  | { kind: "agent_upsert"; agent: FederationAgent }
  | { kind: "event"; agentName: string; content: string; event: FederationAgentEvent }
  | { kind: "task_upsert"; description: string }
  | { kind: "heartbeat" };

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function firstStringFromRecord(
  value: RecordValue,
  keys: string[],
): string | null {
  for (const key of keys) {
    const text = asString(value[key]);
    if (text) return text;
  }
  return null;
}

function summarizeContentBlocks(blocks: unknown[]): string | null {
  const text = blocks
    .map((block) => {
      if (!isRecord(block)) return asString(block);
      return firstStringFromRecord(block, ["text", "content"]);
    })
    .filter((value): value is string => Boolean(value))
    .join(" ");

  return text || null;
}

export function describeAgentEvent(event: FederationAgentEvent): string {
  const { payload } = event;

  if (typeof payload === "string") return payload;
  if (!isRecord(payload)) return event.type;

  const directText = firstStringFromRecord(payload, [
    "content",
    "text",
    "summary",
    "description",
  ]);
  if (directText) return directText;

  const message = payload.message;
  if (isRecord(message)) {
    const messageText = firstStringFromRecord(message, ["content", "text"]);
    if (messageText) return messageText;
  }

  const content = payload.content;
  if (Array.isArray(content)) {
    const blockText = summarizeContentBlocks(content);
    if (blockText) return blockText;
  }

  const toolName = asString(payload.toolName) ?? asString(payload.tool);
  if (toolName) return `${event.type}: ${toolName}`;

  if (Array.isArray(payload.toolNames) && payload.toolNames.length > 0) {
    return `${event.type}: ${payload.toolNames.join(", ")}`;
  }

  return event.type;
}

function toAgent(value: unknown): FederationAgent | null {
  if (!isRecord(value) || !asString(value.id)) return null;
  return value as FederationAgent;
}

function toEvent(value: unknown): FederationAgentEvent | null {
  if (!isRecord(value)) return null;
  const id = asString(value.id);
  const agentId = asString(value.agentId);
  const type = asString(value.type);
  const timestamp = asString(value.timestamp);

  if (!id || !agentId || !type || !timestamp) return null;

  return {
    id,
    agentId,
    taskId: asString(value.taskId) ?? undefined,
    type,
    timestamp,
    payload: value.payload,
  };
}

export function parseFederationSseMessage(data: string): FederationSseUpdate | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    return null;
  }

  if (!isRecord(parsed)) return null;

  if (parsed.kind === "heartbeat") return { kind: "heartbeat" };

  if (parsed.kind === "agent_upsert") {
    const agent = toAgent(parsed.agent);
    return agent ? { kind: "agent_upsert", agent } : null;
  }

  if (parsed.kind === "task_upsert") {
    const task = isRecord(parsed.task) ? parsed.task : null;
    const description = task
      ? firstStringFromRecord(task, ["description", "id"]) ?? "Task updated"
      : "Task updated";
    return { kind: "task_upsert", description };
  }

  if (parsed.kind === "event") {
    const event = toEvent(parsed.event);
    if (!event) return null;

    const content = describeAgentEvent(event);
    return {
      kind: "event",
      agentName: event.agentId,
      content,
      event,
    };
  }

  return null;
}
