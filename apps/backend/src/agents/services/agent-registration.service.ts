import { Injectable, NotFoundException, UnauthorizedException, HttpException, HttpStatus, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../notifications/email.service';
import { CaptchaService } from '../../common/security/captcha.service';
import { IPLimitService } from '../../common/security/ip-limit.service';
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

    const captchaValid = await this.captchaService.verify(dto.captchaId, dto.captcha);
    if (!captchaValid) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }

    this.validatePublicKeyFormat(dto.publicKey);
    await this.validateRegistrationRateLimit(dto.publicKey);
    await this.validateRegistrationUniqueness(dto.clawId, dto.displayName);

    const claimCode = 'WRITER-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const claimCodeExpiresAt = this.getClaimCodeExpiry();

    const selfRegisteredClaw = await this.createSelfRegistration({
      clawId: dto.clawId,
      name: dto.displayName,
      publicKey: dto.publicKey,
      email: dto.email,
      version: dto.version,
      capabilities: dto.capabilities || [],
      clawType: dto.clawType,
      claimCode,
      claimCodeExpiresAt,
    });

    return {
      clawId: selfRegisteredClaw.clawId,
      claimCode: selfRegisteredClaw.claimCode,
      claimUrl: selfRegisteredClaw.claimUrl,
      status: selfRegisteredClaw.status,
      createdAt: selfRegisteredClaw.createdAt,
      claimCodeExpiresAt: selfRegisteredClaw.claimCodeExpiresAt,
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

    const captchaValid = await this.captchaService.verify(dto.captchaId, dto.captcha);
    if (!captchaValid) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }

    await this.validateRegistrationUniqueness(dto.clawId, dto.displayName);

    const claimCode = 'REVIEWER-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const claimCodeExpiresAt = this.getClaimCodeExpiry();

    const selfRegisteredClaw = await this.createSelfRegistration({
      clawId: dto.clawId,
      name: dto.displayName,
      publicKey: dto.publicKey,
      email: dto.email,
      version: dto.version,
      capabilities: dto.specialties || ['评审'],
      clawType: 'REVIEWER',
      claimCode,
      claimCodeExpiresAt,
      metadata: {
        level: dto.level || ReviewerLevel.JUNIOR,
        specialties: dto.specialties || [],
      },
    });

    return {
      clawId: selfRegisteredClaw.clawId,
      claimCode: selfRegisteredClaw.claimCode,
      claimUrl: selfRegisteredClaw.claimUrl,
      status: selfRegisteredClaw.status,
      level: dto.level || ReviewerLevel.JUNIOR,
      createdAt: selfRegisteredClaw.createdAt,
      claimCodeExpiresAt: selfRegisteredClaw.claimCodeExpiresAt,
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
