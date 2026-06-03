# YouTube Downloader — Development Notes

A small Windows desktop app for downloading YouTube videos and playlists.
Python + tkinter front-end, [yt-dlp](https://github.com/yt-dlp/yt-dlp) engine,
[ffmpeg](https://ffmpeg.org/) for muxing/transcoding.

## Files

| File | Purpose |
|---|---|
| `youtube_downloader.py` | The GUI app (tkinter). The thing we ship. |
| `downloader.py` | Earlier CLI version using the `yt_dlp` Python library directly. Kept for reference. |
| `YouTubeDownloader.zip` | **Smart-launcher** distribution (tiny; auto-installs prerequisites). |
| `YouTubeDownloader-Standalone.zip` | **Standalone** distribution (self-contained; bundles yt-dlp + ffmpeg). |

## Architecture

- **GUI**: `tkinter` + `ttk`, restyled with the `clam` theme into a flat dark
  VS Code-like look (green accent, bottom status bar, dark title bar via a
  best-effort DWM `ctypes` call).
- **Downloading**: the GUI shells out to yt-dlp via `subprocess` and streams
  stdout into the log on a background thread, so the UI stays responsive.
  A `Cancel` button calls `terminate()` on the live process.
- **yt-dlp resolution** (`_ytdlp_cmd()`), in priority order:
  1. a `yt-dlp.exe` sitting next to the app (used by the standalone build),
  2. `python -m yt_dlp` for the current interpreter (dev / launcher),
  3. `yt-dlp` on `PATH`.
  When frozen by PyInstaller it never uses option 2 (because `sys.executable`
  is the app, not Python).
- **ffmpeg**: if an `ffmpeg.exe` sits next to the app, `--ffmpeg-location` is
  passed to yt-dlp (standalone build); otherwise yt-dlp finds it on `PATH`.
- **No console flashes**: all subprocess calls use `CREATE_NO_WINDOW`.
- **Prefs**: format / folder / checkbox state persist in `.yd_config.json`
  next to the app.

## Features

- Single video or playlist; playlist detection via **Check**, with an
  item-range selector (`--playlist-items`).
- Formats: best / 1080p / 720p / 480p video, or mp3 / m4a audio-only.
- Optional subtitles (`--write-subs --write-auto-subs`) and thumbnail embed.
- Live log with color-tagged success/error lines; green status bar.

## Running from source

```powershell
python youtube_downloader.py
```

Requires Python 3.13+, plus `yt-dlp` (`pip install yt-dlp`) and `ffmpeg` on
`PATH`. tkinter ships with the standard Windows Python installer.

## Distribution

### 1. Smart-launcher ZIP (`YouTubeDownloader.zip`, ~24 KB)
Contains `youtube_downloader.py`, `Start.bat`, `setup.ps1`, `README.txt`.
On first run `setup.ps1` ensures Python (winget, per-user), yt-dlp (pip), and
ffmpeg (winget `Gyan.FFmpeg`) are present — refreshing `PATH` from the registry
so freshly-installed tools work without reopening the shell — then launches the
GUI with `pythonw`. Needs winget + internet on first run only.

### 2. Standalone ZIP (`YouTubeDownloader-Standalone.zip`, ~112 MB)
Self-contained: `YouTubeDownloader.exe` + `yt-dlp.exe` + `ffmpeg.exe` + README.
No install, no winget, works offline (except the actual video download).

Rebuild:

```powershell
python -m pip install pyinstaller
python -m PyInstaller --onefile --windowed --name YouTubeDownloader youtube_downloader.py
# then drop the latest yt-dlp.exe and an ffmpeg.exe next to the produced .exe
```

`yt-dlp.exe`: https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe
`ffmpeg.exe`: any static Windows build (the bundled one is Gyan 8.1.1).

## Known limitations

- The standalone `.exe` is **not code-signed**, so Windows SmartScreen warns
  "unknown publisher" → *More info → Run anyway*.
- `ffprobe` is **not** bundled with the standalone (it would add ~200 MB);
  merging and audio extraction work without it.
- The smart launcher depends on **winget** (App Installer); absent that, the
  README points to manual Python/ffmpeg installs.
