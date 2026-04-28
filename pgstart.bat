@echo off
chcp 65001 >nul
echo ==========================================
echo      PostgreSQL Portable Start Script
echo ==========================================
echo.

REM Set PostgreSQL paths
set PGDIR=%~dp0pgsql
set PGDATA=%PGDIR%\data
set PGLOG=%PGDIR%\log\postgresql.log
set PGBIN=%PGDIR%\bin

REM Check if PostgreSQL directory exists
if not exist "%PGDIR%" (
    echo [X] PostgreSQL directory not found: %PGDIR%
    pause
    exit /b 1
)

echo [OK] PostgreSQL directory found: %PGDIR%
echo.

REM Check if data directory exists
if not exist "%PGDATA%" (
    echo [X] Data directory not found: %PGDATA%
    echo.
    echo Please initialize the database first:
    echo   %PGBIN%\initdb -D %PGDATA% -E UTF8 --locale=zh_CN.UTF-8
    pause
    exit /b 1
)

echo [OK] Data directory found: %PGDATA%
echo.

REM Check if PostgreSQL is already running
"%PGBIN%\pg_ctl" status -D "%PGDATA%" >nul 2>&1
if %errorlevel% == 0 (
    echo [INFO] PostgreSQL is already running
    echo.
    "%PGBIN%\pg_ctl" status -D "%PGDATA%"
    echo.
    goto :end
)

echo [*] Starting PostgreSQL...
echo.

REM Create log directory if not exists
if not exist "%PGDIR%\log" mkdir "%PGDIR%\log"

REM Start PostgreSQL
"%PGBIN%\pg_ctl" start -D "%PGDATA%" -l "%PGLOG%"

if %errorlevel% == 0 (
    echo.
    echo [OK] PostgreSQL started successfully!
    echo.
    echo Connection info:
    echo   Host: localhost
    echo   Port: 5432
    echo   Data: %PGDATA%
    echo   Log:  %PGLOG%
    echo.
    echo Start time: %date% %time%
) else (
    echo.
    echo [X] Failed to start PostgreSQL
    echo.
    echo Possible reasons:
    echo   1. Port 5432 is occupied
    echo   2. Data directory is corrupted
    echo   3. Permission denied
    echo.
    echo Check log: %PGLOG%
)

:end
echo.
echo ==========================================
echo Press any key to exit...
echo ==========================================
pause >nul
