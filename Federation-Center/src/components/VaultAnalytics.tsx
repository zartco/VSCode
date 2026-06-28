"use client";

import React, { useMemo } from "react";
import { VaultFile } from "@/lib/vault";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import { Calendar, FileText, Hash, Folder } from "lucide-react";

interface VaultAnalyticsProps {
  files: VaultFile[];
}

const COLORS = [
  "#c084fc", // Purple 400
  "#f472b6", // Pink 400
  "#fb7185", // Rose 400
  "#00ff00", // Sky 400
  "#2dd4bf", // Teal 400
  "#34d399", // Emerald 400
  "#fbbf24", // Amber 400
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "rgba(10, 10, 15, 0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
          borderRadius: "12px",
          padding: "16px",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <p style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 600, color: "#a1a1aa" }}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ margin: 0, color: entry.color || entry.payload.fill, fontWeight: 700, fontSize: "16px" }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function VaultAnalytics({ files }: VaultAnalyticsProps) {
  const folderData = useMemo(() => {
    const counts: Record<string, number> = {};
    files.forEach((f) => {
      counts[f.folder] = (counts[f.folder] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
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

  const growthData = useMemo(() => {
    const sortedFiles = [...files]
      .filter((f) => f.createdAt)
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

    const grouped: Record<string, number> = {};
    sortedFiles.forEach((f) => {
      const date = new Date(f.createdAt!);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      grouped[dateKey] = (grouped[dateKey] || 0) + 1;
    });

    let cumulative = 0;
    return Object.entries(grouped).map(([date, count]) => {
      cumulative += count;
      return { date, count: cumulative };
    });
  }, [files]);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100%",
        padding: "32px",
        overflowY: "auto",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: "#f4f4f5",
        background: "linear-gradient(145deg, #050505 0%, #000000 100%)",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header Section */}
        <div style={{ marginBottom: "40px" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              margin: "0 0 16px 0",
              background: "linear-gradient(to right, #c084fc, #00ff00)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
            }}
          >
            Vault Intelligence
          </h1>
          <p style={{ color: "#a1a1aa", fontSize: "1.1rem", margin: 0, fontWeight: 400 }}>
            Artistic insights and structural analytics of your digital mind.
          </p>
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "24px",
            marginBottom: "40px",
          }}
        >
          {[
            { label: "Total Artifacts", value: files.length, icon: <FileText size={20} color="#c084fc" /> },
            { label: "Categories", value: folderData.length, icon: <Folder size={20} color="#00ff00" /> },
            { label: "Unique Tags", value: tagData.length, icon: <Hash size={20} color="#f472b6" /> },
            { label: "Days Active", value: growthData.length, icon: <Calendar size={20} color="#34d399" /> },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: "rgba(20, 20, 25, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: "16px",
                padding: "24px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                boxShadow: "0 4px 24px -4px rgba(0,0,0,0.5)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  padding: "12px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {stat.icon}
              </div>
              <div>
                <p style={{ margin: "0 0 4px 0", color: "#a1a1aa", fontSize: "0.9rem", fontWeight: 500 }}>
                  {stat.label}
                </p>
                <p style={{ margin: 0, fontSize: "1.8rem", fontWeight: 700, color: "#fff" }}>
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Growth Chart */}
        <div
          style={{
            background: "rgba(20, 20, 25, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "24px",
            padding: "32px",
            marginBottom: "32px",
            boxShadow: "0 8px 32px -8px rgba(0,0,0,0.6)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px 0", color: "#fff" }}>
              Vault Expansion
            </h2>
            <p style={{ color: "#a1a1aa", margin: 0, fontSize: "0.95rem" }}>
              Cumulative artifact generation over time
            </p>
          </div>
          
          <div style={{ height: "400px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c084fc" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#c084fc" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#52525b" 
                  tick={{ fill: "#a1a1aa", fontSize: 12 }} 
                  tickMargin={12}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#52525b" 
                  tick={{ fill: "#a1a1aa", fontSize: 12 }} 
                  tickMargin={12}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Total Artifacts"
                  stroke="#c084fc"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorGrowth)"
                  activeDot={{ r: 8, strokeWidth: 0, fill: "#c084fc", style: { filter: "drop-shadow(0 0 8px rgba(192, 132, 252, 0.8))" } }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Grid for Secondary Charts */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "32px",
          }}
        >
          {/* Top Tags Pie */}
          <div
            style={{
              background: "rgba(20, 20, 25, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "24px",
              padding: "32px",
              boxShadow: "0 8px 32px -8px rgba(0,0,0,0.6)",
              backdropFilter: "blur(10px)",
            }}
          >
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 24px 0", color: "#fff" }}>
              Thematic Distribution
            </h3>
            {tagData.length > 0 ? (
              <div style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tagData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={6}
                    >
                      {tagData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      formatter={(value) => <span style={{ color: "#a1a1aa", fontWeight: 500 }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center", color: "#52525b" }}>
                Awaiting thematic structures...
              </div>
            )}
          </div>

          {/* Folders Distribution */}
          <div
            style={{
              background: "rgba(20, 20, 25, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "24px",
              padding: "32px",
              boxShadow: "0 8px 32px -8px rgba(0,0,0,0.6)",
              backdropFilter: "blur(10px)",
            }}
          >
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 24px 0", color: "#fff" }}>
              Structural Dominance
            </h3>
            <div style={{ height: "300px", overflowY: "auto", paddingRight: "8px" }}>
              {folderData.map((folder, i) => {
                const max = folderData[0].value;
                const percentage = (folder.value / max) * 100;
                return (
                  <div key={i} style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
                      <span style={{ color: "#f4f4f5", fontWeight: 500 }}>{folder.name}</span>
                      <span style={{ color: "#a1a1aa" }}>{folder.value}</span>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: "100%",
                          background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}80, ${COLORS[i % COLORS.length]})`,
                          borderRadius: "4px",
                          transition: "width 1s ease-in-out",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
