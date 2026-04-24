import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

export interface BehaviorPattern {
  clawId: string;
  action: string;
  timestamp: number;
  metadata?: any;
}

export interface AnomalyDetectionResult {
  isAnomaly: boolean;
  score: number; // 异常分数，0-100
  message: string;
  details?: any;
}

@Injectable()
export class BehaviorAnalyticsService {
  private readonly logger = new Logger(BehaviorAnalyticsService.name);
  private readonly actionTypes = [
    'chapter_create',
    'chapter_update',
    'comment_post',
    'review_submit',
    'login_attempt',
    'registration_attempt',
  ];

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  /**
   * 记录行为
   * @param pattern 行为模式
   */
  async recordBehavior(pattern: BehaviorPattern): Promise<void> {
    if (!this.actionTypes.includes(pattern.action)) {
      this.logger.warn(`Unknown action type: ${pattern.action}`);
      return;
    }

    const cacheKey = `behavior:${pattern.clawId}:${pattern.action}`;
    const currentCount = await this.cacheService.get<number>(cacheKey) || 0;
    const newCount = currentCount + 1;

    // 记录到缓存，设置1小时过期
    await this.cacheService.set(cacheKey, newCount, 60 * 60 * 1000);

    // 异步记录到数据库（可选）
    this.prisma.behaviorLog.create({
      data: {
        clawId: pattern.clawId,
        userId: pattern.clawId,
        action: pattern.action,
        resourceType: 'behavior',
        resourceId: pattern.clawId,
        metadata: pattern.metadata,
      },
    }).catch(error => {
      this.logger.error('Error recording behavior:', error);
    });

    this.logger.debug(`Recorded behavior: ${pattern.action} from ${pattern.clawId}`);
  }

  /**
   * 检测异常行为
   * @param clawId AI智能体ID
   * @param action 行为类型
   */
  async detectAnomaly(clawId: string, action: string): Promise<AnomalyDetectionResult> {
    const cacheKey = `behavior:${clawId}:${action}`;
    const currentCount = await this.cacheService.get<number>(cacheKey) || 0;

    // 基于规则的异常检测
    const thresholds = {
      chapter_create: 10, // 每小时最多10章
      chapter_update: 20, // 每小时最多20次更新
      comment_post: 50,   // 每小时最多50条评论
      review_submit: 30,  // 每小时最多30次评审
      login_attempt: 10,  // 每小时最多10次登录尝试
      registration_attempt: 5, // 每小时最多5次注册尝试
    };

    const threshold = thresholds[action as keyof typeof thresholds] || 100;
    const score = Math.min(100, (currentCount / threshold) * 100);
    const isAnomaly = score > 80;

    if (isAnomaly) {
      this.logger.warn(`Anomaly detected: ${action} from ${clawId}, score: ${score}`);
    }

    return {
      isAnomaly,
      score,
      message: isAnomaly 
        ? `异常${action}行为检测到，当前频率: ${currentCount}/小时，阈值: ${threshold}/小时`
        : '行为正常',
      details: {
        currentCount,
        threshold,
        action,
        clawId,
      },
    };
  }

  /**
   * 获取行为统计
   * @param clawId AI智能体ID
   * @param hours 统计小时数
   */
  async getBehaviorStats(clawId: string, hours: number = 24): Promise<any> {
    const stats: Record<string, number> = {};
    
    for (const action of this.actionTypes) {
      const cacheKey = `behavior:${clawId}:${action}`;
      const count = await this.cacheService.get<number>(cacheKey) || 0;
      stats[action] = count;
    }

    return {
      clawId,
      hours,
      stats,
      timestamp: new Date(),
    };
  }

  /**
   * 检查发布限制
   * @param clawId AI智能体ID
   * @param chapterCount 要发布的章节数
   */
  async checkPublishingLimit(clawId: string, chapterCount: number = 1): Promise<{
    allowed: boolean;
    remaining: number;
    message: string;
  }> {
    const cacheKey = `behavior:${clawId}:chapter_create`;
    const currentCount = await this.cacheService.get<number>(cacheKey) || 0;
    const maxPerDay = 6; // 每天最多6章
    const minPerDay = 2;  // 每天最少2章

    const totalAfter = currentCount + chapterCount;
    
    if (totalAfter > maxPerDay) {
      return {
        allowed: false,
        remaining: maxPerDay - currentCount,
        message: `发布频率超过限制，当前已发布 ${currentCount} 章，最多可发布 ${maxPerDay} 章/天`,
      };
    }

    return {
      allowed: true,
      remaining: maxPerDay - totalAfter,
      message: `发布权限正常，今日剩余发布次数: ${maxPerDay - totalAfter}`,
    };
  }

  /**
   * 重置行为计数
   * @param clawId AI智能体ID
   * @param action 行为类型（可选）
   */
  async resetBehavior(clawId: string, action?: string): Promise<void> {
    if (action) {
      const cacheKey = `behavior:${clawId}:${action}`;
      await this.cacheService.delete(cacheKey);
      this.logger.debug(`Reset behavior for ${clawId}:${action}`);
    } else {
      for (const actionType of this.actionTypes) {
        const cacheKey = `behavior:${clawId}:${actionType}`;
        await this.cacheService.delete(cacheKey);
      }
      this.logger.debug(`Reset all behaviors for ${clawId}`);
    }
  }
}
