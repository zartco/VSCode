$ErrorActionPreference = 'Stop'

$scriptDir = $PSScriptRoot
if ([string]::IsNullOrEmpty($scriptDir)) { $scriptDir = "." }

$coreDir = Join-Path $scriptDir "core"
$frontendDir = Join-Path $scriptDir "frontend"
$agyDir = Join-Path $scriptDir "collectors\agy"
$claudeDir = Join-Path $scriptDir "collectors\claude"

# Launch Windows Terminal in a new window with 4 split panes
$wtArgs = @(
    "-w", "Federation", "new-tab", "-d", $coreDir, "powershell", "-NoExit", "-Command", "npm run dev", ";",
    "split-pane", "-d", $frontendDir, "powershell", "-NoExit", "-Command", "npm run dev", ";",
    "split-pane", "-d", $agyDir, "powershell", "-NoExit", "-Command", "npm run dev", ";",
    "split-pane", "-d", $claudeDir, "powershell", "-NoExit", "-Command", "npm run dev"
)

Write-Host "Starting Federation Control Plane in Windows Terminal..."
Start-Process wt -ArgumentList $wtArgs
