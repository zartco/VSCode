"use client";

import React, { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { useFederationStore } from "../lib/store";

export default function FederationStatus() {
  const { status, setStatus, addEvent, setAgents, setDrawerOpen } =
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
      try {
        const data = JSON.parse(event.data);
        if (data.type === "event" && data.payload?.content) {
          const content = data.payload.content;
          const msg =
            content.substring(0, 30) + (content.length > 30 ? "..." : "");
          setLastEvent(msg);
          addEvent(content);
        } else if (data.type === "connected") {
          setLastEvent("Stream initialized");
          addEvent("Stream initialized");
        } else if (data.type === "agent_status") {
          // Attempt to parse agents if provided in payload
          if (Array.isArray(data.payload?.agents)) {
            setAgents(data.payload.agents);
          }
        } else if (data.agents && Array.isArray(data.agents)) {
          // If the payload has a direct agents array
          setAgents(data.agents);
        }
      } catch {
        // ignore parse errors
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
  }, [setStatus, addEvent, setAgents]);

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
