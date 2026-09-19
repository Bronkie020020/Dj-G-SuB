@echo off
title DJ G-SUB & SOULCRAFT HUB
echo ======================================================================
echo   DJ G-SUB & SOULCRAFT HUB // 90s CHICAGO & DETROIT UNDERGROUND
echo   AI PROMPT GENERATOR ENGINE (DSPy) & SNEAKER ARTY FARTY STUDIO
echo ======================================================================
echo.
cd /d "%~dp0"

echo [1/2] Controleren van node_modules...
if not exist node_modules (
  echo Bezig met eenmalige installatie van dependencies...
  call npm install
)

echo.
echo [2/2] Server wordt gestart op http://localhost:3000 ...
timeout /t 2 /nobreak >nul
start "" http://localhost:3000

node server.js
pause
