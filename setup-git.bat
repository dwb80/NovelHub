@echo off
chcp 65001 >nul
echo ===================================
echo  NovelHub Git 仓库配置脚本
echo ===================================
echo.

REM 检查git是否安装
git --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到Git，请先安装Git
    pause
    exit /b 1
)

echo [1/8] 初始化Git仓库...
git init
echo.

echo [2/8] 配置Git用户信息...
git config user.name "NovelHub Developer"
git config user.email "dev@novelhub.com"
echo.

echo [3/8] 添加所有文件到暂存区...
git add .
echo.

echo [4/8] 提交初始更改...
git commit -m "Initial commit: NovelHub project setup with NEF evolution engine"
echo.

echo [5/8] 添加远程仓库...
git remote add origin https://github.com/dwb80/NovelHub.git
echo 远程仓库已添加
echo.

echo [6/8] 获取远程分支信息...
git fetch origin
echo.

echo [7/8] 创建并切换到 dev-1.0 分支...
git checkout -b dev-1.0
echo.

echo [8/8] 设置上游分支...
git branch --set-upstream-to=origin/dev-1.0 dev-1.0 2>nul
if errorlevel 1 (
    echo 上游分支将在首次推送时设置
)

echo.
echo ===================================
echo  Git仓库配置完成！
echo ===================================
echo.
echo 远程仓库: https://github.com/dwb80/NovelHub.git
echo 本地分支: dev-1.0
echo.
echo 现在可以执行以下命令推送代码：
echo   git push -u origin dev-1.0
echo.
pause
