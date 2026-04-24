@echo off
chcp 65001 >nul
echo ===================================
echo  重置开发环境数据库
echo ===================================
echo.

cd apps\backend

echo [1/2] 切换到开发环境...
copy /Y .env.development .env >nul
echo [OK] 已使用 .env.development
echo.

echo [2/2] 重置数据库...
set /p CONFIRM="这将删除 dev.db 并重新创建，确认吗? (yes/no): "
if /i not "%CONFIRM%"=="yes" (
    echo 已取消
    pause
    exit /b 0
)

if exist "dev.db" (
    del dev.db
    echo [OK] 已删除 dev.db
)

call npx prisma migrate dev --name init
echo [OK] 数据库已重置
echo.

cd ..\..

echo ===================================
echo  开发环境数据库已重置！
echo ===================================
pause
