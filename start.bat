@echo off
echo Starting AI Resume Analyzer...
echo.

REM Start the backend server in the background
start "Backend Server" cmd /c "cd /d D:\Projects\AI Resume\backend && python -m app.main"

REM Wait a moment for server to start
timeout /t 3 /nobreak > nul

REM Open the frontend in default browser
start http://localhost:8000/static/index.html

echo.
echo Backend server started on http://localhost:8000
echo Frontend opened in browser
echo.
echo Press any key to stop the server...
pause > nul

REM Kill the backend process (this is a simple way, you might need taskkill)
taskkill /f /im python.exe /t 2>nul
echo Server stopped.