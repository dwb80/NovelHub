@echo off
chcp 65001 >nul
echo ===================================
echo  NovelHub 开发环境检查
echo ===================================
echo.

echo [1] 检查 Node.js 版本...
node --version 2>nul
if errorlevel 1 (
    echo [X] Node.js 未安装
) else (
    echo [OK] Node.js 已安装
)
echo.

echo [2] 检查 pnpm 版本...
pnpm --version 2>nul
if errorlevel 1 (
    echo [X] pnpm 未安装
) else (
    echo [OK] pnpm 已安装
)
echo.

echo [3] 检查 Git 版本...
git --version 2>nul
if errorlevel 1 (
    echo [X] Git 未安装
) else (
    echo [OK] Git 已安装
)
echo.

echo [4] 检查根目录 node_modules...
if exist "node_modules" (
    echo [OK] 根目录依赖已安装
) else (
    echo [X] 根目录依赖未安装，请运行: pnpm install
)
echo.

echo [5] 检查后端依赖...
if exist "apps\backend\node_modules" (
    echo [OK] 后端依赖已安装
) else (
    echo [X] 后端依赖未安装
)
echo.

echo [6] 检查前端依赖...
if exist "apps\frontend\node_modules" (
    echo [OK] 前端依赖已安装
) else (
    echo [X] 前端依赖未安装
)
echo.

echo [7] 检查后端 .env 文件...
if exist "apps\backend\.env" (
    echo [OK] 后端 .env 文件已创建
) else (
    echo [X] 后端 .env 文件未创建，请复制 .env.example 并配置
)
echo.

echo [8] 检查 Prisma 配置...
if exist "apps\backend\prisma\prisma.config.ts" (
    echo [WARN] 发现 prisma.config.ts（Prisma 7 配置），建议删除
    echo        Prisma 5.x 不需要此文件
)
echo.

echo [9] 检查 Git 仓库状态...
git status --short 2>nul
if errorlevel 1 (
    echo [X] Git 仓库未初始化
) else (
    echo [OK] Git 仓库已初始化
    echo.
    echo 当前分支:
    git branch --show-current
    echo.
    echo 远程仓库:
    git remote -v 2>nul
)
echo.

echo ===================================
echo  检查完成
echo ===================================
echo.
echo 下一步操作:
echo 1. 如果依赖未安装，运行: pnpm install
echo 2. 如果 .env 未创建，运行: copy apps\backend\.env.example apps\backend\.env
echo 3. 配置数据库后，运行: pnpm prisma migrate dev
echo.
pause
