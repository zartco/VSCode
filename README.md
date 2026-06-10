# VSCode Workspace

A personal Python workspace combining CS50 coursework exercises and a full YouTube downloader desktop app.

---

## What's Inside

```
CS50/                  → Python & HTML exercises from CS50P
Youtube-Downloader/    → Windows desktop app — downloads YouTube videos/playlists
```

---

## CS50

Python scripts written while working through [CS50's Introduction to Programming with Python](https://cs50.harvard.edu/python/).

Each file covers one concept and runs on its own — no external libraries needed.

| File | Concept |
|---|---|
| `hello.py` / `helloworld.py` | Print statements, basic I/O |
| `calculator.py` / `calculator1.py` | Functions, arithmetic |
| `compare.py` | Conditionals |
| `parity.py` | Modulo operator |
| `loops.py` | `for` loops, `range()` |
| `cat.py` | String input and manipulation |
| `grade.py` | Nested conditionals |
| `house.py` | Functions, control flow |
| `html_skeleton.html` / `index.html` | Basic HTML structure |

**Run any script:**

```powershell
python CS50/<script>.py
```

Requires Python 3.x — no pip installs needed.

---

## Youtube Downloader

A Windows desktop app for downloading YouTube videos and playlists.

**Stack:** Python 3.13 · tkinter (dark VS Code-style UI) · [yt-dlp](https://github.com/yt-dlp/yt-dlp) · ffmpeg

**Features:**
- Single videos and full playlists
- Format selection: best quality, 1080p / 720p / 480p, audio-only MP3/M4A
- Playlist item-range picker (e.g. download items 3–10 only)
- Subtitle download and thumbnail embedding
- Live download log with cancel button
- Saves last-used folder and settings across sessions
- Resilient against Windows file-lock errors (network drives, antivirus)
- Single-instance mutex — prevents two copies corrupting the same download

### Run from source

```powershell
pip install yt-dlp
python Youtube-Downloader/youtube_downloader.py
```

Requires Python 3.13+. `tkinter` ships with the standard Windows Python installer. `ffmpeg` is optional but needed for format merging — install via `winget install Gyan.FFmpeg` or add `ffmpeg.exe` next to the script.

### Distribution

Two pre-built distributions are published as [GitHub Release](https://github.com/zartco/VSCode/releases) assets (not committed to the repo):

| Package | Size | What it needs |
|---|---|---|
| `YouTubeDownloader.zip` | ~24 KB | Python + winget (auto-installed by `setup.ps1`) |
| `YouTubeDownloader-Standalone.zip` | ~112 MB | Nothing — fully self-contained |

The standalone `.exe` is unsigned, so Windows SmartScreen will show an "unknown publisher" warning — click *More info → Run anyway*.

---

## Author

[zartco](https://github.com/zartco)
