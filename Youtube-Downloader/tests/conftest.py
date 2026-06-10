"""Test bootstrap: mock optional runtime deps before importing app modules."""

import sys
from pathlib import Path
from unittest.mock import MagicMock

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# downloader.py calls exit(1) when yt_dlp is missing.
if "yt_dlp" not in sys.modules:
    _yt_dlp = MagicMock()
    _yt_dlp.utils.DownloadError = type("DownloadError", (Exception,), {})
    sys.modules["yt_dlp"] = _yt_dlp

# youtube_downloader.py imports tkinter at module load (not available in headless CI).
for _mod in ("tkinter", "tkinter.ttk", "tkinter.filedialog", "tkinter.messagebox"):
    if _mod not in sys.modules:
        sys.modules[_mod] = MagicMock()
