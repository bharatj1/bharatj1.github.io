@echo off
title Phone Remote Control
echo.
echo  Starting Phone Remote...
echo.

:: Needs admin for mute / sleep / reboot
powershell -Command "Start-Process powershell -ArgumentList '-NoProfile -Command python C:\phone-remote\server.py' -Verb RunAs -WindowStyle Minimized"

:: Wait for server to come up
timeout /t 3 /nobreak >nul

:: Show IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "169"') do (
    set ip=%%a
    goto :done
)
:done
set ip=%ip: =%

echo  Phone Remote running.
echo.
echo  Open on your phone:
echo  http://%ip%:8080
echo.
echo  Press any key to close this window (server keeps running)
pause >nul
