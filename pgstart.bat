@echo off
chcp 65001 >nul
echo ==========================================
echo      PostgreSQL Service Start Script
echo ==========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Please run this script as administrator!
    echo.
    echo How to:
    echo   1. Right-click on pgstart.bat
    echo   2. Select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo [OK] Administrator privileges confirmed
echo.

REM Check if PostgreSQL service exists
sc query PostgreSQL >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] PostgreSQL service not found
    echo.
    echo Searching for other PostgreSQL services...
    sc query | findstr /i postgres >nul
    if %errorlevel% == 0 (
        echo.
        echo Found related services:
        sc query | findstr /i postgres
        echo.
        echo Please modify the service name in the script
    ) else (
        echo No PostgreSQL services found. Please confirm PostgreSQL is installed.
    )
    pause
    exit /b 1
)

echo [OK] PostgreSQL service found
echo.

REM Check service status
sc query PostgreSQL | findstr RUNNING >nul
if %errorlevel% == 0 (
    echo [INFO] PostgreSQL service is already running
    echo.
    sc query PostgreSQL | findstr STATE
    echo.
    echo No need to start again
    goto :end
)

echo [*] Starting PostgreSQL service...
echo.

REM Start service
net start PostgreSQL >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] PostgreSQL service started successfully!
    echo.
    echo Service status:
    sc query PostgreSQL | findstr STATE
    echo.
    echo Start time: %date% %time%
) else (
    echo [X] Failed to start PostgreSQL service
    echo.
    echo Possible reasons:
    echo   1. Service configuration error
    echo   2. Data directory corrupted
    echo   3. Port 5432 is occupied by another program
    echo.
    echo Please check PostgreSQL logs for details
    echo Log location: pgsql\data\log\
)

:end
echo.
echo ==========================================
echo Press any key to exit...
echo ==========================================
pause >nul
