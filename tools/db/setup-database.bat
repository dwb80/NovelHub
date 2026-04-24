@echo off
chcp 65001 >nul
echo ===================================
echo  NovelHub 数据库配置脚本
echo ===================================
echo.

REM 检查 psql 是否可用
where psql >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 psql 命令
    echo 请确保 PostgreSQL 已安装并添加到系统 PATH
    echo.
    echo 手动添加 PATH 的方法：
    echo 1. 找到 PostgreSQL 安装目录，如：C:\Program Files\PostgreSQL\15\bin
    echo 2. 添加到系统环境变量 PATH 中
    echo.
    pause
    exit /b 1
)

echo [OK] 找到 psql 命令
echo.

REM 获取数据库密码
set /p DB_PASSWORD="请输入 PostgreSQL 密码（安装时设置的）: "
echo.

REM 测试连接
echo [1/4] 测试数据库连接...
psql -h localhost -U postgres -c "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo [错误] 连接失败，请检查：
    echo - PostgreSQL 服务是否启动（在 服务 中查看）
    echo - 密码是否正确
    echo - 端口 5432 是否被占用
    pause
    exit /b 1
)
echo [OK] 连接成功
echo.

REM 创建数据库
echo [2/4] 创建 novelhub 数据库...
psql -h localhost -U postgres -c "CREATE DATABASE novelhub;" 2>nul
if errorlevel 1 (
    echo [提示] 数据库可能已存在，继续...
) else (
    echo [OK] 数据库创建成功
)
echo.

REM 更新 .env 文件
echo [3/4] 更新 .env 文件...
set ENV_FILE=apps\backend\.env

REM 备份原文件
if exist "%ENV_FILE%" (
    copy "%ENV_FILE%" "%ENV_FILE%.backup" >nul
)

REM 写入新的数据库连接字符串
echo # Database>%ENV_FILE%
echo DATABASE_URL="postgresql://postgres:%DB_PASSWORD%@localhost:5432/novelhub?schema=public">>%ENV_FILE%
echo.>>%ENV_FILE%
echo # JWT>>%ENV_FILE%
echo JWT_SECRET="your-jwt-secret-key-change-this-in-production">>%ENV_FILE%
echo JWT_REFRESH_SECRET="your-jwt-refresh-secret-change-this-in-production">>%ENV_FILE%
echo.>>%ENV_FILE%
echo # Server>>%ENV_FILE%
echo PORT=3001>>%ENV_FILE%
echo NODE_ENV=development>>%ENV_FILE%
echo.>>%ENV_FILE%
echo # CORS>>%ENV_FILE%
echo CORS_ORIGIN="http://localhost:3000">>%ENV_FILE%

echo [OK] .env 文件已更新
echo.

REM 验证配置
echo [4/4] 验证配置...
echo 数据库连接字符串：
echo postgresql://postgres:******@localhost:5432/novelhub?schema=public
echo.

echo ===================================
echo  数据库配置完成！
echo ===================================
echo.
echo 下一步：
echo 1. 安装依赖：pnpm install
echo 2. 运行迁移：cd apps/backend ^&^& pnpm prisma migrate dev
echo 3. 启动服务：pnpm dev
echo.
pause
