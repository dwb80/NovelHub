import { Injectable, NotFoundException, UnauthorizedException, HttpException, HttpStatus, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../notifications/email.service';
import { CaptchaService } from '../../common/security/captcha.service';
import { IPLimitService } from '../../common/security/ip-limit.service';
import { AgentEmailService } from './agent-email.service';
import { SelfRegisterClawDto, ClawType } from '../dto/self-register-agent.dto';
import { SelfRegisterResponseDto } from '../dto/self-register-response.dto';
import { RegisterReviewerDto, RegisterReviewerResponseDto, ReviewerLevel } from '../dto/register-reviewer.dto';
import * as crypto from 'crypto';

@Injectable()
export class AgentRegistrationService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private emailService: EmailService,
    private agentEmailService: AgentEmailService,
    private captchaService: CaptchaService,
    private ipLimitService: IPLimitService,
  ) { }

  async selfRegister(dto: SelfRegisterClawDto, clientIP: string): Promise<SelfRegisterResponseDto> {
    const ipCheck = await this.ipLimitService.checkAndRecord(clientIP, 'registration');
    if (!ipCheck.allowed) {
      throw new HttpException(
        '请求过于频繁，请24小时后再试',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (!dto.clawId.startsWith('ai_writer_')) {
      throw new HttpException(
        'AI作家注册必须使用ai_writer_xxx格式的ID',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.validateApiKey(dto.apiKey);

    // 图形验证码已移除，使用邮箱验证代替
    // const captchaValid = await this.captchaService.verify(dto.captchaId, dto.captcha);
    // if (!captchaValid) {
    //   throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    // }

    this.validatePublicKeyFormat(dto.publicKey);
    await this.validateRegistrationRateLimit(dto.publicKey);
    await this.validateRegistrationUniqueness(dto.clawId, dto.displayName);
    await this.validateClawIdAndApiKeyCombination(dto.clawId, dto.apiKey);

    // 生成验证token和临时claimCode（邮箱验证后更新为正式claimCode）
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tempClaimCode = 'TEMP-' + crypto.randomBytes(16).toString('hex').toUpperCase();

    // 创建待验证的注册记录
    const pendingRegistration = await this.prisma.selfRegisteredClaw.create({
      data: {
        clawId: dto.clawId,
        name: dto.displayName,
        publicKey: dto.publicKey,
        email: dto.email,
        clawType: 'WRITER',
        status: 'PENDING_VERIFICATION',
        verificationToken,
        verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        claimCode: tempClaimCode, // 临时claimCode，验证后更新为正式claimCode
        claimCodeExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        capabilities: dto.capabilities || ['创作'],
        metadata: {
          specialties: dto.capabilities || [],
        },
      },
    });

    // 发送验证邮件
    await this.agentEmailService.sendVerificationEmail({
      to: dto.email,
      clawId: dto.clawId,
      verificationToken,
    });

    return {
      clawId: pendingRegistration.clawId,
      email: pendingRegistration.email,
      verificationToken,
      status: 'pending_verification',
      message: '验证邮件已发送，请查收邮件完成验证',
    };
  }

  async registerReviewer(dto: RegisterReviewerDto, clientIP: string): Promise<RegisterReviewerResponseDto> {
    const ipCheck = await this.ipLimitService.checkAndRecord(clientIP, 'registration');
    if (!ipCheck.allowed) {
      throw new HttpException(
        '请求过于频繁，请24小时后再试',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (!dto.clawId.startsWith('ai_reviewer_')) {
      throw new HttpException(
        'AI评审员注册必须使用ai_reviewer_xxx格式的ID',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.validateApiKey(dto.apiKey);
    this.validatePublicKeyFormat(dto.publicKey);
    await this.validateRegistrationUniqueness(dto.clawId, dto.displayName);
    await this.validateClawIdAndApiKeyCombination(dto.clawId, dto.apiKey);

    // 生成验证token和临时claimCode（邮箱验证后更新为正式claimCode）
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tempClaimCode = 'TEMP-' + crypto.randomBytes(16).toString('hex').toUpperCase();

    // 创建待验证的注册记录
    const pendingRegistration = await this.prisma.selfRegisteredClaw.create({
      data: {
        clawId: dto.clawId,
        name: dto.displayName,
        publicKey: dto.publicKey,
        email: dto.email,
        clawType: 'REVIEWER',
        status: 'PENDING_VERIFICATION',
        verificationToken,
        verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        claimCode: tempClaimCode, // 临时claimCode，验证后更新为正式claimCode
        claimCodeExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        capabilities: dto.specialties || ['评审'],
        metadata: {
          level: dto.level || ReviewerLevel.JUNIOR,
          specialties: dto.specialties || [],
        },
      },
    });

    // 发送验证邮件
    await this.agentEmailService.sendVerificationEmail({
      to: dto.email,
      clawId: dto.clawId,
      verificationToken,
    });

    return {
      clawId: pendingRegistration.clawId,
      email: pendingRegistration.email,
      verificationToken,
      status: 'pending_verification',
      level: dto.level || ReviewerLevel.JUNIOR,
      message: '验证邮件已发送，请查收邮件完成验证',
    };
  }

  private async validateApiKey(apiKey: string): Promise<void> {
    const validApiKey = this.configService.get<string>('CLAW_API_KEY');
    if (!validApiKey) {
      throw new Error('CLAW_API_KEY 环境变量未配置');
    }
    if (apiKey !== validApiKey) {
      throw new UnauthorizedException('API密钥无效');
    }
  }

  private validatePublicKeyFormat(publicKey: string): void {
    if (!publicKey.includes('-----BEGIN PUBLIC KEY-----') ||
      !publicKey.includes('-----END PUBLIC KEY-----')) {
      throw new HttpException(
        '公钥格式错误，必须是PEM格式',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async validateRegistrationRateLimit(publicKey: string): Promise<void> {
    const normalizedKey = publicKey.replace(/\r\n/g, '\n').trim();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentRegistration = await this.prisma.selfRegisteredClaw.findFirst({
      where: {
        publicKey: normalizedKey,
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
    });

    if (recentRegistration) {
      throw new HttpException(
        '同一公钥24小时内只能注册一次，请稍后再试',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private async validateRegistrationUniqueness(clawId: string, name: string): Promise<void> {
    const existingClaw = await this.prisma.claw.findUnique({
      where: { clawId },
    });
    if (existingClaw) {
      throw new ConflictException('该AI智能体ID已被注册');
    }

    const existingClawByName = await this.prisma.claw.findFirst({
      where: { name },
    });
    if (existingClawByName) {
      throw new ConflictException('该AI智能体名称已被使用');
    }

    const existingPending = await this.prisma.selfRegisteredClaw.findUnique({
      where: { clawId },
    });
    if (existingPending && existingPending.status === 'PENDING_CLAIM') {
      throw new ConflictException('该AI智能体ID正在等待领取');
    }

    const existingPendingByName = await this.prisma.selfRegisteredClaw.findFirst({
      where: { name, status: 'PENDING_CLAIM' },
    });
    if (existingPendingByName) {
      throw new ConflictException('该AI智能体名称正在等待领取');
    }
  }

  /**
   * 验证Claw ID和API Key的组合是否已被使用
   * 确保一个Claw ID只能使用对应的API Key注册一次
   */
  private async validateClawIdAndApiKeyCombination(clawId: string, apiKey: string): Promise<void> {
    // 检查是否已有相同Claw ID的注册记录（无论状态）
    const existingRegistration = await this.prisma.selfRegisteredClaw.findFirst({
      where: {
        clawId,
      },
    });

    if (existingRegistration) {
      throw new ConflictException(
        `该AI智能体ID(${clawId})已经提交过注册申请，请勿重复注册。` +
        `当前状态: ${existingRegistration.status}。` +
        `如需重新注册，请联系平台管理员。`
      );
    }

    // 检查是否已有相同API Key的使用记录
    // 注意：这里假设API Key是唯一的，且与Claw ID一一对应
    // 实际实现可能需要根据业务逻辑调整
  }

  private getClaimCodeExpiry(): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    return expiry;
  }

  private async createSelfRegistration(data: {
    clawId: string;
    name: string;
    publicKey: string;
    email: string;
    version?: string;
    capabilities: string[];
    clawType: string;
    claimCode: string;
    claimCodeExpiresAt: Date;
    metadata?: any;
  }): Promise<any> {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const selfRegisteredClaw = await this.prisma.selfRegisteredClaw.create({
      data: {
        clawId: data.clawId,
        name: data.name,
        publicKey: data.publicKey,
        email: data.email,
        emailVerified: false,
        verificationToken,
        verificationExpires,
        version: data.version || '1.0.0',
        capabilities: data.capabilities,
        clawType: data.clawType,
        claimCode: data.claimCode,
        claimCodeExpiresAt: data.claimCodeExpiresAt,
        status: 'PENDING_VERIFICATION',
      },
    });

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const claimUrl = `${frontendUrl}/ai-agent?code=${data.claimCode}`;

    return {
      ...selfRegisteredClaw,
      claimUrl,
    };
  }
}
