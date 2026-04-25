'use client';

import { useEffect, useState } from 'react';
import { Novel } from '@/types';

export default function AdminNovelsPage() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNovels();
  }, [currentPage]);

  const fetchNovels = async () => {
    try {
      const response = await fetch(`/api/v1/admin/novels?page=${currentPage}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setNovels(data.items || []);
        setTotalPages(Math.ceil((data.total || 0) / 20));
      }
    } catch (err) {
      console.error('获取小说列表失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这部小说吗？此操作不可恢复。')) return;
    try {
      const response = await fetch(`/api/v1/admin/novels/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchNovels();
      }
    } catch (err) {
      console.error('删除失败:', err);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: number) => {
    const newStatus = currentStatus === 0 ? 2 : 0;
    try {
      await fetch(`/api/v1/admin/novels/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchNovels();
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
        <h1 className="text-2xl font-bold">小说管理</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="搜索小说..."
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
              <th className="px-4 py-3 text-left text-sm font-medium">小说</th>
              <th className="px-4 py-3 text-left text-sm font-medium">作者</th>
              <th className="px-4 py-3 text-left text-sm font-medium">分类</th>
              <th className="px-4 py-3 text-left text-sm font-medium">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium">数据</th>
              <th className="px-4 py-3 text-left text-sm font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {novels.map((novel) => (
              <tr key={novel.id} className="hover:bg-muted/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-14 bg-muted rounded overflow-hidden">
                      {novel.cover ? (
                        <img src={novel.cover} alt={novel.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs">无</div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{novel.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(novel.createdAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{novel.authorName}</td>
                <td className="px-4 py-3 text-sm">{novel.category}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded ${
                    novel.status === 0
                      ? 'bg-green-100 text-green-700'
                      : novel.status === 1
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {novel.status === 0 ? '连载' : novel.status === 1 ? '完结' : '暂停'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="text-xs text-muted-foreground">
                    <div>{novel.wordCount.toLocaleString()} 字</div>
                    <div>{novel.viewCount.toLocaleString()} 阅读</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleStatus(novel.id, novel.status)}
                      className="px-2 py-1 text-xs border rounded hover:bg-accent"
                    >
                      {novel.status === 2 ? '恢复' : '暂停'}
                    </button>
                    <button
                      onClick={() => handleDelete(novel.id)}
                      className="px-2 py-1 text-xs border border-destructive text-destructive rounded hover:bg-destructive/10"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page
                  ? 'bg-primary text-primary-foreground'
                  : 'border hover:bg-accent'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
