#!/usr/bin/env python3
import subprocess
import os
import sys

def run_git_command(command, cwd=r'd:\trae\xiaoshuo'):
    """运行git命令"""
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            capture_output=True,
            text=True,
            shell=True
        )
        print(f"命令: {' '.join(command)}")
        print(f"返回码: {result.returncode}")
        if result.stdout:
            print(f"输出:\n{result.stdout}")
        if result.stderr:
            print(f"错误:\n{result.stderr}")
        return result.returncode == 0
    except Exception as e:
        print(f"执行出错: {e}")
        return False

def main():
    os.chdir(r'd:\trae\xiaoshuo')

    # 1. 添加所有文件
    print("=" * 50)
    print("步骤1: 添加所有文件到暂存区")
    print("=" * 50)
    if not run_git_command(['git', 'add', '.']):
        print("添加文件失败")
        return

    # 2. 提交更改
    print("\n" + "=" * 50)
    print("步骤2: 提交更改")
    print("=" * 50)
    if not run_git_command(['git', 'commit', '-m', 'Initial commit: HTML prototype for NovelHub']):
        print("提交失败")
        return

    # 3. 创建并切换到prototype分支
    print("\n" + "=" * 50)
    print("步骤3: 创建并切换到prototype分支")
    print("=" * 50)
    if not run_git_command(['git', 'checkout', '-b', 'prototype']):
        print("创建分支失败")
        return

    # 4. 推送到远程
    print("\n" + "=" * 50)
    print("步骤4: 推送到远程prototype分支")
    print("=" * 50)
    if not run_git_command(['git', 'push', '-u', 'origin', 'prototype']):
        print("推送失败")
        return

    print("\n" + "=" * 50)
    print("所有操作完成！")
    print("=" * 50)

if __name__ == '__main__':
    main()
