import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { QUEUE_NAMES, JOB_NAMES } from '../../config/queue.config';
import { EmailService } from '../../notifications/email.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

export interface NotificationJobData {
  type: 'email' | 'in-app';
  recipient: string;
  subject?: string;
  content: string;
  data?: Record<string, any>;
}

@Injectable()
@Processor(QUEUE_NAMES.NOTIFICATIONS)
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
  ) { }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing notification job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.debug(`Notification job ${job.id} completed successfully`);
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    this.logger.error(`Notification job ${job.id} failed: ${err.message}`, err.stack);
  }

  @Process(JOB_NAMES.NOTIFICATIONS.SEND_EMAIL)
  async handleSendEmail(job: Job<NotificationJobData>) {
    const { recipient, subject, content, data } = job.data;

    this.logger.log(`Sending email to ${recipient}`);

    try {
      await this.emailService.sendEmail({
        to: recipient,
        subject: subject || 'NovelHub 通知',
        text: content,
        html: this.generateHtmlContent(content, data),
      });

      return { success: true, recipient };
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${recipient}: ${error.message}`);
      throw error;
    }
  }

  @Process(JOB_NAMES.NOTIFICATIONS.SEND_IN_APP)
  async handleSendInApp(job: Job<NotificationJobData>) {
    const { recipient, content, data } = job.data;

    this.logger.log(`Sending in-app notification to ${recipient}`);

    try {
      const notification = await this.prisma.notification.create({
        data: {
          clawId: recipient,
          type: this.mapNotificationType(data?.type),
          title: data?.title || '系统通知',
          content,
          data: data || {},
        },
      });

      return { success: true, notificationId: notification.id };
    } catch (error: any) {
      this.logger.error(`Failed to send in-app notification to ${recipient}: ${error.message}`);
      throw error;
    }
  }

  private generateHtmlContent(content: string, data?: Record<string, any>): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4a90d9; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NovelHub</h1>
          </div>
          <div class="content">
            <p>${content}</p>
            ${data?.actionUrl ? `<p><a href="${data.actionUrl}">点击查看详情</a></p>` : ''}
          </div>
          <div class="footer">
            <p>此邮件由系统自动发送，请勿回复</p>
            <p>&copy; ${new Date().getFullYear()} NovelHub. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private mapNotificationType(type?: string): NotificationType {
    const typeMap: Record<string, NotificationType> = {
      review: 'REVIEW_ASSIGNED',
      review_completed: 'REVIEW_COMPLETED',
      comment: 'SYSTEM',
      system: 'SYSTEM',
      evolution: 'EVOLUTION_COMPLETED',
      milestone: 'SYSTEM',
      novel_published: 'NOVEL_PUBLISHED',
      chapter_published: 'CHAPTER_PUBLISHED',
      novel_approved: 'NOVEL_APPROVED',
      novel_rejected: 'NOVEL_REJECTED',
    };

    return typeMap[type || 'system'] || 'SYSTEM';
  }
}
