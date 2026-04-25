import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getAnalytics(range: string) {
    const days = this.parseRange(range);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      userStats,
      contentStats,
      aiAgentStats,
      viewStats,
      categoryDistribution,
      dailyTrend,
    ] = await Promise.all([
      this.getUserStats(startDate),
      this.getContentStats(startDate),
      this.getAIAgentStats(),
      this.getViewStats(startDate, days),
      this.getCategoryDistribution(),
      this.getDailyTrend(days),
    ]);

    return {
      ...userStats,
      ...contentStats,
      ...aiAgentStats,
      ...viewStats,
      categoryDistribution,
      dailyTrend,
    };
  }

  async getOverview() {
    const [
      totalReaders,
      totalNovels,
      totalChapters,
      totalComments,
      totalAIAgents,
    ] = await Promise.all([
      this.prisma.reader.count(),
      this.prisma.novel.count(),
      this.prisma.chapter.count(),
      this.prisma.comment.count(),
      this.prisma.claw.count(),
    ]);

    return {
      totalReaders,
      totalNovels,
      totalChapters,
      totalComments,
      totalAIAgents,
    };
  }

  async getTrends(days: number) {
    return this.getDailyTrend(days);
  }

  private parseRange(range: string): number {
    switch (range) {
      case '30d':
        return 30;
      case '90d':
        return 90;
      case '7d':
      default:
        return 7;
    }
  }

  private async getUserStats(startDate: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalReaders,
      newReadersToday,
      newReadersThisWeek,
      newReadersThisMonth,
      activeReadersToday,
    ] = await Promise.all([
      this.prisma.reader.count(),
      this.prisma.reader.count({ where: { createdAt: { gte: today } } }),
      this.prisma.reader.count({ where: { createdAt: { gte: weekStart } } }),
      this.prisma.reader.count({ where: { createdAt: { gte: monthStart } } }),
      this.prisma.readingHistory.groupBy({
        by: ['readerId'],
        where: { readAt: { gte: today } },
        _count: { readerId: true },
      }).then(result => result.length),
    ]);

    return {
      totalReaders,
      newReadersToday,
      newReadersThisWeek,
      newReadersThisMonth,
      activeReadersToday,
    };
  }

  private async getContentStats(startDate: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalNovels,
      newNovelsToday,
      totalChapters,
      newChaptersToday,
      totalComments,
      newCommentsToday,
    ] = await Promise.all([
      this.prisma.novel.count(),
      this.prisma.novel.count({ where: { createdAt: { gte: today } } }),
      this.prisma.chapter.count(),
      this.prisma.chapter.count({ where: { createdAt: { gte: today } } }),
      this.prisma.comment.count(),
      this.prisma.comment.count({ where: { createdAt: { gte: today } } }),
    ]);

    return {
      totalNovels,
      newNovelsToday,
      totalChapters,
      newChaptersToday,
      totalComments,
      newCommentsToday,
    };
  }

  private async getAIAgentStats() {
    const [
      totalAIAgents,
      aiAuthors,
      aiReviewers,
    ] = await Promise.all([
      this.prisma.claw.count(),
      this.prisma.claw.count({
        where: {
          roles: { some: { role: 'AUTHOR' } },
        },
      }),
      this.prisma.claw.count({
        where: {
          roles: { some: { role: 'REVIEWER' } },
        },
      }),
    ]);

    return {
      totalAIAgents,
      aiAuthors,
      aiReviewers,
    };
  }

  private async getViewStats(startDate: Date, days: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // 获取总阅读量（所有章节的viewCount总和）
    const totalViewsResult = await this.prisma.chapter.aggregate({
      _sum: { viewCount: true },
    });

    const totalViews = totalViewsResult._sum.viewCount || 0;

    // 获取今日、本周、本月阅读量
    const [viewsToday, viewsThisWeek, viewsThisMonth] = await Promise.all([
      this.getViewsSince(today),
      this.getViewsSince(weekStart),
      this.getViewsSince(monthStart),
    ]);

    return {
      totalViews,
      viewsToday,
      viewsThisWeek,
      viewsThisMonth,
    };
  }

  private async getViewsSince(date: Date): Promise<number> {
    // 通过阅读历史表统计
    const result = await this.prisma.readingHistory.aggregate({
      where: {
        readAt: { gte: date },
      },
      _sum: {
        progress: true,
      },
    });
    return result._sum?.progress || 0;
  }

  private async getCategoryDistribution() {
    // 从 Novel 表中获取分类统计
    const novels = await this.prisma.novel.findMany({
      select: { category: true },
    });

    const categoryCount: Record<string, number> = {};
    novels.forEach(novel => {
      const cat = novel.category || '其他';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    const totalNovels = novels.length;

    return Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
      percentage: totalNovels > 0 ? Math.round((count / totalNovels) * 100) : 0,
    }));
  }

  private async getDailyTrend(days: number) {
    const trends: Array<{ date: string; views: number; newUsers: number; newNovels: number }> = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [views, newUsers, newNovels] = await Promise.all([
        this.getViewsSince(date),
        this.prisma.reader.count({ where: { createdAt: { gte: date, lt: nextDate } } }),
        this.prisma.novel.count({ where: { createdAt: { gte: date, lt: nextDate } } }),
      ]);

      trends.push({
        date: date.toISOString().split('T')[0],
        views,
        newUsers,
        newNovels,
      });
    }

    return trends;
  }
}
