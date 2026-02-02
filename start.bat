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

echo [INFO] 正在启动开发服务器 (Vite)...
echo [INFO] 播放器将在默认浏览器中自动开启，请稍候。
echo.
call npm run dev

pause
