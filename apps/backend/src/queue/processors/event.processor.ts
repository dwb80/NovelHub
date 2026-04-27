import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger, Injectable, OnModuleInit } from '@nestjs/common';
import { Job } from 'bull';
import { QUEUE_NAMES, JOB_NAMES } from '../../config/queue.config';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../queue.service';

export interface EventJobData {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  payload: Record<string, any>;
}

@Injectable()
@Processor(QUEUE_NAMES.EVENTS)
export class EventProcessor implements OnModuleInit {
  private readonly logger = new Logger(EventProcessor.name);
  private readonly eventHandlers: Map<string, (payload: any) => Promise<void>> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) {}

  onModuleInit() {
    this.registerHandlers();
  }

  private registerHandlers() {
    this.eventHandlers.set(JOB_NAMES.EVENTS.CHAPTER_SUBMITTED, this.handleChapterSubmitted.bind(this));
    this.eventHandlers.set(JOB_NAMES.EVENTS.REVIEW_SUBMITTED, this.handleReviewSubmitted.bind(this));
    this.eventHandlers.set(JOB_NAMES.EVENTS.REVIEW_COMPLETED, this.handleReviewCompleted.bind(this));
    this.eventHandlers.set(JOB_NAMES.EVENTS.NOVEL_PUBLISHED, this.handleNovelPublished.bind(this));
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing event job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.debug(`Event job ${job.id} completed successfully`);
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    this.logger.error(`Event job ${job.id} failed: ${err.message}`, err.stack);
  }

  @Process(JOB_NAMES.EVENTS.CHAPTER_SUBMITTED)
  async handleChapterSubmittedEvent(job: Job<EventJobData>) {
    return this.processEvent(job, JOB_NAMES.EVENTS.CHAPTER_SUBMITTED);
  }

  @Process(JOB_NAMES.EVENTS.REVIEW_SUBMITTED)
  async handleReviewSubmittedEvent(job: Job<EventJobData>) {
    return this.processEvent(job, JOB_NAMES.EVENTS.REVIEW_SUBMITTED);
  }

  @Process(JOB_NAMES.EVENTS.REVIEW_COMPLETED)
  async handleReviewCompletedEvent(job: Job<EventJobData>) {
    return this.processEvent(job, JOB_NAMES.EVENTS.REVIEW_COMPLETED);
  }

  @Process(JOB_NAMES.EVENTS.NOVEL_PUBLISHED)
  async handleNovelPublishedEvent(job: Job<EventJobData>) {
    return this.processEvent(job, JOB_NAMES.EVENTS.NOVEL_PUBLISHED);
  }

  private async processEvent(job: Job<EventJobData>, eventType: string) {
    const { eventId, payload } = job.data;
    
    this.logger.debug(`Processing event ${eventId} of type ${eventType}`);

    try {
      const handler = this.eventHandlers.get(eventType);
      if (handler) {
        await handler(payload);
      }

      await this.prisma.domainEvent.update({
        where: { id: eventId },
        data: {
          status: 'COMPLETED',
          processedAt: new Date(),
        },
      });

      return { success: true, eventId };
    } catch (error: any) {
      await this.prisma.domainEvent.update({
        where: { id: eventId },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
          retryCount: { increment: 1 },
        },
      });

      throw error;
    }
  }

  private async handleChapterSubmitted(payload: any): Promise<void> {
    const { chapterId, novelId, authorId } = payload;
    
    this.logger.log(`Chapter submitted: ${chapterId}`);
    
    await this.queueService.addNotificationJob({
      type: 'in-app',
      recipient: authorId,
      content: `您的章节已提交，正在等待评审`,
      data: { chapterId, novelId },
    });
  }

  private async handleReviewSubmitted(payload: any): Promise<void> {
    const { reviewId, chapterId, reviewerId, authorId } = payload;
    
    this.logger.log(`Review submitted: ${reviewId}`);
    
    await this.queueService.addForgeScoreJob(reviewerId);
    
    await this.queueService.addNotificationJob({
      type: 'in-app',
      recipient: authorId,
      content: `您的章节已收到评审反馈`,
      data: { reviewId, chapterId },
    });
  }

  private async handleReviewCompleted(payload: any): Promise<void> {
    const { reviewId, chapterId, novelId, overallScore } = payload;

    this.logger.log(`Review completed: ${reviewId} with score ${overallScore}`);

    if (overallScore >= 6) {
      await this.queueService.addEvolutionJob({
        agentId: payload.authorId,
        chapterId,
        novelId,
        strategy: 'REFINEMENT',
      });
    }
  }

  private async handleNovelPublished(payload: any): Promise<void> {
    const { novelId, authorId, title } = payload;
    
    this.logger.log(`Novel published: ${novelId} - ${title}`);
    
    await this.queueService.addForgeScoreJob(authorId);
  }
}
