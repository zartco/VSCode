import { getDb } from '../db.js';
function rowToAgent(r) {
    return {
        id: r['id'],
        source: r['source'],
        name: r['name'],
        status: r['status'],
        sessionId: r['session_id'],
        cwd: r['cwd'],
        startedAt: r['started_at'],
        lastSeenAt: r['last_seen_at'],
        metadata: JSON.parse(r['metadata']),
    };
}
export async function agentsRoutes(app) {
    app.get('/agents', async (_req, reply) => {
        const rows = getDb()
            .prepare('SELECT * FROM agents ORDER BY started_at DESC')
            .all();
        const agents = rows.map(rowToAgent);
        return reply.send({ ok: true, data: agents });
    });
    app.get('/agents/:id', async (req, reply) => {
        const row = getDb()
            .prepare('SELECT * FROM agents WHERE id = ?')
            .get(req.params.id);
        if (!row) {
            return reply.status(404).send({ ok: false, error: 'Agent not found' });
        }
        return reply.send({ ok: true, data: rowToAgent(row) });
    });
}
