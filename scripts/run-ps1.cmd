@echo off
REM Launcher for .ps1 files - opens them in Windows Terminal
wt new-tab powershell.exe -ExecutionPolicy Bypass -NoExit -File "%~1"
