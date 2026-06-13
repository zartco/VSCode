import pytest
from youtube_downloader import is_playlist_url

def test_is_playlist_url():
    assert is_playlist_url("https://youtube.com/playlist?list=PL...") is True
    assert is_playlist_url("https://youtube.com/watch?v=123&list=PL...") is True
    assert is_playlist_url("https://youtube.com/watch?v=123") is False
