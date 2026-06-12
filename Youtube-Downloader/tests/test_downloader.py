"""Tests for the CLI downloader module."""

from unittest.mock import MagicMock, patch

import downloader


class TestValidateYoutubeUrl:
    def test_accepts_standard_watch_url(self):
        assert downloader.validate_youtube_url("https://www.youtube.com/watch?v=abc123")

    def test_accepts_short_url(self):
        assert downloader.validate_youtube_url("https://youtu.be/abc123")

    def test_accepts_url_without_scheme(self):
        assert downloader.validate_youtube_url("www.youtube.com/watch?v=abc123")

    def test_rejects_non_youtube_url(self):
        assert not downloader.validate_youtube_url("https://example.com/video")

    def test_rejects_empty_string(self):
        assert not downloader.validate_youtube_url("")


class TestGetDownloadFormat:
    def test_playlist_uses_indexed_template(self):
        fmt, template = downloader.get_download_format(is_playlist=True)
        assert fmt == "bestvideo+bestaudio/best"
        assert template == "%(playlist_index)s - %(title)s.%(ext)s"

    def test_single_video_uses_title_only_template(self):
        fmt, template = downloader.get_download_format(is_playlist=False)
        assert fmt == "bestvideo+bestaudio/best"
        assert template == "%(title)s.%(ext)s"


class TestCreateProgressHook:
    def test_reports_downloading_status(self, capsys):
        hook = downloader.create_progress_hook(total_videos=1)
        hook({"status": "downloading", "_percent_str": " 50.0%", "_speed_str": "1MiB/s", "_eta_str": "00:10"})
        out = capsys.readouterr().out
        assert "Downloading: 50.0%" in out
        assert "1MiB/s" in out

    def test_playlist_download_uses_indented_prefix(self, capsys):
        hook = downloader.create_progress_hook(total_videos=3)
        hook({"status": "finished", "filename": "video.mp4"})
        out = capsys.readouterr().out
        assert out.startswith("  Downloaded:")


class TestDetectPlaylist:
    def test_detects_playlist_with_entry_count(self):
        mock_ydl = MagicMock()
        mock_ydl.extract_info.return_value = {
            "entries": [{"id": "a"}, {"id": "b"}, {"id": "c"}],
        }
        with patch("downloader.yt_dlp.YoutubeDL") as ydl_cls:
            ydl_cls.return_value.__enter__.return_value = mock_ydl
            is_playlist, count = downloader.detect_playlist({}, "http://example.com")
        assert is_playlist is True
        assert count == 3

    def test_single_video_has_count_one(self):
        mock_ydl = MagicMock()
        mock_ydl.extract_info.return_value = {"title": "solo video"}
        with patch("downloader.yt_dlp.YoutubeDL") as ydl_cls:
            ydl_cls.return_value.__enter__.return_value = mock_ydl
            is_playlist, count = downloader.detect_playlist({}, "http://example.com")
        assert is_playlist is False
        assert count == 1

    def test_returns_none_on_download_error(self, capsys):
        mock_ydl = MagicMock()
        mock_ydl.extract_info.side_effect = downloader.yt_dlp.utils.DownloadError("blocked")
        with patch("downloader.yt_dlp.YoutubeDL") as ydl_cls:
            ydl_cls.return_value.__enter__.return_value = mock_ydl
            is_playlist, count = downloader.detect_playlist({}, "http://example.com")
        assert is_playlist is None
        assert count is None
        assert "Error fetching video information" in capsys.readouterr().out
