# Zartco's Computer Science Workspace

A unified, continuously evolving repository tracking a four-year computer science degree. Currently, it houses my CS50 coursework exercises, a fully featured YouTube downloader desktop application, and the early stages of a Federated Agent Control Plane for AI orchestration.

> **Note:** The definitive, interactive documentation and agent handoff payloads are managed within a local **Obsidian Vault** (`C:\Users\Zartc\Vault`). This README provides a high-level overview for GitHub.

---

## Repository Structure

```
CS50/                  → Python & HTML exercises from CS50
Federation/            → Fastify API & telemetry collectors for multi-agent observability
Precalculus/           → Notes and coursework tracking for WGU Precalculus
Vault-Web/             → Next.js dashboard bridging code execution and the Obsidian Vault
Youtube-Downloader/    → Windows desktop app for downloading videos/playlists
```

---

## 1. CS50 Exercises

Python and HTML scripts written while working through [CS50's Introduction to Programming with Python](https://cs50.harvard.edu/python/).
Each script is isolated and demonstrates core programming concepts.

For detailed information, refer to the [CS50 README](CS50/README.md).

---

## 2. YouTube Downloader

A resilient Windows desktop application for downloading YouTube videos and playlists, built with `tkinter`, `yt-dlp`, and `ffmpeg`.

For architecture details, execution instructions, and distribution formats, refer to the [YouTube Downloader README](Youtube-Downloader/README.md).

---

## 3. Vault-Web & Federation

The workspace has evolved into a multi-agent orchestrated setup where an autonomous cloud VM (Jules) and a local orchestrator (Antigravity) collaboratively manage the codebase.

- **Vault-Web**: A React/Next.js dashboard (`Vault-Web/`) acting as the singular window into multi-agent operations. It provides a visual knowledge graph, file explorer, and an analytics suite that natively reads the local Obsidian Vault.
- **Federated Agent Control Plane**: A read-only control plane (`Federation/`) to observe local subagent operations dynamically via Server-Sent Events (SSE). It strictly separates the control plane's Unified Data Model from opaque proprietary agent databases.

For detailed architecture, see [Vault-Web Convergence](docs/architecture/Vault-Web-Convergence.md) and the [Federation Execution Plan](docs/plans/federated-agent-control-plane-plan.md).

---

## Stewardship

This repository is maintained under perpetual AI stewardship. AI agents and contributors alike must ensure that scripts remain documented, cleanly structured, and properly tested as complexity scales over the next four years.

---

## Author

[zartco](https://github.com/zartco)
