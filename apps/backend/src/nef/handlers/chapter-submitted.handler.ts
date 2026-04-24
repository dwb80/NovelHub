// ============================================
// NEF模块 - ChapterSubmittedEvent处理器
// 架构师推导补充，依据: 低耦合原则，通过事件异步处理
// ============================================

import { Injectable, Logger } from '@nestjs/common';
import { EventHandler, ChapterSubmittedEvent, InsightExtractedEvent } from '../../shared/events';
import { PrismaService } from '../../prisma/prisma.service';
import { EventPublisherService } from '../../shared/events/event-publisher.service';

/**
 * 章节提交事件处理器
 * 负责异步分析章节内容，提取创作模式
 */
@Injectable()
export class ChapterSubmittedHandler implements EventHandler<ChapterSubmittedEvent> {
  readonly eventType = 'ChapterSubmitted';
  private readonly logger = new Logger(ChapterSubmittedHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  async handle(event: ChapterSubmittedEvent): Promise<boolean> {
    this.logger.debug(`Processing ChapterSubmittedEvent: ${event.aggregateId}`);

    try {
      const { payload } = event;

      // 1. 获取章节内容
      const chapter = await this.prisma.chapter.findUnique({
        where: { id: payload.chapterId },
        include: { novel: true },
      });

      if (!chapter) {
        this.logger.warn(`Chapter not found: ${payload.chapterId}`);
        return false;
      }

      // 2. 获取或创建创作档案
      const archive = await this.getOrCreateArchive(chapter.novel.authorId);

      // 3. 分析章节内容（简化实现）
      const patterns = this.extractPatterns(chapter.content);

      // 4. 保存模式
      await this.savePatterns(archive.id, patterns);

      // 5. 发布洞察提取事件
      const insightEvent = new InsightExtractedEvent(archive.id, {
        archiveId: archive.id,
        clawId: chapter.novel.authorId,
        chapterId: payload.chapterId,
        patternsExtracted: patterns.length,
        extractedAt: new Date(),
      });

      await this.eventPublisher.publish(insightEvent);

      this.logger.debug(`Chapter analyzed: ${payload.chapterId}, patterns: ${patterns.length}`);
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
   * 获取或创建创作档案
   */
  private async getOrCreateArchive(clawId: string) {
    const existing = await this.prisma.creationArchive.findFirst({
      where: { clawId },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.creationArchive.create({
      data: {
        clawId,
        version: '1.0.0',
      },
    });
  }

  /**
   * 从章节内容中提取模式
   * 简化实现：基于关键词匹配
   */
  private extractPatterns(content: string): any[] {
    const patterns: any[] = [];

    // 情节模式识别（简化）
    if (content.includes('冲突') || content.includes('矛盾')) {
      patterns.push({
        type: 'CONFLICT',
        description: '检测到冲突驱动型情节',
        confidence: 0.7,
      });
    }

    if (content.includes('悬念') || content.includes('疑问')) {
      patterns.push({
        type: 'SUSPENSE',
        description: '检测到悬念设置',
        confidence: 0.6,
      });
    }

    if (content.includes('转折') || content.includes('反转')) {
      patterns.push({
        type: 'TWIST',
        description: '检测到情节转折',
        confidence: 0.65,
      });
    }

    return patterns;
  }

  /**
   * 保存提取的模式
   */
  private async savePatterns(
    archiveId: string,
    patterns: any[],
  ): Promise<void> {
    for (const pattern of patterns) {
      await this.prisma.plotPattern.create({
        data: {
          archiveId,
          name: pattern.name || pattern.type,
          type: pattern.type,
          description: pattern.description,
          confidence: pattern.confidence,
          successRate: 0.5,
          useCount: 1,
          successCount: 0,
          isActive: true,
          version: '1.0.0',
        },
      });
    }
  }
}
