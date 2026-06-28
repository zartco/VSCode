import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { AgentNode, ApiResponse } from '@/contracts/types';

type Row = Record<string, unknown>;

function rowToAgent(r: Row): AgentNode {
  return {
    id: r['id'] as string,
    source: r['source'] as AgentNode['source'],
    name: r['name'] as string,
    status: r['status'] as AgentNode['status'],
    sessionId: r['session_id'] as string,
    cwd: r['cwd'] as string,
    startedAt: r['started_at'] as string,
    lastSeenAt: r['last_seen_at'] as string,
    metadata: JSON.parse(r['metadata'] as string),
  };
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = getDb()
      .prepare('SELECT * FROM agents ORDER BY started_at DESC')
      .all() as Row[];

    const agents: AgentNode[] = rows.map(rowToAgent);
    return NextResponse.json<ApiResponse<AgentNode[]>>({ ok: true, data: agents });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
