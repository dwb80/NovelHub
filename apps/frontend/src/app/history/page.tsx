'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookshelfService } from '@/lib/api/services';
import { BookshelfItem } from '@/types';

export default function ReadingHistoryPage() {
  const [history, setHistory] = useState<BookshelfItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await BookshelfService.getReadingHistory();
      setHistory(data);
    } catch (err) {
      console.error('获取阅读历史失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('确定要清空阅读历史吗？')) return;
    try {
      await fetch('/api/readers/history/clear', { method: 'DELETE' });
      setHistory([]);
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
    <div className="min-h-screen bg-background">
      {/* 导航栏 */}
      <nav className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            NovelHub
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/novels" className="text-muted-foreground hover:text-foreground">
              小说
            </Link>
            <Link href="/bookshelf" className="text-muted-foreground hover:text-foreground">
              书架
            </Link>
            <Link href="/history" className="text-foreground font-medium">
              阅读历史
            </Link>
          </div>
        </div>
      </nav>

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
                href={`/novels/${item.bookId}/chapters/${item.lastChapterId || ''}`}
                className="flex gap-4 p-4 bg-card rounded-lg border hover:shadow-md transition-shadow"
              >
                <div className="w-20 h-28 bg-muted rounded overflow-hidden flex-shrink-0">
                  {item.book.cover ? (
                    <img
                      src={item.book.cover}
                      alt={item.book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                      暂无封面
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{item.book.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{item.book.authorName}</p>
                  <p className="text-sm mb-2">
                    读到：{item.lastChapterTitle || '未开始'}
                  </p>
                  <div className="w-full bg-muted rounded-full h-2 mb-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    进度: {item.progress.toFixed(1)}% · 更新于 {new Date(item.updatedAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
