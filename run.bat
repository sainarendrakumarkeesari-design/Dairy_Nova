@echo off
title DAIRY DOVA - Smart Milk System
echo Starting DAIRY DOVA Local Web Server...
powershell -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
pause
