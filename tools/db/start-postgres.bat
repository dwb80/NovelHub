@echo off
chcp 65001 >nul
echo ===================================
echo  启动 PostgreSQL 服务
echo ===================================
echo.

set PGDIR=%~dp0pgsql
set PGDATA=%PGDIR%\data
set PATH=%PGDIR%\bin;%PATH%

REM 检查数据目录是否存在
if not exist "%PGDATA%" (
    echo [提示] 数据目录不存在，需要初始化数据库...
    echo.
    echo 请运行 init-postgres.bat 初始化数据库
    pause
    exit /b 1
)

echo [1/2] 检查 PostgreSQL 服务状态...
pg_ctl status -D "%PGDATA%" >nul 2>&1
if errorlevel 1 (
    echo [2/2] 启动 PostgreSQL 服务...
    pg_ctl start -D "%PGDATA%" -l "%PGDIR%\log.txt"
    if errorlevel 1 (
        echo [错误] 启动失败，请检查 log.txt
        pause
        exit /b 1
    )
    echo [OK] PostgreSQL 已启动
) else (
    echo [OK] PostgreSQL 已在运行
)

echo.
echo 连接信息：
echo   主机: localhost
echo   端口: 5432
echo   数据库: postgres
echo   用户: postgres
echo.
echo 常用命令：
echo   连接数据库: pgsql\bin\psql -U postgres
echo   停止服务: pgsql\bin\pg_ctl stop -D pgsql\data
echo.
pause
