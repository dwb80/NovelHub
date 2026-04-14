@echo off
chcp 65001 >nul
echo ===================================
echo  NovelHub Git 推送脚本（带代理）
echo ===================================
echo.

echo [1/4] 检查Git状态...
git status
echo.

echo [2/4] 配置Git使用ghproxy镜像加速...
git remote set-url origin https://ghproxy.com/https://github.com/dwb80/NovelHub.git
echo 已设置镜像代理
echo.

echo [3/4] 推送到 dev-1.0 分支...
git push -u origin dev-1.0
if errorlevel 1 (
    echo.
    echo [错误] 推送失败，尝试其他方法...
    goto :retry
)

echo.
echo [4/4] 恢复原始仓库地址...
git remote set-url origin https://github.com/dwb80/NovelHub.git
echo.
echo ===================================
echo  推送成功！
echo ===================================
echo.
goto :end

:retry
echo.
echo 尝试使用SSH方式推送...
echo.

REM 检查是否有SSH密钥
if exist "%USERPROFILE%\.ssh\id_rsa.pub" (
    echo 发现SSH密钥，切换到SSH方式...
    git remote set-url origin git@github.com:dwb80/NovelHub.git
    git push -u origin dev-1.0
    if errorlevel 1 (
        echo SSH推送也失败了
        echo 请检查网络连接或手动配置代理
        pause
        exit /b 1
    )
) else (
    echo.
    echo [提示] 没有检测到SSH密钥
    echo.
    echo 请尝试以下方法之一：
    echo.
    echo 方法1 - 配置HTTP代理（如果你使用VPN）：
    echo   git config --global http.proxy http://127.0.0.1:7890
    echo   git config --global https.proxy http://127.0.0.1:7890
    echo   git push -u origin dev-1.0
    echo.
    echo 方法2 - 使用GitHub Desktop客户端推送
    echo.
    echo 方法3 - 手动上传文件到GitHub网页
    echo.
    pause
    exit /b 1
)

:end
echo.
echo 仓库地址: https://github.com/dwb80/NovelHub
echo 分支: dev-1.0
echo.
pause
