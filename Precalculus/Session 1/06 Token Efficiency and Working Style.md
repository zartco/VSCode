# Token Efficiency & Working Style

The user hit daily token limits during Session 1 (one very long conversation). Keep future sessions cheap:

- **One fresh chat per module/task.** A long thread re-reads its ENTIRE history (every tool result, file dump, screenshot) on every turn — that's the dominant cost. Memory + the vault carry context, so "Build M03" in a new chat starts lean.
- **Minimize screen control.** Screenshots are large images = the most token-heavy actions. Prefer writing files; let the user handle clicks/toggles.
- **Terse/quiet mode by default when conserving tokens** — skip the inline command narration unless the user wants to follow along (their command-showing preference still holds when learning).
- **Let files and scripts carry the weight.** Bulk work in the vault or via scripts (the exporter) beats generating large content inline; the user reopens files instead of re-asking.
- **Externalize state to the vault** (the whole memory/comms framework) so context reloads from files cheaply.
- Avoid re-reading large files / re-rendering images unless needed; scope each request tightly.

**Net:** the multi-agent Obsidian framework (note `05`) is itself the biggest token win — it moves shared state out of the conversation and onto disk.
