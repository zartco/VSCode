import { getDb } from '@/lib/db';
import { broadcast } from '@/lib/broadcaster';
import type { TaskNode } from '@/contracts/types';

export async function POST(request: Request) {
  try {
    const t = (await request.json()) as TaskNode;

    getDb().prepare(`
      INSERT OR REPLACE INTO tasks (id, agent_id, parent_task_id, description, status, started_at, completed_at, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      t.id,
      t.agentId,
      t.parentTaskId ?? null,
      t.description,
      t.status,
      t.startedAt,
      t.completedAt ?? null,
      JSON.stringify(t.metadata)
    );

    broadcast({ kind: 'task_upsert', task: t });

    return new Response(null, { status: 204 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
