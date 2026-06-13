import type { AgentNode, AgentEvent } from '@contracts'
import './AgentList.css'

interface Props {
  agents: AgentNode[]
  events: AgentEvent[]
  selectedAgentId: string | null
  onSelect: (id: string | null) => void
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ago`
}

function StatusDot({ status }: { status: AgentNode['status'] }) {
  const color =
    status === 'active' ? 'var(--accent-green)' :
    status === 'idle'   ? 'var(--text-muted)'   :
                          'var(--accent-red)'
  return (
    <span
      className="status-dot"
      style={{ background: color }}
      title={status}
      aria-label={status}
    />
  )
}

function SourceBadge({ source }: { source: AgentNode['source'] }) {
  const color = source === 'claude' ? 'var(--accent-orange)' : 'var(--accent-blue)'
  return (
    <span className="source-badge" style={{ borderColor: color, color }}>
      {source}
    </span>
  )
}

export function AgentList({ agents, events, selectedAgentId, onSelect }: Props) {
  const handleClick = (id: string) => {
    onSelect(selectedAgentId === id ? null : id)
  }

  return (
    <aside className="agent-list">
      <h2 className="panel-title">Agents</h2>
      <ul className="agent-cards">
        {agents.map((agent) => {
          const eventCount = events.filter((e) => e.agentId === agent.id).length
          return (
            <li key={agent.id}>
              <button
                className={`agent-card ${selectedAgentId === agent.id ? 'agent-card--selected' : ''}`}
                onClick={() => handleClick(agent.id)}
                aria-pressed={selectedAgentId === agent.id}
              >
                <div className="agent-card__header">
                  <SourceBadge source={agent.source} />
                  <div className="agent-card__header-right">
                    {eventCount > 0 && (
                      <span className="agent-card__event-count" title={`${eventCount} events`}>
                        {eventCount}
                      </span>
                    )}
                    <StatusDot status={agent.status} />
                  </div>
                </div>
                <div className="agent-card__name">{agent.name}</div>
                <div className="agent-card__meta">
                  <span className="agent-card__status">{agent.status}</span>
                </div>
                <div className="agent-card__cwd" title={agent.cwd}>
                  {agent.cwd}
                </div>
                <div className="agent-card__time">
                  Last seen {formatRelative(agent.lastSeenAt)}
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
