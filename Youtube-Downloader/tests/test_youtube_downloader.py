"""Tests for youtube_downloader utility logic (no tkinter GUI)."""

import json
import os
import tempfile
from unittest.mock import MagicMock, patch

import youtube_downloader as yd


class TestIsPlaylistUrl:
    def test_playlist_path(self):
        assert yd.is_playlist_url("https://www.youtube.com/playlist?list=PLabc")

    def test_watch_url_with_list_param(self):
        assert yd.is_playlist_url("https://www.youtube.com/watch?v=abc&list=PLabc")

    def test_single_video(self):
        assert not yd.is_playlist_url("https://www.youtube.com/watch?v=abc123")


class TestBuildResilienceArgs:
    """Regression tests for WinError-32 mitigation flags added in the hardening commit."""

    def test_includes_retry_flags(self):
        args = yd.build_resilience_args()
        assert "--file-access-retries" in args
        assert args[args.index("--file-access-retries") + 1] == "10"
        assert "--retries" in args
        assert args[args.index("--retries") + 1] == "10"
        assert "--fragment-retries" in args
        assert args[args.index("--fragment-retries") + 1] == "10"

    def test_stages_temp_files_on_local_disk(self):
        args = yd.build_resilience_args()
        paths_idx = args.index("--paths")
        temp_path = args[paths_idx + 1]
        assert temp_path.startswith("temp:")
        assert temp_path.endswith(os.path.join("youtube_downloader"))
        assert tempfile.gettempdir() in temp_path


class TestBuildYtDlpArgs:
    YTDLP = ["python", "-m", "yt_dlp"]
    OUT = "/downloads/%(title)s.%(ext)s"

    def test_video_best_includes_merge_format(self):
        args = yd.build_yt_dlp_args(self.YTDLP, "Video (best)", self.OUT)
        assert "--format" in args
        assert "bestvideo+bestaudio/best" in args
        assert "--merge-output-format" in args
        assert "mp4" in args

    def test_audio_mp3_extracts_audio(self):
        args = yd.build_yt_dlp_args(self.YTDLP, "Audio only (mp3)", self.OUT)
        assert "--extract-audio" in args
        assert "--audio-format" in args
        assert "mp3" in args

    def test_always_includes_resilience_args(self):
        args = yd.build_yt_dlp_args(self.YTDLP, "Video (best)", self.OUT)
        assert "--file-access-retries" in args
        assert "--paths" in args

    def test_ffmpeg_location_when_provided(self):
        args = yd.build_yt_dlp_args(
            self.YTDLP, "Video (best)", self.OUT, ffmpeg_dir="/opt/ffmpeg")
        idx = args.index("--ffmpeg-location")
        assert args[idx + 1] == "/opt/ffmpeg"

    def test_subtitles_flags(self):
        args = yd.build_yt_dlp_args(
            self.YTDLP, "Video (best)", self.OUT, subtitles=True)
        assert "--write-subs" in args
        assert "--write-auto-subs" in args
        assert "--sub-lang" in args
        assert "en" in args

    def test_thumbnail_embedded_for_video_only(self):
        video_args = yd.build_yt_dlp_args(
            self.YTDLP, "Video (best)", self.OUT, embed_thumbnail=True)
        audio_args = yd.build_yt_dlp_args(
            self.YTDLP, "Audio only (mp3)", self.OUT, embed_thumbnail=True)
        assert "--embed-thumbnail" in video_args
        assert "--embed-thumbnail" not in audio_args

    def test_playlist_range_with_end(self):
        args = yd.build_yt_dlp_args(
            self.YTDLP, "Video (best)", self.OUT,
            playlist_detected=True, range_start="2", range_end="5")
        idx = args.index("--playlist-items")
        assert args[idx + 1] == "2:5"

    def test_playlist_range_open_ended(self):
        args = yd.build_yt_dlp_args(
            self.YTDLP, "Video (best)", self.OUT,
            playlist_detected=True, range_start="3", range_end="")
        idx = args.index("--playlist-items")
        assert args[idx + 1] == "3:"

    def test_playlist_range_defaults_start_to_one(self):
        args = yd.build_yt_dlp_args(
            self.YTDLP, "Video (best)", self.OUT,
            playlist_detected=True, range_start="  ", range_end="10")
        idx = args.index("--playlist-items")
        assert args[idx + 1] == "1:10"


class TestConfigPersistence:
    def test_load_returns_empty_dict_when_missing(self, tmp_path, monkeypatch):
        monkeypatch.setattr(yd, "CONFIG_FILE", str(tmp_path / "missing.json"))
        assert yd.load_config() == {}

    def test_round_trip_save_and_load(self, tmp_path, monkeypatch):
        config_path = tmp_path / ".yd_config.json"
        monkeypatch.setattr(yd, "CONFIG_FILE", str(config_path))
        data = {"last_folder": "/tmp/dl", "format": "Video 720p"}
        yd.save_config(data)
        assert yd.load_config() == data

    def test_load_tolerates_corrupt_json(self, tmp_path, monkeypatch):
        config_path = tmp_path / ".yd_config.json"
        config_path.write_text("not json", encoding="utf-8")
        monkeypatch.setattr(yd, "CONFIG_FILE", str(config_path))
        assert yd.load_config() == {}


class TestYtdlpCmd:
    def test_prefers_bundled_exe(self, tmp_path, monkeypatch):
        exe = tmp_path / "yt-dlp.exe"
        exe.write_text("", encoding="utf-8")
        monkeypatch.setattr(yd, "_YTDLP_EXE_CANDIDATES", [str(exe)])
        monkeypatch.setattr(yd.sys, "frozen", False, raising=False)
        assert yd._ytdlp_cmd() == [str(exe)]

    def test_uses_module_when_installed(self, monkeypatch):
        monkeypatch.setattr(yd, "_YTDLP_EXE_CANDIDATES", [])
        monkeypatch.setattr(yd.sys, "frozen", False, raising=False)
        monkeypatch.setattr(
            "importlib.util.find_spec", lambda name: object() if name == "yt_dlp" else None)
        cmd = yd._ytdlp_cmd()
        assert cmd[0] == yd.sys.executable
        assert "-m" in cmd
        assert "yt_dlp" in cmd

    def test_frozen_build_uses_path_binary(self, monkeypatch):
        monkeypatch.setattr(yd, "_YTDLP_EXE_CANDIDATES", [])
        monkeypatch.setattr(yd.sys, "frozen", True, raising=False)
        assert yd._ytdlp_cmd() == ["yt-dlp"]


class TestAcquireSingleInstance:
    def test_non_windows_always_allows_startup(self, monkeypatch):
        monkeypatch.setattr(yd.os, "name", "posix")
        assert yd._acquire_single_instance() is True


class TestFetchPlaylistCount:
    def test_parses_title_and_count(self, monkeypatch):
        def fake_run(cmd, **kwargs):
            result = MagicMock()
            if "%(playlist_count)s" in cmd:
                result.stdout = "42\n"
            else:
                result.stdout = "My Playlist\n"
            return result

        monkeypatch.setattr(yd.subprocess, "run", fake_run)
        title, count = yd.fetch_playlist_count("http://example.com", ["yt-dlp"])
        assert title == "My Playlist"
        assert count == 42

    def test_returns_none_on_failure(self, monkeypatch):
        monkeypatch.setattr(
            yd.subprocess, "run", MagicMock(side_effect=OSError("timeout")))
        title, count = yd.fetch_playlist_count("http://example.com", ["yt-dlp"])
        assert title is None
        assert count is None
