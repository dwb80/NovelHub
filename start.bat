@echo off
chcp 65001 >nul
echo ==========================================
echo       NovelHub Service Start Script
echo ==========================================
echo.

echo [0/4] Checking existing services...

set FRONTEND_RUNNING=0
set BACKEND_RUNNING=0

netstat -an | find ":3000" | find "LISTENING" >nul
if %errorlevel% == 0 set FRONTEND_RUNNING=1

netstat -an | find ":3001" | find "LISTENING" >nul
if %errorlevel% == 0 set BACKEND_RUNNING=1

if %FRONTEND_RUNNING% == 1 echo       [!] Frontend service (port 3000) is running
if %BACKEND_RUNNING% == 1 echo       [!] Backend service (port 3001) is running

if %FRONTEND_RUNNING% == 1 if %BACKEND_RUNNING% == 1 (
    echo.
    echo       All services are running, no need to start
    echo.
    pause
    exit /b 0
)

echo.
echo [1/4] Starting backend service (port 3001)...
cd /d "%~dp0apps\backend"

if not exist "node_modules" (
    echo       [i] Installing backend dependencies...
    call pnpm install
)

echo       [i] Checking database connection...
call npx prisma db pull >nul 2>&1
if %errorlevel% neq 0 (
    echo       [!] Database connection failed, please check PostgreSQL service
    echo.
    pause
    exit /b 1
)
echo       [OK] Database connection OK

start "NovelHub Backend" cmd /k "pnpm run start:dev"
echo       [OK] Backend service start command sent

echo       [i] Waiting for backend service ready...
:CHECK_BACKEND
timeout /t 2 /nobreak >nul
netstat -an | find ":3001" | find "LISTENING" >nul
if %errorlevel% neq 0 goto CHECK_BACKEND
timeout /t 3 /nobreak >nul
echo       [OK] Backend service ready (http://localhost:3001)

echo.
echo [2/4] Starting frontend service (port 3000)...
cd /d "%~dp0apps\frontend"

if not exist "node_modules" (
    echo       [i] Installing frontend dependencies...
    call pnpm install
)

start "NovelHub Frontend" cmd /k "pnpm run dev"
echo       [OK] Frontend service start command sent

echo       [i] Waiting for frontend service ready...
:CHECK_FRONTEND
timeout /t 2 /nobreak >nul
netstat -an | find ":3000" | find "LISTENING" >nul
if %errorlevel% neq 0 goto CHECK_FRONTEND
timeout /t 3 /nobreak >nul
echo       [OK] Frontend service ready (http://localhost:3000)

echo.
echo [3/4] Checking admin panel...
echo       [i] Admin panel: http://localhost:3000/admin
echo       [i] Default admin: admin / admin123

echo.
echo [4/4] Services started successfully!
echo.
echo ==========================================
echo       Service Access URLs
echo ==========================================
echo.
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001
echo   Admin:    http://localhost:3000/admin
echo.
echo ==========================================
echo.
pause
