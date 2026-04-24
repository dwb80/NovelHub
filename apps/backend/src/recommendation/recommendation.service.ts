import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../common/cache/cache.service';
import { RecommendedNovelDto, RecommendationReason } from './dto/recommended-novel.dto';
import { NovelStatus } from '@prisma/client';

interface UserBehavior {
  novelId: string;
  score: number;
  type: 'VIEW' | 'LIKE' | 'BOOKMARK' | 'READ';
}

interface NovelFeature {
  id: string;
  category: string;
  tags: string[];
  authorId: string;
  rating: number;
  viewCount: number;
}

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);
  private readonly CACHE_TTL = 3600; // 1小时

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  /**
   * 获取个性化推荐
   * 基于协同过滤和内容推荐混合算法
   */
  async getPersonalizedRecommendations(readerId: string, limit: number = 10): Promise<RecommendedNovelDto[]> {
    const cacheKey = `recommendations:${readerId}`;
    const cached = await this.cache.get<RecommendedNovelDto[]>(cacheKey);
    if (cached) {
      return cached.slice(0, limit);
    }

    // 1. 获取用户行为数据
    const userBehaviors = await this.getUserBehaviors(readerId);
    
    // 2. 如果用户没有行为记录，返回热门推荐
    if (userBehaviors.length === 0) {
      const trending = await this.getTrendingNovels(limit);
      await this.cache.set(cacheKey, trending, this.CACHE_TTL);
      return trending;
    }

    // 3. 基于内容的推荐
    const contentBasedRecommendations = await this.contentBasedRecommendations(userBehaviors, limit);
    
    // 4. 协同过滤推荐
    const collaborativeRecommendations = await this.collaborativeFiltering(readerId, limit);
    
    // 5. 混合推荐结果
    const mixedRecommendations = this.mixRecommendations(
      contentBasedRecommendations,
      collaborativeRecommendations,
      limit,
    );

    await this.cache.set(cacheKey, mixedRecommendations, this.CACHE_TTL);
    return mixedRecommendations;
  }

  /**
   * 获取相似小说推荐
   * 基于内容相似度计算
   */
  async getSimilarNovels(novelId: string, limit: number = 10): Promise<RecommendedNovelDto[]> {
    const cacheKey = `similar:${novelId}`;
    const cached = await this.cache.get<RecommendedNovelDto[]>(cacheKey);
    if (cached) {
      return cached.slice(0, limit);
    }

    const sourceNovel = await this.prisma.novel.findUnique({
      where: { id: novelId },
      include: { author: true },
    });

    if (!sourceNovel) {
      return [];
    }

    // 获取同分类、同AI智能体作家或相似标签的小说
    const similarNovels = await this.prisma.novel.findMany({
      where: {
        id: { not: novelId },
        status: NovelStatus.PUBLISHED,
        OR: [
          { category: sourceNovel.category },
          { authorId: sourceNovel.authorId },
          { tags: { hasSome: sourceNovel.tags } },
        ],
      },
      take: limit * 2,
      include: { author: true },
    });

    // 计算相似度分数
    const scoredNovels = similarNovels.map(novel => {
      let score = 0;
      const reasons: RecommendationReason[] = [];

      // 同分类加分
      if (novel.category === sourceNovel.category) {
        score += 30;
        reasons.push(RecommendationReason.SAME_CATEGORY);
      }

      // 同AI智能体作家加分
      if (novel.authorId === sourceNovel.authorId) {
        score += 40;
        reasons.push(RecommendationReason.SAME_AUTHOR);
      }

      // 标签相似度
      const commonTags = novel.tags.filter(tag => sourceNovel.tags.includes(tag));
      if (commonTags.length > 0) {
        score += commonTags.length * 10;
        reasons.push(RecommendationReason.SIMILAR_TAGS);
      }

      // 评分和热度加成
      score += novel.rating * 5;
      score += Math.min(novel.viewCount / 1000, 20);

      return {
        novel,
        score,
        reasons: [...new Set(reasons)],
      };
    });

    // 按分数排序并返回
    const recommendations = scoredNovels
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => this.mapToRecommendedNovel(item.novel, item.score, item.reasons));

    await this.cache.set(cacheKey, recommendations, this.CACHE_TTL);
    return recommendations;
  }

  /**
   * 获取热门小说推荐
   */
  async getTrendingNovels(limit: number = 10): Promise<RecommendedNovelDto[]> {
    const cacheKey = 'trending:novels';
    const cached = await this.cache.get<RecommendedNovelDto[]>(cacheKey);
    if (cached) {
      return cached.slice(0, limit);
    }

    const novels = await this.prisma.novel.findMany({
      where: { status: NovelStatus.PUBLISHED },
      orderBy: [
        { viewCount: 'desc' },
        { rating: 'desc' },
      ],
      take: limit,
      include: { author: true },
    });

    const recommendations = novels.map((novel, index) => 
      this.mapToRecommendedNovel(
        novel, 
        100 - index * 5, 
        [RecommendationReason.TRENDING],
      ),
    );

    await this.cache.set(cacheKey, recommendations, this.CACHE_TTL / 2); // 30分钟缓存
    return recommendations;
  }

  /**
   * 获取新书推荐
   */
  async getNewNovels(limit: number = 10): Promise<RecommendedNovelDto[]> {
    const cacheKey = 'new:novels';
    const cached = await this.cache.get<RecommendedNovelDto[]>(cacheKey);
    if (cached) {
      return cached.slice(0, limit);
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const novels = await this.prisma.novel.findMany({
      where: {
        status: NovelStatus.PUBLISHED,
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { author: true },
    });

    const recommendations = novels.map(novel => 
      this.mapToRecommendedNovel(
        novel, 
        80, 
        [RecommendationReason.NEW_RELEASE],
      ),
    );

    await this.cache.set(cacheKey, recommendations, this.CACHE_TTL);
    return recommendations;
  }

  /**
   * 获取用户行为数据
   */
  private async getUserBehaviors(readerId: string): Promise<UserBehavior[]> {
    const behaviors: UserBehavior[] = [];

    // 获取阅读历史
    const readingHistory = await this.prisma.readingHistory.findMany({
      where: { readerId },
      take: 50,
    });
    readingHistory.forEach(h => {
      behaviors.push({ novelId: h.novelId, score: 3, type: 'READ' });
    });

    // 获取书架记录
    const bookshelf = await this.prisma.bookshelf.findMany({
      where: { readerId },
    });
    bookshelf.forEach(b => {
      behaviors.push({ novelId: b.novelId, score: 5, type: 'BOOKMARK' });
    });

    return behaviors;
  }

  /**
   * 基于内容的推荐
   */
  private async contentBasedRecommendations(
    behaviors: UserBehavior[], 
    limit: number,
  ): Promise<Array<{ novel: any; score: number; reasons: RecommendationReason[] }>> {
    // 获取用户喜欢的小说特征
    const likedNovelIds = behaviors
      .filter(b => b.score >= 3)
      .map(b => b.novelId);

    if (likedNovelIds.length === 0) {
      return [];
    }

    const likedNovels = await this.prisma.novel.findMany({
      where: { id: { in: likedNovelIds } },
    });

    // 提取用户偏好特征
    const userCategories = [...new Set(likedNovels.map(n => n.category))];
    const userTags = [...new Set(likedNovels.flatMap(n => n.tags))];
    const userAuthors = [...new Set(likedNovels.map(n => n.authorId))];

    // 查找相似小说
    const candidates = await this.prisma.novel.findMany({
      where: {
        id: { notIn: likedNovelIds },
        status: NovelStatus.PUBLISHED,
        OR: [
          { category: { in: userCategories } },
          { tags: { hasSome: userTags } },
          { authorId: { in: userAuthors } },
        ],
      },
      take: limit * 3,
      include: { author: true },
    });

    return candidates.map(novel => {
      let score = 0;
      const reasons: RecommendationReason[] = [];

      if (userCategories.includes(novel.category)) {
        score += 25;
        reasons.push(RecommendationReason.SAME_CATEGORY);
      }

      const commonTags = novel.tags.filter(tag => userTags.includes(tag));
      if (commonTags.length > 0) {
        score += commonTags.length * 8;
        reasons.push(RecommendationReason.SIMILAR_TAGS);
      }

      if (userAuthors.includes(novel.authorId)) {
        score += 20;
        reasons.push(RecommendationReason.SAME_AUTHOR);
      }

      score += novel.rating * 3;

      return { novel, score, reasons: [...new Set(reasons)] };
    });
  }

  /**
   * 协同过滤推荐
   */
  private async collaborativeFiltering(
    readerId: string, 
    limit: number,
  ): Promise<Array<{ novel: any; score: number; reasons: RecommendationReason[] }>> {
    // 简化实现：找到相似用户（有相似阅读记录的用户）
    const userNovels = await this.prisma.readingHistory.findMany({
      where: { readerId },
      select: { novelId: true },
    });
    const userNovelIds = userNovels.map(n => n.novelId);

    if (userNovelIds.length === 0) {
      return [];
    }

    // 找到有相似阅读记录的其他用户
    const similarUsers = await this.prisma.readingHistory.groupBy({
      by: ['readerId'],
      where: {
        novelId: { in: userNovelIds },
        readerId: { not: readerId },
      },
      _count: { novelId: true },
      having: { novelId: { _count: { gte: 2 } } }, // 至少有2本共同阅读
      orderBy: { _count: { novelId: 'desc' } },
      take: 20,
    });

    if (similarUsers.length === 0) {
      return [];
    }

    const similarUserIds = similarUsers.map((u: { readerId: string }) => u.readerId);

    // 获取这些用户阅读但目标用户未阅读的小说
    const similarUserNovels = await this.prisma.readingHistory.findMany({
      where: {
        readerId: { in: similarUserIds },
        novelId: { notIn: userNovelIds },
      },
      distinct: ['novelId'],
      take: limit * 2,
    });

    // 获取小说详情
    const novelIds = similarUserNovels.map(n => n.novelId);
    const novels = await this.prisma.novel.findMany({
      where: { id: { in: novelIds } },
      include: { author: true },
    });
    const novelMap = new Map(novels.map(n => [n.id, n]));

    return similarUserNovels.map((r) => ({
      novel: novelMap.get(r.novelId),
      score: 60,
      reasons: [RecommendationReason.COLLABORATIVE],
    })).filter(item => item.novel);
  }

  /**
   * 混合推荐结果
   */
  private mixRecommendations(
    contentBased: Array<{ novel: any; score: number; reasons: RecommendationReason[] }>,
    collaborative: Array<{ novel: any; score: number; reasons: RecommendationReason[] }>,
    limit: number,
  ): RecommendedNovelDto[] {
    const mixed = new Map<string, { novel: any; score: number; reasons: Set<RecommendationReason> }>();

    // 添加基于内容的推荐 (权重 0.6)
    contentBased.forEach(item => {
      mixed.set(item.novel.id, {
        novel: item.novel,
        score: item.score * 0.6,
        reasons: new Set(item.reasons),
      });
    });

    // 添加协同过滤推荐 (权重 0.4)
    collaborative.forEach(item => {
      const existing = mixed.get(item.novel.id);
      if (existing) {
        existing.score += item.score * 0.4;
        item.reasons.forEach(r => existing.reasons.add(r));
      } else {
        mixed.set(item.novel.id, {
          novel: item.novel,
          score: item.score * 0.4,
          reasons: new Set(item.reasons),
        });
      }
    });

    // 排序并返回
    return Array.from(mixed.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => this.mapToRecommendedNovel(item.novel, item.score, Array.from(item.reasons)));
  }

  /**
   * 映射为推荐DTO
   */
  private mapToRecommendedNovel(
    novel: any, 
    score: number, 
    reasons: RecommendationReason[],
  ): RecommendedNovelDto {
    return {
      id: novel.id,
      title: novel.title,
      cover: novel.cover,
      author: {
        id: novel.author.id,
        name: novel.author.name,
      },
      category: novel.category,
      tags: novel.tags,
      rating: novel.rating,
      viewCount: novel.viewCount,
      recommendationScore: Math.min(Math.round(score), 100),
      reasons,
    };
  }
}
