"use client";

import React, { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { useFederationStore } from "../lib/store";
import { SseMessage, AgentEventType } from "@/contracts/types";

const API_BASE = "/api";

const ANTIGRAVITY_STEP_MAP: Record<number, string> = {
  14: "session_start",
  33: "tool_use",
  90: "tool_use",
  5: "tool_result",
  15: "tool_result",
  21: "tool_result",
  101: "tool_result",
  132: "tool_result",
  7: "message",
  8: "message",
  9: "message",
  17: "message",
  23: "message",
  31: "message",
  98: "message",
  99: "message",
};

function describePayload(type: AgentEventType, payload: unknown): string {
  if (payload === null || payload === undefined) return "";
  if (typeof payload !== "object") return String(payload);

  const p = payload as Record<string, unknown>;

  if (typeof p["stepType"] === "number" && typeof p["status"] === "number") {
    const name = ANTIGRAVITY_STEP_MAP[p["stepType"]] || "unknown";
    return `Step #${p["stepType"]} (${name})`;
  }

  switch (type) {
    case "tool_use":
      return `${String(p["tool"] ?? "")} → ${String(p["path"] ?? p["file"] ?? "")}`;
    case "tool_result":
      return `${String(p["tool"] ?? "")} ${p["success"] ? "✓" : "✗"}`;
    case "message":
      return String(p["text"] ?? "").slice(0, 100);
    case "task_create":
      return String(p["description"] ?? "");
    case "task_complete":
      return String(p["summary"] ?? "completed");
    case "session_start":
      return `model=${String(p["model"] ?? p["version"] ?? "")} cwd=${String(p["cwd"] ?? "")}`;
    case "session_end":
      return String(p["reason"] ?? "");
    default:
      return JSON.stringify(p).slice(0, 80);
  }
}

export default function FederationStatus() {
  const {
    status,
    setStatus,
    addEvent,
    setEvents,
    setAgents,
    updateAgent,
    setTasks,
    updateTask,
    setRawEvents,
    addRawEvent,
    setDrawerOpen,
  } = useFederationStore();
  const [lastEvent, setLastEvent] = useState<string>("Initializing...");

  // Fetch initial data on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchInitialData() {
      try {
        const [agentsRes, tasksRes, eventsRes] = await Promise.all([
          fetch(`${API_BASE}/agents`),
          fetch(`${API_BASE}/tasks`),
          fetch(`${API_BASE}/events?limit=200`),
        ]);

        if (cancelled) return;

        if (agentsRes.ok) {
          const res = await agentsRes.json();
          if (res.ok && Array.isArray(res.data)) {
            setAgents(res.data);
          }
        }
        if (tasksRes.ok) {
          const res = await tasksRes.json();
          if (res.ok && Array.isArray(res.data)) {
            setTasks(res.data);
          }
        }
        if (eventsRes.ok) {
          const res = await eventsRes.json();
          if (res.ok && Array.isArray(res.data)) {
            setRawEvents(res.data);
            // Also populate the string events array for the drawer
            const stringLogs = res.data.map(
              (e: any) =>
                `[${e.type.toUpperCase()}] ${describePayload(e.type, e.payload)}`
            );
            setEvents(stringLogs);
          }
        }
      } catch (err) {
        console.error("Failed to fetch initial federation data:", err);
      }
    }

    fetchInitialData();

    return () => {
      cancelled = true;
    };
  }, [setAgents, setTasks, setRawEvents, setEvents]);

  // Connect to SSE stream
  useEffect(() => {
    let sse: EventSource | null = null;
    let closed = false;
    let attempts = 0;

    function connect() {
      if (closed) return;
      
      sse = new EventSource(`${API_BASE}/events/stream`);

      sse.onopen = () => {
        if (closed) return;
        setStatus("online");
        setLastEvent("Connected to Control Plane");
        addEvent("Connected to Control Plane");
        attempts = 0;
      };

      sse.onmessage = (event) => {
        if (closed) return;
        try {
          const msg = JSON.parse(event.data) as SseMessage;
          switch (msg.kind) {
            case "agent_upsert":
              updateAgent(msg.agent);
              break;
            case "task_upsert":
              updateTask(msg.task);
              break;
            case "event": {
              addRawEvent(msg.event);
              const desc = describePayload(msg.event.type, msg.event.payload);
              const logMsg = `[${msg.event.type.toUpperCase()}] ${desc}`;
              const truncateMsg = desc.substring(0, 30) + (desc.length > 30 ? "..." : "");
              setLastEvent(truncateMsg);
              addEvent(logMsg);
              break;
            }
            case "heartbeat":
              // keep-alive
              break;
          }
        } catch (err) {
          console.error("Error parsing SSE message:", err);
        }
      };

      sse.onerror = () => {
        if (closed) return;
        setStatus("offline");
        setLastEvent("Connection lost. Retrying...");
        addEvent("Connection lost. Retrying...");
        sse?.close();
        sse = null;
        attempts++;
        const delay = attempts <= 3 ? 1000 : 5000;
        setTimeout(() => {
          connect();
        }, delay);
      };
    }

    connect();

    return () => {
      closed = true;
      if (sse) {
        sse.close();
      }
    };
  }, [setStatus, addEvent, updateAgent, updateTask, addRawEvent]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Open Federation Control Plane"
      onClick={() => setDrawerOpen(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setDrawerOpen(true);
        }
      }}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#000000",
        border: "1px solid #333",
        borderRadius: "0",
        padding: "0 12px",
        height: "32px",
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        fontSize: "11px",
        color: "#a0a0a0",
        gap: "16px",
        width: "100%",
        boxSizing: "border-box",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.8)",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Activity
          size={14}
          color={
            status === "online"
              ? "#00ff00"
              : status === "connecting"
                ? "#ffaa00"
                : "#ff0000"
          }
        />
        <span
          style={{ fontWeight: "bold", letterSpacing: "1px", color: "#ff00ff" }}
        >
          FED_LINK
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          borderLeft: "1px solid #333",
          paddingLeft: "16px",
        }}
      >
        <span style={{ color: "#00ffff" }}>[STS]</span>
        <span
          style={{
            color:
              status === "online"
                ? "#00ff00"
                : status === "connecting"
                  ? "#ffaa00"
                  : "#ff0000",
            fontWeight: "bold",
          }}
        >
          {status.toUpperCase()}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          flex: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          borderLeft: "1px solid #333",
          paddingLeft: "16px",
          color: "#00ffff",
        }}
      >
        <span style={{ color: "#ff00ff", marginRight: "8px" }}>&gt;</span>
        {lastEvent}
      </div>
    </div>
  );
}
