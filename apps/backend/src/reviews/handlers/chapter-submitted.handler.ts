// ============================================
// 评审模块 - ChapterSubmittedEvent处理器
// 架构师推导补充，依据: 低耦合原则，通过事件触发评审流程
// ============================================

import { Injectable, Logger } from '@nestjs/common';
import { EventHandler, ChapterSubmittedEvent, ReviewTaskCreatedEvent } from '../../shared/events';
import { PrismaService } from '../../prisma/prisma.service';
import { EventPublisherService } from '../../shared/events/event-publisher.service';

/**
 * 章节提交事件处理器
 * 负责创建评审任务
 */
@Injectable()
export class ChapterSubmittedHandler implements EventHandler<ChapterSubmittedEvent> {
  readonly eventType = 'ChapterSubmitted';
  private readonly logger = new Logger(ChapterSubmittedHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventPublisher: EventPublisherService,
  ) { }

  async handle(event: ChapterSubmittedEvent): Promise<boolean> {
    this.logger.debug(`Processing ChapterSubmittedEvent for review: ${event.aggregateId}`);

    try {
      const { payload } = event;

      // 1. 幂等性检查：是否已创建评审任务
      const existingTask = await this.prisma.reviewTask.findFirst({
        where: {
          chapterId: payload.chapterId,
        },
      });

      if (existingTask) {
        this.logger.debug(`Review task already exists for chapter: ${payload.chapterId}`);
        return true; // 幂等性：已处理过
      }

      // 2. 计算所需评委数量（基于字数）
      const requiredJudges = this.calculateRequiredJudges(payload.wordCount);

      // 3. 创建评审任务
      const reviewTask = await this.prisma.reviewTask.create({
        data: {
          novelId: payload.novelId,
          chapterId: payload.chapterId,
          type: 'CHAPTER',
          status: 'PENDING',
        },
      });

      // 4. 发布评审任务创建事件
      const taskCreatedEvent = new ReviewTaskCreatedEvent(reviewTask.id, {
        reviewTaskId: reviewTask.id,
        novelId: payload.novelId,
        chapterId: payload.chapterId,
        type: 'CHAPTER',
        minReviewerCount: requiredJudges,
        maxReviewerCount: requiredJudges + 2,
        createdAt: new Date(),
      });

      await this.eventPublisher.publish(taskCreatedEvent);

      this.logger.debug(`Review task created: ${reviewTask.id} for chapter: ${payload.chapterId}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to process ChapterSubmittedEvent: ${event.aggregateId}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * 计算所需评委数量
   * 基于字数动态计算
   */
  private calculateRequiredJudges(wordCount: number): number {
    if (wordCount < 1000) return 2;
    if (wordCount < 3000) return 3;
    if (wordCount < 5000) return 4;
    return 5; // 最多5个评委
  }
}
