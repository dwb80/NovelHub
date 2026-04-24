@echo off
chcp 65001 >nul
echo ==========================================
echo NovelHub 服务停止脚本
echo ==========================================
echo.

:: 停止前端服务 (Next.js 默认端口 3000)
echo [1/4] 正在停止前端服务 (端口 3000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo       找到进程 PID: %%a
    taskkill /F /PID %%a 2>nul
    if %errorlevel% equ 0 (
        echo       前端服务已停止
    ) else (
        echo       前端服务未运行或无法停止
    )
)

:: 停止后端服务 (NestJS 默认端口 3001)
echo [2/4] 正在停止后端服务 (端口 3001)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo       找到进程 PID: %%a
    taskkill /F /PID %%a 2>nul
    if %errorlevel% equ 0 (
        echo       后端服务已停止
    ) else (
        echo       后端服务未运行或无法停止
    )
)

:: 停止其他可能的开发服务器端口 (3002, 3003等)
echo [3/4] 正在检查其他开发服务器端口...
for %%p in (3002 3003 3004 3005) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p ^| findstr LISTENING') do (
        echo       发现端口 %%p 的进程 PID: %%a
        taskkill /F /PID %%a 2>nul
        echo       端口 %%p 的服务已停止
    )
)

:: 停止 Node.js 进程（以防有残留）
echo [4/4] 正在清理残留的 Node.js 进程...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo       Node.js 进程已清理
) else (
    echo       没有残留的 Node.js 进程
)

echo.
echo ==========================================
echo 所有服务已停止
echo ==========================================
echo.
echo 按任意键退出...
pause >nul
