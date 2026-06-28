$ErrorActionPreference = 'Continue'

$scriptDir = $PSScriptRoot
if ([string]::IsNullOrEmpty($scriptDir)) { $scriptDir = "." }

$agyDir = Join-Path $scriptDir "collectors\agy"
$claudeDir = Join-Path $scriptDir "collectors\claude"

# Launch Windows Terminal on Monitor 3 (Left, Maximized) with 3 split panes
$wtArgString = "-w new --pos=-1000,100 -M new-tab -d `"$scriptDir`" cmd /k `"npm run dev`" `; split-pane -d `"$agyDir`" cmd /k `"npm run dev`" `; split-pane -d `"$claudeDir`" cmd /k `"npm run dev`""

Write-Host "Starting Federation-Center (Next.js & Collectors) in Windows Terminal..."
Start-Process wt -ArgumentList $wtArgString

Write-Host "Starting Google Chrome pointing to http://localhost:3000..."
Start-Process chrome -ArgumentList "--app=http://localhost:3000", "--window-position=0,0", "--start-fullscreen"

# Launch Antigravity IDE to C:\VSCode
$targetDir = "C:\VSCode"
$ideExe = "C:\Users\Zartc\AppData\Local\Programs\Antigravity IDE\Antigravity IDE.exe"

Write-Host "Starting Antigravity IDE..."
if (Test-Path $ideExe) {
    Start-Process $ideExe -ArgumentList "`"$targetDir`""
} else {
    Write-Host "Antigravity IDE not found at expected path: $ideExe"
}

Write-Host "All services launched."
