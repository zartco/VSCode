$ErrorActionPreference = 'Continue'

$scriptDir = $PSScriptRoot
if ([string]::IsNullOrEmpty($scriptDir)) { $scriptDir = "." }

$coreDir = Join-Path $scriptDir "core"
$frontendDir = Join-Path $scriptDir "frontend"
$agyDir = Join-Path $scriptDir "collectors\agy"
$claudeDir = Join-Path $scriptDir "collectors\claude"
$vaultWebDir = "C:\VSCode\Vault-Web"

# Launch Windows Terminal on Monitor 3 (Left, Maximized) with 5 split panes
$wtArgString = "-w new --pos=-1000,100 -M new-tab -d `"$coreDir`" cmd /k `"npm run dev`" `; split-pane -d `"$frontendDir`" cmd /k `"npm run dev`" `; split-pane -d `"$agyDir`" cmd /k `"npm run dev`" `; split-pane -d `"$claudeDir`" cmd /k `"npm run dev`" `; split-pane -d `"$vaultWebDir`" cmd /k `"npm run dev`""

Write-Host "Starting Federation Control Plane in Windows Terminal..."
Start-Process wt -ArgumentList $wtArgString

Write-Host "Starting Google Chrome on Monitor 1..."
Start-Process chrome -ArgumentList "--app=http://localhost:5173", "--window-position=0,0", "--start-fullscreen"

# Launch Antigravity IDE for Antigravity CLI
$cliDir = "C:\VSCode\antigravity-cli"
$ideExe = "C:\Users\Zartc\AppData\Local\Programs\Antigravity IDE\Antigravity IDE.exe"

Write-Host "Starting Antigravity IDE for CLI..."
Start-Process $ideExe -ArgumentList "`"$cliDir`""

Write-Host "All services launched."
