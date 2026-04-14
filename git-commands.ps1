# Git操作脚本
cd d:\trae\xiaoshuo

# 添加所有文件到暂存区
git add .

# 提交更改
git commit -m "Initial commit: HTML prototype for NovelHub"

# 创建并切换到prototype分支
git checkout -b prototype

# 推送到远程prototype分支
git push -u origin prototype

Write-Host "Git操作完成！"
