import type { FastifyInstance } from 'fastify';
import { getDb } from '../db.js';
import type { TaskNode, ApiResponse } from '../../../contracts/types.js';

type Row = Record<string, unknown>;

export async function tasksRoutes(app: FastifyInstance) {
  app.get<{ Reply: ApiResponse<TaskNode[]> }>('/tasks', async (req, reply) => {
    const { agentId } = req.query as { agentId?: string };

    const sql = agentId
      ? 'SELECT * FROM tasks WHERE agent_id = ? ORDER BY started_at DESC'
      : 'SELECT * FROM tasks ORDER BY started_at DESC';
    const params = agentId ? [agentId] : [];

    const rows = getDb().prepare(sql).all(...params) as Row[];

    const tasks: TaskNode[] = rows.map((r) => ({
      id: r['id'] as string,
      agentId: r['agent_id'] as string,
      parentTaskId: r['parent_task_id'] as string | undefined,
      description: r['description'] as string,
      status: r['status'] as TaskNode['status'],
      startedAt: r['started_at'] as string,
      completedAt: r['completed_at'] as string | undefined,
      metadata: JSON.parse(r['metadata'] as string),
    }));

    return reply.send({ ok: true, data: tasks });
  });
}
