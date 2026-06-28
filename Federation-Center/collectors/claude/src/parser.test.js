import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLine, extractSession } from './parser.js';
test('parser - empty inputs', (t) => {
    assert.deepEqual(parseLine('', 'agent1', 'session1'), []);
    assert.equal(extractSession([]), null);
});
