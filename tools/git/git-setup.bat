@echo off
cd /d d:\trae\novelhub

echo Initializing git repository...
git init

echo Adding remote origin...
git remote add origin https://github.com/dwb80/NovelHub.git 2>nul

echo Fetching all branches...
git fetch origin

echo Checking out dev-1.0 branch...
git checkout -b dev-1.0 origin/dev-1.0 2>nul || git checkout dev-1.0

echo Pulling latest changes...
git pull origin dev-1.0

echo Done!
pause
