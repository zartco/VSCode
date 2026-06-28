"use client";

import React from "react";
import dynamic from "next/dynamic";
import { VaultFile } from "@/lib/vault";

const GraphView = dynamic(() => import("@/components/GraphView"), {
  ssr: false,
});

interface Props {
  files: VaultFile[];
}

export default function GraphOnlyClient({ files }: Props) {
  return (
    <GraphView 
      files={files} 
      onNodeClick={(nodeId) => console.log("Clicked:", nodeId)} 
    />
  );
}
