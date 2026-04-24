import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';

export interface IPLimitConfig {
  maxRequests: number;
  windowMs: number; // 时间窗口（毫秒）
}

@Injectable()
export class IPLimitService {
  private readonly logger = new Logger(IPLimitService.name);
  private readonly defaultConfig: IPLimitConfig = {
    maxRequests: 5,     // 每个IP 24小时内最多5次注册尝试
    windowMs: 24 * 60 * 60 * 1000, // 24小时
  };

  constructor(
    private cacheService: CacheService,
  ) {}

  /**
   * 检查IP限制
   * @param ip IP地址
   * @param key 限制类型（如 'registration', 'login' 等）
   * @param config 自定义配置
   */
  async check(ip: string, key: string, config?: Partial<IPLimitConfig>): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const finalConfig: IPLimitConfig = {
      ...this.defaultConfig,
      ...config,
    };

    const cacheKey = `ip_limit:${key}:${ip}`;
    const currentCount = await this.cacheService.get<number>(cacheKey) || 0;

    if (currentCount >= finalConfig.maxRequests) {
      const ttl = await this.cacheService.ttl(cacheKey);
      this.logger.warn(`IP ${ip} exceeded limit for ${key}: ${currentCount}/${finalConfig.maxRequests}`);
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: ttl > 0 ? Date.now() + ttl * 1000 : Date.now() + finalConfig.windowMs,
      };
    }

    return {
      allowed: true,
      remaining: finalConfig.maxRequests - currentCount - 1,
      resetTime: Date.now() + finalConfig.windowMs,
    };
  }

  /**
   * 记录请求
   * @param ip IP地址
   * @param key 限制类型
   * @param config 自定义配置
   */
  async record(ip: string, key: string, config?: Partial<IPLimitConfig>): Promise<void> {
    const finalConfig: IPLimitConfig = {
      ...this.defaultConfig,
      ...config,
    };

    const cacheKey = `ip_limit:${key}:${ip}`;
    const currentCount = await this.cacheService.get<number>(cacheKey) || 0;
    const newCount = currentCount + 1;

    await this.cacheService.set(cacheKey, newCount, finalConfig.windowMs);
    this.logger.debug(`Recorded request from IP ${ip} for ${key}: ${newCount}/${finalConfig.maxRequests}`);
  }

  /**
   * 检查并记录请求
   * @param ip IP地址
   * @param key 限制类型
   * @param config 自定义配置
   */
  async checkAndRecord(ip: string, key: string, config?: Partial<IPLimitConfig>): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const checkResult = await this.check(ip, key, config);
    
    if (checkResult.allowed) {
      await this.record(ip, key, config);
    }
    
    return checkResult;
  }

  /**
   * 重置IP限制
   * @param ip IP地址
   * @param key 限制类型
   */
  async reset(ip: string, key: string): Promise<void> {
    const cacheKey = `ip_limit:${key}:${ip}`;
    await this.cacheService.delete(cacheKey);
    this.logger.debug(`Reset limit for IP ${ip} and key ${key}`);
  }

  /**
   * 获取当前IP的请求计数
   * @param ip IP地址
   * @param key 限制类型
   */
  async getCount(ip: string, key: string): Promise<number> {
    const cacheKey = `ip_limit:${key}:${ip}`;
    return await this.cacheService.get<number>(cacheKey) || 0;
  }
}
