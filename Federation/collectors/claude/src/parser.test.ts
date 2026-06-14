import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLine, extractSession } from './parser.js';

test('parser - empty inputs', (t) => {
  assert.deepEqual(parseLine('', 'agent1', 'session1'), []);
  assert.equal(extractSession([]), null);
});

test('parser - assistant tool blocks become tool and task events', () => {
  const line = JSON.stringify({
    type: 'assistant',
    sessionId: 'session1',
    uuid: 'event1',
    timestamp: '2026-06-14T14:00:00.000Z',
    message: {
      role: 'assistant',
      content: [
        { type: 'text', text: 'Working on it.' },
        {
          type: 'tool_use',
          name: 'Read',
          input: { path: 'README.md' },
        },
        {
          type: 'tool_use',
          name: 'TaskCreate',
          input: { id: 'task1', description: 'Review parser coverage' },
        },
      ],
    },
  });

  const events = parseLine(line, 'agent1', 'session1');

  assert.equal(events.length, 2);
  assert.deepEqual(events[0], {
    id: 'event1',
    agentId: 'agent1',
    taskId: undefined,
    type: 'tool_use',
    timestamp: '2026-06-14T14:00:00.000Z',
    payload: { toolName: 'Read', input: { path: 'README.md' } },
  });
  assert.equal(events[1].agentId, 'agent1');
  assert.equal(events[1].taskId, 'task1');
  assert.equal(events[1].type, 'task_create');
  assert.deepEqual(events[1].payload, {
    toolName: 'TaskCreate',
    input: { id: 'task1', description: 'Review parser coverage' },
  });
});

test('extractSession - reads metadata from the first matching Claude JSONL line', () => {
  const session = extractSession([
    '{not json',
    JSON.stringify({
      type: 'summary',
      sessionId: 'missing-fields',
    }),
    JSON.stringify({
      type: 'assistant',
      sessionId: 'session1',
      cwd: '/workspace',
      timestamp: '2026-06-14T14:00:00.000Z',
      version: 'sonnet-4.6',
      entrypoint: 'cli',
    }),
  ]);

  assert.deepEqual(session, {
    id: 'claude-session1',
    source: 'claude',
    name: 'claude-sonnet-4.6',
    sessionId: 'session1',
    cwd: '/workspace',
    startedAt: '2026-06-14T14:00:00.000Z',
    metadata: { entrypoint: 'cli', version: 'sonnet-4.6' },
  });
});
