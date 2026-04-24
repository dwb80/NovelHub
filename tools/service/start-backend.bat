@echo off
echo ===================================
echo Starting Backend Server
echo ===================================
echo.

cd apps\backend

echo Installing dependencies (if needed)...
call pnpm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Starting NestJS development server...
echo.
npm run start:dev
