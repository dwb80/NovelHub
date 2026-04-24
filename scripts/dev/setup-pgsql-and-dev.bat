@echo off
chcp 65001 >nul
echo ===================================
echo PostgreSQL + Dev Environment Setup
echo ===================================
echo.

set PGDIR=%~dp0..\pgsql
set PGDATA=%PGDIR%\data
set PATH=%PGDIR%\bin;%PATH%

echo [1/8] Checking PostgreSQL directory...
if not exist "%PGDIR%\bin\initdb.exe" (
    echo [ERROR] PostgreSQL not found
    echo Please ensure pgsql directory exists: %PGDIR%
    pause
    exit /b 1
)
echo [OK] PostgreSQL found
echo.

echo [2/8] Initializing PostgreSQL data directory...
if not exist "%PGDATA%" (
    echo Initializing database cluster...
    initdb -D "%PGDATA%" -U postgres -E UTF8 --locale=Chinese_China.936
    if errorlevel 1 (
        echo [ERROR] Initialization failed
        pause
        exit /b 1
    )
    echo [OK] Data directory created
) else (
    echo [OK] Data directory exists
)
echo.

echo [3/8] Starting PostgreSQL service...
pg_ctl status -D "%PGDATA%" >nul 2>&1
if errorlevel 1 (
    pg_ctl start -D "%PGDATA%" -l "%PGDIR%\log.txt"
    if errorlevel 1 (
        echo [ERROR] Start failed
        pause
        exit /b 1
    )
    echo [OK] PostgreSQL started
) else (
    echo [OK] PostgreSQL already running
)
echo.
##密码是123456
echo [4/8] Setting postgres password...
echo.
echo Please set password for postgres user (remember this!)
psql -U postgres -c "\password postgres"
echo.

echo [5/8] Creating development database...
psql -U postgres -c "CREATE DATABASE novelhub_dev;" 2>nul
if errorlevel 1 (
    echo [INFO] Database may already exist, continuing...
) else (
    echo [OK] Database novelhub_dev created
)
echo.

cd ..\apps\backend

echo [6/8] Switching to development environment config...
copy /Y .env.development .env >nul
echo [OK] Using .env.development
echo.

echo [7/8] Installing dependencies...
call pnpm install
if errorlevel 1 (
    echo [ERROR] Dependencies installation failed
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

echo [8/8] Generating Prisma client and running migrations...
call npx prisma generate
if errorlevel 1 (
    echo [ERROR] Prisma client generation failed
    pause
    exit /b 1
)
echo [OK] Prisma client generated
echo.

call npx prisma migrate dev --name init
if errorlevel 1 (
    echo [ERROR] Database migration failed
    pause
    exit /b 1
)
echo [OK] Database migration completed
echo.

cd ..\..

echo ===================================
echo Development Environment Ready!
echo ===================================
echo.
echo PostgreSQL data directory: %PGDATA%
echo Development database: novelhub_dev
echo.
echo Common commands:
echo   Start PG:  pgsql\bin\pg_ctl start -D pgsql\data
echo   Stop PG:   pgsql\bin\pg_ctl stop -D pgsql\data
echo   Start app: pnpm dev
echo.
pause
