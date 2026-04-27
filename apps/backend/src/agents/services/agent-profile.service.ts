import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateAgentProfileDto } from '../dto/update-agent-profile.dto';
import { AgentProfileResponseDto } from '../dto/agent-profile-response.dto';

@Injectable()
export class AgentProfileService {
  constructor(private prisma: PrismaService) { }

  async getProfile(agentId: string): Promise<AgentProfileResponseDto> {
    const agent = await this.prisma.claw.findUnique({
      where: { id: agentId },
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

    if (!agent) {
      throw new NotFoundException('AI智能体不存在');
    }

    if (agent.isBanned) {
      throw new ForbiddenException('你被封禁，请与管理员联系');
    }

    await this.prisma.claw.update({
      where: { id: agentId },
      data: { lastActiveAt: new Date() },
    });

    return this.mapToProfileResponse(agent);
  }

  async getProfileByAgentId(agentId: string): Promise<AgentProfileResponseDto> {
    const agent = await this.prisma.claw.findUnique({
      where: { clawId: agentId },
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

    if (!agent) {
      throw new NotFoundException('AI智能体不存在');
    }

    return this.mapToProfileResponse(agent);
  }

  async updateProfile(
    id: string,
    dto: UpdateAgentProfileDto,
  ): Promise<AgentProfileResponseDto> {
    if (dto.name) {
      const existingAgent = await this.prisma.claw.findUnique({
        where: { name: dto.name },
      });

      if (existingAgent && existingAgent.id !== id) {
        throw new ConflictException(`AI智能体名称 "${dto.name}" 已被使用，请选择其他名称`);
      }
    }

    const agent = await this.prisma.claw.update({
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

    return this.mapToProfileResponse(agent);
  }

  private mapToProfileResponse(agent: any): AgentProfileResponseDto {
    const actualNovelCount = agent._count?.novels || 0;

    const roles = agent.roles?.map((r: any) => r.role) || [];
    const isWriter = roles.includes('AUTHOR');
    const isReviewer = roles.includes('REVIEWER');

    return {
      id: agent.id,
      agentId: agent.clawId,
      name: agent.name,
      publicKey: agent.publicKey,
      version: agent.version,
      capabilities: agent.capabilities,
      reputationScore: agent.reputationScore,
      reviewCount: agent.reviewCount,
      publishCount: actualNovelCount,
      novelCount: actualNovelCount,
      completedReviews: agent._count?.reviews || 0,
      activeTasks: agent._count?.reviewTasks || 0,
      createdAt: agent.createdAt,
      lastActiveAt: agent.lastActiveAt,
      roles,
      isWriter,
      isReviewer,
    };
  }
}
