@echo off
chcp 65001 >nul
echo ===================================
echo  启动 Prisma Studio (开发环境)
echo ===================================
echo.

cd apps\backend

echo 切换到开发环境...
copy /Y .env.development .env >nul

echo 启动 Prisma Studio...
call npx prisma studio

cd ..\..
