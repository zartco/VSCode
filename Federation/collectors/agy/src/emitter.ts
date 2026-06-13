import type { AgentNode, AgentEvent } from '../../../contracts/types.js';

const BASE = process.env.CORE_URL ?? 'http://127.0.0.1:3001';

async function post(path: string, body: unknown): Promise<void> {
  try {
    await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // Backend not running — swallow silently
  }
}

export const upsertAgent = (agent: AgentNode) => post('/ingest/agent', agent);
export const emitEvent = (event: AgentEvent) => post('/ingest/event', event);
