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
  const color = source === 'claude' ? 'var(--accent-orange)' : 'var(--accent-matrix)'
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

  const latestAntigravity = agents
    .filter(a => a.source === 'antigravity')
    .sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime())[0]

  const liveAgents = agents
    .filter(a => {
      if (a.source === 'antigravity') {
        return a.id === latestAntigravity?.id && (a.status === 'active' || a.status === 'idle')
      }
      return a.status === 'active' || a.status === 'idle'
    })
    .sort((a, b) => {
      if (a.source === 'antigravity' && b.source !== 'antigravity') return -1
      if (a.source !== 'antigravity' && b.source === 'antigravity') return 1
      return 0
    })

  const historicalAgents = agents.filter(a => {
    if (a.source === 'antigravity') {
      if (a.id !== latestAntigravity?.id) return true
      return a.status === 'stopped'
    }
    return a.status === 'stopped'
  })

  const renderAgentList = (list: AgentNode[]) => (
    <ul className="agent-cards">
      {list.map((agent) => {
        const eventCount = events.filter((e) => e.agentId === agent.id).length
        const isOrch = agent.source === 'antigravity' && agent.id === latestAntigravity?.id
        return (
          <li key={agent.id}>
            <button
              className={`agent-card ${selectedAgentId === agent.id ? 'agent-card--selected' : ''} ${isOrch ? 'agent-card--orchestrator' : ''}`}
              onClick={() => handleClick(agent.id)}
              aria-pressed={selectedAgentId === agent.id}
            >
              {isOrch && (
                <div className="orchestrator-badge">
                  ★ PRIMARY ORCHESTRATOR
                </div>
              )}
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
              <div className="agent-card__name">
                {isOrch ? 'Antigravity CLI (Orchestrator)' : agent.name}
              </div>
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
  )

  return (
    <aside className="agent-list">
      <h2 className="panel-title">Live Agents</h2>
      {liveAgents.length > 0 ? renderAgentList(liveAgents) : <div className="empty-state">No live agents.</div>}
      
      <h2 className="panel-title" style={{ marginTop: '20px' }}>Agent History</h2>
      {historicalAgents.length > 0 ? renderAgentList(historicalAgents) : <div className="empty-state">No history.</div>}
    </aside>
  )
}
