import type { FastifyInstance } from 'fastify';
import { getDb } from '../db.js';
import type { AgentNode, ApiResponse, ApiError } from '../../../contracts/types.js';

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

export async function agentsRoutes(app: FastifyInstance) {
  app.get<{ Reply: ApiResponse<AgentNode[]> }>('/agents', async (_req, reply) => {
    const rows = getDb()
      .prepare('SELECT * FROM agents ORDER BY started_at DESC')
      .all() as Row[];

    const agents: AgentNode[] = rows.map(rowToAgent);
    return reply.send({ ok: true, data: agents });
  });

  app.get<{ Params: { id: string }; Reply: ApiResponse<AgentNode> | ApiError }>(
    '/agents/:id',
    async (req, reply) => {
      const row = getDb()
        .prepare('SELECT * FROM agents WHERE id = ?')
        .get(req.params.id) as Row | undefined;

      if (!row) {
        return reply.status(404).send({ ok: false, error: 'Agent not found' });
      }

      return reply.send({ ok: true, data: rowToAgent(row) });
    },
  );
}
