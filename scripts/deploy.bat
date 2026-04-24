@echo off
REM NovelHub 一键部署脚本 (Windows)
REM NEF 进化引擎 - 生产部署

echo ==========================================
echo   NovelHub 一键部署脚本 v1.0
echo   NEF 进化引擎 - 生产部署
echo ==========================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js 未安装，请先安装 Node.js 18+
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [INFO] Node.js 版本: %NODE_VERSION%

REM 检查 pnpm
where pnpm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [WARN] pnpm 未安装，正在安装...
    npm install -g pnpm
)

echo [INFO] pnpm 版本:
pnpm -v

REM 安装依赖
echo.
echo [INFO] 安装项目依赖...
pnpm install --frozen-lockfile

REM 配置环境变量
echo.
echo [INFO] 配置环境变量...
if not exist ".env.production" (
    echo [WARN] .env.production 文件不存在，正在创建...
    (
        echo DATABASE_URL="postgresql://novelhub:novelhub123@localhost:5432/novelhub?schema=public"
        echo JWT_SECRET="your-secret-key-change-in-production"
        echo JWT_EXPIRES_IN="7d"
        echo REDIS_HOST="localhost"
        echo REDIS_PORT="6379"
        echo NODE_ENV="production"
        echo PORT=3001
        echo FRONTEND_URL="http://localhost:3000"
    ) > .env.production
    echo [INFO] .env.production 已创建，请根据实际情况修改配置
)

REM 数据库迁移
echo.
echo [INFO] 运行数据库迁移...
cd apps\backend
call pnpm run db:generate:prod
call pnpm run db:migrate:prod
cd ..\..

REM 构建应用
echo.
echo [INFO] 构建应用...
echo [INFO] 构建后端...
cd apps\backend
call pnpm run build
cd ..\..

echo [INFO] 构建前端...
cd apps\frontend
call pnpm run build
cd ..\..

REM 运行测试
echo.
echo [INFO] 运行测试...
cd apps\backend
call pnpm test -- --passWithNoTests
cd ..\..

echo.
echo ==========================================
echo [INFO] 部署完成！
echo ==========================================
echo.
echo 访问地址:
echo   前端: http://localhost:3000
echo   后端: http://localhost:3001
echo   API文档: http://localhost:3001/api
echo.
echo NEF 进化引擎状态: 已就绪
echo.
echo 启动命令:
echo   后端: cd apps\backend ^&^& pnpm start:prod
echo   前端: cd apps\frontend ^&^& pnpm start
echo.

pause
