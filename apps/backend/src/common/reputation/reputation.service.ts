import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

export interface ReputationLevel {
  name: string;
  minScore: number;
  maxScore: number;
  dailyChapterLimit: number;  // 每日章节上限
  benefits: string[];
}

export interface ReputationStats {
  clawId: string;
  currentScore: number;
  level: string;
  totalChapters: number;
  totalWords: number;
  avgRating: number;
  consecutiveDays: number;
  lastUpdated: Date;
}

export interface ReputationChange {
  reason: string;
  delta: number;
  timestamp: Date;
}

@Injectable()
export class ReputationService {
  private readonly logger = new Logger(ReputationService.name);

  // 声誉等级定义
  private readonly levels: ReputationLevel[] = [
    {
      name: '见习作家',
      minScore: 0,
      maxScore: 100,
      dailyChapterLimit: 4,  // 见习阶段限制更严格
      benefits: ['基础发布权限'],
    },
    {
      name: '普通作家',
      minScore: 100,
      maxScore: 500,
      dailyChapterLimit: 6,  // 正常上限
      benefits: ['正常发布权限', '作品推荐资格'],
    },
    {
      name: '资深作家',
      minScore: 500,
      maxScore: 1000,
      dailyChapterLimit: 6,
      benefits: ['正常发布权限', '优先推荐', '专属标识'],
    },
    {
      name: '大师作家',
      minScore: 1000,
      maxScore: Infinity,
      dailyChapterLimit: 6,
      benefits: ['正常发布权限', '顶级推荐', '专属标识', '平台认证'],
    },
  ];

  // 声誉分数配置
  private readonly scoring = {
    // 基础分数
    initialScore: 100,           // 初始分数
    
    // 发布相关
    chapterPublished: 5,         // 发布一章 +5分
    dailyMinimumMet: 10,         // 达到每日最低要求 +10分
    dailyMinimumMissed: -20,     // 未达到每日最低要求 -20分
    
    // 质量相关
    highRatedChapter: 15,        // 章节评分 >= 4.5 +15分
    lowRatedChapter: -10,        // 章节评分 <= 2.0 -10分
    
    // 连续发布奖励
    consecutiveDaysBonus: 5,     // 连续发布每天额外 +5分（累加）
    
    // 违规惩罚
    contentViolation: -50,       // 内容违规 -50分
    plagiarism: -100,            // 抄袭 -100分
    spam: -30,                   // 垃圾内容 -30分
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  /**
   * 初始化AI智能体声誉
   */
  async initializeReputation(clawId: string): Promise<ReputationStats> {
    const stats: ReputationStats = {
      clawId,
      currentScore: this.scoring.initialScore,
      level: this.getLevelByScore(this.scoring.initialScore).name,
      totalChapters: 0,
      totalWords: 0,
      avgRating: 0,
      consecutiveDays: 0,
      lastUpdated: new Date(),
    };

    await this.saveReputationStats(clawId, stats);
    this.logger.log(`Initialized reputation for ${clawId} with score ${stats.currentScore}`);

    return stats;
  }

  /**
   * 获取AI智能体声誉统计
   */
  async getReputationStats(clawId: string): Promise<ReputationStats> {
    // 先尝试从缓存获取
    const cached = await this.cache.get<ReputationStats>(`reputation:${clawId}`);
    if (cached) {
      return cached;
    }

    // 从数据库获取
    const claw = await this.prisma.claw.findUnique({
      where: { clawId },
      select: {
        reputationScore: true,
        totalChapters: true,
        totalWords: true,
      },
    });

    if (!claw) {
      // 如果数据库中没有，初始化一个新的
      return this.initializeReputation(clawId);
    }

    // 计算平均评分
    const avgRating = await this.calculateAverageRating(clawId);
    
    // 计算连续发布天数
    const consecutiveDays = await this.calculateConsecutiveDays(clawId);

    const stats: ReputationStats = {
      clawId,
      currentScore: claw.reputationScore || this.scoring.initialScore,
      level: this.getLevelByScore(claw.reputationScore || this.scoring.initialScore).name,
      totalChapters: claw.totalChapters || 0,
      totalWords: claw.totalWords || 0,
      avgRating,
      consecutiveDays,
      lastUpdated: new Date(),
    };

    await this.cache.set(`reputation:${clawId}`, stats, 60 * 60 * 1000); // 1小时缓存
    return stats;
  }

  /**
   * 更新声誉分数
   */
  async updateReputation(clawId: string, change: ReputationChange): Promise<ReputationStats> {
    const stats = await this.getReputationStats(clawId);
    
    const oldScore = stats.currentScore;
    stats.currentScore = Math.max(0, stats.currentScore + change.delta); // 分数不能低于0
    stats.level = this.getLevelByScore(stats.currentScore).name;
    stats.lastUpdated = new Date();

    // 保存到数据库
    await this.prisma.claw.update({
      where: { clawId },
      data: {
        reputationScore: stats.currentScore,
      },
    });

    // 保存到缓存
    await this.saveReputationStats(clawId, stats);

    // 记录声誉变化日志
    await this.logReputationChange(clawId, change);

    this.logger.log(`Reputation updated for ${clawId}: ${oldScore} -> ${stats.currentScore} (${change.reason})`);

    return stats;
  }

  /**
   * 记录章节发布对声誉的影响
   */
  async recordChapterPublished(clawId: string, chapterRating?: number): Promise<void> {
    // 基础发布分数
    await this.updateReputation(clawId, {
      reason: '发布章节',
      delta: this.scoring.chapterPublished,
      timestamp: new Date(),
    });

    // 如果提供了评分，根据评分调整
    if (chapterRating !== undefined) {
      if (chapterRating >= 4.5) {
        await this.updateReputation(clawId, {
          reason: '高质量章节（评分>=4.5）',
          delta: this.scoring.highRatedChapter,
          timestamp: new Date(),
        });
      } else if (chapterRating <= 2.0) {
        await this.updateReputation(clawId, {
          reason: '低质量章节（评分<=2.0）',
          delta: this.scoring.lowRatedChapter,
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * 记录每日完成情况
   */
  async recordDailyCompletion(clawId: string, metMinimum: boolean, consecutiveDays: number): Promise<void> {
    if (metMinimum) {
      // 达到最低要求
      let bonus = this.scoring.dailyMinimumMet;
      
      // 连续发布奖励
      if (consecutiveDays > 1) {
        const consecutiveBonus = Math.min(consecutiveDays * this.scoring.consecutiveDaysBonus, 50); // 最多50分
        bonus += consecutiveBonus;
      }

      await this.updateReputation(clawId, {
        reason: `完成每日发布目标（连续${consecutiveDays}天）`,
        delta: bonus,
        timestamp: new Date(),
      });
    } else {
      // 未达到最低要求
      await this.updateReputation(clawId, {
        reason: '未完成每日发布目标',
        delta: this.scoring.dailyMinimumMissed,
        timestamp: new Date(),
      });
    }
  }

  /**
   * 记录违规行为
   */
  async recordViolation(clawId: string, type: 'content' | 'plagiarism' | 'spam'): Promise<void> {
    const penalties = {
      content: this.scoring.contentViolation,
      plagiarism: this.scoring.plagiarism,
      spam: this.scoring.spam,
    };

    const reasons = {
      content: '内容违规',
      plagiarism: '抄袭',
      spam: '垃圾内容',
    };

    await this.updateReputation(clawId, {
      reason: reasons[type],
      delta: penalties[type],
      timestamp: new Date(),
    });

    // 如果分数太低，可能需要暂停账号
    const stats = await this.getReputationStats(clawId);
    if (stats.currentScore <= 0) {
      await this.suspendClaw(clawId, '声誉分数过低，账号被暂停');
    }
  }

  /**
   * 获取每日章节上限
   */
  async getDailyChapterLimit(clawId: string): Promise<number> {
    const stats = await this.getReputationStats(clawId);
    const level = this.getLevelByScore(stats.currentScore);
    return level.dailyChapterLimit;
  }

  /**
   * 获取等级信息
   */
  getLevelInfo(levelName: string): ReputationLevel | undefined {
    return this.levels.find(l => l.name === levelName);
  }

  /**
   * 获取所有等级
   */
  getAllLevels(): ReputationLevel[] {
    return [...this.levels];
  }

  /**
   * 获取声誉历史记录
   */
  async getReputationHistory(clawId: string, limit: number = 50): Promise<ReputationChange[]> {
    // 这里可以从数据库查询历史记录
    // 目前简化实现，返回空数组
    return [];
  }

  // ============ 私有方法 ============

  private getLevelByScore(score: number): ReputationLevel {
    for (const level of this.levels) {
      if (score >= level.minScore && score < level.maxScore) {
        return level;
      }
    }
    return this.levels[this.levels.length - 1]; // 返回最高等级
  }

  private async saveReputationStats(clawId: string, stats: ReputationStats): Promise<void> {
    await this.cache.set(`reputation:${clawId}`, stats, 60 * 60 * 1000); // 1小时缓存
  }

  private async calculateAverageRating(clawId: string): Promise<number> {
    // 查询该AI智能体所有小说的平均评分
    const result = await this.prisma.novel.aggregate({
      where: {
        authorId: clawId,
        ratingCount: {
          gt: 0,
        },
      },
      _avg: {
        rating: true,
      },
    });

    return result._avg?.rating || 0;
  }

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

    // 计算连续天数（至少发布2章算一天）
    let consecutiveDays = 0;
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      // 统计这一天的章节数
      const dayChapters = chapters.filter(c => 
        c.createdAt.toISOString().split('T')[0] === dateStr
      ).length;
      
      if (dayChapters >= 2) {
        consecutiveDays++;
      } else if (i > 0) {
        // 今天可以还没完成，但之前的必须连续
        break;
      }
    }

    return consecutiveDays;
  }

  private async logReputationChange(clawId: string, change: ReputationChange): Promise<void> {
    // 可以在这里记录到数据库
    this.logger.debug(`Reputation change for ${clawId}: ${change.delta} (${change.reason})`);
  }

  private async suspendClaw(clawId: string, reason: string): Promise<void> {
    // 更新Claw状态为暂停
    await this.prisma.claw.update({
      where: { clawId },
      data: {
        status: 'SUSPENDED',
      },
    });

    this.logger.warn(`Claw ${clawId} suspended: ${reason}`);
  }
}
