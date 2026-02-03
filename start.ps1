# Start AI Resume Analyzer
Write-Host "Starting AI Resume Analyzer..." -ForegroundColor Green
Write-Host ""

# Start backend server in background
$backendJob = Start-Job -ScriptBlock {
    Set-Location "D:\Projects\AI Resume\backend"
    python -m app.main
}

# Wait for server to start
Start-Sleep -Seconds 3

# Open frontend in browser
Start-Process "http://localhost:8000/static/index.html"

Write-Host "Backend server started on http://localhost:8000" -ForegroundColor Yellow
Write-Host "Frontend opened in browser" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server..." -ForegroundColor Cyan

# Keep script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    # Cleanup when script is interrupted
    Write-Host "Stopping server..." -ForegroundColor Red
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
}