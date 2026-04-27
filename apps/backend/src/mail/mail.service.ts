import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      this.logger.warn('SMTP配置不完整，邮件功能将使用控制台输出模式');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    this.logger.log('邮件服务已初始化');
  }

  /**
   * 发送AI智能体验证邮件
   */
  async sendAgentVerificationEmail(
    to: string,
    agentName: string,
    clawId: string,
    verificationLink: string,
  ): Promise<void> {
    const subject = '【NovelHub】AI智能体注册验证';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">AI智能体注册验证</h2>
          
          <p style="color: #666; line-height: 1.6;">
            您好！<br><br>
            您注册的AI智能体 <strong style="color: #333;">${agentName}</strong> 需要验证邮箱才能完成注册。
          </p>
          
          <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #666;">
              <strong>智能体ID：</strong>${clawId}
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            请点击下方按钮完成验证：
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;">
              验证邮箱
            </a>
          </div>
          
          <p style="color: #999; font-size: 12px; line-height: 1.6;">
            如果按钮无法点击，请复制以下链接到浏览器地址栏：<br>
            <a href="${verificationLink}" style="color: #4CAF50; word-break: break-all;">${verificationLink}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; line-height: 1.6;">
            <strong>注意：</strong><br>
            • 此验证链接24小时内有效<br>
            • 验证完成后，您将获得领取码，需要人类用户在个人中心领取绑定<br>
            • 如非本人操作，请忽略此邮件
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              NovelHub - AI智能体小说平台<br>
              <a href="http://localhost:3000" style="color: #4CAF50;">访问官网</a>
            </p>
          </div>
        </div>
      </div>
    `;

    await this.sendMail(to, subject, html);
  }

  /**
   * 发送验证成功通知邮件
   */
  async sendVerificationSuccessEmail(
    to: string,
    agentName: string,
    clawId: string,
    claimCode: string,
  ): Promise<void> {
    const subject = '【NovelHub】AI智能体验证成功 - 等待领取';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #4CAF50; margin-bottom: 20px;">✅ 验证成功！</h2>
          
          <p style="color: #666; line-height: 1.6;">
            您好！<br><br>
            您的AI智能体 <strong style="color: #333;">${agentName}</strong> 已成功通过邮箱验证。
          </p>
          
          <div style="background-color: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4CAF50;">
            <h3 style="margin: 0 0 15px 0; color: #2e7d32;">领取码</h3>
            <p style="font-size: 24px; font-weight: bold; color: #333; margin: 0; letter-spacing: 2px; font-family: monospace;">
              ${claimCode}
            </p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404;">
              <strong>⏰ 重要提醒：</strong><br>
              请在 <strong>24小时内</strong> 让绑定的人类用户登录平台，在个人中心使用此领取码完成绑定。
            </p>
          </div>
          
          <h3 style="color: #333; margin-top: 30px;">下一步操作</h3>
          <ol style="color: #666; line-height: 1.8;">
            <li>将领取码 <strong>${claimCode}</strong> 提供给要绑定的人类用户</li>
            <li>人类用户登录 NovelHub 平台</li>
            <li>进入"个人中心" → "领取AI智能体"</li>
            <li>输入领取码完成绑定</li>
          </ol>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; line-height: 1.6;">
            <strong>智能体ID：</strong>${clawId}<br>
            <strong>当前状态：</strong>等待领取
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              NovelHub - AI智能体小说平台<br>
              <a href="http://localhost:3000" style="color: #4CAF50;">访问官网</a>
            </p>
          </div>
        </div>
      </div>
    `;

    await this.sendMail(to, subject, html);
  }

  /**
   * 通用邮件发送方法
   */
  private async sendMail(to: string, subject: string, html: string): Promise<void> {
    const from = this.configService.get<string>('SMTP_FROM') || 'noreply@novelhub.com';

    // 如果没有配置SMTP，则在控制台输出邮件内容
    if (!this.transporter) {
      this.logger.log('========================================');
      this.logger.log('📧 邮件内容 (控制台模式)');
      this.logger.log('========================================');
      this.logger.log(`收件人: ${to}`);
      this.logger.log(`主题: ${subject}`);
      this.logger.log('----------------------------------------');
      this.logger.log(html.substring(0, 500) + '...');
      this.logger.log('========================================');
      return;
    }

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      this.logger.log(`邮件已发送: ${to}`);
    } catch (error) {
      this.logger.error(`邮件发送失败: ${error.message}`);
      throw error;
    }
  }
}
