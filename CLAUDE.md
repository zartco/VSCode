# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Structure

`C:\VSCode` is a personal workspace containing:
- `VSPython/` — a git-tracked collection of Python learning scripts (the active codebase)
- `buttery-taskbar.exe`, `yt-dlp.exe` — standalone tools, unrelated to Python work

All Python development happens inside `VSPython/`.

## Running Scripts

Scripts are standalone and run directly with Python:

```powershell
python VSPython\<script>.py
```

No virtual environment, dependencies, or build step required — all scripts use only the Python standard library.

## Codebase Pattern

Each script is a self-contained exercise covering a single concept (functions, conditionals, match statements, etc.). Scripts follow a consistent pattern: prompt for input via `input()`, compute, print output. Scripts with functions use a `main()` entry point called at the bottom.
