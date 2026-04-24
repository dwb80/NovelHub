// ============================================
// 领域事件接口定义
// 架构师推导补充，依据: 低耦合原则，通过事件解耦模块
// ============================================

/**
 * 基础领域事件接口
 * 所有领域事件必须实现此接口
 */
export interface DomainEvent {
  /** 事件唯一ID（用于幂等性检查） */
  readonly eventId: string;
  
  /** 事件类型 */
  readonly eventType: string;
  
  /** 聚合根ID */
  readonly aggregateId: string;
  
  /** 聚合类型 */
  readonly aggregateType: string;
  
  /** 事件发生时间 */
  readonly occurredAt: Date;
  
  /** 事件版本 */
  readonly version: string;
  
  /** 事件数据 */
  readonly payload: unknown;
}

/**
 * 事件元数据
 */
export interface EventMetadata {
  /** 发布者ID */
  publisherId?: string;
  
  /** 用户代理 */
  userAgent?: string;
  
  /** IP地址 */
  ipAddress?: string;
  
  /** 追踪ID */
  traceId?: string;
  
  /** 自定义属性 */
  [key: string]: unknown;
}

/**
 * 领域事件基类
 */
export abstract class BaseDomainEvent implements DomainEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly version: string = '1.0';
  
  abstract readonly eventType: string;
  abstract readonly aggregateId: string;
  abstract readonly aggregateType: string;
  abstract readonly payload: unknown;
  
  constructor() {
    this.eventId = this.generateEventId();
    this.occurredAt = new Date();
  }
  
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================
// 小说模块事件
// ============================================

export interface NovelCreatedPayload {
  novelId: string;
  title: string;
  authorId: string;
  category: string;
  createdAt: Date;
}

export class NovelCreatedEvent extends BaseDomainEvent {
  readonly eventType = 'NovelCreated';
  readonly aggregateType = 'Novel';
  
  constructor(
    readonly aggregateId: string,
    readonly payload: NovelCreatedPayload,
  ) {
    super();
  }
}

// ============================================
// 章节模块事件
// ============================================

export interface ChapterSubmittedPayload {
  chapterId: string;
  novelId: string;
  title: string;
  wordCount: number;
  authorId: string;
  submittedAt: Date;
}

export class ChapterSubmittedEvent extends BaseDomainEvent {
  readonly eventType = 'ChapterSubmitted';
  readonly aggregateType = 'Chapter';
  
  constructor(
    readonly aggregateId: string,
    readonly payload: ChapterSubmittedPayload,
  ) {
    super();
  }
}

export interface ChapterPublishedPayload {
  chapterId: string;
  novelId: string;
  title: string;
  publishedAt: Date;
}

export class ChapterPublishedEvent extends BaseDomainEvent {
  readonly eventType = 'ChapterPublished';
  readonly aggregateType = 'Chapter';
  
  constructor(
    readonly aggregateId: string,
    readonly payload: ChapterPublishedPayload,
  ) {
    super();
  }
}

// ============================================
// 评审模块事件
// ============================================

export interface ReviewSubmittedPayload {
  reviewId: string;
  chapterId: string;
  novelId: string;
  reviewerId: string;
  score: number;
  feedback: string;
  submittedAt: Date;
}

export class ReviewSubmittedEvent extends BaseDomainEvent {
  readonly eventType = 'ReviewSubmitted';
  readonly aggregateType = 'Review';
  
  constructor(
    readonly aggregateId: string,
    readonly payload: ReviewSubmittedPayload,
  ) {
    super();
  }
}

export interface ReviewCompletedPayload {
  reviewTaskId: string;
  chapterId: string;
  novelId: string;
  finalScore: number;
  isApproved: boolean;
  completedAt: Date;
}

export class ReviewCompletedEvent extends BaseDomainEvent {
  readonly eventType = 'ReviewCompleted';
  readonly aggregateType = 'ReviewTask';

  constructor(
    readonly aggregateId: string,
    readonly payload: ReviewCompletedPayload,
  ) {
    super();
  }
}

export interface ReviewTaskCreatedPayload {
  reviewTaskId: string;
  novelId: string;
  chapterId?: string;
  type: string;
  minReviewerCount: number;
  maxReviewerCount: number;
  createdAt: Date;
}

export class ReviewTaskCreatedEvent extends BaseDomainEvent {
  readonly eventType = 'ReviewTaskCreated';
  readonly aggregateType = 'ReviewTask';

  constructor(
    readonly aggregateId: string,
    readonly payload: ReviewTaskCreatedPayload,
  ) {
    super();
  }
}

// ============================================
// 读者模块事件
// ============================================

export interface ReaderRegisteredPayload {
  readerId: string;
  username: string;
  email: string;
  registeredAt: Date;
}

export class ReaderRegisteredEvent extends BaseDomainEvent {
  readonly eventType = 'ReaderRegistered';
  readonly aggregateType = 'Reader';

  constructor(
    readonly aggregateId: string,
    readonly payload: ReaderRegisteredPayload,
  ) {
    super();
  }
}

// ============================================
// 评论模块事件
// ============================================

export interface CommentPostedPayload {
  commentId: string;
  novelId: string;
  chapterId?: string;
  clawId: string;
  content: string;
  postedAt: Date;
}

export class CommentPostedEvent extends BaseDomainEvent {
  readonly eventType = 'CommentPosted';
  readonly aggregateType = 'Comment';
  
  constructor(
    readonly aggregateId: string,
    readonly payload: CommentPostedPayload,
  ) {
    super();
  }
}

// ============================================
// NEF模块事件
// ============================================

export interface InsightExtractedPayload {
  archiveId: string;
  clawId: string;
  chapterId: string;
  patternsExtracted: number;
  extractedAt: Date;
}

export class InsightExtractedEvent extends BaseDomainEvent {
  readonly eventType = 'InsightExtracted';
  readonly aggregateType = 'CreationArchive';
  
  constructor(
    readonly aggregateId: string,
    readonly payload: InsightExtractedPayload,
  ) {
    super();
  }
}

export interface EvolutionCompletedPayload {
  archiveId: string;
  clawId: string;
  strategy: string;
  improvements: string[];
  completedAt: Date;
}

export class EvolutionCompletedEvent extends BaseDomainEvent {
  readonly eventType = 'EvolutionCompleted';
  readonly aggregateType = 'CreationArchive';
  
  constructor(
    readonly aggregateId: string,
    readonly payload: EvolutionCompletedPayload,
  ) {
    super();
  }
}
