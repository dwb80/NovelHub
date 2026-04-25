import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { BehaviorAnalyticsService } from '../analytics/behavior-analytics.service';

type LogLevel = 'info' | 'error' | 'warning' | 'critical';

export interface Alert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  source: string;
  timestamp: Date;
  metadata?: any;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface MonitorConfig {
  checkInterval: number; // 检查间隔（毫秒）
  alertThreshold: number; // 告警阈值
  autoResolveTime: number; // 自动解决时间（毫秒）
}

@Injectable()
export class MonitoringService implements OnModuleInit {
  private readonly logger = new Logger(MonitoringService.name);
  private monitoringInterval: NodeJS.Timeout | null = null;
  private alerts: Alert[] = [];

  private readonly config: MonitorConfig = {
    checkInterval: 60000, // 1分钟
    alertThreshold: 80, // 80分以上告警
    autoResolveTime: 3600000, // 1小时
  };

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
    private behaviorAnalyticsService: BehaviorAnalyticsService,
  ) {}

  onModuleInit() {
    this.startMonitoring();
  }

  /**
   * 启动监控
   */
  startMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      this.performChecks().catch(error => {
        this.logger.error('Error during monitoring check:', error);
      });
    }, this.config.checkInterval);

    this.logger.log('Monitoring started with interval: ' + this.config.checkInterval + 'ms');
  }

  /**
   * 停止监控
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      this.logger.log('Monitoring stopped');
    }
  }

  /**
   * 执行监控检查
   */
  private async performChecks(): Promise<void> {
    try {
      // 1. 检查AI智能体行为异常
      await this.checkAIAgentBehavior();

      // 2. 检查系统资源
      await this.checkSystemResources();

      // 3. 检查数据库健康
      await this.checkDatabaseHealth();

      // 4. 清理过期告警
      this.cleanupExpiredAlerts();
    } catch (error) {
      this.logger.error('Error performing monitoring checks:', error);
    }
  }

  /**
   * 检查AI智能体行为异常
   */
  private async checkAIAgentBehavior(): Promise<void> {
    try {
      // 获取最近活跃的AI智能体
      const activeClaws = await this.prisma.claw.findMany({
        where: {
          lastActiveAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
        select: {
          id: true,
          clawId: true,
        },
        take: 50, // 限制检查数量
      });

      for (const claw of activeClaws) {
        const anomalyResult = await this.behaviorAnalyticsService.detectAnomaly(claw.clawId, 'chapter_create');
        if (anomalyResult.isAnomaly) {
          this.createAlert({
            level: 'warning',
            title: 'AI智能体行为异常',
            message: anomalyResult.message,
            source: 'ai_behavior',
            metadata: {
              clawId: claw.clawId,
              score: anomalyResult.score,
              details: anomalyResult.details,
            },
          });
        }
      }
    } catch (error) {
      this.logger.error('Error checking AI agent behavior:', error);
    }
  }

  /**
   * 检查系统资源
   */
  private async checkSystemResources(): Promise<void> {
    try {
      // 检查内存使用
      const memoryUsage = process.memoryUsage();
      const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

      if (memoryPercent > 80) {
        this.createAlert({
          level: 'warning',
          title: '内存使用过高',
          message: `内存使用 ${memoryPercent.toFixed(2)}%，超过80%阈值`,
          source: 'system',
          metadata: {
            heapUsed: memoryUsage.heapUsed,
            heapTotal: memoryUsage.heapTotal,
            rss: memoryUsage.rss,
          },
        });
      }

      // 检查事件循环延迟
      const start = process.hrtime();
      setTimeout(() => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const delay = seconds * 1000 + nanoseconds / 1e6;
        if (delay > 50) {
          this.createAlert({
            level: 'info',
            title: '事件循环延迟',
            message: `事件循环延迟 ${delay.toFixed(2)}ms，超过50ms`,
            source: 'system',
            metadata: {
              delay: delay,
            },
          });
        }
      }, 0);
    } catch (error) {
      this.logger.error('Error checking system resources:', error);
    }
  }

  /**
   * 检查数据库健康
   */
  private async checkDatabaseHealth(): Promise<void> {
    try {
      const startTime = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const endTime = Date.now();
      const latency = endTime - startTime;

      if (latency > 1000) {
        this.createAlert({
          level: 'warning',
          title: '数据库响应缓慢',
          message: `数据库查询延迟 ${latency}ms，超过1000ms阈值`,
          source: 'database',
          metadata: {
            latency: latency,
          },
        });
      }
    } catch (error) {
      this.createAlert({
        level: 'critical',
        title: '数据库连接失败',
        message: '无法连接到数据库',
        source: 'database',
        metadata: {
          error: error.message,
        },
      });
    }
  }

  /**
   * 创建告警
   */
  createAlert(options: {
    level: 'info' | 'warning' | 'error' | 'critical';
    title: string;
    message: string;
    source: string;
    metadata?: any;
  }): Alert {
    const alert: Alert = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 10),
      ...options,
      timestamp: new Date(),
      resolved: false,
    };

    this.alerts.push(alert);
    const logMessage = `[ALERT] ${options.title}: ${options.message}`;
    if (options.level === 'critical') {
      this.logger.error(logMessage);
    } else if (options.level === 'warning') {
      this.logger.warn(logMessage);
    } else {
      this.logger.log(logMessage);
    }

    // 异步保存到数据库
    this.prisma.alert.create({
      data: {
        type: alert.level,
        level: alert.level,
        severity: alert.level,
        title: alert.title,
        message: `[${alert.title}] ${alert.message}`,
        source: alert.source,
      },
    }).catch(error => {
      this.logger.error('Error saving alert to database:', error);
    });

    return alert;
  }

  /**
   * 解决告警
   */
  resolveAlert(alertId: string): boolean {
    const alertIndex = this.alerts.findIndex(a => a.id === alertId);
    if (alertIndex === -1) {
      return false;
    }

    const alert = this.alerts[alertIndex];
    alert.resolved = true;
    alert.resolvedAt = new Date();

    // 异步更新数据库
    this.prisma.alert.update({
      where: { id: alertId },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
      },
    }).catch(error => {
      this.logger.error('Error updating alert in database:', error);
    });

    this.logger.log(`Resolved alert: ${alert.title}`);
    return true;
  }

  /**
   * 获取告警列表
   */
  getAlerts(filters?: {
    level?: string;
    source?: string;
    resolved?: boolean;
  }): Alert[] {
    let filteredAlerts = [...this.alerts];

    if (filters) {
      if (filters.level) {
        filteredAlerts = filteredAlerts.filter(a => a.level === filters.level);
      }
      if (filters.source) {
        filteredAlerts = filteredAlerts.filter(a => a.source === filters.source);
      }
      if (filters.resolved !== undefined) {
        filteredAlerts = filteredAlerts.filter(a => a.resolved === filters.resolved);
      }
    }

    return filteredAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * 清理过期告警
   */
  private cleanupExpiredAlerts(): void {
    const now = Date.now();
    this.alerts = this.alerts.filter(alert => {
      if (alert.resolved) {
        return now - alert.resolvedAt!.getTime() < this.config.autoResolveTime;
      }
      return now - alert.timestamp.getTime() < this.config.autoResolveTime;
    });
  }

  /**
   * 获取监控状态
   */
  getMonitoringStatus(): {
    isRunning: boolean;
    alerts: {
      total: number;
      critical: number;
      error: number;
      warning: number;
      info: number;
    };
    lastCheck: Date;
  } {
    const alerts = this.getAlerts({ resolved: false });
    const alertCounts = {
      total: alerts.length,
      critical: alerts.filter(a => a.level === 'critical').length,
      error: alerts.filter(a => a.level === 'error').length,
      warning: alerts.filter(a => a.level === 'warning').length,
      info: alerts.filter(a => a.level === 'info').length,
    };

    return {
      isRunning: this.monitoringInterval !== null,
      alerts: alertCounts,
      lastCheck: new Date(),
    };
  }
}
