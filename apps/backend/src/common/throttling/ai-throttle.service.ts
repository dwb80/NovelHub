import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../cache/cache.service';

export interface ThrottleConfig {
  maxActivationsPerDay: number;
  maxCreationsPerSecond: number;
  maxCreationsPerMinute: number;
  maxCreationsPerHour: number;
  timeWindowHours: number[];
}

export interface AIStatus {
  clawId: string;
  status: 'active' | 'hibernating' | 'suspended';
  activationTime: Date;
  lastCreationTime: Date | null;
  dailyCreationCount: number;
  reputationScore: number;
  timeSlot: number;
}

@Injectable()
export class AIThrottleService {
  private readonly logger = new Logger(AIThrottleService.name);
  private readonly config: ThrottleConfig;

  constructor(
    private readonly cache: CacheService,
    private readonly configService: ConfigService,
  ) {
    this.config = {
      maxActivationsPerDay: this.configService.get<number>('AI_MAX_ACTIVATIONS_PER_DAY', 1000),
      maxCreationsPerSecond: this.configService.get<number>('AI_MAX_CREATIONS_PER_SECOND', 10),
      maxCreationsPerMinute: this.configService.get<number>('AI_MAX_CREATIONS_PER_MINUTE', 100),
      maxCreationsPerHour: this.configService.get<number>('AI_MAX_CREATIONS_PER_HOUR', 1000),
      timeWindowHours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    };
  }

  async canActivate(): Promise<{ allowed: boolean; reason?: string }> {
    const today = new Date().toISOString().split('T')[0];
    const key = `ai:activation:count:${today}`;

    const currentCount = (await this.cache.get<number>(key)) || 0;

    if (currentCount >= this.config.maxActivationsPerDay) {
      return {
        allowed: false,
        reason: `Daily activation limit reached: ${currentCount}/${this.config.maxActivationsPerDay}`,
      };
    }

    return { allowed: true };
  }

  async recordActivation(clawId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const key = `ai:activation:count:${today}`;

    const currentCount = (await this.cache.get<number>(key)) || 0;
    await this.cache.set(key, currentCount + 1, 24 * 60 * 60 * 1000);

    const timeSlot = this.calculateTimeSlot(clawId);
    const status: AIStatus = {
      clawId,
      status: 'active',
      activationTime: new Date(),
      lastCreationTime: null,
      dailyCreationCount: 0,
      reputationScore: 50,
      timeSlot,
    };

    await this.cache.set(`ai:status:${clawId}`, status, 24 * 60 * 60 * 1000);

    this.logger.log(`AI ${clawId} activated, timeSlot: ${timeSlot}`);
  }

  /**
   * 更新AI状态中的时间段
   * 
   * 此方法在AI选择时间段时被调用，确保AI状态中的timeSlot与数据库和Redis时段分配保持一致。
   * 如果不调用此方法，canCreate检查会因为时段不匹配而拒绝创作请求。
   * 
   * @param clawId AI智能体ID
   * @param timeSlot 新的时间段（0-23）
   */
  async updateTimeSlot(clawId: string, timeSlot: number): Promise<void> {
    const status = await this.getAIStatus(clawId);
    if (status) {
      status.timeSlot = timeSlot;
      await this.cache.set(`ai:status:${clawId}`, status, 24 * 60 * 60 * 1000);
      this.logger.log(`AI ${clawId} timeSlot updated to ${timeSlot}`);
    }
  }

  async canCreate(clawId: string): Promise<{ allowed: boolean; reason?: string; retryAfter?: number }> {
    const globalLimit = await this.checkGlobalRateLimit();
    if (!globalLimit.allowed) {
      return globalLimit;
    }

    const status = await this.getAIStatus(clawId);
    if (!status) {
      return { allowed: false, reason: 'AI not activated' };
    }

    if (status.status === 'suspended') {
      return { allowed: false, reason: 'AI is suspended' };
    }

    if (status.status === 'hibernating') {
      return { allowed: false, reason: 'AI is hibernating', retryAfter: 3600 };
    }

    const currentHour = new Date().getHours();
    if (currentHour !== status.timeSlot) {
      return {
        allowed: false,
        reason: `Not in allowed time window. Your slot: ${status.timeSlot}:00, current: ${currentHour}:00`,
        retryAfter: this.calculateRetryAfter(status.timeSlot),
      };
    }

    const personalLimit = await this.checkPersonalRateLimit(clawId);
    if (!personalLimit.allowed) {
      return personalLimit;
    }

    return { allowed: true };
  }

  async recordCreation(clawId: string): Promise<void> {
    const now = new Date();
    const status = await this.getAIStatus(clawId);

    if (status) {
      status.lastCreationTime = now;
      status.dailyCreationCount++;
      await this.cache.set(`ai:status:${clawId}`, status, 24 * 60 * 60 * 1000);
    }

    const second = now.getSeconds();
    const minute = now.getMinutes();
    const hour = now.getHours();

    const secondKey = `ai:creation:second:${second}`;
    const minuteKey = `ai:creation:minute:${minute}`;
    const hourKey = `ai:creation:hour:${hour}`;

    const secondCount = (await this.cache.get<number>(secondKey)) || 0;
    const minuteCount = (await this.cache.get<number>(minuteKey)) || 0;
    const hourCount = (await this.cache.get<number>(hourKey)) || 0;

    await Promise.all([
      this.cache.set(secondKey, secondCount + 1, 2000),
      this.cache.set(minuteKey, minuteCount + 1, 120000),
      this.cache.set(hourKey, hourCount + 1, 7200000),
    ]);
  }

  async hibernate(clawId: string): Promise<void> {
    const status = await this.getAIStatus(clawId);
    if (status) {
      status.status = 'hibernating';
      await this.cache.set(`ai:status:${clawId}`, status, 24 * 60 * 60 * 1000);
      this.logger.log(`AI ${clawId} hibernated`);
    }
  }

  async wakeUp(clawId: string): Promise<void> {
    const status = await this.getAIStatus(clawId);
    if (status && status.status === 'hibernating') {
      status.status = 'active';
      await this.cache.set(`ai:status:${clawId}`, status, 24 * 60 * 60 * 1000);
      this.logger.log(`AI ${clawId} woken up`);
    }
  }

  async suspend(clawId: string, reason: string): Promise<void> {
    const status = await this.getAIStatus(clawId);
    if (status) {
      status.status = 'suspended';
      await this.cache.set(`ai:status:${clawId}`, status, 24 * 60 * 60 * 1000);
      await this.cache.set(`ai:suspend:reason:${clawId}`, reason, 24 * 60 * 60 * 1000);
      this.logger.warn(`AI ${clawId} suspended: ${reason}`);
    }
  }

  async getAIStatus(clawId: string): Promise<AIStatus | null> {
    const status = await this.cache.get<AIStatus>(`ai:status:${clawId}`);
    return status || null;
  }

  async getSystemStats(): Promise<{
    totalActive: number;
    totalHibernating: number;
    totalSuspended: number;
    todayActivations: number;
    currentCreationsPerSecond: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const todayActivations = (await this.cache.get<number>(`ai:activation:count:${today}`)) || 0;

    const second = new Date().getSeconds();
    const currentCreationsPerSecond = (await this.cache.get<number>(`ai:creation:second:${second}`)) || 0;

    return {
      totalActive: 0,
      totalHibernating: 0,
      totalSuspended: 0,
      todayActivations,
      currentCreationsPerSecond,
    };
  }

  private calculateTimeSlot(clawId: string): number {
    let hash = 0;
    for (let i = 0; i < clawId.length; i++) {
      hash = ((hash << 5) - hash) + clawId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) % 24;
  }

  private async checkGlobalRateLimit(): Promise<{ allowed: boolean; reason?: string; retryAfter?: number }> {
    const second = new Date().getSeconds();
    const minute = new Date().getMinutes();
    const hour = new Date().getHours();

    const [secondCount, minuteCount, hourCount] = await Promise.all([
      this.cache.get<number>(`ai:creation:second:${second}`),
      this.cache.get<number>(`ai:creation:minute:${minute}`),
      this.cache.get<number>(`ai:creation:hour:${hour}`),
    ]);

    if ((secondCount || 0) >= this.config.maxCreationsPerSecond) {
      return { allowed: false, reason: 'Global rate limit exceeded (per second)', retryAfter: 1 };
    }

    if ((minuteCount || 0) >= this.config.maxCreationsPerMinute) {
      return { allowed: false, reason: 'Global rate limit exceeded (per minute)', retryAfter: 60 };
    }

    if ((hourCount || 0) >= this.config.maxCreationsPerHour) {
      return { allowed: false, reason: 'Global rate limit exceeded (per hour)', retryAfter: 3600 };
    }

    return { allowed: true };
  }

  private async checkPersonalRateLimit(clawId: string): Promise<{ allowed: boolean; reason?: string }> {
    const status = await this.getAIStatus(clawId);
    if (!status) return { allowed: false, reason: 'AI status not found' };

    const reputationFactor = Math.max(0.5, status.reputationScore / 100);
    const personalLimit = Math.floor(10 * reputationFactor);

    if (status.dailyCreationCount >= personalLimit) {
      return { allowed: false, reason: `Personal daily limit reached: ${status.dailyCreationCount}/${personalLimit}` };
    }

    return { allowed: true };
  }

  private calculateRetryAfter(targetHour: number): number {
    const now = new Date();
    const currentHour = now.getHours();
    let hoursDiff = targetHour - currentHour;
    if (hoursDiff < 0) hoursDiff += 24;
    return hoursDiff * 3600 - now.getMinutes() * 60 - now.getSeconds();
  }
}
