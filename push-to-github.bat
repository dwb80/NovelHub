@echo off
chcp 65001 >nul
echo ===================================
echo  NovelHub Git 推送脚本
echo ===================================
echo.

REM 检查git是否安装
git --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到Git，请先安装Git
    pause
    exit /b 1
)

echo [1/6] 初始化Git仓库...
git init

echo.
echo [2/6] 添加所有文件到暂存区...
git add .

echo.
echo [3/6] 提交更改...
git commit -m "Initial commit: NovelHub project setup with NEF evolution engine"

echo.
echo [4/6] 添加远程仓库...
git remote add origin https://github.com/dwb80/NovelHub.git 2>nul
if errorlevel 1 (
    echo 远程仓库已存在，跳过添加
)

echo.
echo [5/6] 获取远程分支信息...
git fetch origin

echo.
echo [6/6] 推送到 dev-1.0 分支...
git checkout -b dev-1.0
git push -u origin dev-1.0

echo.
echo ===================================
echo  推送完成！
echo ===================================
echo.
echo 分支: dev-1.0
echo 仓库: https://github.com/dwb80/NovelHub
echo.
pause
