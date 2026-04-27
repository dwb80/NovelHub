import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface IdentityRecord {
  clawId: string;
  apiKey: string;
  status: 'generated' | 'registered' | 'expired' | 'claimed';
  generatedAt: Date;
  expiresAt: Date;
  registeredAt?: Date;
  customTag: string;
}

@Injectable()
export class AgentIdentityRecordService {
  constructor(private prisma: PrismaService) {}

  /**
   * 记录新生成的身份信息
   */
  async recordIdentity(data: {
    clawId: string;
    apiKey: string;
    customTag: string;
    expiresAt: Date;
  }): Promise<void> {
    // 使用Prisma的SelfRegisteredClaw模型临时存储身份信息
    // 状态为'generated'表示已生成但未注册
    await this.prisma.selfRegisteredClaw.create({
      data: {
        clawId: data.clawId,
        name: `temp_${data.clawId}`, // 临时名称
        publicKey: '', // 占位，注册时更新
        email: '', // 占位，注册时更新
        clawType: data.customTag.toUpperCase(),
        status: 'GENERATED', // 自定义状态：已生成但未注册
        claimCode: data.apiKey, // 临时存储API Key
        claimCodeExpiresAt: data.expiresAt,
        capabilities: [],
      },
    });
  }

  /**
   * 检查是否可以重新申请ID
   * 
   * 允许重新申请的情况：
   * 1. 之前没有申请过ID
   * 2. 之前的ID已过期且未注册
   * 3. 之前的ID注册失败（可以重新申请）
   * 
   * 不允许重新申请的情况：
   * 1. 已有ID正在注册流程中（未过期）
   * 2. 已有ID注册成功
   * 3. 已有ID被领取
   */
  async canRequestNewId(): Promise<{
    allowed: boolean;
    reason?: string;
    existingId?: string;
  }> {
    // 查找所有GENERATED状态的记录
    const generatedRecords = await this.prisma.selfRegisteredClaw.findMany({
      where: {
        status: 'GENERATED',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
    });

    if (generatedRecords.length === 0) {
      return { allowed: true }; // 没有记录，可以申请
    }

    const latestRecord = generatedRecords[0];
    const now = new Date();

    // 检查是否过期
    if (latestRecord.claimCodeExpiresAt && latestRecord.claimCodeExpiresAt < now) {
      // 已过期，更新状态并允许重新申请
      await this.prisma.selfRegisteredClaw.update({
        where: { id: latestRecord.id },
        data: { status: 'EXPIRED' },
      });
      return {
        allowed: true,
        reason: `之前的ID(${latestRecord.clawId})已过期，允许重新申请`,
      };
    }

    // 未过期，不允许重新申请
    return {
      allowed: false,
      reason: `您已有一个有效的ID(${latestRecord.clawId})，有效期至${latestRecord.claimCodeExpiresAt}。如需重新申请，请等待过期或联系管理员。`,
      existingId: latestRecord.clawId,
    };
  }

  /**
   * 标记ID为已注册
   */
  async markAsRegistered(clawId: string): Promise<void> {
    await this.prisma.selfRegisteredClaw.updateMany({
      where: { clawId },
      data: { status: 'PENDING_VERIFICATION' },
    });
  }

  /**
   * 清理过期的GENERATED记录
   */
  async cleanupExpiredIdentities(): Promise<number> {
    const now = new Date();
    const result = await this.prisma.selfRegisteredClaw.updateMany({
      where: {
        status: 'GENERATED',
        claimCodeExpiresAt: {
          lt: now,
        },
      },
      data: {
        status: 'EXPIRED',
      },
    });

    return result.count;
  }
}
