@echo off
title JanSetu - Platform Runner
echo ==============================================================
echo                 JANSETU - BUILD FOR BHARAT 2026
echo         Bilingual AI Government Assistance Platform
echo ==============================================================
echo.
echo Starting Backend API (Port 4000)...
start "JanSetu Backend" cmd /k "cd backend && npm install && npm run dev"
echo.
echo Starting Frontend Client (Port 5173)...
start "JanSetu Frontend" cmd /k "cd frontend && npm install && npm run dev"
echo.
echo ==============================================================
echo JanSetu is launching!
echo Backend will be available at:  http://localhost:4000
echo Frontend will be available at: http://localhost:5173
echo ==============================================================
pause
