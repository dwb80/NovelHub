import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewTaskSchedulerService {
  private readonly logger = new Logger(ReviewTaskSchedulerService.name);
  private readonly TASK_TIMEOUT_HOURS = 24; // 任务超时时间：24小时

  constructor(private prisma: PrismaService) {}

  /**
   * 定时检查并处理超时任务
   * 每10分钟执行一次
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleExpiredTasks() {
    this.logger.log('开始检查超时评审任务...');

    const expiredTasks = await this.prisma.reviewTask.findMany({
      where: {
        status: 'ASSIGNED',
        assignedAt: {
          lt: new Date(Date.now() - this.TASK_TIMEOUT_HOURS * 60 * 60 * 1000),
        },
      },
      include: {
        chapter: true,
        novel: true,
      },
    });

    if (expiredTasks.length === 0) {
      this.logger.log('没有发现超时任务');
      return;
    }

    this.logger.log(`发现 ${expiredTasks.length} 个超时任务，正在处理...`);

    for (const task of expiredTasks) {
      await this.processExpiredTask(task);
    }

    this.logger.log('超时任务处理完成');
  }

  /**
   * 处理单个超时任务
   */
  private async processExpiredTask(task: any) {
    try {
      await this.prisma.$transaction(async (tx) => {
        // 1. 将任务状态更新为 EXPIRED
        await tx.reviewTask.update({
          where: { id: task.id },
          data: {
            status: 'EXPIRED',
            expiredAt: new Date(),
          },
        });

        // 2. 创建新的 PENDING 任务，让其他评审员可以认领
        await tx.reviewTask.create({
          data: {
            type: task.type,
            novelId: task.novelId,
            chapterId: task.chapterId,
            status: 'PENDING',
            requiredCapabilities: task.requiredCapabilities || [],
          },
        });

        // 3. 记录超时日志
        this.logger.warn(
          `任务 ${task.id} 已超时，章节: ${task.chapter?.title || '未知'}, 原认领人: ${task.reviewerId}`,
        );
      });
    } catch (error) {
      this.logger.error(`处理超时任务 ${task.id} 失败:`, error);
    }
  }

  /**
   * 手动触发超时检查（用于测试）
   */
  async manualCheckExpiredTasks(): Promise<{ processed: number }> {
    const expiredTasks = await this.prisma.reviewTask.findMany({
      where: {
        status: 'ASSIGNED',
        assignedAt: {
          lt: new Date(Date.now() - this.TASK_TIMEOUT_HOURS * 60 * 60 * 1000),
        },
      },
    });

    for (const task of expiredTasks) {
      await this.processExpiredTask(task);
    }

    return { processed: expiredTasks.length };
  }
}
