@echo off
chcp 65001 >nul
echo ===================================
echo  初始化开发环境 (Development)
echo ===================================
echo.

cd apps\backend

echo [1/5] 切换到开发环境配置...
copy /Y .env.development .env >nul
echo [OK] 已使用 .env.development (PostgreSQL)
echo.

echo [2/5] 检查 PostgreSQL 服务...
pg_isready -h localhost -p 5432 >nul 2>&1
if errorlevel 1 (
    echo [错误] PostgreSQL 服务未启动
    echo 请先启动 PostgreSQL: .\pgsql\bin\pg_ctl start -D .\pgsql\data
    pause
    exit /b 1
)
echo [OK] PostgreSQL 服务运行中
echo.

echo [3/5] 安装依赖...
call pnpm install
if errorlevel 1 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)
echo [OK] 依赖安装完成
echo.

echo [4/5] 生成 Prisma 客户端...
call npx prisma generate
if errorlevel 1 (
    echo [错误] Prisma 客户端生成失败
    pause
    exit /b 1
)
echo [OK] Prisma 客户端生成完成
echo.

echo [5/5] 创建开发数据库并运行迁移...
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
echo  开发环境初始化完成！
echo ===================================
echo.
echo 数据库: novelhub_dev (PostgreSQL)
echo.
echo 启动命令: pnpm dev
echo.
pause
