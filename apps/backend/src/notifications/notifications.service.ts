import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { EmailService } from './email.service';

interface CreateNotificationDto {
  type: NotificationType;
  title: string;
  content: string;
  data?: Record<string, any>;
}

interface CreateAdminNotificationDto extends CreateNotificationDto {
  adminId?: string;
  sendEmail?: boolean;
}

interface CreateUserNotificationDto extends CreateNotificationDto {
  clawId?: string;
  readerId?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * 创建管理员通知
   */
  async createAdminNotification(dto: CreateAdminNotificationDto): Promise<void> {
    try {
      // 如果没有指定adminId，则发送给所有管理员
      if (!dto.adminId) {
        const admins = await this.prisma.admin.findMany({
          where: { isDeleted: false, isBanned: false },
          select: { id: true, email: true },
        });

        await Promise.all(
          admins.map(admin =>
            this.prisma.adminNotification.create({
              data: {
                adminId: admin.id,
                type: dto.type,
                title: dto.title,
                content: dto.content,
                data: dto.data || {},
              },
            })
          )
        );

        this.logger.log(`管理员通知已创建: ${dto.title}, 接收人数: ${admins.length}`);
      } else {
        await this.prisma.adminNotification.create({
          data: {
            adminId: dto.adminId,
            type: dto.type,
            title: dto.title,
            content: dto.content,
            data: dto.data || {},
          },
        });

        this.logger.log(`管理员通知已创建: ${dto.title}, 接收人: ${dto.adminId}`);
      }

      // 如果需要发送邮件，这里可以调用邮件服务
      if (dto.sendEmail) {
        await this.sendEmailNotification(dto);
      }
    } catch (error) {
      this.logger.error(`创建管理员通知失败: ${error.message}`, error.stack);
    }
  }

  /**
   * 创建用户通知
   */
  async createUserNotification(dto: CreateUserNotificationDto): Promise<void> {
    try {
      if (!dto.clawId && !dto.readerId) {
        this.logger.warn('创建用户通知失败: 必须指定clawId或readerId');
        return;
      }

      await this.prisma.notification.create({
        data: {
          clawId: dto.clawId || '',
          readerId: dto.readerId,
          type: dto.type,
          title: dto.title,
          content: dto.content,
          data: dto.data || {},
        },
      });

      this.logger.log(`用户通知已创建: ${dto.title}`);
    } catch (error) {
      this.logger.error(`创建用户通知失败: ${error.message}`, error.stack);
    }
  }

  /**
   * 获取管理员通知列表
   */
  async getAdminNotifications(adminId: string, options?: { page?: number; limit?: number; unreadOnly?: boolean }) {
    const { page = 1, limit = 20, unreadOnly = false } = options || {};
    const skip = (page - 1) * limit;

    const where: any = {
      adminId,
      isDeleted: false,
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.adminNotification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.adminNotification.count({ where }),
      this.prisma.adminNotification.count({
        where: { adminId, isRead: false, isDeleted: false },
      }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    };
  }

  /**
   * 标记通知为已读
   */
  async markAdminNotificationAsRead(notificationId: string, adminId: string): Promise<void> {
    await this.prisma.adminNotification.updateMany({
      where: {
        id: notificationId,
        adminId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * 标记所有通知为已读
   */
  async markAllAdminNotificationsAsRead(adminId: string): Promise<void> {
    await this.prisma.adminNotification.updateMany({
      where: {
        adminId,
        isRead: false,
        isDeleted: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * 删除通知
   */
  async deleteAdminNotification(notificationId: string, adminId: string): Promise<void> {
    await this.prisma.adminNotification.updateMany({
      where: {
        id: notificationId,
        adminId,
      },
      data: {
        isDeleted: true,
      },
    });
  }

  /**
   * 获取未读通知数量
   */
  async getAdminUnreadCount(adminId: string): Promise<number> {
    return this.prisma.adminNotification.count({
      where: {
        adminId,
        isRead: false,
        isDeleted: false,
      },
    });
  }

  /**
   * 发送邮件通知
   */
  private async sendEmailNotification(dto: CreateAdminNotificationDto): Promise<void> {
    if (!dto.adminId) {
      // 发送给所有管理员的邮件通知
      const admins = await this.prisma.admin.findMany({
        where: { isDeleted: false, isBanned: false },
        select: { email: true, name: true },
      });

      await Promise.all(
        admins.map(admin =>
          this.emailService.sendAdminNotificationEmail(admin.email, {
            adminName: admin.name,
            notificationTitle: dto.title,
            notificationContent: dto.content,
            notificationType: dto.type,
          })
        )
      );
    } else {
      // 发送给指定管理员
      const admin = await this.prisma.admin.findUnique({
        where: { id: dto.adminId },
        select: { email: true, name: true },
      });

      if (admin) {
        await this.emailService.sendAdminNotificationEmail(admin.email, {
          adminName: admin.name,
          notificationTitle: dto.title,
          notificationContent: dto.content,
          notificationType: dto.type,
        });
      }
    }
  }

  // ==================== 业务通知触发方法 ====================

  /**
   * 新用户注册通知
   */
  async notifyNewUserRegistered(userInfo: { userId: string; username: string; email: string }): Promise<void> {
    await this.createAdminNotification({
      type: NotificationType.NEW_USER_REGISTERED,
      title: '新用户注册',
      content: `用户 "${userInfo.username}" (${userInfo.email}) 刚刚注册了账号`,
      data: {
        userId: userInfo.userId,
        username: userInfo.username,
        email: userInfo.email,
      },
    });
  }

  /**
   * 新小说提交通知
   */
  async notifyNewNovelSubmitted(novelInfo: { novelId: string; title: string; authorName: string }): Promise<void> {
    await this.createAdminNotification({
      type: NotificationType.NEW_NOVEL_SUBMITTED,
      title: '新小说待审核',
      content: `小说 "${novelInfo.title}" 由 ${novelInfo.authorName} 提交，等待审核`,
      data: {
        novelId: novelInfo.novelId,
        title: novelInfo.title,
        authorName: novelInfo.authorName,
      },
    });
  }

  /**
   * 新举报提交通知
   */
  async notifyNewReportSubmitted(reportInfo: { reportId: string; type: string; reason: string }): Promise<void> {
    await this.createAdminNotification({
      type: NotificationType.NEW_REPORT_SUBMITTED,
      title: '新举报待处理',
      content: `收到新的${reportInfo.type}举报: ${reportInfo.reason.substring(0, 50)}...`,
      data: {
        reportId: reportInfo.reportId,
        type: reportInfo.type,
        reason: reportInfo.reason,
      },
    });
  }

  /**
   * 评审任务待处理通知
   */
  async notifyReviewTaskPending(taskInfo: { taskId: string; novelTitle: string; pendingCount: number }): Promise<void> {
    await this.createAdminNotification({
      type: NotificationType.REVIEW_TASK_PENDING,
      title: '评审任务待分配',
      content: `小说 "${taskInfo.novelTitle}" 的评审任务待分配，当前有 ${taskInfo.pendingCount} 个待处理任务`,
      data: {
        taskId: taskInfo.taskId,
        novelTitle: taskInfo.novelTitle,
        pendingCount: taskInfo.pendingCount,
      },
    });
  }

  /**
   * 发送每日摘要
   */
  async sendDailyDigest(adminId: string, stats: {
    newUsers: number;
    newNovels: number;
    newReports: number;
    completedReviews: number;
  }): Promise<void> {
    await this.createAdminNotification({
      adminId,
      type: NotificationType.DAILY_DIGEST,
      title: `每日数据摘要 - ${new Date().toLocaleDateString('zh-CN')}`,
      content: `昨日新增用户: ${stats.newUsers} | 新提交小说: ${stats.newNovels} | 新举报: ${stats.newReports} | 完成评审: ${stats.completedReviews}`,
      data: stats,
    });
  }
}
