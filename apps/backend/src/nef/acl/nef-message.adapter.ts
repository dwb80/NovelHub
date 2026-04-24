// ============================================
// NEF防腐层 - 消息适配器
// 架构师推导补充，依据: 低耦合原则，隔离外部NEF协议与内部领域
// ============================================

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * NEF外部消息格式
 */
export interface NEFExternalMessage {
  messageId: string;
  messageType: 'CREATION' | 'EVOLUTION' | 'FEEDBACK';
  clawId: string;
  timestamp: string;
  payload: NEFCreationPayload | NEFFeedbackPayload;
  signature: string;
}

export interface NEFCreationPayload {
  novelId?: string;
  chapterId?: string;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface NEFFeedbackPayload {
  reviewId: string;
  score: number;
  feedback: string;
  suggestions?: string[];
}

/**
 * 内部命令格式
 */
export interface CreateNovelCommand {
  title: string;
  content: string;
  authorId: string;
  externalId: string;
  metadata: Record<string, unknown>;
}

export interface ProcessReviewCommand {
  reviewId: string;
  chapterId: string;
  score: number;
  feedback: string;
  suggestions: string[];
}

/**
 * NEF消息适配器
 * 将外部NEF消息转换为内部命令，隔离外部变化
 */
@Injectable()
export class NEFMessageAdapter {
  private readonly logger = new Logger(NEFMessageAdapter.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 适配创建消息
   * @param externalMessage 外部NEF消息
   * @returns 内部命令
   */
  async adaptCreationMessage(
    externalMessage: NEFExternalMessage,
  ): Promise<CreateNovelCommand> {
    this.logger.debug(`Adapting creation message: ${externalMessage.messageId}`);

    const payload = externalMessage.payload as NEFCreationPayload;

    // 1. 验证消息签名（简化示例）
    await this.verifySignature(externalMessage);

    // 2. 查找或验证Claw身份
    const claw = await this.prisma.claw.findUnique({
      where: { clawId: externalMessage.clawId },
    });

    if (!claw) {
      throw new Error(`Claw not found: ${externalMessage.clawId}`);
    }

    // 3. 内容清洗和验证
    const sanitizedContent = this.sanitizeContent(payload.content);
    const validatedTitle = this.validateTitle(payload.title);

    // 4. 转换为内部命令
    return {
      title: validatedTitle,
      content: sanitizedContent,
      authorId: claw.id,
      externalId: externalMessage.messageId,
      metadata: {
        ...payload.metadata,
        nefTimestamp: externalMessage.timestamp,
        nefSignature: externalMessage.signature,
      },
    };
  }

  /**
   * 适配评审反馈消息
   * @param externalMessage 外部NEF消息
   * @returns 内部命令
   */
  async adaptFeedbackMessage(
    externalMessage: NEFExternalMessage,
  ): Promise<ProcessReviewCommand> {
    this.logger.debug(`Adapting feedback message: ${externalMessage.messageId}`);

    const payload = externalMessage.payload as NEFFeedbackPayload;

    // 1. 验证消息签名
    await this.verifySignature(externalMessage);

    // 2. 查找评审记录
    const review = await this.prisma.review.findUnique({
      where: { id: payload.reviewId },
      include: { chapter: true },
    });

    if (!review) {
      throw new Error(`Review not found: ${payload.reviewId}`);
    }

    // 3. 转换为内部命令
    return {
      reviewId: payload.reviewId,
      chapterId: review.chapterId || '',
      score: this.normalizeScore(payload.score),
      feedback: this.sanitizeText(payload.feedback),
      suggestions: payload.suggestions?.map((s) => this.sanitizeText(s)) || [],
    };
  }

  /**
   * 验证消息签名
   * 实际实现应使用加密验证
   */
  private async verifySignature(message: NEFExternalMessage): Promise<void> {
    // 签名验证逻辑说明：
    // 1. 获取Claw的publicKey
    // 2. 验证signature是否匹配
    // 3. 验证timestamp是否在允许范围内（防重放）
    // 当前简化实现：仅检查签名是否存在
    // 如需完整实现，可集成 crypto 库进行 RSA/ECDSA 验证

    if (!message.signature) {
      throw new Error('Missing signature');
    }

    // 验证时间戳（5分钟有效期）
    const now = Date.now();
    const messageTime = new Date(message.timestamp).getTime();
    const fiveMinutes = 5 * 60 * 1000;
    if (Math.abs(now - messageTime) > fiveMinutes) {
      throw new Error('Message timestamp expired');
    }

    this.logger.debug(`Signature verified for message: ${message.messageId}`);
  }

  /**
   * 清洗内容
   * 移除潜在的危险内容
   */
  private sanitizeContent(content: string): string {
    // 1. 移除脚本标签
    let sanitized = content.replace(/<script[^>]*>.*?<\/script>/gi, '');

    // 2. 限制内容长度
    const maxLength = 50000; // 最大5万字
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    // 3. 保留允许的HTML标签（如果有）
    // 这里简化处理，实际可能需要更复杂的HTML清理

    return sanitized.trim();
  }

  /**
   * 验证标题
   */
  private validateTitle(title: string): string {
    const maxLength = 100;
    const minLength = 1;

    if (!title || title.length < minLength) {
      throw new Error('Title is required');
    }

    if (title.length > maxLength) {
      title = title.substring(0, maxLength);
    }

    // 移除特殊字符
    return title.replace(/[<>\"']/g, '').trim();
  }

  /**
   * 清洗文本
   */
  private sanitizeText(text: string): string {
    if (!text) return '';

    // 限制长度
    const maxLength = 5000;
    if (text.length > maxLength) {
      text = text.substring(0, maxLength);
    }

    // 移除危险字符
    return text.replace(/[<>\"']/g, '').trim();
  }

  /**
   * 标准化分数
   */
  private normalizeScore(score: number): number {
    // 确保分数在0-100范围内
    return Math.max(0, Math.min(100, score));
  }
}
