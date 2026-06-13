"use client";

import React, { useState } from "react";
import { Folder, Terminal, Network, BarChart } from "lucide-react";
import { VaultFile, VaultFolder } from "@/lib/vault";
import FederationStatus from "@/components/FederationStatus";
import { SearchPalette } from "@/components/SearchPalette";
import GraphView from "@/components/GraphView";
import FederationDrawer from "@/components/FederationDrawer";
import FileExplorer from "@/components/FileExplorer";
import MarkdownReader from "@/components/MarkdownReader";
import VaultAnalytics from "@/components/VaultAnalytics";

interface VaultAppProps {
  files: VaultFile[];
  folders: VaultFolder[];
}

export default function VaultApp({ files, folders }: VaultAppProps) {
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<VaultFile | null>(null);
  const [activeView, setActiveView] = useState<
    "federation" | "folder" | "file" | "analytics"
  >("federation");

  return (
    <div
      className="app-layout"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        background: "#000",
        color: "#e0e0e0",
      }}
    >
      <SearchPalette
        files={files}
        onSelect={(file) => {
          setActiveFolder(file.folder);
          setActiveFile(file);
          setActiveView("file");
        }}
      />
      <FederationDrawer />

      {/* Top Taskbar */}
      <header
        className="top-taskbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "4px 16px",
          borderBottom: "1px solid #333",
          background: "#0a0a0a",
          fontFamily: "monospace",
          fontSize: "0.85rem",
          color: "#10b981",
        }}
      >
        <div
          className="taskbar-brand"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Terminal size={14} />
          <span>root@vault-os:~</span>
        </div>
        <FederationStatus />
      </header>

      <div
        className="app-workspace"
        style={{ display: "flex", flex: 1, overflow: "hidden" }}
      >
        {/* Sidebar */}
        <aside
          className="sidebar tactical-dock"
          style={{
            width: "250px",
            borderRight: "1px solid #333",
            background: "#050505",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className="dock-header"
            style={{
              padding: "16px",
              borderBottom: "1px solid #333",
              color: "#10b981",
              fontFamily: "monospace",
              fontWeight: "bold",
            }}
          >
            <span className="blink-cursor">_</span> SYS_MENU
          </div>

          <div
            className="sidebar-nav"
            style={{ padding: "16px", overflowY: "auto", flex: 1 }}
          >
            <h1 className="sidebar-title">Vault</h1>

            <div className="sidebar-nav">
              <div
                className={`folder-item ${activeView === "federation" ? "active" : ""}`}
                onClick={() => {
                  setActiveFolder(null);
                  setActiveFile(null);
                  setActiveView("federation");
                }}
                style={{
                  marginBottom: "8px",
                  color:
                    activeView === "federation"
                      ? "#10b981"
                      : "var(--text-primary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "8px 12px",
                }}
              >
                <Network size={18} />
                <span>Knowledge Graph</span>
              </div>

              <div
                className={`folder-item ${activeView === "analytics" ? "active" : ""}`}
                onClick={() => {
                  setActiveFolder(null);
                  setActiveFile(null);
                  setActiveView("analytics");
                }}
                style={{
                  marginBottom: "16px",
                  color:
                    activeView === "analytics"
                      ? "#10b981"
                      : "var(--text-primary)",
                  borderBottom: "1px solid #333",
                  paddingBottom: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "8px 12px",
                }}
              >
                <BarChart size={18} />
                <span>Vault Analytics</span>
              </div>
            </div>

            <div
              style={{
                fontSize: "0.75rem",
                color: "#666",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "8px",
                paddingLeft: "12px",
                fontFamily: "monospace",
              }}
            >
              /mnt/directories
            </div>

            {folders.map((folder) => (
              <div
                key={folder.path}
                className={`folder-item ${activeFolder === folder.name && activeView !== "federation" ? "active" : ""}`}
                onClick={() => {
                  setActiveFolder(folder.name);
                  setActiveFile(null);
                  setActiveView("folder");
                }}
                style={{
                  marginBottom: "8px",
                  background:
                    activeFolder === folder.name && activeView !== "federation"
                      ? "rgba(16, 185, 129, 0.1)"
                      : "transparent",
                  borderLeft:
                    activeFolder === folder.name && activeView !== "federation"
                      ? "2px solid #10b981"
                      : "2px solid transparent",
                  color:
                    activeFolder === folder.name && activeView !== "federation"
                      ? "#10b981"
                      : "var(--text-secondary)",
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                  fontFamily: "monospace",
                  transition: "all 0.2s",
                }}
              >
                <Folder size={16} />
                <span>{folder.name}/</span>
              </div>
            ))}
            {folders.length === 0 && (
              <div
                style={{
                  color: "#666",
                  fontSize: "0.85rem",
                  paddingLeft: "12px",
                  fontFamily: "monospace",
                }}
              >
                ls: no directories
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main
          className="main-content stark-window"
          style={{
            flex: 1,
            padding: "16px",
            background: "#000",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {activeView === "federation" ? (
            <GraphView
              files={files}
              onNodeClick={(nodeId) => {
                const file = files.find(
                  (f) => f.name.replace(/\.md$/i, "") === nodeId,
                );
                if (file) {
                  setActiveFolder(file.folder);
                  setActiveFile(file);
                  setActiveView("file");
                }
              }}
            />
          ) : activeView === "analytics" ? (
            <div
              className="os-window"
              style={{
                animation: "fadeIn 0.2s ease-out forwards",
                border: "1px solid #333",
                background: "#050505",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <VaultAnalytics files={files} />
            </div>
          ) : activeView === "folder" && activeFolder ? (
            <div
              className="os-window"
              style={{
                animation: "fadeIn 0.2s ease-out forwards",
                border: "1px solid #333",
                background: "#050505",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                className="window-content"
                style={{ flex: 1, overflowY: "auto" }}
              >
                <FileExplorer
                  files={files}
                  activeFolder={activeFolder}
                  onFileSelect={(file) => {
                    setActiveFile(file);
                    setActiveView("file");
                  }}
                />
              </div>
            </div>
          ) : (
            activeView === "file" &&
            activeFile && (
              <div
                className="os-window"
                key={activeFile.path}
                style={{
                  border: "1px solid #333",
                  background: "#050505",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  className="window-content"
                  style={{
                    overflowY: "auto",
                    flex: 1,
                    fontFamily: "monospace",
                    color: "#e0e0e0",
                  }}
                >
                  <MarkdownReader file={activeFile} />
                </div>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}
