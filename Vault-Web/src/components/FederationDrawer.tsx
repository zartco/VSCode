"use client";

import React from "react";
import { useFederationStore } from "../lib/store";
import { X, Server, Activity, Terminal } from "lucide-react";

export default function FederationDrawer() {
  const { isDrawerOpen, setDrawerOpen, status, events, agents } =
    useFederationStore();

  if (!isDrawerOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "400px",
        height: "100vh",
        backgroundColor: "rgba(10, 10, 10, 0.95)",
        borderLeft: "1px solid #333",
        boxShadow: "-5px 0 20px rgba(0,0,0,0.8)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        color: "#a0a0a0",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px",
          borderBottom: "1px solid #333",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#fff",
          }}
        >
          <Server
            size={18}
            color={
              status === "online"
                ? "#00ff00"
                : status === "connecting"
                  ? "#ffaa00"
                  : "#ff0000"
            }
          />
          <h2 style={{ margin: 0, fontSize: "14px", letterSpacing: "1px" }}>
            FEDERATION CONTROL PLANE
          </h2>
        </div>
        <button
          aria-label="Close Federation Control Plane"
          onClick={() => setDrawerOpen(false)}
          style={{
            background: "transparent",
            border: "none",
            color: "#a0a0a0",
            cursor: "pointer",
            display: "flex",
            padding: "4px",
          }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ padding: "16px", borderBottom: "1px solid #333" }}>
        <h3
          style={{
            fontSize: "12px",
            color: "#fff",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Activity size={14} /> SYSTEM STATUS
        </h3>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
          }}
        >
          <span>Connection:</span>
          <span
            style={{
              color:
                status === "online"
                  ? "#00ff00"
                  : status === "connecting"
                    ? "#ffaa00"
                    : "#ff0000",
            }}
          >
            {status.toUpperCase()}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            marginTop: "8px",
          }}
        >
          <span>Active Agents:</span>
          <span style={{ color: "#00ff00" }}>{agents.length}</span>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {agents.length > 0 && (
          <div>
            <h3
              style={{ fontSize: "12px", color: "#fff", marginBottom: "12px" }}
            >
              AGENTS
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {agents.map((agent, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid #333",
                    borderRadius: "4px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <strong style={{ color: "#fff", fontSize: "12px" }}>
                      {agent.name || agent.id || "Unknown Agent"}
                    </strong>
                    <span
                      style={{
                        fontSize: "10px",
                        color:
                          agent.status === "active" ? "#00ff00" : "#ffaa00",
                      }}
                    >
                      {agent.status || "idle"}
                    </span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#888" }}>
                    {agent.currentTask || "Standing by..."}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3
            style={{
              fontSize: "12px",
              color: "#fff",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Terminal size={14} /> EVENT LOG
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              backgroundColor: "#000",
              padding: "12px",
              borderRadius: "4px",
              border: "1px solid #333",
              height: "300px",
              overflowY: "auto",
            }}
          >
            {events.length === 0 ? (
              <span style={{ color: "#555", fontSize: "11px" }}>
                Waiting for events...
              </span>
            ) : (
              events.map((event, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: "11px",
                    lineHeight: "1.4",
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  <span style={{ color: "#555" }}>&gt;</span>{" "}
                  <span style={{ color: "#00ff00" }}>{event}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
