import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

interface CacheItem<T> {
  value: T;
  expiry: number;
}

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redis: Redis | null = null;
  private localCache: Map<string, CacheItem<any>> = new Map();
  private readonly defaultTTL = 5 * 60 * 1000;
  private useRedis = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const redisHost = this.configService.get('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get('REDIS_PORT', 6379);
    const redisPassword = this.configService.get('REDIS_PASSWORD');
    const redisDb = this.configService.get('REDIS_DB', 0);

    try {
      this.redis = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword || undefined,
        db: redisDb,
        retryStrategy: (times) => {
          if (times > 3) {
            this.logger.warn('Redis connection failed, falling back to local cache');
            return null;
          }
          return Math.min(times * 100, 3000);
        },
        maxRetriesPerRequest: 3,
      });

      this.redis.on('connect', () => {
        this.logger.log('Redis connected successfully');
        this.useRedis = true;
      });

      this.redis.on('error', (err) => {
        this.logger.error(`Redis error: ${err.message}`);
        this.useRedis = false;
      });

      this.redis.on('close', () => {
        this.logger.warn('Redis connection closed, using local cache');
        this.useRedis = false;
      });

      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          this.logger.warn('Redis connection timeout, using local cache');
          resolve();
        }, 5000);

        this.redis!.ping().then(() => {
          clearTimeout(timeout);
          resolve();
        }).catch(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    } catch (error: any) {
      this.logger.error(`Failed to initialize Redis: ${error.message}`);
      this.useRedis = false;
    }

    setInterval(() => this.cleanupLocalCache(), 60 * 1000);
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    if (this.useRedis && this.redis) {
      try {
        const data = await this.redis.get(key);
        if (!data) return undefined;
        return JSON.parse(data) as T;
      } catch (error: any) {
        this.logger.error(`Redis get error: ${error.message}`);
        return this.getLocal<T>(key);
      }
    }
    return this.getLocal<T>(key);
  }

  private getLocal<T>(key: string): T | undefined {
    const item = this.localCache.get(key);
    if (!item) return undefined;

    if (Date.now() > item.expiry) {
      this.localCache.delete(key);
      return undefined;
    }

    return item.value;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const expiry = Date.now() + (ttl || this.defaultTTL);

    if (this.useRedis && this.redis) {
      try {
        await this.redis.setex(key, Math.floor((ttl || this.defaultTTL) / 1000), JSON.stringify(value));
        return;
      } catch (error: any) {
        this.logger.error(`Redis set error: ${error.message}`);
      }
    }

    this.localCache.set(key, { value, expiry });
  }

  async delete(key: string): Promise<void> {
    if (this.useRedis && this.redis) {
      try {
        await this.redis.del(key);
      } catch (error: any) {
        this.logger.error(`Redis delete error: ${error.message}`);
      }
    }
    this.localCache.delete(key);
  }

  async has(key: string): Promise<boolean> {
    if (this.useRedis && this.redis) {
      try {
        const exists = await this.redis.exists(key);
        return exists === 1;
      } catch (error: any) {
        this.logger.error(`Redis has error: ${error.message}`);
      }
    }
    return this.localCache.has(key) && Date.now() <= (this.localCache.get(key)?.expiry || 0);
  }

  async clear(): Promise<void> {
    if (this.useRedis && this.redis) {
      try {
        await this.redis.flushdb();
      } catch (error: any) {
        this.logger.error(`Redis clear error: ${error.message}`);
      }
    }
    this.localCache.clear();
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  async ttl(key: string): Promise<number> {
    if (this.useRedis && this.redis) {
      try {
        const ttl = await this.redis.ttl(key);
        return ttl > 0 ? ttl : 0;
      } catch (error: any) {
        this.logger.error(`Redis ttl error: ${error.message}`);
      }
    }
    // 本地缓存：计算剩余时间
    const item = this.localCache.get(key);
    if (!item) return 0;
    const remaining = Math.floor((item.expiry - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  }

  private cleanupLocalCache(): void {
    const now = Date.now();
    for (const [key, item] of this.localCache.entries()) {
      if (now > item.expiry) {
        this.localCache.delete(key);
      }
    }
  }

  getStats(): { mode: string; localSize: number; localKeys: string[] } {
    return {
      mode: this.useRedis ? 'redis' : 'local',
      localSize: this.localCache.size,
      localKeys: Array.from(this.localCache.keys()),
    };
  }

  async getRedisInfo(): Promise<{ connected: boolean; memory?: string; keys?: number }> {
    if (!this.redis) {
      return { connected: false };
    }

    try {
      const info = await this.redis.info('memory');
      const memoryMatch = info.match(/used_memory_human:(\S+)/);
      const dbSize = await this.redis.dbsize();

      return {
        connected: this.useRedis,
        memory: memoryMatch ? memoryMatch[1] : undefined,
        keys: dbSize,
      };
    } catch {
      return { connected: false };
    }
  }
}
