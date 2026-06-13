import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { addClient, removeClient, broadcast } from './broadcaster.js';

test('broadcaster - add, broadcast, and remove client', (t) => {
  const res = new EventEmitter() as any;
  res.write = (data: string) => {
    res.emit('data', data);
  };

  addClient(res);

  let receivedData = '';
  res.on('data', (d: string) => {
    receivedData += d;
  });

  const msg = { kind: 'heartbeat', ts: '2026-01-01' } as any;
  broadcast(msg);

  assert.ok(receivedData.includes('data: {"kind":"heartbeat","ts":"2026-01-01"}'));

  removeClient(res);

  const msg2 = { kind: 'heartbeat', ts: '2026-01-02' } as any;
  broadcast(msg2);
  
  assert.ok(!receivedData.includes('2026-01-02'));
});
