# ============================================================
#  Render-Image.ps1  —  Inline image display via chafa/Sixel
#  Usage: .\Render-Image.ps1 -Path logo.png
#         .\Render-Image.ps1 -Path photo.jpg -Width 60 -Format symbols
#  Requires: chafa  (winget install hpjansson.Chafa)
# ============================================================

param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$Path,

    # Output width in terminal columns.  0 = auto (half terminal width).
    [int]$Width = 0,

    # Output height in terminal rows.  0 = auto (proportional to width).
    [int]$Height = 0,

    # Sixel  = highest quality (Windows Terminal 1.22+, default)
    # symbols = half-block Unicode fallback (works everywhere)
    [ValidateSet("sixel","symbols")]
    [string]$Format = "sixel",

    # Symbol set chafa uses for the symbol fallback.
    # vhalf = upper/lower half-blocks (best detail, universal)
    # block = solid block only (fastest, coarser)
    # ascii = pure ASCII characters (most retro)
    [ValidateSet("vhalf","block","ascii","all")]
    [string]$Symbols = "vhalf",

    # DIN99d is a perceptually-uniform color space — colors that look
    # equidistant to human eyes are spaced equidistantly in DIN99d,
    # so chafa's palette quantization produces less visible banding.
    [ValidateSet("din99d","rgb")]
    [string]$ColorSpace = "din99d",

    # Blue-noise dithering scatters quantization error irregularly,
    # which looks more natural than the regular grid of Bayer dithering.
    [ValidateSet("bayer","none","blue")]
    [string]$Dither = "blue"
)

if (-not (Get-Command chafa -ErrorAction SilentlyContinue)) {
    Write-Error @"
chafa is not installed.  Run:
    winget install hpjansson.Chafa
then open a new terminal session.
"@
    return
}

if (-not (Test-Path $Path)) {
    Write-Error "File not found: $Path"
    return
}

# Auto-size: use half the terminal width so the image doesn't crowd text
$cols = $Host.UI.RawUI.WindowSize.Width
$rows = $Host.UI.RawUI.WindowSize.Height
$w    = if ($Width  -gt 0) { $Width  } else { [int]($cols * 0.5) }
$h    = if ($Height -gt 0) { $Height } else { [int]($rows * 0.4) }

# Build the chafa argument list.  Using an array lets PowerShell handle
# quoting automatically — no risk of spaces in $Path breaking the command.
$chafaArgs = @(
    "--format",      $Format,
    "--symbols",     $Symbols,
    "--color-space", $ColorSpace,
    "--dither",      $Dither,
    "--size",        "${w}x${h}",
    $Path
)

& chafa @chafaArgs
