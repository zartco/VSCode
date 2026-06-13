import { useState, useEffect, useCallback } from 'react'
import type { AgentNode, TaskNode, AgentEvent, SseMessage, ApiResponse } from '@contracts'
import { mockAgents, mockTasks, mockEvents } from './mock/data'
import { AgentList } from './components/AgentList'
import { TaskTree } from './components/TaskTree'
import { EventFeed } from './components/EventFeed'
import './App.css'

const API_BASE = 'http://127.0.0.1:3001'
const SSE_URL = `${API_BASE}/events/stream`

export default function App() {
  const [agents, setAgents] = useState<AgentNode[]>(mockAgents)
  const [tasks, setTasks] = useState<TaskNode[]>(mockTasks)
  const [events, setEvents] = useState<AgentEvent[]>(mockEvents)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [sseStatus, setSseStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')

  // Fetch real data on mount; fall back to mock data silently if backend is unreachable
  useEffect(() => {
    let cancelled = false

    async function fetchInitialData() {
      try {
        const [agentsRes, eventsRes] = await Promise.all([
          fetch(`${API_BASE}/agents`),
          fetch(`${API_BASE}/events?limit=200`),
        ])

        if (!agentsRes.ok || !eventsRes.ok) return

        const agentsJson = (await agentsRes.json()) as ApiResponse<AgentNode[]>
        const eventsJson = (await eventsRes.json()) as ApiResponse<AgentEvent[]>

        if (!agentsJson.ok || !eventsJson.ok) return
        if (cancelled) return

        setAgents(agentsJson.data)
        setEvents(eventsJson.data)
      } catch {
        // Backend unreachable — keep mock data
      }
    }

    void fetchInitialData()

    return () => {
      cancelled = true
    }
  }, [])

  const handleSseMessage = useCallback((msg: SseMessage) => {
    switch (msg.kind) {
      case 'agent_upsert':
        setAgents((prev) => {
          const idx = prev.findIndex((a) => a.id === msg.agent.id)
          if (idx === -1) return [...prev, msg.agent]
          const next = [...prev]
          next[idx] = msg.agent
          return next
        })
        break
      case 'task_upsert':
        setTasks((prev) => {
          const idx = prev.findIndex((t) => t.id === msg.task.id)
          if (idx === -1) return [...prev, msg.task]
          const next = [...prev]
          next[idx] = msg.task
          return next
        })
        break
      case 'event':
        setEvents((prev) => {
          // Deduplicate by id
          if (prev.some((e) => e.id === msg.event.id)) return prev
          return [...prev, msg.event]
        })
        break
      case 'heartbeat':
        // No state update needed; connection is alive
        break
    }
  }, [])

  useEffect(() => {
    let source: EventSource | null = null
    let closed = false
    let attempts = 0

    function connect() {
      try {
        source = new EventSource(SSE_URL)

        source.onopen = () => {
          if (!closed) setSseStatus('connected')
          attempts = 0
        }

        source.onmessage = (ev) => {
          if (closed) return
          try {
            const msg = JSON.parse(ev.data as string) as SseMessage
            handleSseMessage(msg)
          } catch {
            // Malformed SSE message — ignore
          }
        }

        source.onerror = () => {
          if (closed) return
          setSseStatus('disconnected')
          source?.close()
          source = null
          attempts++
          const delay = attempts <= 3 ? 1000 : 5000
          // Retry after backoff — backend may not be running yet
          setTimeout(() => {
            if (!closed) connect()
          }, delay)
        }
      } catch {
        // EventSource constructor failed (e.g., invalid URL)
        setSseStatus('disconnected')
      }
    }

    connect()

    return () => {
      closed = true
      source?.close()
    }
  }, [handleSseMessage])

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Federated Agent Control Plane</h1>
        <div className={`sse-indicator sse-indicator--${sseStatus}`} title={`SSE: ${sseStatus}`}>
          <span className="sse-dot" />
          <span className="sse-label">{sseStatus}</span>
        </div>
      </header>
      <main className="app-panels">
        <div className="panel panel--left">
          <AgentList
            agents={agents}
            events={events}
            selectedAgentId={selectedAgentId}
            onSelect={setSelectedAgentId}
          />
        </div>
        <div className="panel panel--middle">
          <TaskTree
            tasks={tasks}
            selectedAgentId={selectedAgentId}
          />
        </div>
        <div className="panel panel--right">
          <EventFeed
            events={events}
            selectedAgentId={selectedAgentId}
          />
        </div>
      </main>
    </div>
  )
}
