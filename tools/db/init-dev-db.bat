@echo off
chcp 65001 >nul
echo ===================================
echo  初始化开发环境数据库
echo ===================================
echo.

cd apps\backend

echo [1/5] 切换到开发环境配置...
copy /Y .env.development .env >nul
echo [OK] 已使用 .env.development
echo.

echo [2/5] 安装依赖（如果尚未安装）...
call pnpm install
if errorlevel 1 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)
echo [OK] 依赖安装完成
echo.

echo [3/5] 生成 Prisma 客户端...
call npx prisma generate
if errorlevel 1 (
    echo [错误] Prisma 客户端生成失败
    pause
    exit /b 1
)
echo [OK] Prisma 客户端生成完成
echo.

echo [4/5] 创建开发数据库并运行迁移...
call npx prisma migrate dev --name init
if errorlevel 1 (
    echo [错误] 数据库迁移失败
    pause
    exit /b 1
)
echo [OK] 数据库迁移完成
echo.

echo [5/5] 验证数据库...
if exist "dev.db" (
    echo [OK] 数据库文件已创建: dev.db
    dir dev.db
) else (
    echo [警告] 未找到 dev.db 文件
)
echo.

cd ..\..

echo ===================================
echo  开发环境数据库初始化完成！
echo ===================================
echo.
echo 数据库文件: apps\backend\dev.db
echo.
echo 下一步：启动开发服务器
echo   pnpm dev
echo.
pause
