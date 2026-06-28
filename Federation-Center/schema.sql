-- Federated Agent Control Plane — SQLite Schema v1
-- All timestamps are stored as ISO 8601 text strings.

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS agents (
  id           TEXT PRIMARY KEY,
  source       TEXT NOT NULL CHECK (source IN ('claude', 'antigravity')),
  name         TEXT NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('active', 'idle', 'stopped')),
  session_id   TEXT NOT NULL,
  cwd          TEXT NOT NULL,
  started_at   TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  metadata     TEXT NOT NULL DEFAULT '{}'  -- JSON blob
);

CREATE TABLE IF NOT EXISTS tasks (
  id             TEXT PRIMARY KEY,
  agent_id       TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  parent_task_id TEXT REFERENCES tasks(id),
  description    TEXT NOT NULL,
  status         TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at     TEXT NOT NULL,
  completed_at   TEXT,
  metadata       TEXT NOT NULL DEFAULT '{}'  -- JSON blob
);

CREATE TABLE IF NOT EXISTS events (
  id         TEXT PRIMARY KEY,
  agent_id   TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  task_id    TEXT REFERENCES tasks(id),
  type       TEXT NOT NULL,
  timestamp  TEXT NOT NULL,
  payload    TEXT NOT NULL DEFAULT 'null'  -- JSON blob
);

-- Speed up the SSE feed (newest-first queries on events)
CREATE INDEX IF NOT EXISTS idx_events_agent_ts ON events (agent_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_events_task    ON events (task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_agent    ON tasks (agent_id);
