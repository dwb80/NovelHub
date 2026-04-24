'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { NotificationService } from '@/lib/api/services';

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await NotificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('获取通知失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('标记已读失败:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('标记全部已读失败:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await NotificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('删除通知失败:', err);
    }
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
            <Link href="/notifications" className="text-foreground font-medium">
              通知 {unreadCount > 0 && `(${unreadCount})`}
            </Link>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">通知中心</h1>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 border rounded-md text-sm hover:bg-accent"
            >
              全部已读
            </button>
          )}
        </div>

        {/* 筛选标签 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'border hover:bg-accent'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-md text-sm ${
              filter === 'unread'
                ? 'bg-primary text-primary-foreground'
                : 'border hover:bg-accent'
            }`}
          >
            未读 {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">暂无通知</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.isRead ? 'bg-card' : 'bg-primary/5 border-primary/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-primary rounded-full" />
                    )}
                    <h3 className="font-semibold">{notification.title}</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleString('zh-CN')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{notification.content}</p>
                <div className="flex gap-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-xs px-3 py-1 bg-primary text-primary-foreground rounded"
                    >
                      标记已读
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="text-xs px-3 py-1 border rounded hover:bg-accent"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
