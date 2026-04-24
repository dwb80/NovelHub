@echo off
chcp 65001 >nul
echo ===================================
echo  启动 Prisma Studio (测试环境)
echo ===================================
echo.

cd apps\backend

echo 切换到测试环境...
copy /Y .env.test .env >nul

echo 启动 Prisma Studio...
call npx prisma studio

cd ..\..
