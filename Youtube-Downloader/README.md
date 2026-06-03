# YouTube Downloader

A small Windows desktop app for downloading YouTube videos and playlists.
Python + tkinter front-end, [yt-dlp](https://github.com/yt-dlp/yt-dlp) engine,
[ffmpeg](https://ffmpeg.org/) for muxing/transcoding.

## Files

| File | Purpose |
|---|---|
| `youtube_downloader.py` | The GUI app (tkinter). The thing we ship. |
| `downloader.py` | Earlier CLI version using the `yt_dlp` Python library directly. Kept for reference. |
| `README.md` | This file — architecture + build/distribution notes. |

Distribution zips and PyInstaller build output are produced locally and
published as **GitHub Release assets** (they are git-ignored, not committed).

## Architecture

- **GUI**: `tkinter` + `ttk`, restyled with the `clam` theme into a flat dark
  VS Code-like look (green accent, bottom status bar, dark title bar via a
  best-effort DWM `ctypes` call).
- **Downloading**: the GUI shells out to yt-dlp via `subprocess` and streams
  stdout into the log on a background thread, so the UI stays responsive.
  A `Cancel` button calls `terminate()` on the live process. All subprocess
  calls use `CREATE_NO_WINDOW` so no console flashes.
- **yt-dlp resolution** (`_ytdlp_cmd()`), in priority order: a `yt-dlp.exe`
  next to the app (standalone build) → `python -m yt_dlp` (dev/launcher) →
  `yt-dlp` on `PATH`. When frozen by PyInstaller it never uses the module form
  (because `sys.executable` is the app, not Python).
- **ffmpeg**: if `ffmpeg.exe` sits next to the app, `--ffmpeg-location` is
  passed to yt-dlp (standalone build); otherwise yt-dlp finds it on `PATH`.

## Download resilience (Windows / network drives)

Downloading directly to a network/mapped drive (e.g. `Z:\`) or with antivirus
active can fail with `WinError 32` ("file is being used by another process")
when yt-dlp renames `.part` → final file. The app mitigates this:

- `--paths temp:%TEMP%\youtube_downloader` keeps all `.part`/intermediate files
  on the **local disk**; only the finished file is moved to the destination.
- `--file-access-retries 10` (and `--retries`/`--fragment-retries 10`) ride out
  transient locks.
- A **single-instance mutex** (`_acquire_single_instance`) stops a second copy
  of the app from running, since two instances writing the same files was the
  original cause of the corruption.

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
