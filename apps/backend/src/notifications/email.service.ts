import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

interface AdminNotificationEmail {
  adminName: string;
  notificationTitle: string;
  notificationContent: string;
  notificationType: string;
  actionUrl?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private readonly isEnabled: boolean;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.isEnabled = this.configService.get<boolean>('EMAIL_ENABLED') || false;
    
    if (this.isEnabled) {
      this.initializeTransporter();
    } else {
      this.logger.warn('邮件服务未启用，请在环境变量中设置 EMAIL_ENABLED=true');
    }
  }

  private initializeTransporter(): void {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT') || 587;
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const secure = this.configService.get<boolean>('SMTP_SECURE') || false;

    if (!host || !user || !pass) {
      this.logger.error('SMTP配置不完整，邮件服务无法启动');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    // 验证连接
    this.transporter!.verify((error) => {
      if (error) {
        this.logger.error('SMTP连接验证失败:', error.message);
      } else {
        this.logger.log('SMTP服务器连接成功，邮件服务已就绪');
      }
    });
  }

  /**
   * 发送邮件
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isEnabled || !this.transporter) {
      this.logger.warn('邮件服务未启用或配置错误，邮件未发送');
      return false;
    }

    try {
      const from = options.from || this.configService.get<string>('EMAIL_FROM') || 'noreply@novelhub.com';
      
      const result = await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      this.logger.log(`邮件发送成功: ${result.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`邮件发送失败: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * 发送管理员通知邮件
   */
  async sendAdminNotificationEmail(to: string, data: AdminNotificationEmail): Promise<boolean> {
    const subject = `[NovelHub管理员通知] ${data.notificationTitle}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.notificationTitle}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .notification-box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin: 20px 0;
          }
          .notification-type {
            display: inline-block;
            background: #e0e7ff;
            color: #4f46e5;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 10px;
          }
          .btn {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
          }
          .footer {
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔔 NovelHub 管理员通知</h1>
        </div>
        <div class="content">
          <p>您好，${data.adminName}</p>
          
          <div class="notification-box">
            <span class="notification-type">${data.notificationType}</span>
            <h2 style="margin-top: 0; color: #1f2937;">${data.notificationTitle}</h2>
            <p style="color: #4b5563;">${data.notificationContent}</p>
          </div>
          
          ${data.actionUrl ? `
          <a href="${data.actionUrl}" class="btn">查看详情</a>
          ` : ''}
          
          <div class="footer">
            <p>此邮件由 NovelHub 系统自动发送</p>
            <p>如需管理通知设置，请登录管理后台</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      NovelHub 管理员通知
      
      您好，${data.adminName}
      
      【${data.notificationType}】${data.notificationTitle}
      
      ${data.notificationContent}
      
      ${data.actionUrl ? `查看详情: ${data.actionUrl}` : ''}
      
      ---
      此邮件由 NovelHub 系统自动发送
    `;

    return this.sendEmail({
      to,
      subject,
      html,
      text,
    });
  }

  /**
   * 发送测试邮件
   */
  async sendTestEmail(to: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: '[NovelHub] 邮件服务测试',
      html: `
        <h1>邮件服务测试</h1>
        <p>这是一封测试邮件，用于验证邮件服务是否正常工作。</p>
        <p>如果您收到这封邮件，说明邮件服务配置正确。</p>
        <hr>
        <p>发送时间: ${new Date().toLocaleString('zh-CN')}</p>
      `,
      text: '邮件服务测试 - 如果您收到这封邮件，说明邮件服务配置正确。',
    });
  }

  /**
   * 检查邮件服务状态
   */
  isEmailServiceEnabled(): boolean {
    return this.isEnabled && this.transporter !== null;
  }

  /**
   * 发送数据一致性告警邮件
   */
  async sendDataConsistencyAlert(report: {
    timestamp: Date;
    totalIssues: number;
    issues: Array<{
      type: string;
      entityId: string;
      entityName?: string;
      expected: number;
      actual: number;
      message: string;
    }>;
    summary: {
      clawPublishCount: number;
      clawReviewCount: number;
      novelChapterCount: number;
    };
  }): Promise<boolean> {
    const admins = await this.prisma.admin.findMany({
      where: { isDeleted: false, isBanned: false },
      select: { email: true, name: true },
    });

    if (admins.length === 0) {
      return false;
    }

    const subject = `[NovelHub数据告警] 发现 ${report.totalIssues} 个数据一致性问题`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .issue { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #dc2626; border-radius: 4px; }
          .summary { background: #e0e7ff; padding: 15px; border-radius: 4px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>数据一致性告警</h1>
            <p>发现 ${report.totalIssues} 个数据一致性问题</p>
          </div>
          <div class="content">
            <p><strong>检查时间:</strong> ${report.timestamp.toLocaleString('zh-CN')}</p>
            
            <h3>问题详情:</h3>
            ${report.issues.map(issue => `
              <div class="issue">
                <p><strong>${issue.type}</strong></p>
                <p>${issue.message}</p>
                <p>实体: ${issue.entityName || issue.entityId}</p>
                <p>期望值: ${issue.expected}, 实际值: ${issue.actual}</p>
              </div>
            `).join('')}
            
            <div class="summary">
              <h3>统计摘要</h3>
              <p>Claw发布数: ${report.summary.clawPublishCount}</p>
              <p>Claw评审数: ${report.summary.clawReviewCount}</p>
              <p>小说章节数: ${report.summary.novelChapterCount}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      数据一致性告警
      
      检查时间: ${report.timestamp.toLocaleString('zh-CN')}
      发现问题数: ${report.totalIssues}
      
      问题详情:
      ${report.issues.map(issue => `
        - ${issue.type}: ${issue.message}
          实体: ${issue.entityName || issue.entityId}
          期望值: ${issue.expected}, 实际值: ${issue.actual}
      `).join('\n')}
      
      统计摘要:
      - Claw发布数: ${report.summary.clawPublishCount}
      - Claw评审数: ${report.summary.clawReviewCount}
      - 小说章节数: ${report.summary.novelChapterCount}
    `;

    // 发送给所有管理员
    const results = await Promise.all(
      admins.map((admin: { email: string; name: string }) =>
        this.sendEmail({
          to: admin.email,
          subject,
          html,
          text,
        })
      )
    );

    return results.every((r: boolean) => r);
  }
}
