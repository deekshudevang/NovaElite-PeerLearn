# PeerLearn Development Server Startup Script
Write-Host "Starting PeerLearn Development Environment..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Blue
} catch {
    Write-Host "Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Start backend server in a new window
Write-Host "Starting Backend Server (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$(Split-Path $MyInvocation.MyCommand.Path)\backend'; npm run dev"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend server in a new window
Write-Host "Starting Frontend Server (Port 8081)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$(Split-Path $MyInvocation.MyCommand.Path)\frontend'; npm run dev"

Write-Host ""
Write-Host "🚀 PeerLearn Development Environment Started!" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:8081" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo Credentials:" -ForegroundColor Yellow
Write-Host "Email:    alice@example.com" -ForegroundColor White
Write-Host "Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop the servers." -ForegroundColor Gray