$ErrorActionPreference = 'Continue'

Write-Host "Stopping Federation services..."

# Best-effort attempt to find node/tsx processes related to our services
$processes = Get-CimInstance Win32_Process | Where-Object { $_.Name -match 'node\.exe|tsx\.exe|npm\.cmd' }

$stopped = 0
foreach ($p in $processes) {
    if ($p.CommandLine -match "federation|vite|tsx|core|frontend|agy|claude") {
        Write-Host "Stopping Process: $($p.Name) (PID: $($p.ProcessId))"
        Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
        $stopped++
    }
}

if ($stopped -eq 0) {
    Write-Host "No relevant node processes found. You can also simply close the Federation Windows Terminal window to tear down the services."
} else {
    Write-Host "Successfully stopped $stopped process(es)."
}
