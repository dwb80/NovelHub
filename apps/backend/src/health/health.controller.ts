import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../common/cache/cache.service';
import { QueueService } from '../queue/queue.service';

@ApiTags('健康检查')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly queueService: QueueService,
  ) { }

  @Get()
  @ApiOperation({ summary: '基础健康检查' })
  @ApiResponse({ status: 200, description: '服务正常运行' })
  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'novelhub-backend',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
      },
      cpu: process.cpuUsage(),
    };
  }

  @Get('ready')
  @ApiOperation({ summary: '就绪检查 - 检查所有依赖服务' })
  @ApiResponse({ status: 200, description: '所有服务就绪' })
  @ApiResponse({ status: 503, description: '服务不可用' })
  async ready() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkCache(),
      this.checkQueues(),
    ]);

    const results = {
      database: checks[0].status === 'fulfilled' ? checks[0].value : { status: 'error', error: (checks[0] as PromiseRejectedResult).reason?.message },
      cache: checks[1].status === 'fulfilled' ? checks[1].value : { status: 'error', error: (checks[1] as PromiseRejectedResult).reason?.message },
      queues: checks[2].status === 'fulfilled' ? checks[2].value : { status: 'error', error: (checks[2] as PromiseRejectedResult).reason?.message },
    };

    const allHealthy = Object.values(results).every(
      (r: any) => r.status === 'ok' || r.status === 'degraded',
    );

    return {
      status: allHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      checks: results,
    };
  }

  @Get('live')
  @ApiOperation({ summary: '存活检查' })
  @ApiResponse({ status: 200, description: '服务存活' })
  async live() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('metrics')
  @ApiOperation({ summary: '获取系统指标' })
  @ApiResponse({ status: 200, description: '系统指标' })
  async metrics() {
    const [dbStats, cacheStats, queueHealth] = await Promise.allSettled([
      this.getDatabaseStats(),
      this.getCacheStats(),
      this.queueService.getQueueHealth(),
    ]);

    return {
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        nodeVersion: process.version,
        platform: process.platform,
      },
      database: dbStats.status === 'fulfilled' ? dbStats.value : { error: 'unavailable' },
      cache: cacheStats.status === 'fulfilled' ? cacheStats.value : { error: 'unavailable' },
      queues: queueHealth.status === 'fulfilled' ? queueHealth.value : { error: 'unavailable' },
    };
  }

  private async checkDatabase(): Promise<{ status: string; latency?: number; error?: string }> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;
      return {
        status: latency < 100 ? 'ok' : 'degraded',
        latency,
      };
    } catch (error: any) {
      return { status: 'error', error: error.message };
    }
  }

  private async checkCache(): Promise<{ status: string; mode?: string; latency?: number; error?: string }> {
    const start = Date.now();
    try {
      const stats = this.cacheService.getStats();
      const latency = Date.now() - start;
      return {
        status: stats.mode === 'redis' ? 'ok' : 'degraded',
        mode: stats.mode,
        latency,
      };
    } catch (error: any) {
      return { status: 'error', error: error.message };
    }
  }

  private async checkQueues(): Promise<{ status: string; details?: any; error?: string }> {
    try {
      const health = await this.queueService.getQueueHealth();
      const hasFailed = Object.values(health).some((q: any) => q.failed > 100);
      return {
        status: hasFailed ? 'degraded' : 'ok',
        details: health,
      };
    } catch (error: any) {
      return { status: 'error', error: error.message };
    }
  }

  private async getDatabaseStats(): Promise<any> {
    try {
      const [novelCount, chapterCount, clawCount] = await Promise.all([
        this.prisma.novel.count(),
        this.prisma.chapter.count(),
        this.prisma.claw.count(),
      ]);
      return { novelCount, chapterCount, clawCount };
    } catch {
      return { error: 'unavailable' };
    }
  }

  private async getCacheStats(): Promise<any> {
    try {
      const stats = this.cacheService.getStats();
      const redisInfo = await this.cacheService.getRedisInfo();
      return { ...stats, redis: redisInfo };
    } catch {
      return { error: 'unavailable' };
    }
  }
}
