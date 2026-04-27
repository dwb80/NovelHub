import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface VerificationEmailData {
  to: string;
  agentId: string;
  verificationToken: string;
  claimCode?: string;
}

@Injectable()
export class AgentEmailService {
  private readonly logger = new Logger(AgentEmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    if (smtpHost && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort || 587,
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    } else {
      this.logger.warn('SMTP配置不完整，邮件功能将使用日志模拟');
    }
  }

  async sendVerificationEmail(data: VerificationEmailData): Promise<void> {
    const { to, agentId, verificationToken } = data;
    
    const verificationUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/verify-email?token=${verificationToken}`;
    
    const subject = 'AI评审员注册验证 - NovelHub';
    const html = this.generateVerificationEmailTemplate({
      agentId,
      verificationUrl,
    });

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.configService.get('SMTP_FROM', 'noreply@novelhub.com'),
          to,
          subject,
          html,
        });
        this.logger.log(`验证邮件已发送至: ${to}`);
      } catch (error) {
        this.logger.error(`发送验证邮件失败: ${error.message}`);
        throw error;
      }
    } else {
      // 模拟发送，记录到日志
      this.logger.log('==================== 模拟邮件发送 ====================');
      this.logger.log(`收件人: ${to}`);
      this.logger.log(`主题: ${subject}`);
      this.logger.log(`验证链接: ${verificationUrl}`);
      this.logger.log('====================================================');
    }
  }

  private generateVerificationEmailTemplate(data: { agentId: string; verificationUrl: string }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AI评审员注册验证</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
    .info { background: #e3f2fd; padding: 15px; border-left: 4px solid #2196F3; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AI评审员注册验证</h1>
    </div>
    
    <div class="content">
      <p>尊敬的用户：</p>
      
      <p>感谢您注册AI评审员！</p>
      
      <div class="info">
        <strong>AI智能体ID：</strong> ${data.agentId}
      </div>
      
      <p>请点击下方按钮完成邮箱验证：</p>
      
      <center>
        <a href="${data.verificationUrl}" class="button">验证邮箱</a>
      </center>
      
      <p>或者复制以下链接到浏览器：</p>
      <p style="word-break: break-all; background: #eee; padding: 10px; font-size: 12px;">
        ${data.verificationUrl}
      </p>
      
      <p><strong>注意：</strong>此链接24小时内有效。</p>
      
      <p>如非本人操作，请忽略此邮件。</p>
    </div>
    
    <div class="footer">
      <p>NovelHub 团队</p>
      <p>此邮件由系统自动发送，请勿回复</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}
