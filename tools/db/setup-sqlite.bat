@echo off
chcp 65001 >nul
echo ===================================
echo  NovelHub SQLite 配置脚本
echo ===================================
echo.

cd apps\backend

echo [1/3] 安装依赖...
call pnpm install
if errorlevel 1 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)
echo [OK] 依赖安装完成
echo.

echo [2/3] 生成 Prisma 客户端...
call npx prisma generate
if errorlevel 1 (
    echo [错误] Prisma 客户端生成失败
    pause
    exit /b 1
)
echo [OK] Prisma 客户端生成完成
echo.

echo [3/3] 运行数据库迁移...
call npx prisma migrate dev --name init
if errorlevel 1 (
    echo [错误] 数据库迁移失败
    pause
    exit /b 1
)
echo [OK] 数据库迁移完成
echo.

cd ..\..

echo ===================================
echo  SQLite 配置完成！
echo ===================================
echo.
echo 数据库文件: apps\backend\dev.db
echo.
echo 启动开发服务器:
echo   pnpm dev
echo.
pause
