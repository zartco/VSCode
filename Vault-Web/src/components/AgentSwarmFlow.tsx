"use client";

import React, { useEffect, useState, useRef } from "react";
import { Terminal, Cpu, Play } from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: string;
  agent: string;
  content: string;
  type: "system" | "agent";
  agentIndex: number;
}

export default function AgentSwarmFlow() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<"connecting" | "online" | "offline">(
    "connecting",
  );
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Keep track of agent names to assign them consistent colors (1-7)
  const agentMapRef = useRef<Record<string, number>>({});
  const nextAgentIndexRef = useRef<number>(1);

  const getAgentIndex = (agentName: string) => {
    if (!agentMapRef.current[agentName]) {
      agentMapRef.current[agentName] = nextAgentIndexRef.current;
      nextAgentIndexRef.current = (nextAgentIndexRef.current % 7) + 1;
    }
    return agentMapRef.current[agentName];
  };

  const addLog = (
    agent: string,
    content: string,
    type: "system" | "agent" = "agent",
  ) => {
    setLogs((prev) => {
      const newLogs = [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toLocaleTimeString([], {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          agent,
          content,
          type,
          agentIndex: type === "system" ? 0 : getAgentIndex(agent),
        },
      ];
      // keep max 200 logs to prevent memory leaks
      return newLogs.slice(-200);
    });
  };

  useEffect(() => {
    // Initial system boot logs
    setTimeout(
      () => addLog("SYSTEM", "Initializing Swarm Command Center...", "system"),
      500,
    );
    setTimeout(
      () =>
        addLog(
          "SYSTEM",
          "Awaiting telemetry from agent endpoints...",
          "system",
        ),
      1200,
    );

    const sse = new EventSource("http://127.0.0.1:3001/events/stream");

    sse.onopen = () => {
      setStatus("online");
      addLog(
        "SYSTEM",
        "Federated Uplink established. Swarm node ready.",
        "system",
      );
    };

    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "event" && data.payload?.content) {
          // Attempt to extract an agent name if available, else default to Agent
          const agentName =
            data.payload.agent ||
            data.payload.source ||
            "Agent-" +
              Math.floor(Math.random() * 1000)
                .toString()
                .substring(0, 3);
          addLog(agentName, data.payload.content, "agent");
        } else if (data.type === "connected") {
          addLog("SYSTEM", "Agent stream synchronized.", "system");
        }
      } catch {
        // ignore parse errors
      }
    };

    let errorLogged = false;
    sse.onerror = () => {
      setStatus("offline");
      if (!errorLogged) {
        addLog("SYSTEM", "Connection lost. Re-establishing link...", "system");
        errorLogged = true;
      }
    };

    return () => {
      sse.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const simulateSwarm = () => {
    const agents = [
      "RESEARCHER",
      "CODER",
      "REVIEWER",
      "PLANNER",
      "QA",
      "DEVOPS",
      "ARCHITECT",
    ];
    const actions = [
      "Analyzing component dependency graph...",
      "Extracting federation schema...",
      "Drafting implementation plan for Vault-Web.",
      "Testing module federations...",
      "Deployed local cluster for validation.",
      "Reviewing CSS architecture for anomalies.",
      "Optimizing build cache hit rate.",
      "Graph database sync completed.",
      "Pushing telemetry to control plane.",
      "Awaiting instructions from user.",
    ];

    setStatus("online");
    addLog("SYSTEM", "Simulated Swarm Unleashed.", "system");

    let count = 0;
    const interval = setInterval(() => {
      const agent = agents[Math.floor(Math.random() * agents.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      addLog(agent, action, "agent");
      count++;
      if (count > 25) clearInterval(interval);
    }, 400);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  return (
    <div
      style={{
        backgroundColor: "#000000",
        color: "#10b981",
        border: "1px solid #10b981",
        fontFamily: 'monospace, "Courier New", Courier',
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          backgroundColor: "#10b981",
          color: "#000000",
          padding: "4px 8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: "bold",
          fontSize: "0.85rem",
          borderBottom: "1px solid #10b981",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Terminal size={14} />
          <span>root@vault:~# swarm-ops</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Cpu size={14} />
          <span>
            {status === "online" ? "7 AGENTS SYNCED" : "AWAITING AGENTS"}
          </span>
          <button
            onClick={simulateSwarm}
            style={{
              marginLeft: "8px",
              background: "#000000",
              color: "#10b981",
              border: "1px solid #000000",
              padding: "2px 6px",
              fontSize: "0.7rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            <Play size={10} />
            Demo
          </button>
        </div>
      </div>

      <div
        style={{
          padding: "12px",
          overflowY: "auto",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          fontSize: "0.85rem",
        }}
      >
        {logs.map((log) => (
          <div
            key={log.id}
            style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}
          >
            <div
              style={{ color: "#00ffff", opacity: 0.8, whiteSpace: "nowrap" }}
            >
              [{log.timestamp}]
            </div>
            <div
              style={{
                color: log.type === "system" ? "#f59e0b" : "#10b981",
                fontWeight: "bold",
                minWidth: "100px",
              }}
            >
              {log.agent}
            </div>
            <div
              style={{
                color: log.type === "system" ? "#f59e0b" : "#00ffff",
                flex: 1,
                wordBreak: "break-word",
              }}
            >
              {log.content}
            </div>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
