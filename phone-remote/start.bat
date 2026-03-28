@echo off
:: PC Remote — runs the server with admin rights (needed for sleep/reboot)
:: Put a shortcut to this in your Startup folder (Win+R → shell:startup)

cd /d "%~dp0"

:: Check if already running as admin
net session >nul 2>&1
if %errorLevel% == 0 (
    start "" /B pythonw server.py
) else (
    :: Re-launch as admin silently
    powershell -Command "Start-Process '%~f0' -Verb RunAs -WindowStyle Hidden"
)
