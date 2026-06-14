import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { readNewSteps, readSession } from './reader.js';

function createFixtureDb(): { dbPath: string; cleanup: () => void } {
  const dir = mkdtempSync(path.join(tmpdir(), 'agy-reader-'));
  const dbPath = path.join(dir, 'conversation.db');
  const db = new DatabaseSync(dbPath);

  db.exec(`
    CREATE TABLE trajectory_meta (
      trajectory_id TEXT NOT NULL,
      cascade_id TEXT NOT NULL,
      trajectory_type INTEGER NOT NULL,
      source INTEGER NOT NULL
    );

    CREATE TABLE trajectory_metadata_blob (
      data BLOB NOT NULL
    );

    CREATE TABLE steps (
      idx INTEGER NOT NULL,
      step_type INTEGER NOT NULL,
      status INTEGER NOT NULL,
      has_subtrajectory INTEGER NOT NULL,
      step_payload BLOB
    );
  `);

  db.prepare(
    'INSERT INTO trajectory_meta (trajectory_id, cascade_id, trajectory_type, source) VALUES (?, ?, ?, ?)',
  ).run('trajectory1', 'cascade1', 1, 2);
  db.prepare('INSERT INTO trajectory_metadata_blob (data) VALUES (?)').run(
    Buffer.from('metadata file:///C:/Users/Zartc/Documents/antigravity/project\x12end'),
  );
  db.prepare(
    'INSERT INTO steps (idx, step_type, status, has_subtrajectory, step_payload) VALUES (?, ?, ?, ?, ?)',
  ).run(7, 90, 1, 0, Buffer.from('{"name": "Read"} default_api:write'));
  db.close();

  return {
    dbPath,
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}

test('readSession extracts Antigravity session metadata and cwd', () => {
  const fixture = createFixtureDb();
  try {
    const session = readSession(fixture.dbPath);

    assert.ok(session?.startedAt);
    assert.deepEqual(session, {
      id: 'agy-cascade1',
      source: 'antigravity',
      name: 'antigravity',
      sessionId: 'cascade1',
      cwd: 'C:\\Users\\Zartc\\Documents\\antigravity\\project',
      startedAt: session.startedAt,
      metadata: {
        trajectoryId: 'trajectory1',
        trajectoryType: 1,
        source: 2,
        dbPath: fixture.dbPath,
      },
    });
  } finally {
    fixture.cleanup();
  }
});

test('readNewSteps maps tool-use rows into agent events', () => {
  const fixture = createFixtureDb();
  try {
    const result = readNewSteps(fixture.dbPath, 6);

    assert.equal(result.maxIdx, 7);
    assert.equal(result.events.length, 1);
    assert.equal(result.events[0].agentId, 'agy-cascade1');
    assert.equal(result.events[0].type, 'tool_use');
    assert.deepEqual(result.events[0].payload, {
      stepType: 90,
      status: 1,
      hasSubtrajectory: false,
      toolNames: ['Read', 'default_api:write'],
    });
  } finally {
    fixture.cleanup();
  }
});
