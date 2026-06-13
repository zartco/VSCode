import { DatabaseSync } from 'node:sqlite';
import type { AgentNode, AgentEvent, AgentEventType } from '../../../contracts/types.js';
import { randomUUID } from 'node:crypto';

/**
 * Numeric step_type codes discovered by querying all .db files:
 *   SELECT DISTINCT step_type, COUNT(*) FROM steps GROUP BY step_type
 *
 * Mapping rationale (derived from sequential position analysis):
 *   - 90, 33          : tool_use   — precede a tool_result step
 *   - 15, 5, 21, 101, 132 : tool_result — always follow a tool_use step
 *   - 14              : session_start — first step in every session (also recurs
 *                       mid-session as turn delimiters)
 *   - 8, 9, 7, 17, 23, 31, 98, 99 : message — model/user text turns
 *
 * Unmapped codes fall through to 'message'.
 */
const STEP_TYPE_MAP: Record<number, AgentEventType> = {
  // Session lifecycle
  14: 'session_start',
  // Tool use — request to invoke a tool
  33: 'tool_use',
  90: 'tool_use',
  // Tool result — response from a tool invocation
  5:   'tool_result',
  15:  'tool_result',
  21:  'tool_result',
  101: 'tool_result',
  132: 'tool_result',
  // Messages — model output or user input turns
  7:  'message',
  8:  'message',
  9:  'message',
  17: 'message',
  23: 'message',
  31: 'message',
  98: 'message',
  99: 'message',
};

/**
 * The trajectory_metadata_blob table stores a protobuf-encoded binary blob.
 * It contains `file:///` URIs that point to the workspace root, e.g.:
 *   file:///C:/Users/Zartc/Documents/antigravity/agitated-noether
 * We extract the path portion and normalise it to a Windows path.
 *
 * Regex: file:/// followed by a drive letter, colon or slash, then printable
 * non-control chars (stops at protobuf field delimiters like \x12, \x1a).
 */
const FILE_URI_RE = /file:\/\/\/([A-Za-z][:/][A-Za-z0-9\-._~!$&'()*+,;=:@/% ]{1,200})/g;

function extractCwdFromBlob(data: Uint8Array): string {
  const text = Buffer.from(data).toString('utf8', 0, Math.min(data.length, 4096));
  const match = FILE_URI_RE.exec(text);
  // Reset lastIndex so re-use of the module-level regex is safe
  FILE_URI_RE.lastIndex = 0;
  if (!match) return '';
  // Normalise: replace forward slashes with backslashes, uppercase drive letter
  const raw = match[1];
  const normalised = raw.replace(/\//g, '\\');
  return normalised.charAt(0).toUpperCase() + normalised.slice(1);
}

const TOOL_NAME_RE = /(?:call:|name":\s*")([a-zA-Z0-9_:]+)/g;

function extractToolNames(data: Uint8Array): string[] {
  const text = Buffer.from(data).toString('utf8');
  const matches = new Set<string>();
  
  let match;
  while ((match = TOOL_NAME_RE.exec(text)) !== null) {
    matches.add(match[1]);
  }
  
  const fallbackMatch = text.match(/default_api:\w+/g);
  if (fallbackMatch) {
    for (const m of fallbackMatch) {
      matches.add(m);
    }
  }

  return Array.from(matches);
}

interface TrajectoryMeta {
  trajectory_id: string;
  cascade_id: string;
  trajectory_type: number;
  source: number;
}

interface MetadataBlobRow {
  data: Uint8Array;
}

interface StepRow {
  idx: number;
  step_type: number;
  status: number;
  has_subtrajectory: number;
  step_payload?: Uint8Array;
}

export function readSession(dbPath: string): Omit<AgentNode, 'status' | 'lastSeenAt'> | null {
  let db: DatabaseSync;
  try {
    db = new DatabaseSync(dbPath, { open: true });
  } catch {
    return null;
  }

  try {
    const rows = db
      .prepare('SELECT * FROM trajectory_meta LIMIT 1')
      .all() as unknown as TrajectoryMeta[];

    if (rows.length === 0) return null;
    const meta = rows[0];

    // Extract the working directory from the trajectory_metadata_blob.
    // The blob is a protobuf binary that embeds file:/// URIs for the workspace root.
    let cwd = '';
    try {
      const blobRows = db
        .prepare('SELECT data FROM trajectory_metadata_blob LIMIT 1')
        .all() as unknown as MetadataBlobRow[];
      if (blobRows.length > 0 && blobRows[0].data instanceof Uint8Array) {
        cwd = extractCwdFromBlob(blobRows[0].data);
      }
    } catch {
      // Table missing or unreadable — leave cwd as empty string
    }

    return {
      id: `agy-${meta.cascade_id}`,
      source: 'antigravity',
      name: 'antigravity',
      sessionId: meta.cascade_id,
      cwd,
      startedAt: new Date().toISOString(),
      metadata: {
        trajectoryId: meta.trajectory_id,
        trajectoryType: meta.trajectory_type,
        source: meta.source,
        dbPath,
      },
    };
  } finally {
    db.close();
  }
}

export function readNewSteps(dbPath: string, afterIdx: number): { events: AgentEvent[]; maxIdx: number } {
  let db: DatabaseSync;
  try {
    db = new DatabaseSync(dbPath, { open: true });
  } catch {
    return { events: [], maxIdx: afterIdx };
  }

  try {
    const rows = db
      .prepare('SELECT idx, step_type, status, has_subtrajectory, step_payload FROM steps WHERE idx > ? ORDER BY idx ASC')
      .all(afterIdx) as unknown as StepRow[];

    if (rows.length === 0) return { events: [], maxIdx: afterIdx };

    // Derive cascade_id from trajectory_meta to build the agentId
    const metaRows = db
      .prepare('SELECT cascade_id FROM trajectory_meta LIMIT 1')
      .all() as unknown as { cascade_id: string }[];

    if (metaRows.length === 0) return { events: [], maxIdx: afterIdx };
    const agentId = `agy-${metaRows[0].cascade_id}`;

    const events: AgentEvent[] = rows.map((row) => {
      let toolNames: string[] | undefined;
      // Extract tools from tool_use steps
      if (row.step_payload && (row.step_type === 33 || row.step_type === 90)) {
        toolNames = extractToolNames(row.step_payload);
      }

      return {
        id: randomUUID(),
        agentId,
        taskId: undefined,
        type: STEP_TYPE_MAP[row.step_type] ?? 'message',
        timestamp: new Date().toISOString(),
        payload: {
          stepType: row.step_type,
          status: row.status,
          hasSubtrajectory: Boolean(row.has_subtrajectory),
          ...(toolNames && toolNames.length > 0 ? { toolNames } : {})
        },
      };
    });

    const maxIdx = rows[rows.length - 1].idx;
    return { events, maxIdx };
  } finally {
    db.close();
  }
}
