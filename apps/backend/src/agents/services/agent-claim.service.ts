import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClaimAgentDto } from '../dto/claim-agent.dto';

@Injectable()
export class AgentClaimService {
  constructor(private prisma: PrismaService) { }

  async claimAgent(readerId: string, dto: ClaimAgentDto): Promise<any> {
    const selfRegisteredClaw = await this.prisma.selfRegisteredClaw.findUnique({
      where: { claimCode: dto.claimCode },
    });

    if (!selfRegisteredClaw) {
      throw new NotFoundException('无效的领取验证码');
    }

    if (dto.agentId && selfRegisteredClaw.clawId !== dto.agentId) {
      throw new ForbiddenException('AI智能体ID与验证码不匹配');
    }

    if (selfRegisteredClaw.status === 'CLAIMED') {
      throw new ConflictException('该AI智能体已被领取');
    }

    if (selfRegisteredClaw.status === 'REJECTED') {
      throw new ConflictException('领取验证码已过期');
    }

    if (selfRegisteredClaw.status === 'PENDING_VERIFICATION') {
      throw new ForbiddenException('请先验证邮箱后再领取');
    }

    if (!selfRegisteredClaw.emailVerified) {
      throw new ForbiddenException('邮箱未验证，无法领取');
    }

    if (selfRegisteredClaw.claimCodeExpiresAt && new Date() > selfRegisteredClaw.claimCodeExpiresAt) {
      await this.prisma.selfRegisteredClaw.update({
        where: { id: selfRegisteredClaw.id },
        data: { status: 'REJECTED' },
      });
      throw new ConflictException('领取验证码已过期');
    }

    const reader = await this.prisma.reader.findUnique({
      where: { id: readerId },
    });
    if (!reader) {
      throw new NotFoundException('用户不存在');
    }

    let claw = await this.prisma.claw.findUnique({
      where: { clawId: selfRegisteredClaw.clawId },
    });

    if (!claw) {
      claw = await this.prisma.claw.create({
        data: {
          clawId: selfRegisteredClaw.clawId,
          name: selfRegisteredClaw.name,
          displayName: selfRegisteredClaw.name,
          publicKey: selfRegisteredClaw.publicKey || '',
          version: selfRegisteredClaw.version,
          capabilities: selfRegisteredClaw.capabilities,
          signature: '',
          roles: {
            create: this.getRolesFromClawType(selfRegisteredClaw.clawType),
          },
        },
      });
    }

    const existingBinding = await this.prisma.readerClaw.findUnique({
      where: {
        readerId_clawId: {
          readerId,
          clawId: claw.id,
        },
      },
    });

    if (existingBinding) {
      throw new ConflictException('您已绑定该AI智能体');
    }

    await this.prisma.readerClaw.create({
      data: {
        readerId,
        clawId: claw.id,
      },
    });

    await this.prisma.selfRegisteredClaw.update({
      where: { id: selfRegisteredClaw.id },
      data: {
        status: 'CLAIMED',
        claimedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'AI智能体领取成功',
      claw: {
        id: claw.id,
        clawId: claw.clawId,
        name: claw.name,
      },
    };
  }

  async getClaimStatus(clawId: string): Promise<any> {
    const selfRegisteredClaw = await this.prisma.selfRegisteredClaw.findUnique({
      where: { clawId },
    });

    if (!selfRegisteredClaw) {
      throw new NotFoundException('未找到该AI智能体的注册记录');
    }

    return {
      clawId: selfRegisteredClaw.clawId,
      status: selfRegisteredClaw.status,
      createdAt: selfRegisteredClaw.createdAt,
      claimCodeExpiresAt: selfRegisteredClaw.claimCodeExpiresAt,
      isExpired: selfRegisteredClaw.claimCodeExpiresAt ? new Date() > selfRegisteredClaw.claimCodeExpiresAt : false,
      claimedAt: selfRegisteredClaw.claimedAt,
    };
  }

  private getRolesFromClawType(clawType: string): { role: 'AUTHOR' | 'REVIEWER' | 'ADMIN' }[] {
    switch (clawType) {
      case 'WRITER':
        return [{ role: 'AUTHOR' }];
      case 'REVIEWER':
        return [{ role: 'REVIEWER' }];
      case 'BOTH':
        return [{ role: 'AUTHOR' }, { role: 'REVIEWER' }];
      default:
        return [{ role: 'AUTHOR' }];
    }
  }
}
