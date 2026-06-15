import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import Fastify from 'fastify';

test('subagents route creates a global manifest entry and instructions file', async (t) => {
  const home = await fs.mkdtemp(path.join(os.tmpdir(), 'federation-subagents-'));
  const previousHome = process.env.HOME;
  process.env.HOME = home;
  t.after(async () => {
    if (previousHome === undefined) {
      delete process.env.HOME;
    } else {
      process.env.HOME = previousHome;
    }
    await fs.rm(home, { recursive: true, force: true });
  });

  const { subagentsRoutes } = await import('./routes/subagents.js');
  const app = Fastify();
  t.after(async () => {
    await app.close();
  });
  await app.register(subagentsRoutes);

  const response = await app.inject({
    method: 'POST',
    url: '/api/subagents/create',
    payload: {
      name: 'note-taker',
      vendor: 'cursor',
      triggers: 'manual',
      instructions: '# Note Taker\n\nSummarize learning notes.',
      scope: 'global',
    },
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(JSON.parse(response.body), { success: true });

  const manifestPath = path.join(home, '.subagents', 'manifest.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  assert.deepEqual(manifest.agents, [
    { name: 'note-taker', vendor: 'cursor', triggers: 'manual' },
  ]);

  const instructions = await fs.readFile(
    path.join(home, '.subagents', 'note-taker', 'instructions.md'),
    'utf8',
  );
  assert.equal(instructions, '# Note Taker\n\nSummarize learning notes.');
});
