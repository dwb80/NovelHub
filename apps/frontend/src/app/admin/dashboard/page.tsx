'use client';

import { useEffect, useState } from 'react';

interface DashboardStats {
  totalNovels: number;
  totalUsers: number;
  totalChapters: number;
  totalComments: number;
  todayNewNovels: number;
  todayNewUsers: number;
  todayViews: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/statistics');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('获取统计数据失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-16">加载中...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">管理后台概览</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg border p-6">
          <div className="text-sm text-muted-foreground mb-1">总小说数</div>
          <div className="text-3xl font-bold">{stats?.totalNovels || 0}</div>
          <div className="text-xs text-green-600 mt-2">
            +{stats?.todayNewNovels || 0} 今日新增
          </div>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <div className="text-sm text-muted-foreground mb-1">总用户数</div>
          <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
          <div className="text-xs text-green-600 mt-2">
            +{stats?.todayNewUsers || 0} 今日新增
          </div>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <div className="text-sm text-muted-foreground mb-1">总章节数</div>
          <div className="text-3xl font-bold">{stats?.totalChapters || 0}</div>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <div className="text-sm text-muted-foreground mb-1">总评论数</div>
          <div className="text-3xl font-bold">{stats?.totalComments || 0}</div>
        </div>
      </div>

      {/* 今日数据 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border p-6">
          <h2 className="font-semibold mb-4">今日访问</h2>
          <div className="text-4xl font-bold text-primary">
            {stats?.todayViews?.toLocaleString() || 0}
          </div>
          <p className="text-sm text-muted-foreground mt-2">页面浏览次数</p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h2 className="font-semibold mb-4">系统状态</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">API 服务</span>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">正常</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">数据库</span>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">正常</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">缓存服务</span>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">正常</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
