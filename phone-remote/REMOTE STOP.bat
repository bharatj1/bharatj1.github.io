@echo off
title Stopping Phone Remote
echo.
echo  Stopping Phone Remote server...
taskkill /F /IM python.exe /T >nul 2>&1
taskkill /F /IM pythonw.exe /T >nul 2>&1
echo  Done.
echo.
pause
