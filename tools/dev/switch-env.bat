@echo off
chcp 65001 >nul
echo ===================================
echo  NovelHub 环境切换工具
echo ===================================
echo.
echo 可用环境:
echo   1. development (开发环境) - SQLite, 端口3001
echo   2. test (测试环境) - SQLite, 端口3002
echo   3. production (生产环境) - PostgreSQL, 端口3001
echo.

set /p ENV_CHOICE="请选择环境 (1/2/3): "

if "%ENV_CHOICE%"=="1" (
    set ENV_NAME=development
    set ENV_FILE=.env.development
) else if "%ENV_CHOICE%"=="2" (
    set ENV_NAME=test
    set ENV_FILE=.env.test
) else if "%ENV_CHOICE%"=="3" (
    set ENV_NAME=production
    set ENV_FILE=.env.production
) else (
    echo 无效选择
    pause
    exit /b 1
)

echo.
echo [1/3] 切换到 %ENV_NAME% 环境...
cd apps\backend
copy /Y %ENV_FILE% .env >nul
echo [OK] 环境文件已切换
echo.

echo [2/3] 生成 Prisma 客户端...
call npx prisma generate
if errorlevel 1 (
    echo [错误] Prisma 客户端生成失败
    pause
    exit /b 1
)
echo [OK] Prisma 客户端已生成
echo.

echo [3/3] 运行数据库迁移...
if "%ENV_NAME%"=="production" (
    call npx prisma migrate deploy
) else (
    call npx prisma migrate dev
)
if errorlevel 1 (
    echo [错误] 数据库迁移失败
    pause
    exit /b 1
)
echo [OK] 数据库迁移完成
echo.

cd ..\..

echo ===================================
echo  已切换到 %ENV_NAME% 环境！
echo ===================================
echo.
echo 启动开发服务器:
echo   pnpm dev
echo.
pause
