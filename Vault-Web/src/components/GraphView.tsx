"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { VaultFile } from "@/lib/vault";
import { generateGraphData, GraphNode } from "@/lib/graph";

// react-force-graph-2d must be imported dynamically without SSR
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full bg-slate-900 text-slate-400">
      Loading graph...
    </div>
  ),
});

interface GraphViewProps {
  files: VaultFile[];
  onNodeClick: (nodeId: string) => void;
}

export default function GraphView({ files, onNodeClick }: GraphViewProps) {
  const graphData = React.useMemo(() => generateGraphData(files), [files]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handleNodeClick = (node: object) => {
    const n = node as GraphNode;
    if (n && n.id) {
      onNodeClick(n.id);
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[400px] bg-slate-900 rounded-lg overflow-hidden border border-slate-800 shadow-inner"
    >
      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel="name"
        nodeColor={(node: object) =>
          (node as GraphNode).group === "Unresolved" ? "#ef4444" : "#3b82f6"
        }
        nodeRelSize={4}
        nodeVal={(node: object) => (node as GraphNode).val || 1}
        linkColor={() => "#334155"}
        linkWidth={1.5}
        onNodeClick={handleNodeClick}
        backgroundColor="#0f172a"
      />
    </div>
  );
}
