import { getDb } from '@/lib/db';
import { broadcast } from '@/lib/broadcaster';
import type { AgentEvent } from '@/contracts/types';

export async function POST(request: Request) {
  try {
    const e = (await request.json()) as AgentEvent;

    const result = getDb().prepare(`
      INSERT OR IGNORE INTO events (id, agent_id, task_id, type, timestamp, payload)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      e.id,
      e.agentId,
      e.taskId ?? null,
      e.type,
      e.timestamp,
      JSON.stringify(e.payload)
    ) as unknown as { changes: number };

    if (result.changes > 0) {
      broadcast({ kind: 'event', event: e });
    }

    return new Response(null, { status: 204 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
