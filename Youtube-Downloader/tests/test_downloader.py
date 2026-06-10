"""Tests for the CLI downloader module."""

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
