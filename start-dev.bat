@echo off
title PMB Mulia Angkasa - Dev Launcher
echo ===================================================
echo   Memulai PMB Mulia Angkasa Akademi
echo   - Backend NestJS : Port 5000
echo   - Frontend NextJS: Port 3000
echo ===================================================

start "PMB Backend (Port 5000)" cmd /k "cd /d %~dp0backend && npm run start:dev"
start "PMB Frontend (Port 3000)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Server backend dan frontend sedang dijalankan di jendela terpisah!
echo - Halaman web: http://localhost:3000
echo - API Backend: http://localhost:5000/api
echo.
