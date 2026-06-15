import { getDb } from '../db.js';
import { addClient, removeClient } from '../broadcaster.js';
export async function eventsRoutes(app) {
    // REST: last N events (for initial page load)
    app.get('/events', async (req, reply) => {
        const { agentId, limit = '100' } = req.query;
        const sql = agentId
            ? 'SELECT * FROM events WHERE agent_id = ? ORDER BY timestamp DESC LIMIT ?'
            : 'SELECT * FROM events ORDER BY timestamp DESC LIMIT ?';
        const params = agentId ? [agentId, parseInt(limit)] : [parseInt(limit)];
        const rows = getDb().prepare(sql).all(...params);
        const events = rows.map((r) => ({
            id: r['id'],
            agentId: r['agent_id'],
            taskId: r['task_id'],
            type: r['type'],
            timestamp: r['timestamp'],
            payload: JSON.parse(r['payload']),
        }));
        return reply.send({ ok: true, data: events });
    });
    // SSE: real-time event stream
    app.get('/events/stream', async (req, reply) => {
        reply.raw.setHeader('Content-Type', 'text/event-stream');
        reply.raw.setHeader('Cache-Control', 'no-cache');
        reply.raw.setHeader('Connection', 'keep-alive');
        reply.raw.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
        reply.raw.flushHeaders();
        addClient(reply.raw);
        // Heartbeat every 15s so the client knows the connection is alive
        const heartbeat = setInterval(() => {
            reply.raw.write(`data: ${JSON.stringify({ kind: 'heartbeat', ts: new Date().toISOString() })}\n\n`);
        }, 15_000);
        req.raw.on('close', () => {
            clearInterval(heartbeat);
            removeClient(reply.raw);
        });
        // Keep the handler alive — SSE connections are long-lived
        await new Promise((resolve) => req.raw.on('close', resolve));
    });
}
