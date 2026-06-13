import pytest
from downloader import validate_youtube_url, get_download_format

def test_validate_youtube_url():
    assert validate_youtube_url("https://www.youtube.com/watch?v=dQw4w9WgXcQ") is True
    assert validate_youtube_url("https://youtu.be/dQw4w9WgXcQ") is True
    assert validate_youtube_url("https://google.com") is False
    assert validate_youtube_url("not a url") is False

def test_get_download_format():
    format_spec, output_template = get_download_format(is_playlist=False)
    assert format_spec == "bestvideo+bestaudio/best"
    assert output_template == "%(title)s.%(ext)s"

    format_spec, output_template = get_download_format(is_playlist=True)
    assert format_spec == "bestvideo+bestaudio/best"
    assert output_template == "%(playlist_index)s - %(title)s.%(ext)s"
