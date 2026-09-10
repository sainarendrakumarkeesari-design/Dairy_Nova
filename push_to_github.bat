@echo off
setlocal enabledelayedexpansion
title Push Dairy Dova to GitHub
color 0A

echo ================================================================
echo   DAIRY DOVA - AUTOMATIC GITHUB DEPLOYMENT
echo ================================================================
echo.

set "PATH=C:\Users\keesa\AppData\Local\github-copilot-git-2.53.0-3\cmd;C:\Users\keesa\AppData\Local\github-copilot-git-2.53.0-3\mingw64\bin;%PATH%"
cd /d "%~dp0"

echo [1/3] Staging modified and new files...
git add .

echo [2/3] Checking for changes to commit...
git diff --cached --quiet
if %ERRORLEVEL% NEQ 0 (
    echo Changes detected. Committing...
    for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
    for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a:%%b)
    git commit -m "Auto-update: !mydate! !mytime!"
) else (
    echo No uncommitted changes detected. Proceeding to push.
)

echo [3/3] Pushing to GitHub repository (main branch)...
git push origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ================================================================
    echo  SUCCESS! All updates are deployed to:
    echo  https://github.com/sainarendrakumarkeesari-design/Dairy_Nova
    echo ================================================================
) else (
    echo ================================================================
    echo  Push encountered an issue. Please verify your connection.
    echo ================================================================
)

ping -n 3 127.0.0.1 >nul
