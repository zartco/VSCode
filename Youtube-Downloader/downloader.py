"""Command line YouTube downloader utilizing yt-dlp."""
import os
import re
from pathlib import Path

try:
    import yt_dlp
except ImportError:
    print("Error: yt-dlp is not installed.")
    print("Install it with: pip install yt-dlp")
    exit(1)


def validate_youtube_url(url):
    """Check if URL is a valid YouTube link."""
    youtube_patterns = [
        r'(?:https?://)?(?:www\.)?youtube\.com',
        r'(?:https?://)?(?:www\.)?youtu\.be',
    ]
    return any(re.search(pattern, url) for pattern in youtube_patterns)


def get_youtube_url():
    """Prompt for and validate YouTube URL."""
    while True:
        url = input("Enter YouTube URL (video or playlist): ").strip()
        if not url:
            print("URL cannot be empty.")
            continue
        if validate_youtube_url(url):
            return url
        print("Invalid URL. Please enter a valid YouTube link.")


def get_output_path():
    """Prompt for output path, default to ./downloads."""
    path_input = input("Output path (default: ./downloads): ").strip()
    output_path = Path(path_input) if path_input else Path("./downloads")

    try:
        output_path.mkdir(parents=True, exist_ok=True)
        return str(output_path)
    except OSError as e:
        print(f"Error creating directory: {e}")
        exit(1)


def get_download_format(is_playlist):
    """Return yt-dlp format string and output template based on content type."""
    format_spec = "bestvideo+bestaudio/best"

    if is_playlist:
        output_template = "%(playlist_index)s - %(title)s.%(ext)s"
    else:
        output_template = "%(title)s.%(ext)s"

    return format_spec, output_template


def create_progress_hook(total_videos=1):
    """Create a progress hook for yt-dlp downloads."""
    def progress_hook(d):
        if d['status'] == 'downloading':
            percent = d.get('_percent_str', 'N/A').strip()
            speed = d.get('_speed_str', 'N/A').strip()
            eta = d.get('_eta_str', 'N/A').strip()
            if total_videos > 1:
                print(f"  Downloading: {percent} @ {speed} (ETA: {eta})")
            else:
                print(f"Downloading: {percent} @ {speed} (ETA: {eta})")
        elif d['status'] == 'finished':
            if total_videos > 1:
                print(f"  Downloaded: {d['filename']}")
            else:
                print(f"Downloaded: {d['filename']}")

    return progress_hook


def detect_playlist(ydl_opts, url):
    """Check if URL is a playlist by extracting info."""
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            is_playlist = 'entries' in info
            video_count = len(info['entries']) if is_playlist else 1
            return is_playlist, video_count
    except yt_dlp.utils.DownloadError as e:
        print(f"Error fetching video information: {e}")
        return None, None
    except Exception as e:
        print(f"Unexpected error: {e}")
        return None, None


def download_videos(url, output_path):
    """Download video(s) using yt-dlp."""

    # Setup
    ydl_opts_info = {
        'quiet': True,
        'no_warnings': True,
    }

    # Detect playlist
    is_playlist, video_count = detect_playlist(ydl_opts_info, url)
    if is_playlist is None:
        return False

    # Get format and template
    format_spec, output_template = get_download_format(is_playlist)

    # Configure downloader
    ydl_opts = {
        'format': format_spec,
        'outtmpl': os.path.join(output_path, output_template),
        'quiet': False,
        'no_warnings': False,
        'progress_hooks': [create_progress_hook(video_count)],
        'postprocessors': [{
            'key': 'FFmpegVideoConvertor',
            'prefixes': [],
        }],
    }

    # Download
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print(f"\nStarting download ({video_count} {'video' if video_count == 1 else 'videos'})...\n")
            ydl.download([url])

        print(f"\nâœ“ Successfully downloaded {video_count} {'video' if video_count == 1 else 'videos'} to {output_path}")
        return True

    except yt_dlp.utils.DownloadError as e:
        print(f"Download error: {e}")
        return False
    except KeyboardInterrupt:
        print("\n\nDownload cancelled by user.")
        return False
    except Exception as e:
        print(f"Error during download: {e}")
        return False


def main():
    """Main entry point for the CLI."""
    print("=" * 50)
    print("YouTube Downloader")
    print("=" * 50)
    print()

    try:
        url = get_youtube_url()
        output_path = get_output_path()
        success = download_videos(url, output_path)

        if success:
            print("\nDone!")
        else:
            print("\nDownload failed.")

    except KeyboardInterrupt:
        print("\n\nExiting...")
    except Exception as e:
        print(f"Unexpected error: {e}")


if __name__ == "__main__":
    main()

