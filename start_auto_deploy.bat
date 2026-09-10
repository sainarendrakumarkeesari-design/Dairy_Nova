@echo off
title Dairy Nova - Auto Deploy Watcher to GitHub
color 0B
cd /d "%~dp0"

echo ================================================================
echo   STARTING CONTINUOUS AUTO-DEPLOY WATCHER TO GITHUB
echo ================================================================
echo.

powershell -ExecutionPolicy Bypass -NoProfile -File ".\auto_sync_github.ps1"

pause
