@echo off
chcp 65001 >nul
echo ===================================
echo  Git 仓库配置检查
echo ===================================
echo.

echo [1] 检查Git版本...
git --version
echo.

echo [2] 检查仓库状态...
git status
echo.

echo [3] 检查远程仓库配置...
git remote -v
echo.

echo [4] 检查当前分支...
git branch -a
echo.

echo [5] 检查提交历史...
git log --oneline -5 2>nul
if errorlevel 1 (
    echo 还没有提交记录
)
echo.

echo [6] 检查Git配置...
echo 用户名: 
git config user.name
echo 邮箱: 
git config user.email
echo.

echo ===================================
echo  检查完成
echo ===================================
pause
