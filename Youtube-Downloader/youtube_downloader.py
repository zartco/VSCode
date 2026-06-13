"""YouTube downloader with a dark, VS Code-inspired tkinter GUI.

Supports single videos and playlists (with item-range selection), format/quality
selection, subtitles, and thumbnail embedding. Downloads run on a background
thread with live log output. Wraps the yt-dlp CLI via subprocess.
"""
import subprocess
import os
import sys
import threading
import json
import tempfile
import tkinter as tk
from tkinter import ttk, filedialog, messagebox

# â”€â”€ App directory (works both as a .py and as a frozen PyInstaller .exe) â”€â”€
if getattr(sys, "frozen", False):
    _SCRIPT_DIR = os.path.dirname(sys.executable)
else:
    _SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Suppress console windows when invoking yt-dlp/ffmpeg from the GUI (Windows).
_NO_WINDOW = subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0

_YTDLP_EXE_CANDIDATES = [
    os.path.join(_SCRIPT_DIR, "yt-dlp.exe"),
    os.path.join(_SCRIPT_DIR, "..", "yt-dlp.exe"),
]


def _ytdlp_cmd():
    """Return the yt-dlp invocation as an argument-list prefix.

    Prefers a bundled yt-dlp.exe, then the yt_dlp module for the current
    interpreter (works regardless of PATH), then yt-dlp on PATH.
    """
    for candidate in _YTDLP_EXE_CANDIDATES:
        path = os.path.normpath(candidate)
        if os.path.isfile(path):
            return [path]
    # Frozen build with no sibling exe: use PATH. (sys.executable is the GUI
    # itself, not a Python interpreter, so "-m yt_dlp" would not work here.)
    if getattr(sys, "frozen", False):
        return ["yt-dlp"]
    try:
        import importlib.util
        if importlib.util.find_spec("yt_dlp") is not None:
            return [sys.executable, "-m", "yt_dlp"]
    except Exception:
        pass
    return ["yt-dlp"]  # fall back to PATH


def _ffmpeg_location():
    """Return a bundled ffmpeg directory if ffmpeg.exe sits next to the app."""
    if os.path.isfile(os.path.join(_SCRIPT_DIR, "ffmpeg.exe")):
        return _SCRIPT_DIR
    return None


def _acquire_single_instance():
    """On Windows, return a mutex handle if no other instance is running, or
    None if one already is. Prevents two copies from downloading into the same
    files at once, which corrupts downloads (WinError 32 on rename)."""
    if os.name != "nt":
        return True
    try:
        import ctypes
        ERROR_ALREADY_EXISTS = 183
        handle = ctypes.windll.kernel32.CreateMutexW(
            None, False, "YouTubeDownloader_SingleInstance")
        if ctypes.windll.kernel32.GetLastError() == ERROR_ALREADY_EXISTS:
            return None
        return handle
    except Exception:
        return True  # never block startup on an unexpected error


CONFIG_FILE = os.path.join(_SCRIPT_DIR, ".yd_config.json")


def load_config():
    """Load application configuration from file."""
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE) as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def save_config(data):
    """Save application configuration to file."""
    try:
        with open(CONFIG_FILE, "w") as f:
            json.dump(data, f)
    except Exception:
        pass


def is_playlist_url(url):
    """Determine if the given URL is a YouTube playlist."""
    return "playlist" in url or "list=" in url


def fetch_playlist_count(url, ytdlp):
    """Return (title, count) for a playlist, or (None, None) on failure."""
    try:
        result = subprocess.run(
            list(ytdlp) + ["--flat-playlist", "--print", "%(playlist_count)s",
                           "--playlist-items", "1", url],
            capture_output=True, text=True, timeout=20, creationflags=_NO_WINDOW,
        )
        lines = result.stdout.strip().splitlines()
        count = int(lines[0]) if lines and lines[0].isdigit() else None

        result2 = subprocess.run(
            list(ytdlp) + ["--flat-playlist", "--print", "%(playlist_title)s",
                           "--playlist-items", "1", url],
            capture_output=True, text=True, timeout=20, creationflags=_NO_WINDOW,
        )
        title = result2.stdout.strip().splitlines()[0] if result2.stdout.strip() else None
        return title, count
    except Exception:
        return None, None


# â”€â”€ Palette (VS Code dark + GitHub-green accent) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
C = {
    "bg":          "#1e1e1e",
    "panel":       "#252526",
    "input":       "#333333",
    "input_focus": "#3c3c3c",
    "border":      "#3c3c3c",
    "border_lt":   "#4d4d4d",
    "fg":          "#e0e0e0",
    "fg_muted":    "#9d9d9d",
    "fg_heading":  "#ffffff",
    "accent":      "#2ea043",
    "accent_hi":   "#3fb950",
    "accent_lo":   "#238636",
    "accent_text": "#4ec9b0",
    "log_bg":      "#181818",
    "log_fg":      "#d4d4d4",
    "danger":      "#f85149",
    "status_fg":   "#0d1117",
}

UI_FONT = ("Segoe UI", 10)
SMALL_FONT = ("Segoe UI", 9)
MONO_FONT = ("Consolas", 9)


class App(tk.Tk):
    """Main application class for YouTube Downloader GUI."""
    def __init__(self):
        super().__init__()
        self.title("YouTube Downloader")
        self.config = load_config()
        self._proc = None
        self._job = None
        self._cancelled = False
        self._playlist_detected = False

        self._setup_style()
        self._build_ui()
        self.configure(bg=C["bg"])

        self._center(680, 620)
        self.minsize(680, 500)
        self.resizable(False, True)
        self._apply_dark_titlebar()
        self.after(60, self._apply_dark_titlebar)

    # â”€â”€ Styling â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    def _setup_style(self):
        style = ttk.Style(self)
        style.theme_use("clam")

        style.configure(".",
                        background=C["bg"], foreground=C["fg"],
                        fieldbackground=C["input"], bordercolor=C["border"],
                        lightcolor=C["bg"], darkcolor=C["bg"],
                        troughcolor=C["input"], focuscolor=C["accent"],
                        selectbackground=C["accent"], selectforeground="#ffffff",
                        font=UI_FONT)

        style.configure("TFrame", background=C["bg"])
        style.configure("TLabel", background=C["bg"], foreground=C["fg"])
        style.configure("Heading.TLabel", background=C["bg"],
                        foreground=C["fg_heading"], font=("Segoe UI Semibold", 17))
        style.configure("Sub.TLabel", background=C["bg"],
                        foreground=C["fg_muted"], font=("Segoe UI", 9))
        style.configure("Section.TLabel", background=C["bg"],
                        foreground=C["fg_muted"], font=("Segoe UI", 8, "bold"))
        style.configure("Accent.TLabel", background=C["bg"],
                        foreground=C["accent_text"], font=("Segoe UI", 9))

        # Entry
        style.configure("TEntry", fieldbackground=C["input"], foreground=C["fg"],
                        bordercolor=C["border"], insertcolor=C["fg"],
                        padding=7, relief="flat")
        style.map("TEntry",
                  bordercolor=[("focus", C["accent"])],
                  fieldbackground=[("focus", C["input_focus"])])

        # Secondary button
        style.configure("TButton", background=C["input"], foreground=C["fg"],
                        bordercolor=C["border"], focuscolor=C["input"],
                        relief="flat", padding=(14, 7), font=SMALL_FONT)
        style.map("TButton",
                  background=[("active", C["input_focus"]), ("pressed", C["border"])],
                  bordercolor=[("active", C["border_lt"])])

        # Primary (accent) button
        style.configure("Accent.TButton", background=C["accent"], foreground="#ffffff",
                        bordercolor=C["accent"], focuscolor=C["accent"],
                        relief="flat", padding=(20, 9), font=("Segoe UI Semibold", 10))
        style.map("Accent.TButton",
                  background=[("active", C["accent_hi"]), ("pressed", C["accent_lo"]),
                              ("disabled", C["input"])],
                  foreground=[("disabled", C["fg_muted"])])

        # Ghost / cancel button
        style.configure("Ghost.TButton", background=C["bg"], foreground=C["fg_muted"],
                        bordercolor=C["border"], focuscolor=C["bg"],
                        relief="flat", padding=(16, 8))
        style.map("Ghost.TButton",
                  foreground=[("active", C["danger"]), ("disabled", "#5a5a5a")],
                  bordercolor=[("active", C["danger"])],
                  background=[("active", C["bg"])])

        # Combobox
        style.configure("TCombobox", fieldbackground=C["input"], background=C["input"],
                        foreground=C["fg"], arrowcolor=C["fg_muted"],
                        bordercolor=C["border"], relief="flat", padding=6)
        style.map("TCombobox",
                  fieldbackground=[("readonly", C["input"])],
                  bordercolor=[("focus", C["accent"])],
                  arrowcolor=[("active", C["fg"])])
        self.option_add("*TCombobox*Listbox.background", C["panel"])
        self.option_add("*TCombobox*Listbox.foreground", C["fg"])
        self.option_add("*TCombobox*Listbox.selectBackground", C["accent"])
        self.option_add("*TCombobox*Listbox.selectForeground", "#ffffff")
        self.option_add("*TCombobox*Listbox.font", "{Segoe UI} 9")

        # Checkbutton
        style.configure("TCheckbutton", background=C["bg"], foreground=C["fg"],
                        focuscolor=C["bg"], indicatorbackground=C["input"],
                        indicatorforeground=C["accent"])
        style.map("TCheckbutton",
                  background=[("active", C["bg"])],
                  foreground=[("active", C["fg_heading"])],
                  indicatorbackground=[("selected", C["accent"]),
                                       ("active", C["input_focus"])],
                  indicatorforeground=[("selected", "#ffffff")])

        # Progress bar
        style.configure("TProgressbar", troughcolor=C["input"], background=C["accent"],
                        bordercolor=C["bg"], lightcolor=C["accent"],
                        darkcolor=C["accent"], thickness=6)

        # Scrollbar
        style.configure("Vertical.TScrollbar", background=C["input"],
                        troughcolor=C["bg"], bordercolor=C["bg"],
                        arrowcolor=C["fg_muted"], relief="flat")
        style.map("Vertical.TScrollbar", background=[("active", C["border_lt"])])

        style.configure("TSeparator", background=C["border"])

    def _apply_dark_titlebar(self):
        """Best-effort dark window title bar on Windows 10/11."""
        try:
            import ctypes
            self.update_idletasks()
            hwnd = ctypes.windll.user32.GetParent(self.winfo_id())
            value = ctypes.c_int(1)
            for attr in (20, 19):  # DWMWA_USE_IMMERSIVE_DARK_MODE (new, old)
                try:
                    ctypes.windll.dwmapi.DwmSetWindowAttribute(
                        hwnd, attr, ctypes.byref(value), ctypes.sizeof(value))
                except Exception:
                    pass
        except Exception:
            pass

    def _center(self, w, h):
        self.update_idletasks()
        x = (self.winfo_screenwidth() - w) // 2
        y = (self.winfo_screenheight() - h) // 3
        self.geometry(f"{w}x{h}+{x}+{y}")

    # â”€â”€ UI construction â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    def _build_ui(self):
        # Status bar pinned to the bottom (VS Code style)
        status = tk.Frame(self, bg=C["accent"])
        status.pack(side="bottom", fill="x")
        self.status_var = tk.StringVar(value="Ready")
        tk.Label(status, textvariable=self.status_var, bg=C["accent"],
                 fg=C["status_fg"], font=("Segoe UI", 8, "bold"),
                 anchor="w").pack(side="left", padx=12, pady=3)
        tk.Label(status, text="yt-dlp", bg=C["accent"], fg=C["status_fg"],
                 font=("Segoe UI", 8), anchor="e").pack(side="right", padx=12, pady=3)

        content = ttk.Frame(self, padding=24)
        content.pack(fill="both", expand=True)
        content.columnconfigure(0, weight=1)

        # Header: accent bar + title + subtitle
        header = ttk.Frame(content)
        header.grid(row=0, column=0, sticky="ew")
        tk.Frame(header, bg=C["accent"], width=4, height=44).pack(
            side="left", fill="y", padx=(0, 14))
        titles = ttk.Frame(header)
        titles.pack(side="left", fill="x")
        ttk.Label(titles, text="YouTube Downloader", style="Heading.TLabel").pack(anchor="w")
        ttk.Label(titles, text="Download videos & playlists via yt-dlp",
                  style="Sub.TLabel").pack(anchor="w")

        ttk.Separator(content, orient="horizontal").grid(
            row=1, column=0, sticky="ew", pady=(16, 4))

        # URL
        ttk.Label(content, text="URL", style="Section.TLabel").grid(
            row=2, column=0, sticky="w", pady=(10, 4))
        url_row = ttk.Frame(content)
        url_row.grid(row=3, column=0, sticky="ew")
        self.url_var = tk.StringVar()
        self.check_btn = ttk.Button(url_row, text="Check", command=self._check_url)
        self.check_btn.pack(side="right")
        self.url_entry = ttk.Entry(url_row, textvariable=self.url_var)
        self.url_entry.pack(side="left", fill="x", expand=True, padx=(0, 8))

        self.playlist_label = ttk.Label(content, text="", style="Accent.TLabel")
        self.playlist_label.grid(row=4, column=0, sticky="w", pady=(6, 0))

        # Playlist range (hidden until a playlist is detected)
        self.range_row = ttk.Frame(content)
        self.range_row.grid(row=5, column=0, sticky="w", pady=(6, 0))
        self.range_start_var = tk.StringVar(value="1")
        self.range_end_var = tk.StringVar()
        ttk.Label(self.range_row, text="Items").pack(side="left")
        ttk.Label(self.range_row, text="from", style="Sub.TLabel").pack(side="left", padx=(10, 4))
        ttk.Entry(self.range_row, textvariable=self.range_start_var, width=6).pack(side="left")
        ttk.Label(self.range_row, text="to", style="Sub.TLabel").pack(side="left", padx=(10, 4))
        self.range_end_entry = ttk.Entry(self.range_row, textvariable=self.range_end_var, width=6)
        self.range_end_entry.pack(side="left")
        ttk.Label(self.range_row, text="blank = all", style="Sub.TLabel").pack(side="left", padx=10)
        self.range_row.grid_remove()

        # Save to
        ttk.Label(content, text="SAVE TO", style="Section.TLabel").grid(
            row=6, column=0, sticky="w", pady=(16, 4))
        folder_row = ttk.Frame(content)
        folder_row.grid(row=7, column=0, sticky="ew")
        self.folder_var = tk.StringVar(value=self.config.get("last_folder", "./downloads"))
        ttk.Button(folder_row, text="Browseâ€¦", command=self._browse_folder).pack(side="right")
        ttk.Entry(folder_row, textvariable=self.folder_var).pack(
            side="left", fill="x", expand=True, padx=(0, 8))

        # Options
        ttk.Label(content, text="OPTIONS", style="Section.TLabel").grid(
            row=8, column=0, sticky="w", pady=(16, 4))
        opt_row = ttk.Frame(content)
        opt_row.grid(row=9, column=0, sticky="w")
        ttk.Label(opt_row, text="Format").pack(side="left")
        self.fmt_var = tk.StringVar(value=self.config.get("format", "Video (best)"))
        ttk.Combobox(opt_row, textvariable=self.fmt_var, state="readonly", width=18,
                     values=["Video (best)", "Video 1080p", "Video 720p", "Video 480p",
                             "Audio only (mp3)", "Audio only (m4a)"]).pack(side="left", padx=(8, 20))
        self.subtitles_var = tk.BooleanVar(value=self.config.get("subtitles", False))
        ttk.Checkbutton(opt_row, text="Subtitles", variable=self.subtitles_var).pack(
            side="left", padx=(0, 14))
        self.thumb_var = tk.BooleanVar(value=self.config.get("thumbnail", False))
        ttk.Checkbutton(opt_row, text="Embed thumbnail", variable=self.thumb_var).pack(side="left")

        # Actions
        act = ttk.Frame(content)
        act.grid(row=10, column=0, sticky="w", pady=(20, 8))
        self.dl_btn = ttk.Button(act, text="Download", style="Accent.TButton",
                                 command=self._start_download)
        self.dl_btn.pack(side="left")
        self.cancel_btn = ttk.Button(act, text="Cancel", style="Ghost.TButton",
                                     command=self._cancel, state="disabled")
        self.cancel_btn.pack(side="left", padx=10)

        # Progress (shown only while downloading)
        self.progress = ttk.Progressbar(content, mode="indeterminate")
        self.progress.grid(row=11, column=0, sticky="ew", pady=(0, 8))
        self.progress.grid_remove()

        # Output log
        ttk.Label(content, text="OUTPUT LOG", style="Section.TLabel").grid(
            row=12, column=0, sticky="w", pady=(4, 4))
        log_wrap = tk.Frame(content, bg=C["border"])
        log_wrap.grid(row=13, column=0, sticky="nsew")
        content.rowconfigure(13, weight=1)
        self.log = tk.Text(log_wrap, height=12, bg=C["log_bg"], fg=C["log_fg"],
                           insertbackground=C["fg"], relief="flat", bd=0,
                           highlightthickness=0, padx=12, pady=10,
                           font=MONO_FONT, wrap="word", state="disabled")
        sb = ttk.Scrollbar(log_wrap, command=self.log.yview, style="Vertical.TScrollbar")
        self.log.configure(yscrollcommand=sb.set)
        self.log.pack(side="left", fill="both", expand=True, padx=1, pady=1)
        sb.pack(side="right", fill="y", padx=(0, 1), pady=1)

        self.log.tag_configure("success", foreground=C["accent_hi"])
        self.log.tag_configure("error", foreground=C["danger"])
        self.log.tag_configure("info", foreground=C["accent_text"])
        self.log.tag_configure("muted", foreground=C["fg_muted"])

    # â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    def _log(self, text, tag=None):
        self.log.configure(state="normal")
        self.log.insert("end", text + "\n", tag or ())
        self.log.see("end")
        self.log.configure(state="disabled")

    def _status(self, text):
        self.status_var.set(text)

    def _browse_folder(self):
        folder = filedialog.askdirectory(title="Select download folder")
        if folder:
            self.folder_var.set(folder)

    def _check_url(self):
        url = self.url_var.get().strip()
        if not url:
            return
        self.playlist_label.config(text="Checkingâ€¦")
        self.check_btn.config(state="disabled")
        self._status("Checking URLâ€¦")

        def _run():
            ytdlp = _ytdlp_cmd()
            if is_playlist_url(url):
                title, count = fetch_playlist_count(url, ytdlp)
                msg = "Playlist detected"
                if title:
                    msg += f": â€œ{title}â€"
                if count:
                    msg += f"  ({count} items)"
                self.after(0, lambda: self._show_playlist_ui(msg, count))
            else:
                self.after(0, lambda: self._hide_playlist_ui("Single video"))
            self.after(0, lambda: self.check_btn.config(state="normal"))

        threading.Thread(target=_run, daemon=True).start()

    def _show_playlist_ui(self, msg, count):
        self.playlist_label.config(text=msg, foreground=C["accent_text"])
        self.range_row.grid()
        if count:
            self.range_end_var.set(str(count))
        self._playlist_detected = True
        self._status("Playlist detected")

    def _hide_playlist_ui(self, msg):
        self.playlist_label.config(text=msg, foreground=C["fg_muted"])
        self.range_row.grid_remove()
        self._playlist_detected = False
        self._status("Ready")

    def _build_yt_args(self, url, output_template):
        ytdlp = _ytdlp_cmd()
        fmt = self.fmt_var.get()

        format_map = {
            "Video (best)":     ["--format", "bestvideo+bestaudio/best", "--merge-output-format", "mp4"],
            "Video 1080p":      ["--format", "bestvideo[height<=1080]+bestaudio/best[height<=1080]", "--merge-output-format", "mp4"],
            "Video 720p":       ["--format", "bestvideo[height<=720]+bestaudio/best[height<=720]", "--merge-output-format", "mp4"],
            "Video 480p":       ["--format", "bestvideo[height<=480]+bestaudio/best[height<=480]", "--merge-output-format", "mp4"],
            "Audio only (mp3)": ["--extract-audio", "--audio-format", "mp3", "--audio-quality", "0"],
            "Audio only (m4a)": ["--extract-audio", "--audio-format", "m4a", "--audio-quality", "0"],
        }

        args = list(ytdlp) + ["-o", output_template] + format_map.get(fmt, [])

        ff = _ffmpeg_location()
        if ff:
            args += ["--ffmpeg-location", ff]

        # Resilience on Windows / network drives: keep volatile .part and
        # intermediate files on the local disk (only the finished file is moved
        # to the destination), and retry through transient file locks from
        # antivirus or SMB shares -- the usual cause of WinError 32 on rename.
        args += ["--file-access-retries", "10",
                 "--retries", "10", "--fragment-retries", "10"]
        args += ["--paths", "temp:" + os.path.join(tempfile.gettempdir(),
                                                    "youtube_downloader")]

        if self.subtitles_var.get():
            args += ["--write-subs", "--write-auto-subs", "--sub-lang", "en"]
        if self.thumb_var.get() and "audio" not in fmt.lower():
            args += ["--embed-thumbnail"]
        if self._playlist_detected:
            start = self.range_start_var.get().strip() or "1"
            end = self.range_end_var.get().strip()
            args += ["--playlist-items", f"{start}:{end}" if end else f"{start}:"]

        args.append(url)
        return args

    # â”€â”€ Download control â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    def _start_download(self):
        url = self.url_var.get().strip()
        if not url:
            messagebox.showwarning("Missing URL", "Please enter a YouTube URL.")
            return

        folder = self.folder_var.get().strip() or "./downloads"
        os.makedirs(folder, exist_ok=True)
        output_template = os.path.join(folder, "%(title)s.%(ext)s")

        save_config({
            "last_folder": folder,
            "format": self.fmt_var.get(),
            "subtitles": self.subtitles_var.get(),
            "thumbnail": self.thumb_var.get(),
        })

        self._cancelled = False
        self.dl_btn.config(state="disabled")
        self.cancel_btn.config(state="normal")
        self.progress.grid()
        self.progress.start(12)
        self.log.configure(state="normal")
        self.log.delete("1.0", "end")
        self.log.configure(state="disabled")
        self._log(f"Starting download: {url}", "info")
        self._log(f"Output folder: {folder}\n", "muted")
        self._status("Downloadingâ€¦")

        args = self._build_yt_args(url, output_template)

        def _run():
            try:
                self._proc = subprocess.Popen(
                    args, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                    text=True, creationflags=_NO_WINDOW)
                for line in self._proc.stdout:
                    self.after(0, lambda l=line.rstrip(): self._log(l))
                self._proc.wait()
                rc = self._proc.returncode
                if self._cancelled:
                    pass
                elif rc == 0:
                    self.after(0, lambda: self._log("\nâœ“ Download complete!", "success"))
                    self.after(0, lambda: self._status("Download complete"))
                else:
                    self.after(0, lambda: self._log(f"\nError: yt-dlp exited with code {rc}", "error"))
                    self.after(0, lambda: self._status("Error"))
            except FileNotFoundError:
                self.after(0, lambda: self._log(
                    "Error: yt-dlp not found.\n"
                    "Install it with:  pip install yt-dlp", "error"))
                self.after(0, lambda: self._status("yt-dlp not found"))
            finally:
                self.after(0, self._download_done)

        self._job = threading.Thread(target=_run, daemon=True)
        self._job.start()

    def _cancel(self):
        self._cancelled = True
        if self._proc and self._proc.poll() is None:
            self._proc.terminate()
            self._log("\nCancelled.", "muted")
            self._status("Cancelled")
        self._download_done()

    def _download_done(self):
        self.progress.stop()
        self.progress.grid_remove()
        self.dl_btn.config(state="normal")
        self.cancel_btn.config(state="disabled")
        self._proc = None


if __name__ == "__main__":
    _instance_lock = _acquire_single_instance()
    if _instance_lock is None:
        _warn_root = tk.Tk()
        _warn_root.withdraw()
        messagebox.showwarning(
            "Already running",
            "YouTube Downloader is already open.\n\n"
            "Running two copies can corrupt downloads, because both write the "
            "same temporary files. Please use the window that's already open.")
        _warn_root.destroy()
        sys.exit(0)
    app = App()
    app.mainloop()

