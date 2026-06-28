"use client";

import React, { useState, useEffect } from "react";

const API_BASE = "";

type Subagent = {
  name: string;
  vendor: string;
  triggers: string;
};

export function SubagentList({
  endpoint,
  title,
}: {
  endpoint: string;
  title: string;
}) {
  const [agents, setAgents] = useState<Subagent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}${endpoint}`)
      .then((res) => res.json())
      .then((data) => {
        setAgents(data.agents || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [endpoint]);

  return (
    <div className="subagent-list-container">
      <h2 style={{ fontSize: "16px", marginBottom: "16px", textTransform: "uppercase", color: "var(--accent-blue)" }}>
        {title}
      </h2>
      {loading ? (
        <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Loading...</p>
      ) : agents.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>No subagents found.</p>
      ) : (
        <div className="subagent-grid">
          {agents.map((agent, i) => (
            <div key={i} className="subagent-card">
              <h3>{agent.name}</h3>
              <p>
                <strong>Vendor:</strong> {agent.vendor}
              </p>
              <p>
                <strong>Triggers:</strong> {agent.triggers}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
