/*
 * ══════════════════════════════════════════════════════════════════════════════
 *    _   ___   __  ___ ___  _    _     ___ ___ _____ ___  ___  
 *   /_\ / __|  \ \/ / | _ \/_\  | |   | __/ __|_   _/ _ \| _ \ 
 *  / _ \ (_ |   \  /  |  _/ _ \ | |__ | _| (__  | || (_) |   / 
 * /_/ \_\___|   /_/   |_|/_/ \_\|____||___\___| |_| \___/|_|_\ 
 *
 *   TELEMETRY COLLECTOR: ANTIGRAVITY AGENT
 * ══════════════════════════════════════════════════════════════════════════════
 */

import chokidar from 'chokidar';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { stat } from 'node:fs/promises';
import { readSession, readNewSteps } from './reader.js';
import { upsertAgent, emitEvent } from './emitter.js';
import type { AgentNode } from '../../../contracts/types.js';

const AGY_DIR     = join(homedir(), '.gemini', 'antigravity',     'conversations').replace(/\\/g, '/');
const AGY_IDE_DIR = join(homedir(), '.gemini', 'antigravity-ide', 'conversations').replace(/\\/g, '/');

// Per-file watermark: the highest step idx we've already emitted
const watermarks = new Map<string, number>();
const agents = new Map<string, AgentNode>();

async function processDb(dbPath: string): Promise<void> {
  const highWatermark = watermarks.get(dbPath) ?? -1;

  // On first encounter, register the session as an agent
  if (highWatermark === -1) {
    const meta = readSession(dbPath);
    if (meta) {
      const agent: AgentNode = {
        ...meta,
        status: 'active',
        lastSeenAt: (await stat(dbPath)).mtime.toISOString(),
      };
      agents.set(dbPath, agent);
      await upsertAgent(agent);
      console.log(`[agy] session started: ${meta.sessionId}`);
    }
  }

  // Read and emit new steps
  const { events: newEvents, maxIdx } = readNewSteps(dbPath, highWatermark);
  if (newEvents.length > 0) {
    for (const event of newEvents) {
      await emitEvent(event);
    }

    watermarks.set(dbPath, maxIdx);

    // Update lastSeenAt on the agent
    const agent = agents.get(dbPath);
    if (agent) {
      agent.lastSeenAt = (await stat(dbPath)).mtime.toISOString();
      agent.status = 'active';
      await upsertAgent(agent);
    }
  }
}

// Staleness-checking loop (every 1 minute)
setInterval(async () => {
  const now = new Date();
  for (const agent of agents.values()) {
    if (!agent.lastSeenAt) continue;
    const lastSeen = new Date(agent.lastSeenAt);
    const diffMs = now.getTime() - lastSeen.getTime();
    
    let newStatus: AgentNode['status'] = agent.status;
    if (diffMs > 24 * 60 * 60 * 1000) {
      newStatus = 'stopped';
    } else if (diffMs > 5 * 60 * 1000) {
      newStatus = 'idle';
    }

    if (newStatus !== agent.status) {
      agent.status = newStatus;
      await upsertAgent(agent).catch(err => console.error('[agy] error upserting agent:', err));
    }
  }
}, 60 * 1000);

const watcher = chokidar.watch([AGY_DIR, AGY_IDE_DIR], {
  persistent: true,
  ignoreInitial: true,
  depth: 0,
  awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
});

const isDb = (p: string) => p.endsWith('.db');

watcher.on('add', (path) => { if (isDb(path)) processDb(path).catch(console.error); });
watcher.on('change', (path) => { if (isDb(path)) processDb(path).catch(console.error); });
watcher.on('error', (err) => console.error('[agy] watcher error:', err));

console.log(`
\x1b[1m\x1b[38;2;0;255;0m  ┌──────────────────────────────────────────────────┐
  │  📡  TELEMETRY COLLECTOR: ANTIGRAVITY [ACTIVE]   │
  └──────────────────────────────────────────────────┘\x1b[0m
`);
console.log(`[agy-collector] watching ${AGY_DIR}`);
console.log(`[agy-collector] watching ${AGY_IDE_DIR}`);

// Background loop to update agent status
setInterval(async () => {
  const now = Date.now();
  for (const agent of agents.values()) {
    const lastSeen = new Date(agent.lastSeenAt).getTime();
    const diff = now - lastSeen;
    let newStatus: AgentNode['status'] = agent.status;
    
    if (diff > 24 * 60 * 60 * 1000) newStatus = 'stopped';
    else if (diff > 5 * 60 * 1000) newStatus = 'idle';
    
    if (newStatus !== agent.status) {
      agent.status = newStatus;
      await upsertAgent(agent).catch(err => console.error('[agy-collector] status update error:', err));
    }
  }
}, 60 * 1000);
