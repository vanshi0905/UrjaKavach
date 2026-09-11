@echo off
echo =====================================================================
echo  Starting JSL Industrial Carbon & Energy Decision Engine (v2.1)
echo  Team NIT Raipur -- JSL Stainless Spark PS-3
echo =====================================================================
echo.
echo Launching FastAPI Server on http://localhost:8000 ...
echo Dashboard UI available at: http://localhost:8000
echo Press Ctrl+C to stop the server.
echo.
python main.py --serve --port 8000
pause
