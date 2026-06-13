import Fastify from 'fastify';
import cors from '@fastify/cors';
import { agentsRoutes } from './routes/agents.js';
import { tasksRoutes } from './routes/tasks.js';
import { eventsRoutes } from './routes/events.js';
import { ingestRoutes } from './routes/ingest.js';

const app = Fastify({ logger: true });

await app.register(cors, { origin: 'http://localhost:5173' });

await app.register(agentsRoutes);
await app.register(tasksRoutes);
await app.register(eventsRoutes);
await app.register(ingestRoutes);

app.get('/health', async () => ({ ok: true }));

const port = parseInt(process.env.PORT ?? '3001');
await app.listen({ port, host: '127.0.0.1' });
console.log(`Federation core running on http://127.0.0.1:${port}`);
