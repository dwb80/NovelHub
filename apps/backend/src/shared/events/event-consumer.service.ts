// ============================================
// 领域事件消费服务
// 架构师推导补充，依据: 低耦合原则，统一事件消费处理
// ============================================

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DomainEvent } from './domain-event.interface';

/**
 * 事件处理器接口
 */
export interface EventHandler<T extends DomainEvent = DomainEvent> {
  /** 处理的事件类型 */
  readonly eventType: string;
  
  /**
   * 处理事件
   * @param event 领域事件
   * @returns 是否处理成功
   */
  handle(event: T): Promise<boolean>;
}

/**
 * 事件消费服务
 * 负责从消息队列消费事件并分发给处理器
 */
@Injectable()
export class EventConsumerService implements OnModuleInit {
  private readonly logger = new Logger(EventConsumerService.name);
  private readonly handlers = new Map<string, EventHandler[]>();

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    // 启动时开始消费待处理事件
    this.processPendingEvents();
  }

  /**
   * 注册事件处理器
   * @param handler 事件处理器
   */
  registerHandler(handler: EventHandler): void {
    const handlers = this.handlers.get(handler.eventType) || [];
    handlers.push(handler);
    this.handlers.set(handler.eventType, handlers);
    
    this.logger.log(`Registered handler for event: ${handler.eventType}`);
  }

  /**
   * 消费事件
   * @param event 领域事件
   */
  async consume(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType);
    
    if (!handlers || handlers.length === 0) {
      this.logger.warn(`No handlers found for event: ${event.eventType}`);
      return;
    }

    // 更新事件状态为处理中
    await this.updateEventStatus(event.eventId, 'PROCESSING');

    try {
      // 执行所有处理器
      const results = await Promise.all(
        handlers.map((handler) => handler.handle(event)),
      );

      // 检查是否全部成功
      const allSuccess = results.every((r) => r);
      
      if (allSuccess) {
        await this.updateEventStatus(event.eventId, 'COMPLETED');
        this.logger.debug(`Event processed successfully: ${event.eventType} [${event.eventId}]`);
      } else {
        await this.handleEventFailure(event.eventId, 'Some handlers failed');
      }
    } catch (error) {
      await this.handleEventFailure(event.eventId, error.message);
    }
  }

  /**
   * 处理待处理事件（启动时调用）
   */
  private async processPendingEvents(): Promise<void> {
    const pendingEvents = await this.prisma.domainEvent.findMany({
      where: {
        status: { in: ['PENDING', 'FAILED'] },
        retryCount: { lt: 3 },
      },
      orderBy: { publishedAt: 'asc' },
      take: 100,
    });

    this.logger.log(`Processing ${pendingEvents.length} pending events`);

    for (const eventRecord of pendingEvents) {
      // 转换为领域事件并消费
      const event = this.toDomainEvent(eventRecord);
      await this.consume(event);
    }
  }

  /**
   * 更新事件状态
   */
  private async updateEventStatus(
    eventId: string,
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'DEAD_LETTER',
  ): Promise<void> {
    const updateData: any = { status };
    
    if (status === 'COMPLETED') {
      updateData.processedAt = new Date();
    }

    await this.prisma.domainEvent.update({
      where: { id: eventId },
      data: updateData,
    });
  }

  /**
   * 处理事件失败
   */
  private async handleEventFailure(
    eventId: string,
    errorMessage: string,
  ): Promise<void> {
    const event = await this.prisma.domainEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) return;

    const newRetryCount = event.retryCount + 1;
    const isDeadLetter = newRetryCount >= 3;

    await this.prisma.domainEvent.update({
      where: { id: eventId },
      data: {
        status: isDeadLetter ? 'DEAD_LETTER' : 'FAILED',
        retryCount: newRetryCount,
        errorMessage,
      },
    });

    if (isDeadLetter) {
      this.logger.error(
        `Event moved to dead letter queue: ${event.eventType} [${eventId}]`,
      );
      // 发送告警通知（可选）
      // 可集成邮件或短信服务通知运维人员
    } else {
      this.logger.warn(
        `Event processing failed, will retry: ${event.eventType} [${eventId}] (attempt ${newRetryCount})`,
      );
    }
  }

  /**
   * 将数据库记录转换为领域事件
   */
  private toDomainEvent(record: any): DomainEvent {
    return {
      eventId: record.eventId,
      eventType: record.eventType,
      aggregateId: record.aggregateId,
      aggregateType: record.aggregateType,
      occurredAt: record.publishedAt,
      version: '1.0',
      payload: record.payload,
    };
  }
}
