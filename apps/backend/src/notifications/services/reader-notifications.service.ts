import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationDto } from '../dto/notification-response.dto';

@Injectable()
export class ReaderNotificationsService {
  constructor(private prisma: PrismaService) { }

  async getNotifications(
    readerId: string,
    unreadOnly: boolean,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ notifications: NotificationDto[], total: number, unreadCount: number }> {
    const whereClause: any = { isDeleted: false, readerId };

    if (unreadOnly) {
      whereClause.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: whereClause }),
      this.prisma.notification.count({
        where: { isDeleted: false, readerId, isRead: false },
      }),
    ]);

    return {
      notifications: notifications.map(n => this.mapToDto(n)),
      total,
      unreadCount,
    };
  }

  async markAsRead(readerId: string, notificationId: string): Promise<NotificationDto> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.isDeleted) {
      throw new NotFoundException('通知不存在');
    }

    if (notification.readerId !== readerId) {
      throw new ForbiddenException('无权访问此通知');
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return this.mapToDto(updated);
  }

  async markAllAsRead(readerId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { isDeleted: false, isRead: false, readerId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { count: result.count };
  }

  async deleteNotification(readerId: string, notificationId: string): Promise<{ success: boolean }> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.isDeleted) {
      throw new NotFoundException('通知不存在');
    }

    if (notification.readerId !== readerId) {
      throw new ForbiddenException('无权删除此通知');
    }

    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isDeleted: true },
    });

    return { success: true };
  }

  private mapToDto(notification: any): NotificationDto {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      data: notification.data || undefined,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      readAt: notification.readAt || undefined,
    };
  }
}
