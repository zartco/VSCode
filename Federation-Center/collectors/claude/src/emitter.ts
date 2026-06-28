import type { AgentNode, AgentEvent, TaskNode } from '../../../src/contracts/types.js';

const BASE = process.env.CORE_URL ?? 'http://127.0.0.1:3000/api/ingest';

async function post(path: string, body: unknown): Promise<void> {
  try {
    await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // Backend not running — swallow silently, retry on next event
  }
}

export async function upsertAgent(agent: AgentNode): Promise<void> {
  await post('/agent', agent);
}

export async function upsertTask(task: TaskNode): Promise<void> {
  await post('/task', task);
}

export async function emitEvent(event: AgentEvent): Promise<void> {
  await post('/event', event);
}
