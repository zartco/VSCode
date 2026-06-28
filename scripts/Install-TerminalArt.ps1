# ============================================================
#  Install-TerminalArt.ps1
#  One-shot setup: installs chafa, mpv, ffmpeg via winget.
#  Run this once from an elevated terminal or allow UAC prompts.
# ============================================================

$tools = @(
    @{ Id = "hpjansson.Chafa";   Name = "chafa  (Sixel/ASCII image renderer)" },
    @{ Id = "shinchiro.mpv";     Name = "mpv    (native Sixel video player)"  },
    @{ Id = "Gyan.FFmpeg";       Name = "ffmpeg (video decode for pipe mode)" }
)

foreach ($tool in $tools) {
    Write-Host "`nInstalling $($tool.Name)..." -ForegroundColor Cyan
    winget install --id $tool.Id --silent --accept-source-agreements --accept-package-agreements
}

Write-Host "`nAll tools installed." -ForegroundColor Green
Write-Host "Open a NEW terminal tab so PATH changes take effect, then test with:" -ForegroundColor Yellow
Write-Host "  chafa --version" -ForegroundColor White
Write-Host "  mpv   --version" -ForegroundColor White
Write-Host "  ffmpeg -version" -ForegroundColor White
