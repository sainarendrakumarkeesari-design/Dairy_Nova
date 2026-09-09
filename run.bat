@echo off
title DAIRY NOVA - Smart Milk System & Auto Deploy
cd /d "%~dp0"

echo ================================================================
echo   DAIRY NOVA - LOCAL SERVER & GITHUB AUTO-DEPLOY
echo ================================================================
echo.
echo [1/2] Launching GitHub Auto-Deploy File Watcher (background)...
start "Dairy Nova - GitHub Auto-Deploy" /min powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0auto_sync_github.ps1"

echo [2/2] Starting DAIRY NOVA Local Web Server (http://localhost:3000)...
powershell -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
pause
