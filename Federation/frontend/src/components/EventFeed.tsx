import type { AgentEvent, AgentEventType } from '@contracts'
import './EventFeed.css'

interface Props {
  events: AgentEvent[]
  selectedAgentId: string | null
}

type BadgeVariant =
  | 'orange'
  | 'blue'
  | 'green'
  | 'red'
  | 'yellow'
  | 'purple'
  | 'muted'

function eventBadgeVariant(type: AgentEventType): BadgeVariant {
  switch (type) {
    case 'session_start':  return 'green'
    case 'session_end':    return 'red'
    case 'tool_use':       return 'orange'
    case 'tool_result':    return 'yellow'
    case 'message':        return 'blue'
    case 'task_create':    return 'purple'
    case 'task_update':    return 'purple'
    case 'task_complete':  return 'green'
    case 'task_fail':      return 'red'
    case 'hook_trigger':   return 'orange'
    case 'error':          return 'red'
    default:               return 'muted'
  }
}

const ANTIGRAVITY_STEP_MAP: Record<number, string> = {
  14: 'session_start',
  33: 'tool_use',
  90: 'tool_use',
  5: 'tool_result',
  15: 'tool_result',
  21: 'tool_result',
  101: 'tool_result',
  132: 'tool_result',
  7: 'message',
  8: 'message',
  9: 'message',
  17: 'message',
  23: 'message',
  31: 'message',
  98: 'message',
  99: 'message',
}

function describePayload(type: AgentEventType, payload: unknown): string {
  if (payload === null || payload === undefined) return ''
  if (typeof payload !== 'object') return String(payload)

  const p = payload as Record<string, unknown>

  if (typeof p['stepType'] === 'number' && typeof p['status'] === 'number') {
    const name = ANTIGRAVITY_STEP_MAP[p['stepType']] || 'unknown'
    return `Step #${p['stepType']} (${name})`
  }

  switch (type) {
    case 'tool_use':
      return `${String(p['tool'] ?? '')} → ${String(p['path'] ?? p['file'] ?? '')}`
    case 'tool_result':
      return `${String(p['tool'] ?? '')} ${p['success'] ? '✓' : '✗'}`
    case 'message':
      return String(p['text'] ?? '').slice(0, 100)
    case 'task_create':
      return String(p['description'] ?? '')
    case 'task_complete':
      return String(p['summary'] ?? 'completed')
    case 'session_start':
      return `model=${String(p['model'] ?? p['version'] ?? '')} cwd=${String(p['cwd'] ?? '')}`
    case 'session_end':
      return String(p['reason'] ?? '')
    default:
      return JSON.stringify(p).slice(0, 80)
  }
}

function toRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000) return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return new Date(iso).toLocaleDateString()
}

interface EventRowProps {
  event: AgentEvent
}

function EventRow({ event }: EventRowProps) {
  const variant = eventBadgeVariant(event.type)
  const desc = describePayload(event.type, event.payload)

  return (
    <li className="event-row">
      <span className="event-row__time">{toRelative(event.timestamp)}</span>
      <span className={`event-badge event-badge--${variant}`}>{event.type}</span>
      {desc && <span className="event-row__desc">{desc}</span>}
    </li>
  )
}

export function EventFeed({ events, selectedAgentId }: Props) {
  const filtered = selectedAgentId
    ? events.filter((e) => e.agentId === selectedAgentId)
    : events

  // Newest first
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  return (
    <section className="event-feed">
      <h2 className="panel-title">
        Events{selectedAgentId ? '' : ' — all agents'}
        <span className="event-feed__count">{sorted.length}</span>
      </h2>
      {sorted.length === 0 ? (
        <p className="event-feed__empty">No events</p>
      ) : (
        <ul className="event-list">
          {sorted.map((ev) => (
            <EventRow key={ev.id} event={ev} />
          ))}
        </ul>
      )}
    </section>
  )
}
