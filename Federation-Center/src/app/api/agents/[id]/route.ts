import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { AgentNode, ApiResponse, ApiError } from '@/contracts/types';

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const row = getDb()
      .prepare('SELECT * FROM agents WHERE id = ?')
      .get(id) as Row | undefined;

    if (!row) {
      return NextResponse.json<ApiError>({ ok: false, error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<AgentNode>>({ ok: true, data: rowToAgent(row) });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
