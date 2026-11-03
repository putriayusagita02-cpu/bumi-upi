@echo off
title Bumi Upi CRM & Customer Portal
echo =====================================================================
echo   Rumah Tamah Bumi Upi — F&B CRM & Ordering Monorepo (Garut)
echo   Customer Portal : http://localhost:3000
echo   Admin & POS     : http://localhost:3001
echo =====================================================================
echo.
echo [1/3] Menghentikan proses Node.js lama...
taskkill /F /IM node.exe >nul 2>&1

echo [2/3] Membersihkan folder build & cache Next.js (.next)...
if exist "apps\web\.next" rd /s /q "apps\web\.next" >nul 2>&1
if exist "apps\admin\.next" rd /s /q "apps\admin\.next" >nul 2>&1

echo [3/3] Menjalankan server aplikasi web (3000) dan admin (3001)...
call pnpm.cmd dev
pause
