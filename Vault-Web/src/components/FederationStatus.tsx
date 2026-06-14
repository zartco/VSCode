"use client";

import React, { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { useFederationStore } from "../lib/store";
import { parseFederationSseMessage } from "../lib/federation-sse";

export default function FederationStatus() {
  const { status, setStatus, addEvent, updateAgent, setDrawerOpen } =
    useFederationStore();
  const [lastEvent, setLastEvent] = useState<string>("Initializing...");

  useEffect(() => {
    const sse = new EventSource("http://127.0.0.1:3001/events/stream");

    sse.onopen = () => {
      setStatus("online");
      setLastEvent("Connected to Control Plane");
      addEvent("Connected to Control Plane");
    };

    sse.onmessage = (event) => {
      const update = parseFederationSseMessage(event.data);
      if (!update) return;

      if (update.kind === "event") {
        const msg =
          update.content.substring(0, 30) +
          (update.content.length > 30 ? "..." : "");
        setLastEvent(msg);
        addEvent(update.content);
      } else if (update.kind === "agent_upsert") {
        updateAgent(update.agent);
        setLastEvent(`${update.agent.name ?? update.agent.id} synced`);
      } else if (update.kind === "task_upsert") {
        setLastEvent(update.description);
        addEvent(update.description);
      }
    };

    sse.onerror = () => {
      setStatus("offline");
      setLastEvent("Connection lost. Retrying...");
      addEvent("Connection lost. Retrying...");
    };

    return () => {
      sse.close();
    };
  }, [setStatus, addEvent, updateAgent]);

  return (
    <div
      onClick={() => setDrawerOpen(true)}
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
          style={{ fontWeight: "bold", letterSpacing: "1px", color: "#ffffff" }}
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
        <span style={{ color: "#555" }}>[STS]</span>
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
          color: "#00ff00",
        }}
      >
        <span style={{ color: "#555", marginRight: "8px" }}>&gt;</span>
        {lastEvent}
      </div>
    </div>
  );
}
