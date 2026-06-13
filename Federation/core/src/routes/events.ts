import type { FastifyInstance } from 'fastify';
import { getDb } from '../db.js';
import { addClient, removeClient } from '../broadcaster.js';
import type { AgentEvent, ApiResponse, SseMessage } from '../../../contracts/types.js';

type Row = Record<string, unknown>;

export async function eventsRoutes(app: FastifyInstance) {
  // REST: last N events (for initial page load)
  app.get<{ Reply: ApiResponse<AgentEvent[]> }>('/events', async (req, reply) => {
    const { agentId, limit = '100' } = req.query as { agentId?: string; limit?: string };

    const sql = agentId
      ? 'SELECT * FROM events WHERE agent_id = ? ORDER BY timestamp DESC LIMIT ?'
      : 'SELECT * FROM events ORDER BY timestamp DESC LIMIT ?';
    const params = agentId ? [agentId, parseInt(limit)] : [parseInt(limit)];

    const rows = getDb().prepare(sql).all(...params) as Row[];

    const events: AgentEvent[] = rows.map((r) => ({
      id: r['id'] as string,
      agentId: r['agent_id'] as string,
      taskId: r['task_id'] as string | undefined,
      type: r['type'] as AgentEvent['type'],
      timestamp: r['timestamp'] as string,
      payload: JSON.parse(r['payload'] as string),
    }));

    return reply.send({ ok: true, data: events });
  });

  // SSE: real-time event stream
  app.get('/events/stream', async (req, reply) => {
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.flushHeaders();

    addClient(reply.raw);

    // Heartbeat every 15s so the client knows the connection is alive
    const heartbeat = setInterval(() => {
      reply.raw.write(`data: ${JSON.stringify({ kind: 'heartbeat', ts: new Date().toISOString() } satisfies SseMessage)}\n\n`);
    }, 15_000);

    req.raw.on('close', () => {
      clearInterval(heartbeat);
      removeClient(reply.raw);
    });

    // Keep the handler alive — SSE connections are long-lived
    await new Promise<void>((resolve) => req.raw.on('close', resolve));
  });
}
