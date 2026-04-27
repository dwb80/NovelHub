import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { randomBytes } from 'crypto';
import {
  GenerateInvitationCodeDto,
  GenerateInvitationCodeResponseDto,
  RequestIdentityWithCodeDto,
  RequestIdentityWithCodeResponseDto,
  InvitationCodeStatus,
  ListInvitationCodesResponseDto,
} from '../dto/invitation-code.dto';
import { AgentIdentityRecordService } from './agent-identity-record.service';
import { v4 as uuidv4 } from 'uuid';

export interface InvitationCodeRecord {
  code: string;
  agentType: 'writer' | 'reviewer';
  status: InvitationCodeStatus;
  createdAt: Date;
  expiresAt: Date;
  usedAt?: Date;
  usedBy?: string;
  remark?: string;
  recipientEmail?: string;
  createdBy: string;
}

@Injectable()
export class AgentInvitationService {
  constructor(
    private prisma: PrismaService,
    private identityRecordService: AgentIdentityRecordService,
  ) {}

  /**
   * 生成邀请码（管理员专用）
   */
  async generateInvitationCode(
    dto: GenerateInvitationCodeDto,
    adminId: string,
  ): Promise<GenerateInvitationCodeResponseDto> {
    // 生成唯一邀请码
    const code = this.generateUniqueCode();
    
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30天有效期

    // 存储到数据库（使用selfRegisteredClaw表临时存储）
    await this.prisma.selfRegisteredClaw.create({
      data: {
        clawId: code, // 用clawId字段存储邀请码
        name: `invitation_${dto.agentType}`,
        publicKey: '',
        email: dto.recipientEmail || '',
        clawType: dto.agentType.toUpperCase(),
        status: 'INVITATION_UNUSED', // 自定义状态：邀请码未使用
        claimCode: code,
        claimCodeExpiresAt: expiresAt,
        capabilities: [],
        metadata: {
          type: 'invitation_code',
          remark: dto.remark,
          createdBy: adminId,
          recipientEmail: dto.recipientEmail,
        },
      },
    });

    return {
      code,
      agentType: dto.agentType,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: InvitationCodeStatus.UNUSED,
      remark: dto.remark,
    };
  }

  /**
   * 批量生成邀请码
   */
  async batchGenerateInvitationCodes(
    dto: GenerateInvitationCodeDto,
    adminId: string,
    count: number,
  ): Promise<GenerateInvitationCodeResponseDto[]> {
    const codes: GenerateInvitationCodeResponseDto[] = [];
    
    for (let i = 0; i < count; i++) {
      const code = await this.generateInvitationCode(dto, adminId);
      codes.push(code);
    }
    
    return codes;
  }

  /**
   * 使用邀请码申请ID（智能体自助）
   */
  async requestIdentityWithCode(
    dto: RequestIdentityWithCodeDto,
  ): Promise<RequestIdentityWithCodeResponseDto> {
    // 1. 验证邀请码
    const invitation = await this.validateInvitationCode(dto.invitationCode);

    // 2. 生成Claw ID和API Key
    const timestamp = Date.now();
    const uuid = uuidv4().replace(/-/g, '').substring(0, 16);
    const prefix = invitation.agentType === 'reviewer' ? 'ai_reviewer' : 'ai_writer';
    const clawId = `${prefix}_${timestamp}_${uuid}`;
    const apiKey = this.generateApiKey(invitation.agentType);

    const generatedAt = new Date();
    const expiresAt = new Date(generatedAt.getTime() + 60 * 60 * 1000); // 1小时有效期

    // 3. 记录身份信息
    await this.identityRecordService.recordIdentity({
      clawId,
      apiKey,
      customTag: invitation.agentType,
      expiresAt,
    });

    // 4. 标记邀请码为已使用
    await this.markInvitationCodeAsUsed(dto.invitationCode, clawId);

    return {
      clawId,
      apiKey,
      generatedAt: generatedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      importantNotice: '⚠️ 请务必保存好Claw ID和API Key，这是AI智能体的唯一身份标识，丢失后无法找回！建议立即保存到安全的地方。',
      nextStep: '👉 下一步：AI智能体需要生成RSA密钥对，然后使用此Claw ID和API Key提交注册申请。',
      invitationCode: dto.invitationCode,
    };
  }

  /**
   * 列出所有邀请码（管理员专用）- 支持分页
   */
  async listInvitationCodes(
    adminId: string,
    filters?: { status?: InvitationCodeStatus; agentType?: 'writer' | 'reviewer'; page?: number; pageSize?: number },
  ): Promise<ListInvitationCodesResponseDto> {
    const where: any = {
      status: {
        in: ['INVITATION_UNUSED', 'INVITATION_USED', 'INVITATION_EXPIRED'],
      },
    };

    if (filters?.status) {
      where.status = `INVITATION_${filters.status.toUpperCase()}`;
    }

    if (filters?.agentType) {
      where.clawType = filters.agentType.toUpperCase();
    }

    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 10;
    const skip = (page - 1) * pageSize;

    // 获取总数
    const total = await this.prisma.selfRegisteredClaw.count({ where });

    // 获取分页数据
    const records = await this.prisma.selfRegisteredClaw.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    });

    const list = records.map(record => ({
      code: record.clawId,
      agentType: record.clawType.toLowerCase() as 'writer' | 'reviewer',
      createdAt: record.createdAt.toISOString(),
      expiresAt: record.claimCodeExpiresAt?.toISOString() || '',
      status: this.mapStatus(record.status),
      remark: (record.metadata as any)?.remark,
    }));

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 验证邀请码有效性
   */
  private async validateInvitationCode(code: string): Promise<{ agentType: 'writer' | 'reviewer' }> {
    const record = await this.prisma.selfRegisteredClaw.findFirst({
      where: {
        clawId: code,
        status: 'INVITATION_UNUSED',
      },
    });

    if (!record) {
      throw new HttpException(
        '邀请码无效或已被使用',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 检查是否过期
    if (record.claimCodeExpiresAt && record.claimCodeExpiresAt < new Date()) {
      // 更新状态为过期
      await this.prisma.selfRegisteredClaw.update({
        where: { id: record.id },
        data: { status: 'INVITATION_EXPIRED' },
      });
      
      throw new HttpException(
        '邀请码已过期',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      agentType: record.clawType.toLowerCase() as 'writer' | 'reviewer',
    };
  }

  /**
   * 标记邀请码为已使用
   */
  private async markInvitationCodeAsUsed(code: string, usedBy: string): Promise<void> {
    await this.prisma.selfRegisteredClaw.updateMany({
      where: { clawId: code },
      data: {
        status: 'INVITATION_USED',
        metadata: {
          usedAt: new Date().toISOString(),
          usedBy,
        },
      },
    });
  }

  /**
   * 生成唯一邀请码
   */
  private generateUniqueCode(): string {
    const timestamp = new Date().getFullYear();
    const randomPart = randomBytes(6).toString('base64url').toUpperCase();
    return `INV-${timestamp}-${randomPart}`;
  }

  /**
   * 生成API Key
   */
  private generateApiKey(agentType: 'writer' | 'reviewer'): string {
    const timestamp = Date.now();
    const randomPart = randomBytes(16).toString('hex');
    return `ak_live_${agentType}_${timestamp}_${randomPart}`;
  }

  /**
   * 映射状态
   */
  private mapStatus(dbStatus: string): InvitationCodeStatus {
    switch (dbStatus) {
      case 'INVITATION_UNUSED':
        return InvitationCodeStatus.UNUSED;
      case 'INVITATION_USED':
        return InvitationCodeStatus.USED;
      case 'INVITATION_EXPIRED':
        return InvitationCodeStatus.EXPIRED;
      default:
        return InvitationCodeStatus.REVOKED;
    }
  }
}
