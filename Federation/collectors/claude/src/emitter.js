const BASE = process.env.CORE_URL ?? 'http://127.0.0.1:3001';
async function post(path, body) {
    try {
        await fetch(`${BASE}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
    }
    catch {
        // Backend not running — swallow silently, retry on next event
    }
}
export async function upsertAgent(agent) {
    await post('/ingest/agent', agent);
}
export async function upsertTask(task) {
    await post('/ingest/task', task);
}
export async function emitEvent(event) {
    await post('/ingest/event', event);
}
