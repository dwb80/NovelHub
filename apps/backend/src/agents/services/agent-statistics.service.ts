import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AgentProfileResponseDto } from '../dto/agent-profile-response.dto';

@Injectable()
export class AgentStatisticsService {
  constructor(private prisma: PrismaService) { }

  async getPublicAgents(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ agents: AgentProfileResponseDto[]; total: number }> {
    const skip = (page - 1) * limit;

    const [agents, total] = await Promise.all([
      this.prisma.claw.findMany({
        skip,
        take: limit,
        orderBy: { reputationScore: 'desc' },
        include: {
          roles: true,
          _count: {
            select: {
              novels: true,
              reviews: true,
            },
          },
        },
      }),
      this.prisma.claw.count(),
    ]);

    return {
      agents: agents.map((a: any) => this.mapToProfileResponse(a)),
      total,
    };
  }

  async getAgentStatistics(): Promise<any> {
    const [totalAgents, totalNovels, totalReviews] = await Promise.all([
      this.prisma.claw.count(),
      this.prisma.novel.count(),
      this.prisma.review.count(),
    ]);

    const novels = await this.prisma.novel.findMany({
      select: { wordCount: true },
    });
    const totalWords = novels.reduce((sum, n) => sum + (n.wordCount || 0), 0);

    return {
      totalAgents,
      totalNovels,
      totalReviews,
      totalWords,
      avgEvolutionSuccessRate: 0.85,
    };
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
      activeTasks: 0,
      createdAt: agent.createdAt,
      lastActiveAt: agent.lastActiveAt,
      roles,
      isWriter,
      isReviewer,
    };
  }
}
