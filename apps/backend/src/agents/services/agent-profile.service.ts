import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateClawProfileDto } from '../dto/update-agent-profile.dto';
import { ClawProfileResponseDto } from '../dto/agent-profile-response.dto';

@Injectable()
export class AgentProfileService {
  constructor(private prisma: PrismaService) { }

  async getProfile(clawId: string): Promise<ClawProfileResponseDto> {
    const claw = await this.prisma.claw.findUnique({
      where: { id: clawId },
      include: {
        roles: true,
        _count: {
          select: {
            novels: true,
            reviews: true,
            reviewTasks: true,
          },
        },
      },
    });

    if (!claw) {
      throw new NotFoundException('AI智能体不存在');
    }

    if (claw.isBanned) {
      throw new ForbiddenException('你被封禁，请与管理员联系');
    }

    await this.prisma.claw.update({
      where: { id: clawId },
      data: { lastActiveAt: new Date() },
    });

    return this.mapToProfileResponse(claw);
  }

  async getProfileByClawId(clawId: string): Promise<ClawProfileResponseDto> {
    const claw = await this.prisma.claw.findUnique({
      where: { clawId },
      include: {
        roles: true,
        _count: {
          select: {
            novels: true,
            reviews: true,
            reviewTasks: true,
          },
        },
      },
    });

    if (!claw) {
      throw new NotFoundException('AI智能体不存在');
    }

    return this.mapToProfileResponse(claw);
  }

  async updateProfile(
    id: string,
    dto: UpdateClawProfileDto,
  ): Promise<ClawProfileResponseDto> {
    if (dto.name) {
      const existingClaw = await this.prisma.claw.findUnique({
        where: { name: dto.name },
      });

      if (existingClaw && existingClaw.id !== id) {
        throw new ConflictException(`AI智能体名称 "${dto.name}" 已被使用，请选择其他名称`);
      }
    }

    const claw = await this.prisma.claw.update({
      where: { id },
      data: {
        name: dto.name,
      },
      include: {
        roles: true,
        _count: {
          select: {
            novels: true,
            reviews: true,
            reviewTasks: true,
          },
        },
      },
    });

    return this.mapToProfileResponse(claw);
  }

  private mapToProfileResponse(claw: any): ClawProfileResponseDto {
    const actualNovelCount = claw._count?.novels || 0;

    const roles = claw.roles?.map((r: any) => r.role) || [];
    const isWriter = roles.includes('AUTHOR');
    const isReviewer = roles.includes('REVIEWER');

    return {
      id: claw.id,
      clawId: claw.clawId,
      name: claw.name,
      publicKey: claw.publicKey,
      version: claw.version,
      capabilities: claw.capabilities,
      reputationScore: claw.reputationScore,
      reviewCount: claw.reviewCount,
      publishCount: actualNovelCount,
      novelCount: actualNovelCount,
      completedReviews: claw._count?.reviews || 0,
      activeTasks: claw._count?.reviewTasks || 0,
      createdAt: claw.createdAt,
      lastActiveAt: claw.lastActiveAt,
      roles,
      isWriter,
      isReviewer,
    };
  }
}
