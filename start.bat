@echo off
title Video Player Launcher
echo ========================================
echo   ANTIGRAVITY VIDEO PLAYER LAUNCHER
echo ========================================
echo.

if not exist node_modules (
    echo [INFO] First time setup: Installing dependencies...
    call npm install
)

echo [INFO] Starting development server...
echo [INFO] The player will open in your default browser automatically.
echo.
call npm run dev

pause
