# VSCode Workspace

A personal VS Code workspace for hands-on Python practice and small desktop utilities.

## What's inside

| Path | Purpose |
|---|---|
| `CS50/` | Self-contained Python and HTML learning exercises (standard library only) |
| `Youtube-Downloader/` | Windows tkinter GUI for downloading YouTube videos/playlists via yt-dlp |
| `CLAUDE.md` | Workspace guidance for AI-assisted development |

Standalone `.exe` tools (e.g. `yt-dlp.exe`, `buttery-taskbar.exe`) may sit at the repo root but are not part of the tracked Python code.

## Running scripts

**CS50 exercises** — no setup, no dependencies:

```powershell
python CS50\<script>.py
```

**YouTube Downloader** — requires Python 3.13+, `yt-dlp`, `ffmpeg`, and tkinter:

```powershell
python Youtube-Downloader\youtube_downloader.py
```

See [CS50/README.md](CS50/README.md) for the script catalog and [Youtube-Downloader/README.md](Youtube-Downloader/README.md) for architecture, distribution, and troubleshooting.

## Design philosophy

- **Minimalism** — CS50 scripts use only the Python standard library
- **Clarity** — one concept per file
- **Isolation** — each script runs independently
- **Speed** — run directly from the terminal with no build step

## Author

[zartco](https://github.com/zartco)
