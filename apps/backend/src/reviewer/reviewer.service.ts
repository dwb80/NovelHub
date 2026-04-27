import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NovelStatus } from '@prisma/client';

@Injectable()
export class ReviewerService {
  constructor(private readonly prisma: PrismaService) { }

  async getStats(readerId: string) {
    const readerAgents = await this.prisma.readerClaw.findMany({
      where: { readerId },
      include: {
        claw: {
          include: {
            roles: true,
            reviews: {
              select: {
                id: true,
                overallRating: true,
                createdAt: true,
              },
            },
            _count: {
              select: {
                reviews: true,
              },
            },
          },
        },
      },
    });

    const reviewers = readerAgents
      .filter((rc: { claw: { roles: { role: string }[] } }) =>
        rc.claw.roles.some((r: { role: string }) => r.role === 'REVIEWER'),
      )
      .map(
        (rc: {
          claw: {
            id: string;
            clawId: string;
            name: string;
            reputationScore: number;
          };
        }) => ({
          id: rc.claw.id,
          agentId: rc.claw.clawId,
          name: rc.claw.name,
          reputationScore: rc.claw.reputationScore,
        }),
      );

    const reviewerIds = reviewers.map((r: { id: string }) => r.id);

    const reviews = await this.prisma.review.findMany({
      where: {
        reviewerId: { in: reviewerIds },
      },
      select: {
        overallRating: true,
        createdAt: true,
      },
    });

    const completedReviews = reviews.length;
    const averageRating =
      completedReviews > 0
        ? reviews.reduce(
          (sum: number, r: { overallRating: number }) =>
            sum + r.overallRating,
          0,
        ) / completedReviews
        : 0;

    const pendingReviews = await this.prisma.novel.count({
      where: {
        status: NovelStatus.REVIEWING,
        authorId: { in: reviewerIds },
      },
    });

    const recentReviews = await this.prisma.review.findMany({
      where: {
        reviewerId: { in: reviewerIds },
      },
      include: {
        novel: {
          select: {
            title: true,
          },
        },
        reviewer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    const recentActivity = recentReviews.map(
      (r: {
        novel: { title: string } | null;
        reviewer: { name: string };
        createdAt: Date;
      }) => ({
        type: 'completed' as const,
        title: r.novel?.title || '未知小说',
        reviewerName: r.reviewer.name,
        time: r.createdAt.toISOString(),
      }),
    );

    const ratingDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    reviews.forEach((r: { overallRating: number }) => {
      const roundedScore = Math.round(r.overallRating);
      if (roundedScore >= 1 && roundedScore <= 5) {
        ratingDistribution[roundedScore]++;
      }
    });

    const totalReviews = reviews.length;
    const ratingDistributionPercent: Record<number, number> = {};
    for (let i = 1; i <= 5; i++) {
      ratingDistributionPercent[i] =
        totalReviews > 0 ? ratingDistribution[i] / totalReviews : 0;
    }

    const monthlyTrend = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;

      const monthReviews = await this.prisma.review.count({
        where: {
          reviewerId: { in: reviewerIds },
          createdAt: {
            gte: new Date(month.getFullYear(), month.getMonth(), 1),
            lt: new Date(month.getFullYear(), month.getMonth() + 1, 1),
          },
        },
      });

      monthlyTrend.push({
        month: monthStr,
        count: 10,
        completed: monthReviews,
      });
    }

    return {
      reviewerCount: reviewers.length,
      completedReviews,
      pendingReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      reviewers,
      recentActivity,
      ratingDistribution: ratingDistributionPercent,
      monthlyTrend,
      maxMonthlyCount: 10,
    };
  }

  async getPendingReviews(readerId: string) {
    const readerAgents = await this.prisma.readerClaw.findMany({
      where: { readerId },
      include: {
        claw: {
          include: {
            roles: true,
          },
        },
      },
    });

    const reviewerIds = readerAgents
      .filter((rc: { claw: { roles: { role: string }[] } }) =>
        rc.claw.roles.some((r: { role: string }) => r.role === 'REVIEWER'),
      )
      .map((rc: { claw: { id: string } }) => rc.claw.id);

    if (reviewerIds.length === 0) {
      return { novels: [] };
    }

    const novels = await this.prisma.novel.findMany({
      where: {
        status: NovelStatus.REVIEWING,
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    return {
      novels: novels.map(
        (novel: {
          id: string;
          title: string;
          author: { name: string } | null;
          wordCount: number;
          createdAt: Date;
        }) => ({
          id: novel.id,
          title: novel.title,
          authorName: novel.author?.name || '未知AI智能体作家',
          wordCount: novel.wordCount,
          submittedAt: novel.createdAt.toISOString(),
        }),
      ),
    };
  }

  async getReviewHistory(readerId: string) {
    const readerAgents = await this.prisma.readerClaw.findMany({
      where: { readerId },
      include: {
        claw: {
          include: {
            roles: true,
          },
        },
      },
    });

    const reviewerIds = readerAgents
      .filter((rc: { claw: { roles: { role: string }[] } }) =>
        rc.claw.roles.some((r: { role: string }) => r.role === 'REVIEWER'),
      )
      .map((rc: { claw: { id: string } }) => rc.claw.id);

    if (reviewerIds.length === 0) {
      return { reviews: [] };
    }

    const reviews = await this.prisma.review.findMany({
      where: {
        reviewerId: { in: reviewerIds },
      },
      include: {
        novel: {
          select: {
            title: true,
          },
        },
        reviewer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return {
      reviews: reviews.map(
        (review: {
          id: string;
          novel: { title: string } | null;
          reviewer: { name: string };
          overallRating: number;
          plotRating: number | null;
          styleRating: number | null;
          characterRating: number | null;
          pacingRating: number | null;
          comment: string | null;
        }) => ({
          id: review.id,
          novelTitle: review.novel?.title || '未知小说',
          reviewerName: review.reviewer.name,
          score: review.overallRating,
          creativityScore: review.plotRating || 0,
          writingScore: review.styleRating || 0,
          logicScore: review.characterRating || 0,
          appealScore: review.pacingRating || 0,
          comment: review.comment,
        }),
      ),
    };
  }
}
