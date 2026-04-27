import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NovelStatus, Prisma } from '@prisma/client';
import { RankingType, RankingPeriod } from '../common/constants';

@Injectable()
export class DiscoverService {
  constructor(private prisma: PrismaService) { }

  /**
   * 获取发现页分类导航统计
   * 按男频/女频/出版三大频道聚合分类及小说数量
   */
  async getCategoryStats(): Promise<{
    male: { category: string; count: number }[];
    female: { category: string; count: number }[];
    published: { category: string; count: number }[];
  }> {
    const categories = await this.prisma.novel.groupBy({
      by: ['category'],
      where: { status: NovelStatus.PUBLISHED },
      _count: true,
    });

    const categoryMap = new Map(categories.map(c => [c.category, c._count]));

    const MALE_CATEGORIES = ['xuanhuan', 'dushi', 'xianxia', 'kehuan', 'lishi', 'wuxia', 'junshi', 'youxi'];
    const FEMALE_CATEGORIES = ['yanqing', 'guyan', 'xianyan', 'xuanyi', 'chuanyue', 'gongdou', 'zhichang', 'qingchun'];
    const PUBLISHED_CATEGORIES = ['classic', 'literature', 'history', 'philosophy', 'biography'];

    const mapCategories = (keys: string[]) =>
      keys.map(category => ({
        category,
        count: categoryMap.get(category as any) || 0,
      }));

    return {
      male: mapCategories(MALE_CATEGORIES),
      female: mapCategories(FEMALE_CATEGORIES),
      published: mapCategories(PUBLISHED_CATEGORIES),
    };
  }

  /**
   * 获取排行榜数据
   * @param type 排行榜类型
   * @param period 时间范围
   * @param limit 返回数量
   */
  async getRankings(
    type: RankingType = RankingType.HOT,
    period: RankingPeriod = RankingPeriod.WEEKLY,
    limit: number = 20,
  ): Promise<any[]> {
    let orderBy: Prisma.NovelOrderByWithRelationInput = { viewCount: 'desc' };
    let where: Prisma.NovelWhereInput = { status: NovelStatus.PUBLISHED };

    const now = new Date();
    switch (period) {
      case RankingPeriod.DAILY:
        where.updatedAt = { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
        break;
      case RankingPeriod.WEEKLY:
        where.updatedAt = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case RankingPeriod.MONTHLY:
        where.updatedAt = { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
    }

    switch (type) {
      case RankingType.HOT:
        orderBy = { viewCount: 'desc' };
        break;
      case RankingType.FAVORITE:
      case RankingType.RATING:
        orderBy = { rating: 'desc' };
        break;
      case RankingType.NEW:
        orderBy = { createdAt: 'desc' };
        break;
      case RankingType.COMPLETED:
        where.serial_status = 'COMPLETED';
        orderBy = { updatedAt: 'desc' };
        break;
    }

    const novels = await this.prisma.novel.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            reputationScore: true,
          },
        },
      },
    });

    return novels.map(n => ({
      id: n.id,
      title: n.title,
      cover: n.cover,
      category: n.category,
      wordCount: n.wordCount,
      rating: n.rating,
      viewCount: n.viewCount,
      authorName: n.author?.displayName,
    }));
  }

  /**
   * 热门搜索关键词
   */
  async getHotSearches(limit: number = 10): Promise<string[]> {
    return [
      '斗破苍穹',
      '完美世界',
      '遮天',
      '凡人修仙传',
      '诡秘之主',
      '道诡异仙',
      '大奉打更人',
      '剑来',
      '雪中悍刀行',
      '庆余年',
    ].slice(0, limit);
  }
}
