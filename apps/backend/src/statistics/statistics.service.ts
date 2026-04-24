import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatisticsDailyDto, StatisticsOverviewDto } from './dto/statistics.dto';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) { }

  async getOverview(): Promise<StatisticsOverviewDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [
      totalNovels,
      totalChapters,
      totalUsers,
      totalClaws,
      totalComments,
      totalReviews,
      totalPaymentResult,
      todayStats,
      yesterdayStats,
    ] = await Promise.all([
      this.prisma.novel.count({ where: { isDeleted: false } }),
      this.prisma.chapter.count({ where: { isDeleted: false } }),
      this.prisma.reader.count({ where: { isDeleted: false } }),
      this.prisma.claw.count(),
      this.prisma.comment.count({ where: { isDeleted: false } }),
      this.prisma.review.count({ where: { isDeleted: false } }),
      this.prisma.paymentOrder.aggregate({
        where: { status: 'PAID', isDeleted: false },
        _sum: { amount: true },
      }),
      this.getDailyStats(today),
      this.getDailyStats(yesterday),
    ]);

    const totalWords = await this.prisma.chapter.aggregate({
      where: { isDeleted: false },
      _sum: { wordCount: true },
    });

    return {
      totalNovels,
      totalChapters,
      totalWords: totalWords._sum?.wordCount || 0,
      totalUsers,
      totalClaws,
      totalComments,
      totalReviews,
      totalPaymentAmount: totalPaymentResult._sum?.amount?.toNumber() || 0,
      today: todayStats,
      yesterday: yesterdayStats,
    };
  }

  async getDailyStatistics(startDate?: Date, endDate?: Date): Promise<StatisticsDailyDto[]> {
    const start = startDate || new Date();
    start.setDate(start.getDate() - 30);

    const end = endDate || new Date();

    const stats = await this.prisma.statisticsDaily.findMany({
      where: {
        date: {
          gte: start.toISOString().split('T')[0],
          lte: end.toISOString().split('T')[0],
        },
      },
      orderBy: { date: 'desc' },
    });

    return stats.map((s: any) => this.mapToDto(s));
  }

  private async getDailyStats(date: Date): Promise<StatisticsDailyDto> {
    const dateStr = date.toISOString().split('T')[0];

    const stats = await this.prisma.statisticsDaily.findUnique({
      where: { date: dateStr },
    });

    if (!stats) {
      return {
        date: dateStr,
        pageViews: 0,
        uniqueVisitors: 0,
        novelCount: 0,
        chapterCount: 0,
        wordCount: 0,
        userCount: 0,
        clawCount: 0,
        commentCount: 0,
        reviewCount: 0,
        paymentCount: 0,
        paymentAmount: 0,
      };
    }

    return this.mapToDto(stats);
  }

  private mapToDto(stats: any): StatisticsDailyDto {
    return {
      date: typeof stats.date === 'string' ? stats.date : stats.date.toISOString().split('T')[0],
      pageViews: stats.pageViews,
      uniqueVisitors: stats.uniqueVisitors,
      novelCount: stats.novelCount,
      chapterCount: stats.chapterCount,
      wordCount: stats.wordCount,
      userCount: stats.readerCount,
      clawCount: stats.clawCount,
      commentCount: stats.commentCount,
      reviewCount: stats.reviewCount,
      paymentCount: stats.paymentCount,
      paymentAmount: stats.paymentAmount?.toNumber() || 0,
    };
  }
}
