@echo off
title Phone Remote Control
echo.
echo  Starting Phone Remote...
echo.

:: pythonw.exe = no console window, runs fully detached in background
:: Closing this window will NOT kill the server
powershell -Command "Start-Process 'C:\Python314\pythonw.exe' -ArgumentList 'C:\phone-remote\server.py' -Verb RunAs -WindowStyle Hidden"

:: Wait for server to come up
timeout /t 3 /nobreak >nul

:: Show IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "169"') do (
    set ip=%%a
    goto :done
)
:done
set ip=%ip: =%

echo  Phone Remote running in background.
echo.
echo  Open on your phone:
echo  http://%ip%:8080
echo.
echo  Safe to close this window - server keeps running.
pause >nul
