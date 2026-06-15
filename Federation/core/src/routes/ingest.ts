import type { FastifyInstance } from 'fastify';
import { getDb } from '../db.js';
import { broadcast } from '../broadcaster.js';
import type { AgentNode, AgentEvent, TaskNode } from '../../../contracts/types.js';
import type { StatementResultingChanges } from 'node:sqlite';

export async function ingestRoutes(app: FastifyInstance) {
  // Collectors call this to register/update an agent session
  app.post<{ Body: AgentNode }>('/ingest/agent', async (req, reply) => {
    const a = req.body;
    getDb().prepare(`
      INSERT INTO agents (id, source, name, status, session_id, cwd, started_at, last_seen_at, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        status = excluded.status,
        last_seen_at = excluded.last_seen_at,
        metadata = excluded.metadata
    `).run(
      a.id, a.source, a.name, a.status, a.sessionId,
      a.cwd, a.startedAt, a.lastSeenAt, JSON.stringify(a.metadata),
    );
    broadcast({ kind: 'agent_upsert', agent: a });
    return reply.status(204).send();
  });

  // Collectors call this to emit a single event
  app.post<{ Body: AgentEvent }>('/ingest/event', async (req, reply) => {
    const e = req.body;
    const result: StatementResultingChanges = getDb().prepare(`
      INSERT OR IGNORE INTO events (id, agent_id, task_id, type, timestamp, payload)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      e.id, e.agentId, e.taskId ?? null,
      e.type, e.timestamp, JSON.stringify(e.payload),
    );
    if (result.changes > 0) {
      broadcast({ kind: 'event', event: e });
    }
    return reply.status(204).send();
  });

  // Collectors call this to create or update a task
  app.post<{ Body: TaskNode }>('/ingest/task', async (req, reply) => {
    const t = req.body;
    getDb().prepare(`
      INSERT OR REPLACE INTO tasks (id, agent_id, parent_task_id, description, status, started_at, completed_at, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      t.id, t.agentId, t.parentTaskId ?? null,
      t.description, t.status, t.startedAt,
      t.completedAt ?? null, JSON.stringify(t.metadata),
    );
    broadcast({ kind: 'task_upsert', task: t });
    return reply.status(204).send();
  });

  // Ingest Obsidian vault modifications
  app.post<{ Body: any }>('/ingest/vault', async (req, reply) => {
    const payload = req.body;
    console.log(`[Federation Core] Received vault modification:`, payload.action, payload.filePath);
    // Broadcast or store the vault modification event
    return reply.status(204).send();
  });
}
