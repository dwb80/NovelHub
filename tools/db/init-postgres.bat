@echo off
chcp 65001 >nul
echo ===================================
echo  初始化 PostgreSQL 数据库
echo ===================================
echo.

set PGDIR=%~dp0pgsql
set PGDATA=%PGDIR%\data
set PATH=%PGDIR%\bin;%PATH%

REM 检查是否已初始化
if exist "%PGDATA%" (
    echo [提示] 数据库已初始化，跳过初始化步骤
echo.
    goto :create_db
)

echo [1/4] 初始化数据库集群...
initdb -D "%PGDATA%" -U postgres -E UTF8 --locale=Chinese_China.936
if errorlevel 1 (
    echo [错误] 初始化失败
    pause
    exit /b 1
)
echo [OK] 初始化完成
echo.

echo [2/4] 启动 PostgreSQL 服务...
pg_ctl start -D "%PGDATA%" -l "%PGDIR%\log.txt"
if errorlevel 1 (
    echo [错误] 启动失败
    pause
    exit /b 1
)
echo [OK] 服务已启动
echo.

echo [3/4] 设置 postgres 用户密码...
echo.
echo 请设置 postgres 用户的密码（记住这个密码！）
psql -U postgres -c "\password postgres"
if errorlevel 1 (
    echo [错误] 设置密码失败
    pause
    exit /b 1
)
echo [OK] 密码设置完成
echo.

:create_db
echo [4/4] 创建 novelhub 数据库...
psql -U postgres -c "CREATE DATABASE novelhub;" 2>nul
if errorlevel 1 (
    echo [提示] 数据库已存在，跳过
echo ) else (
    echo [OK] 数据库创建完成
)
echo.

echo ===================================
echo  初始化完成！
echo ===================================
echo.
echo 下一步：
echo 1. 记住你设置的密码
echo 2. 运行 setup-pgsql-env.bat 配置环境变量
echo 3. 以后使用 start-postgres.bat 启动数据库
echo.
pause
