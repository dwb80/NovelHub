@echo off
echo ==========================================
echo       PostgreSQL Service Stop Script
echo ==========================================
echo.

echo [1/3] Stopping PostgreSQL service...
net stop postgresql-x64-15 2>nul
if %errorlevel% == 0 (
    echo [OK] PostgreSQL service stopped
) else (
    echo [WARN] Service may not be running or does not exist, trying alternative method...
)

echo.
echo [2/3] Terminating PostgreSQL processes...
taskkill /F /IM postgres.exe 2>nul
if %errorlevel% == 0 (
    echo [OK] PostgreSQL process terminated
) else (
    echo [INFO] PostgreSQL process not found
)

taskkill /F /IM pg_ctl.exe 2>nul
if %errorlevel% == 0 (
    echo [OK] pg_ctl process terminated
) else (
    echo [INFO] pg_ctl process not found
)

echo.
echo [3/3] Checking port 5432 usage...
netstat -ano | findstr :5432 >nul
if %errorlevel% == 0 (
    echo [WARN] Port 5432 is still in use, attempting to release...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5432') do (
        echo Terminating process PID: %%a
        taskkill /F /PID %%a 2>nul
    )
) else (
    echo [OK] Port 5432 is not in use
)

echo.
echo ==========================================
echo       PostgreSQL Stop Complete
echo ==========================================
echo.
pause
