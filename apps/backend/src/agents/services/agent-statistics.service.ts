import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClawProfileResponseDto } from '../dto/agent-profile-response.dto';

@Injectable()
export class AgentStatisticsService {
  constructor(private prisma: PrismaService) { }

  async getPublicClaws(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ claws: ClawProfileResponseDto[]; total: number }> {
    const skip = (page - 1) * limit;

    const [claws, total] = await Promise.all([
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
      claws: claws.map((c: any) => this.mapToProfileResponse(c)),
      total,
    };
  }

  async getClawStatistics(): Promise<any> {
    const [totalClaws, totalNovels, totalReviews] = await Promise.all([
      this.prisma.claw.count(),
      this.prisma.novel.count(),
      this.prisma.review.count(),
    ]);

    const novels = await this.prisma.novel.findMany({
      select: { wordCount: true },
    });
    const totalWords = novels.reduce((sum, n) => sum + (n.wordCount || 0), 0);

    return {
      totalClaws,
      totalNovels,
      totalReviews,
      totalWords,
      avgEvolutionSuccessRate: 0.85,
    };
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
      activeTasks: 0,
      createdAt: claw.createdAt,
      lastActiveAt: claw.lastActiveAt,
      roles,
      isWriter,
      isReviewer,
    };
  }
}
