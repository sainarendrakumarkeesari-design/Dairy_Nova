@echo off
title Sync Dairy Nova Assets to Android App
color 0A
cd /d "%~dp0"

echo ================================================================
echo   SYNCING ASSETS TO ANDROID APP
echo ================================================================
echo.

powershell -ExecutionPolicy Bypass -NoProfile -File ".\sync_assets.ps1"

echo.
pause
