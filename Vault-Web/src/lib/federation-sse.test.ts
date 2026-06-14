import { test } from "node:test";
import assert from "node:assert/strict";
import {
  describeAgentEvent,
  parseFederationSseMessage,
  type FederationAgentEvent,
} from "./federation-sse";

test("parseFederationSseMessage handles agent upserts from the control plane", () => {
  const update = parseFederationSseMessage(
    JSON.stringify({
      kind: "agent_upsert",
      agent: {
        id: "claude-session-1",
        name: "claude-sonnet",
        status: "active",
      },
    }),
  );

  assert.deepEqual(update, {
    kind: "agent_upsert",
    agent: {
      id: "claude-session-1",
      name: "claude-sonnet",
      status: "active",
    },
  });
});

test("parseFederationSseMessage summarizes event payloads for the live UI", () => {
  const update = parseFederationSseMessage(
    JSON.stringify({
      kind: "event",
      event: {
        id: "event-1",
        agentId: "agy-cascade-1",
        type: "message",
        timestamp: "2026-06-14T14:00:00.000Z",
        payload: { text: "Metrics collection running." },
      },
    }),
  );

  assert.equal(update?.kind, "event");
  assert.equal(update?.content, "Metrics collection running.");
  assert.equal(update?.agentName, "agy-cascade-1");
});

test("describeAgentEvent extracts text from Claude message content blocks", () => {
  const event: FederationAgentEvent = {
    id: "event-2",
    agentId: "claude-session-1",
    type: "message",
    timestamp: "2026-06-14T14:00:00.000Z",
    payload: {
      content: [
        { type: "text", text: "Reviewed the graph parser." },
        { type: "tool_use", name: "Read" },
      ],
    },
  };

  assert.equal(describeAgentEvent(event), "Reviewed the graph parser.");
});

test("parseFederationSseMessage preserves task and heartbeat messages", () => {
  assert.deepEqual(
    parseFederationSseMessage(
      JSON.stringify({
        kind: "task_upsert",
        task: { id: "task-1", description: "Validate SSE contract" },
      }),
    ),
    { kind: "task_upsert", description: "Validate SSE contract" },
  );

  assert.deepEqual(
    parseFederationSseMessage(
      JSON.stringify({ kind: "heartbeat", ts: "2026-06-14T14:00:00.000Z" }),
    ),
    { kind: "heartbeat" },
  );
});

test("parseFederationSseMessage ignores malformed and unsupported payloads", () => {
  assert.equal(parseFederationSseMessage("{"), null);
  assert.equal(parseFederationSseMessage(JSON.stringify({ kind: "event" })), null);
  assert.equal(
    parseFederationSseMessage(JSON.stringify({ type: "event", payload: {} })),
    null,
  );
});
