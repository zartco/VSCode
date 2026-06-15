/*
 * ══════════════════════════════════════════════════════════════════════════════
 *    ___ _      _   _   _ ___  ___   ___  _    _     ___ ___ _____ ___  ___  
 *   / __| |    /_\ | | | |   \| __| / __|/_\  | |   | __/ __|_   _/ _ \| _ \ 
 *  | (__| |__ / _ \| |_| | |) | _| | (__/ _ \ | |__ | _| (__  | || (_) |   / 
 *   \___|____/_/ \_\\___/|___/|___| \___/_/ \_\|____||___\___| |_| \___/|_|_\ 
 *
 *   TELEMETRY COLLECTOR: CLAUDE AGENT
 * ══════════════════════════════════════════════════════════════════════════════
 */

import chokidar from 'chokidar';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { homedir } from 'node:os';
import { join, basename } from 'node:path';
import { parseLine, extractSession } from './parser.js';
import { upsertAgent, emitEvent, upsertTask } from './emitter.js';
import type { AgentNode, TaskNode } from '../../../contracts/types.js';

const CLAUDE_DIR = join(homedir(), '.claude', 'projects').replace(/\\/g, '/');

// Track byte offset per file so we only read new lines on each change
const offsets = new Map<string, number>();
const agents = new Map<string, AgentNode>();
const tasks = new Map<string, TaskNode>();

async function readNewLines(filePath: string): Promise<string[]> {
  const { size } = await stat(filePath);
  const offset = offsets.get(filePath) ?? 0;
  if (size <= offset) return [];

  const lines: string[] = [];
  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(filePath, { start: offset, encoding: 'utf8' });
    const rl = createInterface({ input: stream });
    rl.on('line', (line) => { if (line.trim()) lines.push(line); });
    rl.on('close', resolve);
    rl.on('error', reject);
  });

  offsets.set(filePath, size);
  return lines;
}

/**
 * Determine whether a JSONL file belongs to a subagent transcript.
 * Subagent files live at:
 *   ~/.claude/projects/<project>/<session>/subagents/<subagent>.jsonl
 * Regular session files live at:
 *   ~/.claude/projects/<project>/<session>.jsonl
 *
 * We detect the subagent case by checking whether the normalised path
 * contains a `/subagents/` directory segment.
 */
function resolveAgentId(filePath: string): { agentId: string; sessionId: string } {
  const normalised = filePath.replace(/\\/g, '/');
  const stem = basename(filePath, '.jsonl');

  if (normalised.includes('/subagents/')) {
    return {
      agentId: `claude-subagent-${stem}`,
      sessionId: stem,
    };
  }

  return {
    agentId: `claude-${stem}`,
    sessionId: stem,
  };
}

async function processFile(filePath: string, isNew: boolean): Promise<void> {
  const lines = await readNewLines(filePath);
  if (lines.length === 0) return;

  const { agentId, sessionId } = resolveAgentId(filePath);

  // On first encounter, extract session metadata
  if (isNew || !agents.has(agentId)) {
    const meta = extractSession(lines);
    if (meta) {
      const agent: AgentNode = {
        ...meta,
        id: agentId,         // override with the resolved agentId (subagent-aware)
        sessionId,
        status: 'active',
        lastSeenAt: (await stat(filePath)).mtime.toISOString(),
      };
      agents.set(agentId, agent);
      await upsertAgent(agent);
      console.log(`[claude] session started: ${agentId} (${meta.cwd})`);
    }
  }

  // Emit new events — parseLine now returns AgentEvent[]
  for (const line of lines) {
    const events = parseLine(line, agentId, sessionId);
    for (const event of events) {
      if (['task_create', 'task_update', 'task_complete'].includes(event.type)) {
        const payload = event.payload as any;
        const input = payload.input || {};
        const taskId = event.taskId || event.id;

        let task = tasks.get(taskId);
        if (!task) {
          task = {
            id: taskId,
            agentId,
            description: input.description || 'Unknown task',
            status: 'pending',
            startedAt: event.timestamp,
            metadata: {},
            parentTaskId: input.parentTaskId
          };
          tasks.set(taskId, task);
        }

        if (event.type === 'task_create') {
          task.status = 'running';
          if (input.description) task.description = input.description;
        } else if (event.type === 'task_update') {
          if (input.status) task.status = input.status;
          if (input.description) task.description = input.description;
        } else if (event.type === 'task_complete') {
          task.status = input.success === false ? 'failed' : 'completed';
          task.completedAt = event.timestamp;
        }

        await upsertTask(task);
      }
      await emitEvent(event);
    }
  }

  // Update lastSeenAt
  const agent = agents.get(agentId);
  if (agent) {
    agent.lastSeenAt = (await stat(filePath)).mtime.toISOString();
    await upsertAgent(agent);
  }
}

// Watch the directory directly — chokidar v4 glob patterns are unreliable on Windows
const watcher = chokidar.watch(CLAUDE_DIR, {
  persistent: true,
  ignoreInitial: true,
  depth: 3,
  awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 },
});

const isJsonl = (p: string) => p.endsWith('.jsonl');

watcher.on('add', (path) => {
  if (!isJsonl(path)) return;
  console.log(`[claude] session file: ${path}`);
  processFile(path, true).catch(console.error);
});
watcher.on('change', (path) => {
  if (!isJsonl(path)) return;
  processFile(path, false).catch(console.error);
});
watcher.on('error', (err) => console.error('[claude] watcher error:', err));

// Check agent status every 1 minute
setInterval(() => {
  const now = Date.now();
  for (const agent of agents.values()) {
    if (agent.status === 'stopped') continue;
    
    const lastSeen = new Date(agent.lastSeenAt).getTime();
    const elapsed = now - lastSeen;
    let newStatus: AgentNode['status'] = agent.status;
    
    if (elapsed > 24 * 60 * 60 * 1000) {
      newStatus = 'stopped';
    } else if (elapsed > 5 * 60 * 1000) {
      newStatus = 'idle';
    }
    
    if (newStatus !== agent.status) {
      agent.status = newStatus;
      upsertAgent(agent).catch(console.error);
    }
  }
}, 60 * 1000);

console.log(`
\x1b[1m\x1b[38;2;0;255;180m  ┌──────────────────────────────────────────────────┐
  │  📡  TELEMETRY COLLECTOR: CLAUDE-AGENT [ACTIVE]  │
  └──────────────────────────────────────────────────┘\x1b[0m
`);
console.log(`[claude-collector] watching ${CLAUDE_DIR}`);
