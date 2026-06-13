import { VaultFile } from "./vault";

export interface GraphNode {
  id: string;
  name: string;
  group?: string;
  val?: number;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export function generateGraphData(files: VaultFile[]): GraphData {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const nodeIds = new Set<string>();

  // Create initial nodes for all vault files
  files.forEach((file) => {
    const name = file.name.replace(/\.md$/i, "");
    nodes.push({
      id: name,
      name: name,
      group: file.folder,
      val: 2, // base node size
    });
    nodeIds.add(name);
  });

  // Extract links and create edges
  files.forEach((file) => {
    const sourceName = file.name.replace(/\.md$/i, "");
    const content = file.content || "";

    // Match Obsidian-style links [[Link]] or [[Link|Display]] or [[Link#Heading]]
    const linkRegex = /\[\[(.*?)\]\]/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      let targetName = match[1];

      if (targetName.includes("|")) {
        targetName = targetName.split("|")[0];
      }
      if (targetName.includes("#")) {
        targetName = targetName.split("#")[0];
      }
      targetName = targetName.trim();

      if (targetName && targetName !== sourceName) {
        // If node doesn't exist, create it as an unresolved link
        if (!nodeIds.has(targetName)) {
          nodes.push({
            id: targetName,
            name: targetName,
            group: "Unresolved",
            val: 1, // smaller size for unresolved nodes
          });
          nodeIds.add(targetName);
        }

        links.push({
          source: sourceName,
          target: targetName,
        });

        // Increase node size slightly for each incoming link
        const targetNode = nodes.find((n) => n.id === targetName);
        if (targetNode && targetNode.val !== undefined) {
          targetNode.val += 0.5;
        }
      }
    }
  });

  return { nodes, links };
}
