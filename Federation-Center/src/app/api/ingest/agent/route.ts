import { getDb } from '@/lib/db';
import { broadcast } from '@/lib/broadcaster';
import type { AgentNode } from '@/contracts/types';

export async function POST(request: Request) {
  try {
    const a = (await request.json()) as AgentNode;
    getDb().prepare(`
      INSERT INTO agents (id, source, name, status, session_id, cwd, started_at, last_seen_at, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        status = excluded.status,
        last_seen_at = excluded.last_seen_at,
        metadata = excluded.metadata
    `).run(
      a.id,
      a.source,
      a.name,
      a.status,
      a.sessionId,
      a.cwd,
      a.startedAt,
      a.lastSeenAt,
      JSON.stringify(a.metadata)
    );

    broadcast({ kind: 'agent_upsert', agent: a });

    return new Response(null, { status: 204 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
