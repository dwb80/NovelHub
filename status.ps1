# NovelHub Service Status Check
Write-Host "========================================"
Write-Host "       NovelHub Service Status"
Write-Host "========================================"
Write-Host ""

# Check Frontend Service (Port 3000)
Write-Host "[Frontend] Port 3000"
Write-Host "-------------------"
$frontend = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($frontend) {
    Write-Host "Status: Running" -ForegroundColor Green
    Write-Host "PID: $($frontend.OwningProcess)"
    $process = Get-Process -Id $frontend.OwningProcess -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "Process: $($process.ProcessName)"
    }
} else {
    Write-Host "Status: Stopped" -ForegroundColor Red
}
Write-Host ""

# Check Backend Service (Port 3001)
Write-Host "[Backend] Port 3001"
Write-Host "-------------------"
$backend = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($backend) {
    Write-Host "Status: Running" -ForegroundColor Green
    Write-Host "PID: $($backend.OwningProcess)"
    $process = Get-Process -Id $backend.OwningProcess -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "Process: $($process.ProcessName)"
    }
} else {
    Write-Host "Status: Stopped" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================"
Write-Host "           Access URLs"
Write-Host "========================================"
Write-Host "Frontend: http://localhost:3000"
Write-Host "Backend: http://localhost:3001"
Write-Host "Health: http://localhost:3001/api/v1/health"
Write-Host ""

pause
