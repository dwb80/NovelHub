@echo off
echo ===================================
echo Check Services Status
echo ===================================
echo.

echo [1] Checking PostgreSQL...
pg_isready -h localhost -p 5432 >nul 2>&1
if errorlevel 1 (
    echo [X] PostgreSQL is NOT running
    echo     Start with: .\pgsql\bin\pg_ctl start -D .\pgsql\data
) else (
    echo [OK] PostgreSQL is running
)
echo.

echo [2] Checking Backend (port 3001)...
netstat -an | findstr "3001" | findstr "LISTENING" >nul
if errorlevel 1 (
    echo [X] Backend is NOT running on port 3001
) else (
    echo [OK] Backend is running on port 3001
)
echo.

echo [3] Checking Frontend (port 3000)...
netstat -an | findstr "3000" | findstr "LISTENING" >nul
if errorlevel 1 (
    echo [X] Frontend is NOT running on port 3000
) else (
    echo [OK] Frontend is running on port 3000
)
echo.

echo ===================================
echo.
echo To start services:
echo   1. Start PostgreSQL: .\pgsql\bin\pg_ctl start -D .\pgsql\data
echo   2. Start Backend:    cd apps/backend ^&^& npm run start:dev
echo   3. Start Frontend:   cd apps/frontend ^&^& npm run dev
echo.
pause
