"use client";

import React, { useMemo } from "react";
import { VaultFile } from "@/lib/vault";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface VaultAnalyticsProps {
  files: VaultFile[];
}

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

export default function VaultAnalytics({ files }: VaultAnalyticsProps) {
  const folderData = useMemo(() => {
    const counts: Record<string, number> = {};
    files.forEach((f) => {
      counts[f.folder] = (counts[f.folder] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [files]);

  const tagData = useMemo(() => {
    const counts: Record<string, number> = {};
    files.forEach((f) => {
      if (f.tags) {
        f.tags.forEach((t) => {
          counts[t] = (counts[t] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [files]);

  return (
    <div
      className="w-full h-full p-6 overflow-y-auto"
      style={{
        fontFamily: "monospace",
        color: "#e0e0e0",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          fontSize: "1.5rem",
          marginBottom: "24px",
          color: "#10b981",
          borderBottom: "1px solid #333",
          paddingBottom: "8px",
        }}
      >
        Vault Analytics
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "24px",
        }}
      >
        {/* Files per Folder */}
        <div
          style={{
            background: "#0a0a0a",
            border: "1px solid #333",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <h3 style={{ marginBottom: "16px", color: "#888" }}>
            Files per Folder
          </h3>
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={folderData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" stroke="#555" />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#888"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#1a1a1a" }}
                  contentStyle={{
                    background: "#000",
                    border: "1px solid #333",
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Tags */}
        <div
          style={{
            background: "#0a0a0a",
            border: "1px solid #333",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <h3 style={{ marginBottom: "16px", color: "#888" }}>Top Tags</h3>
          {tagData.length > 0 ? (
            <div style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tagData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {tagData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#000",
                      border: "1px solid #333",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div
              style={{
                height: "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#555",
              }}
            >
              No tags found in vault
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
