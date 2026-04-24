// ============================================
// NEF模块 - ReviewSubmittedEvent处理器
// 架构师推导补充，依据: 低耦合原则，通过事件异步处理
// ============================================

import { Injectable, Logger } from '@nestjs/common';
import { EventHandler, ReviewSubmittedEvent, EvolutionCompletedEvent } from '../../shared/events';
import { PrismaService } from '../../prisma/prisma.service';
import { EventPublisherService } from '../../shared/events/event-publisher.service';

/**
 * 评审提交事件处理器
 * 负责异步处理评审反馈，优化创作档案
 */
@Injectable()
export class ReviewSubmittedHandler implements EventHandler<ReviewSubmittedEvent> {
  readonly eventType = 'ReviewSubmitted';
  private readonly logger = new Logger(ReviewSubmittedHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  async handle(event: ReviewSubmittedEvent): Promise<boolean> {
    this.logger.debug(`Processing ReviewSubmittedEvent: ${event.aggregateId}`);

    try {
      const { payload } = event;

      // 1. 获取章节信息
      const chapter = await this.prisma.chapter.findUnique({
        where: { id: payload.chapterId },
        include: { novel: true },
      });

      if (!chapter) {
        this.logger.error(`Chapter not found: ${payload.chapterId}`);
        return false;
      }

      // 2. 获取创作档案
      const archive = await this.prisma.creationArchive.findUnique({
        where: { clawId: chapter.novel.authorId },
      });

      if (!archive) {
        this.logger.warn(`Archive not found for claw: ${chapter.novel.authorId}`);
        return true; // 没有档案也不视为失败
      }

      // 3. 分析评审反馈，生成改进建议
      const improvements = this.analyzeFeedback(payload.feedback);

      // 4. 更新模式成功率
      await this.updatePatternSuccess(archive.id, payload.score);

      // 5. 记录进化历史
      await this.recordEvolutionHistory(archive.id, chapter.novel.authorId, payload, improvements);

      // 6. 发布进化完成事件
      const evolutionEvent = new EvolutionCompletedEvent(archive.id, {
        archiveId: archive.id,
        clawId: chapter.novel.authorId,
        strategy: this.selectStrategy(payload.score),
        improvements,
        completedAt: new Date(),
      });

      await this.eventPublisher.publish(evolutionEvent);

      this.logger.debug(`Review processed for chapter: ${payload.chapterId}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to process ReviewSubmittedEvent: ${event.aggregateId}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * 分析评审反馈，生成改进建议
   */
  private analyzeFeedback(feedback: string): string[] {
    const improvements: string[] = [];

    // 简化实现：基于关键词提取改进点
    if (feedback.includes('节奏') || feedback.includes('拖沓') || feedback.includes('紧凑')) {
      improvements.push('优化情节节奏控制');
    }

    if (feedback.includes('人物') || feedback.includes('角色') || feedback.includes('性格')) {
      improvements.push('深化人物刻画');
    }

    if (feedback.includes('对话') || feedback.includes('台词')) {
      improvements.push('改进对话自然度');
    }

    if (feedback.includes('描写') || feedback.includes('场景')) {
      improvements.push('增强场景描写');
    }

    if (improvements.length === 0) {
      improvements.push('保持当前创作风格');
    }

    return improvements;
  }

  /**
   * 更新模式成功率
   */
  private async updatePatternSuccess(archiveId: string, score: number): Promise<void> {
    // 获取最近使用的模式
    const patterns = await this.prisma.plotPattern.findMany({
      where: { archiveId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // 根据评分更新成功率
    const isSuccess = score >= 70;

    for (const pattern of patterns) {
      await this.prisma.plotPattern.update({
        where: { id: pattern.id },
        data: {
          successCount: isSuccess ? { increment: 1 } : pattern.successCount,
          useCount: { increment: 1 },
          successRate: isSuccess
            ? (pattern.successCount + 1) / (pattern.useCount + 1)
            : pattern.successCount / (pattern.useCount + 1),
        },
      });
    }
  }

  /**
   * 记录进化历史
   */
  private async recordEvolutionHistory(
    archiveId: string,
    clawId: string,
    review: any,
    improvements: string[],
  ): Promise<void> {
    await this.prisma.evolutionHistory.create({
      data: {
        archiveId,
        strategy: this.selectStrategy(review.score),
        changes: improvements,
        metricsBefore: { score: review.score },
        metricsAfter: { score: review.score },
      },
    });
  }

  /**
   * 选择进化策略
   */
  private selectStrategy(score: number): any {
    if (score < 50) return 'RESTRUCTURING';
    if (score < 75) return 'REFINEMENT';
    return 'INNOVATION';
  }
}
