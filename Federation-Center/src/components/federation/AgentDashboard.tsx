"use client";

import React, { useState } from "react";
import { AgentList } from "./AgentList";
import { EventFeed } from "./EventFeed";
import { SubagentList } from "./SubagentList";
import { CreateSubagent } from "./CreateSubagent";

export default function AgentDashboard() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "library" | "create"
  >("dashboard");

  return (
    <div
      className="federation-view"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        padding: "16px",
        background: "#000000",
        color: "#e0e0e0",
        overflow: "hidden",
      }}
    >
      <nav className="app-nav">
        <button
          className={activeTab === "dashboard" ? "active" : ""}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={activeTab === "library" ? "active" : ""}
          onClick={() => setActiveTab("library")}
        >
          Library
        </button>
        <button
          className={activeTab === "create" ? "active" : ""}
          onClick={() => setActiveTab("create")}
        >
          Create New
        </button>
      </nav>

      <div style={{ flex: 1, overflow: "hidden" }}>
        {activeTab === "dashboard" && (
          <div className="app-panels">
            <div className="panel panel--left">
              <AgentList />
            </div>
            <div className="panel panel--middle">
              <SubagentList
                endpoint="/api/subagents/deployed"
                title="Deployed Subagents"
              />
            </div>
            <div className="panel panel--right">
              <EventFeed />
            </div>
          </div>
        )}
        {activeTab === "library" && (
          <div style={{ height: "100%", overflowY: "auto" }}>
            <SubagentList
              endpoint="/api/subagents/library"
              title="Global Subagent Library"
            />
          </div>
        )}
        {activeTab === "create" && (
          <div style={{ height: "100%", overflowY: "auto" }}>
            <CreateSubagent />
          </div>
        )}
      </div>
    </div>
  );
}
export { AgentDashboard };
