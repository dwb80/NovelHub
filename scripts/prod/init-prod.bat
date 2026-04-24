@echo off
chcp 65001 >nul
echo ===================================
echo  初始化生产环境 (Production)
echo ===================================
echo.
echo [注意] 生产环境使用 PostgreSQL
echo.

cd apps\backend

echo [1/5] 切换到生产环境配置...
copy /Y .env.production .env >nul
echo [OK] 已使用 .env.production (PostgreSQL)
echo.

echo [2/5] 检查 PostgreSQL 配置...
findstr "DATABASE_URL" .env | findstr "postgresql" >nul
if errorlevel 1 (
    echo [错误] 未配置 PostgreSQL 连接字符串
    echo 请编辑 .env.production 文件，设置正确的 DATABASE_URL
    pause
    exit /b 1
)
echo [OK] PostgreSQL 配置已设置
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

echo [5/5] 部署数据库迁移...
echo [注意] 这将应用所有待处理的迁移到生产数据库
echo.
set /p CONFIRM="确认要继续吗? (yes/no): "
if /i not "%CONFIRM%"=="yes" (
    echo 已取消
    pause
    exit /b 0
)

call npx prisma migrate deploy
if errorlevel 1 (
    echo [错误] 数据库迁移失败
    echo 请检查 PostgreSQL 连接和权限
    pause
    exit /b 1
)
echo [OK] 数据库迁移完成
echo.

cd ..\..

echo ===================================
echo  生产环境初始化完成！
echo ===================================
echo.
echo 数据库: novelhub_prod (PostgreSQL)
echo.
echo 构建命令: pnpm build
echo 启动命令: pnpm start:prod
echo.
pause
