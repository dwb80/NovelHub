@echo off
echo ===================================
echo Starting Frontend Server
echo ===================================
echo.

cd apps\frontend

echo Installing dependencies (if needed)...
call pnpm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Starting Next.js development server...
echo.
npm run dev
