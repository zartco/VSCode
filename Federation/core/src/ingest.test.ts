import { test } from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { ingestRoutes } from './routes/ingest.js';

test('vault ingest route accepts vault modification payloads', async (t) => {
  const app = Fastify();
  t.after(async () => {
    await app.close();
  });
  await app.register(ingestRoutes);

  const response = await app.inject({
    method: 'POST',
    url: '/ingest/vault',
    payload: {
      action: 'UPDATE_METADATA',
      filePath: 'Courses/CS50p/week-4.md',
    },
  });

  assert.equal(response.statusCode, 204);
});
