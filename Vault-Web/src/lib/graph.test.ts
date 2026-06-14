import { test } from "node:test";
import assert from "node:assert/strict";
import { generateGraphData } from "./graph";
import type { VaultFile } from "./vault";

test("generateGraphData creates links for aliases, headings, and unresolved notes", () => {
  const files: VaultFile[] = [
    {
      name: "Dashboard.md",
      path: "/Dashboard.md",
      folder: "Root",
      content:
        "See [[Federation|control plane]], [[Missing Note#Plan]], and [[Dashboard]].",
    },
    {
      name: "Federation.md",
      path: "/Federation.md",
      folder: "Projects",
      content: "",
    },
  ];

  const graph = generateGraphData(files);

  assert.deepEqual(
    graph.nodes.map((node) => ({
      id: node.id,
      group: node.group,
      val: node.val,
    })),
    [
      { id: "Dashboard", group: "Root", val: 2 },
      { id: "Federation", group: "Projects", val: 2.5 },
      { id: "Missing Note", group: "Unresolved", val: 1.5 },
    ],
  );
  assert.deepEqual(graph.links, [
    { source: "Dashboard", target: "Federation" },
    { source: "Dashboard", target: "Missing Note" },
  ]);
});
