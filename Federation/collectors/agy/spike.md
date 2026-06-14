# Antigravity Collector Spike

## Objective
Locate the `agy` transcripts path to build the Antigravity Collector.

## Findings
The `agy` state and transcripts are typically located in `~/.agy/state` and `~/.agy/transcripts`. We need to verify these directories exist and have readable permissions for the collector.

## Next Steps
- Implement file watcher on `~/.agy/transcripts`.
- Adapt `agy` logs to the Unified Data Model (`AgentEvent`).
