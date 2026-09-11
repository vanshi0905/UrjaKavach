@echo off
title Deploy JSL Carbon Decision Engine to Vercel
echo =====================================================================
echo   DEPLOY JSL CARBON DECISION ENGINE TO VERCEL
echo   Team NIT Raipur - Problem Statement 3
echo =====================================================================
echo.
cd /d "C:\Users\Asus\Desktop\JSL\frontend"
echo Running Vercel deployment...
npx vercel --prod
echo.
pause
