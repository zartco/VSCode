import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { TaskNode, ApiResponse } from '@/contracts/types';

type Row = Record<string, unknown>;

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    const sql = agentId
      ? 'SELECT * FROM tasks WHERE agent_id = ? ORDER BY started_at DESC'
      : 'SELECT * FROM tasks ORDER BY started_at DESC';
    const params = agentId ? [agentId] : [];

    const rows = getDb().prepare(sql).all(...params) as Row[];

    const tasks: TaskNode[] = rows.map((r) => ({
      id: r['id'] as string,
      agentId: r['agent_id'] as string,
      parentTaskId: (r['parent_task_id'] as string) || undefined,
      description: r['description'] as string,
      status: r['status'] as TaskNode['status'],
      startedAt: r['started_at'] as string,
      completedAt: (r['completed_at'] as string) || undefined,
      metadata: JSON.parse(r['metadata'] as string),
    }));

    return NextResponse.json<ApiResponse<TaskNode[]>>({ ok: true, data: tasks });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
