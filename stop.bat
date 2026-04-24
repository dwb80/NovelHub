@echo off
echo ==========================================
echo       NovelHub Service Stop Script
echo ==========================================
echo.

:: Stop frontend service (port 3000)
echo [1/3] Stopping frontend service (port 3000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo       Found process PID: %%a, stopping...
    taskkill /F /PID %%a >nul 2>&1
    if !errorlevel! equ 0 (
        echo       [OK] Frontend service stopped
    ) else (
        echo       [FAIL] Stop failed, may already be closed
    )
)

:: Stop backend service (port 3001)
echo [2/3] Stopping backend service (port 3001)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do (
    echo       Found process PID: %%a, stopping...
    taskkill /F /PID %%a >nul 2>&1
    if !errorlevel! equ 0 (
        echo       [OK] Backend service stopped
    ) else (
        echo       [FAIL] Stop failed, may already be closed
    )
)

:: Stop all Node.js processes
echo [3/3] Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo       [OK] All Node.js processes stopped
) else (
    echo       [INFO] No running Node.js processes
)

echo.
echo ==========================================
echo       All services stopped
echo ==========================================
echo.
pause
