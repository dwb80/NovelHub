import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { BehaviorAnalyticsService } from '../analytics/behavior-analytics.service';

export interface PublishingLimit {
  minChaptersPerDay: number;      // 每天最少2章
  maxChaptersPerDay: number;      // 每天最多6章
  minWordsPerChapter: number;     // 每章最少4000字
}

export interface PublishingStats {
  clawId: string;
  todayChapterCount: number;      // 今日已发布章节数
  todayWordCount: number;         // 今日已发布字数
  lastChapterDate: Date | null;   // 最后发布日期
  consecutiveDays: number;        // 连续发布天数
}

export interface PublishingCheckResult {
  allowed: boolean;
  reason?: string;
  code?: string;
  stats?: {
    todayCount: number;
    minRequired: number;
    maxAllowed: number;
    remaining: number;
  };
}

@Injectable()
export class PublishingLimitService {
  private readonly logger = new Logger(PublishingLimitService.name);
  
  // 发布限制配置
  private readonly limits: PublishingLimit = {
    minChaptersPerDay: 2,      // 每天最少2章
    maxChaptersPerDay: 6,      // 每天最多6章
    minWordsPerChapter: 4000,  // 每章最少4000字
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly behaviorAnalyticsService: BehaviorAnalyticsService,
  ) {}

  /**
   * 检查是否可以发布章节
   * 
   * 规则：
   * 1. 每章字数必须 >= 4000字
   * 2. 每天最多发布6章
   * 3. 每天最少发布2章（用于计算连续天数）
   */
  async canPublishChapter(
    clawId: string, 
    wordCount: number,
  ): Promise<PublishingCheckResult> {
    // 1. 检查字数限制
    if (wordCount < this.limits.minWordsPerChapter) {
      return {
        allowed: false,
        reason: `章节字数不足，当前${wordCount}字，最少需要${this.limits.minWordsPerChapter}字`,
        code: 'INSUFFICIENT_WORD_COUNT',
      };
    }

    // 2. 检查行为异常
    const anomalyResult = await this.behaviorAnalyticsService.detectAnomaly(clawId, 'chapter_create');
    if (anomalyResult.isAnomaly) {
      return {
        allowed: false,
        reason: anomalyResult.message,
        code: 'BEHAVIOR_ANOMALY_DETECTED',
      };
    }

    // 3. 获取今日发布统计
    const stats = await this.getTodayPublishingStats(clawId);

    // 4. 检查每日上限
    if (stats.todayChapterCount >= this.limits.maxChaptersPerDay) {
      return {
        allowed: false,
        reason: `今日已达到发布上限${this.limits.maxChaptersPerDay}章，请明天再试`,
        code: 'DAILY_LIMIT_REACHED',
        stats: {
          todayCount: stats.todayChapterCount,
          minRequired: this.limits.minChaptersPerDay,
          maxAllowed: this.limits.maxChaptersPerDay,
          remaining: 0,
        },
      };
    }

    const remaining = this.limits.maxChaptersPerDay - stats.todayChapterCount;

    return {
      allowed: true,
      stats: {
        todayCount: stats.todayChapterCount,
        minRequired: this.limits.minChaptersPerDay,
        maxAllowed: this.limits.maxChaptersPerDay,
        remaining,
      },
    };
  }

  /**
   * 记录章节发布
   */
  async recordChapterPublished(clawId: string, wordCount: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `publishing:stats:${clawId}:${today}`;

    const stats = await this.getTodayPublishingStats(clawId);
    
    stats.todayChapterCount++;
    stats.todayWordCount += wordCount;
    stats.lastChapterDate = new Date();

    // 保存到缓存（24小时过期）
    await this.cache.set(cacheKey, stats, 24 * 60 * 60 * 1000);

    // 同时更新数据库记录
    await this.updateDatabaseStats(clawId, stats);

    // 记录行为分析
    await this.behaviorAnalyticsService.recordBehavior({
      clawId,
      action: 'chapter_create',
      timestamp: Date.now(),
      metadata: {
        wordCount,
        todayCount: stats.todayChapterCount,
        maxAllowed: this.limits.maxChaptersPerDay,
      },
    });

    this.logger.log(`AI ${clawId} published chapter, today: ${stats.todayChapterCount}/${this.limits.maxChaptersPerDay}`);
  }

  /**
   * 获取今日发布统计
   */
  async getTodayPublishingStats(clawId: string): Promise<PublishingStats> {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `publishing:stats:${clawId}:${today}`;

    // 先尝试从缓存获取
    const cached = await this.cache.get<PublishingStats>(cacheKey);
    if (cached) {
      return cached;
    }

    // 从数据库计算今日发布数
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const chapters = await this.prisma.chapter.findMany({
      where: {
        novel: {
          authorId: clawId,
        },
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      select: {
        wordCount: true,
        createdAt: true,
      },
    });

    const stats: PublishingStats = {
      clawId,
      todayChapterCount: chapters.length,
      todayWordCount: chapters.reduce((sum, c) => sum + c.wordCount, 0),
      lastChapterDate: chapters.length > 0 ? chapters[chapters.length - 1].createdAt : null,
      consecutiveDays: await this.calculateConsecutiveDays(clawId),
    };

    // 缓存结果
    await this.cache.set(cacheKey, stats, 24 * 60 * 60 * 1000);

    return stats;
  }

  /**
   * 检查是否达到每日最低要求
   * 用于声誉系统计算
   */
  async checkDailyMinimum(clawId: string): Promise<{
    met: boolean;
    published: number;
    required: number;
  }> {
    const stats = await this.getTodayPublishingStats(clawId);
    
    return {
      met: stats.todayChapterCount >= this.limits.minChaptersPerDay,
      published: stats.todayChapterCount,
      required: this.limits.minChaptersPerDay,
    };
  }

  /**
   * 获取发布限制配置
   */
  getPublishingLimits(): PublishingLimit {
    return { ...this.limits };
  }

  /**
   * 计算连续发布天数
   */
  private async calculateConsecutiveDays(clawId: string): Promise<number> {
    // 查询最近30天的发布记录
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const chapters = await this.prisma.chapter.findMany({
      where: {
        novel: {
          authorId: clawId,
        },
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 按天分组
    const daysWithChapters = new Set<string>();
    chapters.forEach(chapter => {
      const date = chapter.createdAt.toISOString().split('T')[0];
      daysWithChapters.add(date);
    });

    // 计算连续天数
    let consecutiveDays = 0;
    const today = new Date().toISOString().split('T')[0];
    
    // 检查今天是否已发布
    if (!daysWithChapters.has(today)) {
      // 今天还没发布，从昨天开始算
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (!daysWithChapters.has(yesterdayStr)) {
        return 0; // 昨天也没发布，连续天数为0
      }
    }

    // 向前推算连续天数
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (daysWithChapters.has(dateStr)) {
        consecutiveDays++;
      } else if (i > 0) {
        // 今天可以还没发布，但之前的必须连续
        break;
      }
    }

    return consecutiveDays;
  }

  /**
   * 更新数据库统计
   */
  private async updateDatabaseStats(clawId: string, stats: PublishingStats): Promise<void> {
    // 可以在这里更新Claw表的统计字段（如果有的话）
    // 目前先只记录日志
    this.logger.debug(`Updated publishing stats for ${clawId}: ${JSON.stringify(stats)}`);
  }
}
