// ============================================
// 领域事件发布服务
// 架构师推导补充，依据: 低耦合原则，统一事件发布入口
// ============================================

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DomainEvent, EventMetadata } from './domain-event.interface';

/**
 * 事件发布服务
 * 负责持久化事件到数据库，并发送到消息队列
 */
@Injectable()
export class EventPublisherService {
  private readonly logger = new Logger(EventPublisherService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 发布领域事件
   * @param event 领域事件
   * @param metadata 事件元数据
   */
  async publish(event: DomainEvent, metadata?: EventMetadata): Promise<void> {
    try {
      // 1. 持久化事件到数据库（至少一次投递保证）
      await this.persistEvent(event, metadata);

      // 2. 发送到消息队列（异步处理）
      await this.sendToQueue(event);

      this.logger.debug(`Event published: ${event.eventType} [${event.eventId}]`);
    } catch (error) {
      this.logger.error(
        `Failed to publish event: ${event.eventType} [${event.eventId}]`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * 批量发布事件
   * @param events 领域事件数组
   * @param metadata 事件元数据
   */
  async publishAll(
    events: DomainEvent[],
    metadata?: EventMetadata,
  ): Promise<void> {
    await Promise.all(events.map((event) => this.publish(event, metadata)));
  }

  /**
   * 持久化事件到数据库
   */
  private async persistEvent(
    event: DomainEvent,
    metadata?: EventMetadata,
  ): Promise<void> {
    await this.prisma.domainEvent.create({
      data: {
        eventId: event.eventId,
        eventType: event.eventType,
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        payload: event.payload as any,
        metadata: (metadata || {}) as any,
        status: 'PENDING',
        publishedAt: event.occurredAt,
      },
    });
  }

  /**
   * 发送事件到消息队列
   * 实际实现需要集成BullMQ
   */
  private async sendToQueue(event: DomainEvent): Promise<void> {
    // 事件已持久化到数据库，后续可通过轮询机制处理
    // 如需实时处理，可集成 BullMQ 或 RabbitMQ
    // 队列映射：
    // - ChapterSubmittedEvent -> 'nef-processing' 队列
    // - ReviewSubmittedEvent -> 'nef-evolution' 队列
    // - ReviewCompletedEvent -> 'chapter-status' 队列

    this.logger.debug(`Event persisted (queue integration pending): ${event.eventType}`);
  }
}
