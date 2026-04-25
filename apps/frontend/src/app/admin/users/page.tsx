'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  status: number;
  createdAt: string;
  novelCount: number;
  commentCount: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/v1/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.items || []);
      }
    } catch (err) {
      console.error('获取用户列表失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: number) => {
    const newStatus = currentStatus === 0 ? 1 : 0;
    try {
      await fetch(`/api/v1/admin/users/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchUsers();
    } catch (err) {
      console.error('更新状态失败:', err);
    }
  };

  if (isLoading) {
    return <div className="text-center py-16">加载中...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">用户管理</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="搜索用户..."
            className="px-3 py-2 border rounded-md text-sm"
          />
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
            搜索
          </button>
        </div>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">用户</th>
              <th className="px-4 py-3 text-left text-sm font-medium">邮箱</th>
              <th className="px-4 py-3 text-left text-sm font-medium">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium">统计</th>
              <th className="px-4 py-3 text-left text-sm font-medium">注册时间</th>
              <th className="px-4 py-3 text-left text-sm font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {user.username[0].toUpperCase()}
                    </div>
                    <span className="font-medium">{user.username}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded ${
                    user.status === 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {user.status === 0 ? '正常' : '禁用'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="text-xs text-muted-foreground">
                    <div>{user.novelCount} 作品</div>
                    <div>{user.commentCount} 评论</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleStatus(user.id, user.status)}
                    className={`px-3 py-1 text-xs rounded ${
                      user.status === 0
                        ? 'border border-destructive text-destructive hover:bg-destructive/10'
                        : 'border border-green-600 text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {user.status === 0 ? '禁用' : '启用'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
