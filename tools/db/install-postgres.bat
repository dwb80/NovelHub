@echo off
chcp 65001 >nul
echo ===================================
echo  PostgreSQL 安装助手
echo ===================================
echo.

echo 正在检查 PostgreSQL 是否已安装...

REM 检查常见的 PostgreSQL 安装路径
if exist "C:\Program Files\PostgreSQL" (
    echo.
    echo [OK] 发现 PostgreSQL 安装目录！
    dir /b "C:\Program Files\PostgreSQL"
    echo.
    echo 如果已安装，请直接配置数据库连接。
    pause
    exit /b 0
)

if exist "C:\Program Files (x86)\PostgreSQL" (
    echo.
    echo [OK] 发现 PostgreSQL 安装目录！
    dir /b "C:\Program Files (x86)\PostgreSQL"
    echo.
    echo 如果已安装，请直接配置数据库连接。
    pause
    exit /b 0
)

echo.
echo [X] 未检测到 PostgreSQL 安装
echo.
echo ===================================
echo  安装步骤
echo ===================================
echo.
echo 1. 访问下载页面：
echo    https://www.postgresql.org/download/windows/
echo.
echo 2. 点击 "Download the installer" 下载安装程序
echo.
echo 3. 运行安装程序，按以下步骤：
echo    - 安装目录：保持默认（C:\Program Files\PostgreSQL\15）
echo    - 组件选择：勾选 PostgreSQL Server, pgAdmin, Command Line Tools
echo    - 数据目录：保持默认
echo    - 密码：设置一个强密码（记住它！）
echo    - 端口：保持默认 5432
echo    - 区域设置：保持默认
echo.
echo 4. 等待安装完成
echo.
echo 5. 安装完成后，运行配置脚本：setup-database.bat
echo.
pause

REM 打开下载页面
start https://www.postgresql.org/download/windows/
