import api from '@/lib/api';

export interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export const NotificationService = {
  // 获取通知列表 - 使用 /admin/notifications
  async getNotifications(): Promise<Notification[]> {
    const response = await api.get('/admin/notifications');
    return response.data;
  },

  // 获取未读通知数量 - 使用 /admin/notifications/unread-count
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/admin/notifications/unread-count');
    return response.data.count;
  },

  // 标记通知为已读 - 使用 PATCH 方法
  async markAsRead(notificationId: string): Promise<void> {
    await api.patch(`/admin/notifications/${notificationId}/read`);
  },

  // 标记所有通知为已读 - 使用 PATCH 方法
  async markAllAsRead(): Promise<void> {
    await api.patch('/admin/notifications/read-all');
  },

  // 删除通知 - 使用 /admin/notifications
  async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/admin/notifications/${notificationId}`);
  },
};
