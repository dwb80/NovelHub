@echo off
chcp 65001 >nul
echo ===================================
echo  配置 PostgreSQL 环境
echo ===================================
echo.

set /p DB_PASSWORD="请输入 PostgreSQL 密码（init-postgres.bat 中设置的）: "
echo.

set ENV_FILE=apps\backend\.env

echo [1/2] 创建 .env 文件...
(
echo # Database
echo DATABASE_URL="postgresql://postgres:%DB_PASSWORD%@localhost:5432/novelhub?schema=public"
echo.
echo # JWT
echo JWT_SECRET="your-jwt-secret-key-change-this-in-production"
echo JWT_REFRESH_SECRET="your-jwt-refresh-secret-change-this-in-production"
echo.
echo # Server
echo PORT=3001
echo NODE_ENV=development
echo.
echo # CORS
echo CORS_ORIGIN="http://localhost:3000"
) > %ENV_FILE%

echo [OK] .env 文件已创建
echo.

echo [2/2] 验证配置...
echo 数据库连接: postgresql://postgres:******@localhost:5432/novelhub
echo.

echo ===================================
echo  配置完成！
echo ===================================
echo.
echo 使用说明：
echo 1. 启动数据库: start-postgres.bat
echo 2. 安装依赖: pnpm install
echo 3. 运行迁移: cd apps/backend ^&^& pnpm prisma migrate dev
echo 4. 启动服务: pnpm dev
echo.
pause
