"use client";

import React, { useState } from "react";

const API_BASE = "http://127.0.0.1:3001";

export function CreateSubagent() {
  const [name, setName] = useState("");
  const [vendor, setVendor] = useState("Codex");
  const [triggers, setTriggers] = useState("");
  const [instructions, setInstructions] = useState("");
  const [scope, setScope] = useState<"global" | "project">("global");
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Creating...");
    try {
      const res = await fetch(`${API_BASE}/api/subagents/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, vendor, triggers, instructions, scope }),
      });
      if (res.ok) {
        setStatus("Success! Subagent created.");
        setName("");
        setTriggers("");
        setInstructions("");
      } else {
        setStatus("Failed to create subagent.");
      }
    } catch (err) {
      setStatus(`Error: ${err}`);
    }
  };

  return (
    <div className="create-subagent">
      <h2 style={{ fontSize: "16px", marginBottom: "16px", textTransform: "uppercase", color: "var(--accent-blue)" }}>
        Create New Subagent
      </h2>
      <form onSubmit={handleSubmit} className="subagent-form">
        <label>
          Name:
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g., translator"
          />
        </label>
        <label>
          Vendor:
          <select value={vendor} onChange={(e) => setVendor(e.target.value)}>
            <option value="Codex">Codex</option>
            <option value="Claude">Claude</option>
            <option value="ollama">Ollama (Local OS)</option>
          </select>
        </label>
        <label>
          Scope:
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as "global" | "project")}
          >
            <option value="global">Global (~/.subagents)</option>
            <option value="project">Project (.subagents)</option>
          </select>
        </label>
        <label>
          Triggers:
          <input
            value={triggers}
            onChange={(e) => setTriggers(e.target.value)}
            required
            placeholder="e.g., translate, перевод"
          />
        </label>
        <label>
          Instructions:
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            required
            placeholder="You are a professional translator..."
            rows={10}
          />
        </label>
        <button type="submit">Create Subagent</button>
      </form>
      {status && <div className="status-msg">{status}</div>}
    </div>
  );
}
