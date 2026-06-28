# ============================================================
#  Play-Video.ps1  —  Inline video playback via mpv/Sixel
#                     or ffmpeg|chafa pipeline fallback
#  Usage: .\Play-Video.ps1 -Path clip.mp4
#         .\Play-Video.ps1 -Path clip.mp4 -Mode chafa -Loop
#  Requires: mpv  (winget install mpv-player.mpv)   for -Mode mpv
#            ffmpeg (winget install Gyan.FFmpeg)     for -Mode chafa
#            chafa  (winget install hpjansson.Chafa) for -Mode chafa
# ============================================================

param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$Path,

    # mpv   = native Sixel driver, best sync + audio support
    # chafa = ffmpeg→chafa pipe, no audio, but more control over look
    [ValidateSet("mpv","chafa")]
    [string]$Mode = "mpv",

    # Width in columns.  0 = auto (80% of terminal width for mpv,
    # half-width for chafa).
    [int]$Width = 0,

    # Loop the video indefinitely
    [switch]$Loop,

    # For -Mode chafa only: frames per second to extract from the video.
    # Lower = less CPU.  Video is typically 24-30 fps; 12 looks acceptable.
    [int]$Fps = 15,

    # For -Mode chafa only: extract a specific number of seconds then stop.
    # 0 = play entire file.
    [int]$DurationSec = 0
)

$cols = $Host.UI.RawUI.WindowSize.Width
$rows = $Host.UI.RawUI.WindowSize.Height

if (-not (Test-Path $Path)) {
    Write-Error "File not found: $Path"
    return
}

# ----------------------------------------------------------------
#  MODE: mpv  (recommended — native Sixel, synced audio/video)
# ----------------------------------------------------------------
if ($Mode -eq "mpv") {
    if (-not (Get-Command mpv -ErrorAction SilentlyContinue)) {
        Write-Error @"
mpv is not installed.  Run:
    winget install mpv-player.mpv
and reopen the terminal.
"@
        return
    }

    $w = if ($Width -gt 0) { $Width } else { [int]($cols * 0.8) }

    $mpvArgs = @(
        "--no-config",       # ignore user mpv.conf to avoid surprises
        "--vo=sixel",        # Sixel video output driver
        "--profile=sw-fast", # software render preset, bypasses GPU for VO
        "--really-quiet",    # suppress progress/stats so only Sixel reaches stdout
        "--vo-sixel-width=$w"
    )

    if ($Loop)          { $mpvArgs += "--loop"      }
    $mpvArgs            += $Path

    Write-Host "Playing via mpv (Sixel) — press Q to quit." -ForegroundColor DarkGray
    & mpv @mpvArgs
    return
}

# ----------------------------------------------------------------
#  MODE: chafa  (ffmpeg → chafa pipe, frame-by-frame ASCII/Sixel)
#
#  Why a pipe works here:
#  ffmpeg writes raw RGB24 frames to stdout; chafa reads raw RGB24
#  from stdin ("-"). PowerShell 7 passes raw bytes between native
#  executables when you use |, so no binary corruption occurs.
#
#  Why we need --loglevel quiet:
#  ffmpeg writes progress info to stderr.  Without redirecting it,
#  the progress text would interleave with chafa's Sixel output
#  and corrupt the image display.
# ----------------------------------------------------------------
if ($Mode -eq "chafa") {
    foreach ($tool in @("ffmpeg","chafa")) {
        if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
            Write-Error "$tool is not installed. See script header for winget commands."
            return
        }
    }

    $w = if ($Width -gt 0) { $Width } else { [int]($cols * 0.5) }
    $h = [int]($rows * 0.8)

    # Probe the video duration so we know when to stop in non-loop mode
    $dur = if ($DurationSec -gt 0) { $DurationSec } else { 0 }

    $loopCount = if ($Loop) { -1 } else { 1 }

    Write-Host "Playing via ffmpeg|chafa pipeline — Ctrl+C to stop." -ForegroundColor DarkGray

    $iteration = 0
    do {
        $iteration++

        # Build ffmpeg arguments:
        #   -ss 0      start at beginning
        #   -i <file>  input
        #   -vf fps=N  extract N frames per second (reduces CPU load vs native fps)
        #   -f rawvideo -pix_fmt rgb24  output raw RGB bytes — what chafa -f raw expects
        #   pipe:1     write to stdout
        $ffmpegArgs = @("-loglevel","quiet","-i",$Path,"-vf","fps=$Fps","-f","rawvideo","-pix_fmt","rgb24","pipe:1")
        if ($dur -gt 0) { $ffmpegArgs = @("-t",$dur) + $ffmpegArgs }

        # chafa reads raw RGB24 from stdin when given "-" as the filename.
        # --format sixel and explicit size prevent auto-detection issues on Windows.
        $chafaArgs = @("--format","sixel","--size","${w}x${h}","--color-space","din99d","-")

        & ffmpeg @ffmpegArgs | & chafa @chafaArgs

    } while ($loopCount -eq -1)
}
