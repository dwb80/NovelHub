@echo off
chcp 65001 >nul
echo ==========================================
echo      PostgreSQL Service Status Check
echo ==========================================
echo.

REM Check PostgreSQL service status
sc query PostgreSQL 2>nul | findstr STATE >nul
if %errorlevel% == 0 (
    sc query PostgreSQL | findstr RUNNING >nul
    if %errorlevel% == 0 (
        echo [OK] PostgreSQL service is running
        echo.
        sc query PostgreSQL | findstr STATE
    ) else (
        echo [X] PostgreSQL service is not running
        echo.
        sc query PostgreSQL | findstr STATE
        echo.
        echo Tip: Use pgstart.bat to start the service
    )
) else (
    echo [X] PostgreSQL service not found
    echo.
    echo Possible reasons:
    echo   1. PostgreSQL is not installed
    echo   2. Service name is not "PostgreSQL"
    echo.
    echo Searching for other PostgreSQL services...
    echo.
    sc query 2>nul | findstr /i postgres >nul
    if %errorlevel% == 0 (
        echo Found related services:
        sc query | findstr /i postgres
    ) else (
        echo No PostgreSQL related services found
    )
)

echo.
echo ==========================================
echo Checking port 5432...
echo ==========================================
netstat -ano | findstr ":5432" >nul
if %errorlevel% == 0 (
    echo [OK] Port 5432 is in use
    netstat -ano | findstr ":5432"
) else (
    echo [X] Port 5432 is not in use
)

echo.
echo ==========================================
echo Press any key to exit...
echo ==========================================
pause >nul
