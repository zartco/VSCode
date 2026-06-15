import { useState, useEffect } from 'react';
import './SubagentList.css';

const API_BASE = 'http://127.0.0.1:3001';

type Subagent = {
  name: string;
  vendor: string;
  triggers: string;
};

export function SubagentList({ endpoint, title }: { endpoint: string, title: string }) {
  const [agents, setAgents] = useState<Subagent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}${endpoint}`)
      .then(res => res.json())
      .then(data => {
        setAgents(data.agents || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [endpoint]);

  return (
    <div className="subagent-list-container">
      <h2>{title}</h2>
      {loading ? (
        <p>Loading...</p>
      ) : agents.length === 0 ? (
        <p>No subagents found.</p>
      ) : (
        <div className="subagent-grid">
          {agents.map((agent, i) => (
            <div key={i} className="subagent-card">
              <h3>{agent.name}</h3>
              <p><strong>Vendor:</strong> {agent.vendor}</p>
              <p><strong>Triggers:</strong> {agent.triggers}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
