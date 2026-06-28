import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { AgentEvent, ApiResponse } from '@/contracts/types';

type Row = Record<string, unknown>;

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const limit = searchParams.get('limit') || '100';

    const sql = agentId
      ? 'SELECT * FROM events WHERE agent_id = ? ORDER BY timestamp DESC LIMIT ?'
      : 'SELECT * FROM events ORDER BY timestamp DESC LIMIT ?';
    const params = agentId ? [agentId, parseInt(limit, 10)] : [parseInt(limit, 10)];

    const rows = getDb().prepare(sql).all(...params) as Row[];

    const events: AgentEvent[] = rows.map((r) => ({
      id: r['id'] as string,
      agentId: r['agent_id'] as string,
      taskId: (r['task_id'] as string) || undefined,
      type: r['type'] as AgentEvent['type'],
      timestamp: r['timestamp'] as string,
      payload: JSON.parse(r['payload'] as string),
    }));

    return NextResponse.json<ApiResponse<AgentEvent[]>>({ ok: true, data: events });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
