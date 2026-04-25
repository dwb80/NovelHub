'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { ReadingHistoryItem } from '@/types';

export default function ReadingHistoryPage() {
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/v1/bookshelf/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data || []);
      }
    } catch (err) {
      console.error('获取阅读历史失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('确定要清空阅读历史吗？')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/v1/readers/me/reading-history', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setHistory([]);
      }
    } catch (err) {
      console.error('清空历史失败:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <MainLayout>
      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">阅读历史</h1>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="px-4 py-2 border border-destructive text-destructive rounded-md text-sm hover:bg-destructive/10"
            >
              清空历史
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg mb-4">暂无阅读历史</p>
            <Link href="/novels" className="text-primary hover:underline">
              去发现好书
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <Link
                key={item.id}
                href={`/novels/${item.novelId}/chapters/${item.chapterId}`}
                className="flex gap-4 p-4 bg-card rounded-lg border hover:shadow-md transition-shadow"
              >
                <div className="w-20 h-28 bg-muted rounded overflow-hidden flex-shrink-0 flex items-center justify-center text-xs text-muted-foreground">
                  封面
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{item.novelTitle}</h3>
                  <p className="text-sm mb-2">
                    读到：{item.chapterTitle || '未开始'}
                  </p>
                  <div className="w-full bg-muted rounded-full h-2 mb-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    进度: {item.progress.toFixed(1)}% · 阅读于 {new Date(item.readAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </MainLayout>
  );
}
