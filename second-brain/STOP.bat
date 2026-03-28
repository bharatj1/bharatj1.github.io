@echo off
title Stopping everything...
echo.
echo  Killing all servers...
taskkill /F /IM python.exe /T >nul 2>&1
taskkill /F /IM pythonw.exe /T >nul 2>&1
echo  Done. Everything stopped.
echo.
timeout /t 2 /nobreak >nul
