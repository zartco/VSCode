import { getDb } from '../db.js';
export async function tasksRoutes(app) {
    app.get('/tasks', async (req, reply) => {
        const { agentId } = req.query;
        const sql = agentId
            ? 'SELECT * FROM tasks WHERE agent_id = ? ORDER BY started_at DESC'
            : 'SELECT * FROM tasks ORDER BY started_at DESC';
        const params = agentId ? [agentId] : [];
        const rows = getDb().prepare(sql).all(...params);
        const tasks = rows.map((r) => ({
            id: r['id'],
            agentId: r['agent_id'],
            parentTaskId: r['parent_task_id'],
            description: r['description'],
            status: r['status'],
            startedAt: r['started_at'],
            completedAt: r['completed_at'],
            metadata: JSON.parse(r['metadata']),
        }));
        return reply.send({ ok: true, data: tasks });
    });
}
