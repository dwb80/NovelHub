import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskType, ReviewStatus } from '@prisma/client';

export interface ReviewTaskResult {
  taskId: string;
  chapterId: string;
  approved: boolean;
  score: number;
  comments: string[];
  suggestions: string[];
  reviewerId: string;
  timestamp: Date;
}

@Injectable()
export class ReviewTaskService {
  private readonly logger = new Logger(ReviewTaskService.name);

  constructor(
    private prisma: PrismaService,
  ) {}

  async createReviewTask(chapterId: string, novelId: string): Promise<any> {
    const task = await this.prisma.reviewTask.create({
      data: {
        chapterId,
        novelId,
        type: TaskType.CHAPTER,
        status: ReviewStatus.PENDING,
        requiredCapabilities: [],
      },
    });

    this.logger.log(`Created review task for chapter ${chapterId}`);
    return task;
  }

  async getPendingTasks(limit: number = 10): Promise<any[]> {
    return this.prisma.reviewTask.findMany({
      where: { status: ReviewStatus.PENDING },
      orderBy: [
        { createdAt: 'asc' },
      ],
      take: limit,
    });
  }

  async assignTask(taskId: string, reviewerId: string): Promise<any> {
    const task = await this.prisma.reviewTask.update({
      where: { id: taskId },
      data: {
        reviewerId: reviewerId,
        status: ReviewStatus.ASSIGNED,
        assignedAt: new Date(),
      },
    });

    this.logger.log(`Assigned task ${taskId} to reviewer ${reviewerId}`);
    return task;
  }

  async completeTask(taskId: string, result: ReviewTaskResult): Promise<any> {
    const task = await this.prisma.reviewTask.update({
      where: { id: taskId },
      data: {
        status: ReviewStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    await this.prisma.chapter.update({
      where: { id: result.chapterId },
      data: {
        status: result.approved ? 'PUBLISHED' : 'REJECTED',
      },
    });

    // 获取章节信息
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: result.chapterId },
    });

    await this.prisma.review.create({
      data: {
        taskId,
        novelId: chapter?.novelId || '',
        chapterId: result.chapterId,
        reviewerId: result.reviewerId,
        overallScore: result.score,
        overallRating: Math.round(result.score),
        plotRating: Math.round(result.score),
        characterRating: Math.round(result.score),
        pacingRating: Math.round(result.score),
        styleRating: Math.round(result.score),
        status: ReviewStatus.COMPLETED,
        comment: result.comments.join('; '),
      },
    });

    this.logger.log(`Completed review task ${taskId}, chapter ${result.chapterId} ${result.approved ? 'approved' : 'rejected'}`);
    return task;
  }

  async getTask(taskId: string): Promise<any | null> {
    return this.prisma.reviewTask.findUnique({
      where: { id: taskId },
    });
  }

  async getChapterReviews(chapterId: string): Promise<any[]> {
    return this.prisma.review.findMany({
      where: { chapterId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReviewStats(): Promise<{
    pending: number;
    inProgress: number;
    completed: number;
    total: number;
  }> {
    const [pending, assigned, completed] = await Promise.all([
      this.prisma.reviewTask.count({ where: { status: ReviewStatus.PENDING } }),
      this.prisma.reviewTask.count({ where: { status: ReviewStatus.ASSIGNED } }),
      this.prisma.reviewTask.count({ where: { status: ReviewStatus.COMPLETED } }),
    ]);

    return {
      pending,
      inProgress: assigned,
      completed,
      total: pending + assigned + completed,
    };
  }
}
