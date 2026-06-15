/*
 * ══════════════════════════════════════════════════════════════════════════════
 *   ______ ______ ____   ______ ____   ___  ______ ____ ___  _  _
 *   |  ___||  ____||  \  |  ___||  _ \ / _ \|_   _||_  // _ \| \| |
 *   |  ___||  ___| | | | |  ___||    /|  _  | | |   | ||  _  | .` |
 *   |_|    |______||__/  |______||_|\_\|_| |_| |_|  |___|_| |_|_|\_|
 *
 *   FEDERATION OBSERVE PANEL - CORE API HOST
 * ══════════════════════════════════════════════════════════════════════════════
 */
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { agentsRoutes } from './routes/agents.js';
import { tasksRoutes } from './routes/tasks.js';
import { eventsRoutes } from './routes/events.js';
import { ingestRoutes } from './routes/ingest.js';
import { subagentsRoutes } from './routes/subagents.js';
import { filesRoutes } from './routes/files.js';
const app = Fastify({ logger: true });
await app.register(cors, { origin: 'http://localhost:5173' });
await app.register(agentsRoutes);
await app.register(tasksRoutes);
await app.register(eventsRoutes);
await app.register(ingestRoutes);
await app.register(subagentsRoutes);
await app.register(filesRoutes);
app.get('/health', async () => ({ ok: true }));
const port = parseInt(process.env.PORT ?? '3001');
await app.listen({ port, host: '127.0.0.1' });
const banner = `
\x1b[1m\x1b[38;2;0;255;180m   ___ ___ ___  ___ ___   _ _____ ___ ___  _  _
  | __| __|   \\| __| _ \\ /_\\_   _|_ _/ _ \\| \\| |
  | _|| _|| |) | _||   // _ \\| |  | | (_) | .\` |
  |_| |___|___/|___|_|_\\_/ \\_\\_| |___\\___/|_|\\_|
\x1b[0m
  \x1b[1m\x1b[38;2;0;255;0m● CONTROL PLANE ACTIVE | http://127.0.0.1:${port} | ONLINE\x1b[0m
`;
console.log(banner);
