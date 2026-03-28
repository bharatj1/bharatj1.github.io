@echo off
title PC Remote + Second Brain
echo.
echo  Starting everything...
echo.

:: Start phone-remote as admin (needs it for sleep/reboot/mute)
powershell -Command "Start-Process powershell -ArgumentList '-NoProfile -Command python C:\phone-remote\server.py' -Verb RunAs -WindowStyle Minimized"

:: Start second-brain as current user (needs Outlook COM access)
start "Second Brain" /MIN cmd /c "python C:\second-brain\server.py"

:: Wait and show IP
timeout /t 3 /nobreak >nul
echo  Both servers running.
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "169"') do (
    set ip=%%a
    goto :done
)
:done
set ip=%ip: =%
echo  Phone Remote : http://%ip%:8080
echo  Second Brain : http://%ip%:8081
echo.
echo  Press any key to close this window (servers keep running)
pause >nul
