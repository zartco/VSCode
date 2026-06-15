import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import Fastify from 'fastify';
import { filesRoutes } from './routes/files.js';

test('files route lists a requested directory with directories first', async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'federation-files-'));
  t.after(async () => {
    await fs.rm(root, { recursive: true, force: true });
  });

  await fs.mkdir(path.join(root, 'notes'));
  await fs.writeFile(path.join(root, 'alpha.md'), '# Alpha\n');

  const app = Fastify();
  t.after(async () => {
    await app.close();
  });
  await app.register(filesRoutes);

  const response = await app.inject({
    method: 'GET',
    url: `/api/files?dir=${encodeURIComponent(root)}`,
  });

  assert.equal(response.statusCode, 200);
  const body = JSON.parse(response.body);
  assert.equal(body.currentDir, path.resolve(root));
  assert.deepEqual(
    body.files.map((entry: { name: string; isDirectory: boolean }) => ({
      name: entry.name,
      isDirectory: entry.isDirectory,
    })),
    [
      { name: 'notes', isDirectory: true },
      { name: 'alpha.md', isDirectory: false },
    ],
  );
});
