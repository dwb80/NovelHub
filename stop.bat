@echo off
echo ==========================================
echo NovelHub Service Stop Script
echo ==========================================
echo.

echo [1/3] Stopping frontend service (port 3000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo     Found process PID: %%a
    taskkill /F /PID %%a 2>nul
    echo     Frontend service stopped
)

echo [2/3] Stopping backend service (port 3001)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo     Found process PID: %%a
    taskkill /F /PID %%a 2>nul
    echo     Backend service stopped
)

echo [3/3] Cleaning up Node.js processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo     Node.js processes cleaned
) else (
    echo     No Node.js processes found
)

echo.
echo ==========================================
echo All services stopped
echo ==========================================
pause
