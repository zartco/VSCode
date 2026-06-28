# Vault-Web "Convergence" Architecture Spec

## Overview
Vault-Web has transitioned from a simple Markdown viewer into a fully integrated, intelligent command center. The system now supports Global Full-Text Search, Obsidian-style Graph Visualization, and Deep Federation Control.

## Key Components

### 1. Global Full-Text Search
- **Technology:** `fuse.js`
- **Location:** `src/components/SearchPalette.tsx`, `src/lib/search.ts`
- **Trigger:** Intercepts `Ctrl+K` globally to toggle the Search Palette overlay.
- **Functionality:** Provides client-side fuzzy searching across all `VaultFile`'s name and content properties. Clicking a result navigates to that file and opens the Markdown View.

### 2. Knowledge Graph Visualization
- **Technology:** `react-force-graph-2d`
- **Location:** `src/components/GraphView.tsx`, `src/lib/graph.ts`
- **Functionality:** Parses markdown files for bidirectional `[[Links]]` using regex. Displays nodes sized dynamically based on inbound link count. Identifies unresolved nodes (links without backing files). Replaces the empty state workspace.

### 3. Federation Control Plane
- **Technology:** `zustand`, SSE (Server-Sent Events)
- **Location:** `src/lib/store.ts`, `src/components/FederationDrawer.tsx`, `src/components/FederationStatus.tsx`
- **Functionality:** Manages the live stream of `monitor-steward` telemetry and Antigravity execution events via `EventSource`. Maintains the global state of the federation swarm (`connecting`, `online`, `offline`), active subagents, and their current execution tasks. Accessible via a slide-out drawer interacting with the `FED_LINK` taskbar widget.

## 7-Agent Swarm Integration
This architecture was implemented via a parallel 7-Agent Swarm utilizing the Leader-Follower pattern. The agents successfully coordinated without conflicts, with distinct tiers operating efficiently:
- Tier 1: Search, Graph, Federation modules constructed in parallel
- Tier 2: `VaultApp.tsx` global assembly
- Tier 3: Specification Documentation (`knowledge-steward`)
- Tier 4: `qa-tester` (Zero lint/tsc errors)
