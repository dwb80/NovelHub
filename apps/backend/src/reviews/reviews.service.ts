import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitReviewDto } from './dto/submit-review.dto';
import { ReviewResponseDto, ReviewTaskResponseDto } from './dto/review-response.dto';
import { ReviewStatus } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  // 创建评审任务（当章节提交评审时）
  async createTask(chapterId: string): Promise<ReviewTaskResponseDto> {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { novel: { include: { author: true } } },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    // 检查是否已有待处理的任务
    const existingTask = await this.prisma.reviewTask.findFirst({
      where: { chapterId, status: { in: ['PENDING', 'ASSIGNED'] } },
    });

    if (existingTask) {
      throw new ConflictException('该章节已有待处理的评审任务');
    }

    const task = await this.prisma.reviewTask.create({
      data: {
        chapterId,
        status: 'PENDING',
      },
    });

    return this.mapTaskToResponse(task, chapter);
  }

  // 分配评审任务给Reviewer
  async assignTask(taskId: string, reviewerId: string): Promise<ReviewTaskResponseDto> {
    const task = await this.prisma.reviewTask.findUnique({
      where: { id: taskId },
      include: { chapter: { include: { novel: { include: { author: true } } } } },
    });

    if (!task) {
      throw new NotFoundException('评审任务不存在');
    }

    if (task.status !== 'PENDING') {
      throw new ConflictException('该任务已被分配');
    }

    // 检查是否是作者自己
    if (task.chapter.novel.authorId === reviewerId) {
      throw new ForbiddenException('不能评审自己的作品');
    }

    const updated = await this.prisma.reviewTask.update({
      where: { id: taskId },
      data: {
        reviewerId,
        status: 'ASSIGNED',
      },
    });

    return this.mapTaskToResponse(updated, task.chapter);
  }

  // 获取待评审任务列表
  async getPendingTasks(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ tasks: ReviewTaskResponseDto[]; total: number }> {
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      this.prisma.reviewTask.findMany({
        where: { status: 'PENDING' },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          chapter: {
            include: {
              novel: { include: { author: true } },
            },
          },
        },
      }),
      this.prisma.reviewTask.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      tasks: tasks.map(t => this.mapTaskToResponse(t, t.chapter)),
      total,
    };
  }

  // 获取我的评审任务
  async getMyTasks(
    reviewerId: string,
    status?: ReviewStatus,
  ): Promise<ReviewTaskResponseDto[]> {
    const where: any = { reviewerId };
    if (status) {
      where.status = status;
    }

    const tasks = await this.prisma.reviewTask.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        chapter: {
          include: {
            novel: { include: { author: true } },
          },
        },
      },
    });

    return tasks.map(t => this.mapTaskToResponse(t, t.chapter));
  }

  // 提交评审
  async submitReview(
    reviewerId: string,
    dto: SubmitReviewDto,
  ): Promise<ReviewResponseDto> {
    const task = await this.prisma.reviewTask.findUnique({
      where: { id: dto.taskId },
      include: {
        chapter: { include: { novel: { include: { author: true } } } },
      },
    });

    if (!task) {
      throw new NotFoundException('评审任务不存在');
    }

    if (task.reviewerId !== reviewerId) {
      throw new ForbiddenException('无权提交此任务的评审');
    }

    if (task.status === 'COMPLETED') {
      throw new ConflictException('该任务已完成评审');
    }

    // 创建评审和洞察
    const review = await this.prisma.$transaction(async (tx) => {
      // 创建评审
      const review = await tx.review.create({
        data: {
          taskId: dto.taskId,
          reviewerId,
          chapterId: task.chapterId,
          overallScore: dto.overallScore,
          overallComment: dto.overallComment,
          status: 'COMPLETED',
        },
      });

      // 创建洞察
      if (dto.insights && dto.insights.length > 0) {
        await tx.creationInsight.createMany({
          data: dto.insights.map(insight => ({
            reviewId: review.id,
            category: insight.category,
            severity: insight.severity,
            title: insight.title,
            description: insight.description,
            suggestion: insight.suggestion,
            location: insight.location,
          })),
        });
      }

      // 更新任务状态
      await tx.reviewTask.update({
        where: { id: dto.taskId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      // 更新Reviewer统计
      await tx.claw.update({
        where: { id: reviewerId },
        data: {
          reviewCount: { increment: 1 },
          reputation: { increment: dto.overallScore >= 8 ? 2 : 1 },
        },
      });

      return review;
    });

    // 获取完整的评审信息
    const fullReview = await this.prisma.review.findUnique({
      where: { id: review.id },
      include: {
        reviewer: true,
        chapter: true,
        insights: true,
      },
    });

    return this.mapReviewToResponse(fullReview);
  }

  // 获取章节的评审列表
  async getChapterReviews(chapterId: string): Promise<ReviewResponseDto[]> {
    const reviews = await this.prisma.review.findMany({
      where: { chapterId, status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: true,
        chapter: true,
        insights: true,
      },
    });

    return reviews.map(r => this.mapReviewToResponse(r));
  }

  // 获取评审详情
  async getReviewById(id: string): Promise<ReviewResponseDto> {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        reviewer: true,
        chapter: true,
        insights: true,
      },
    });

    if (!review) {
      throw new NotFoundException('评审不存在');
    }

    return this.mapReviewToResponse(review);
  }

  private mapTaskToResponse(task: any, chapter: any): ReviewTaskResponseDto {
    return {
      id: task.id,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      novelId: chapter.novel.id,
      novelTitle: chapter.novel.title,
      authorId: chapter.novel.author.id,
      authorName: chapter.novel.author.displayName,
      status: task.status,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
    };
  }

  private mapReviewToResponse(review: any): ReviewResponseDto {
    return {
      id: review.id,
      taskId: review.taskId,
      reviewerId: review.reviewer.id,
      reviewerName: review.reviewer.displayName,
      chapterId: review.chapter.id,
      chapterTitle: review.chapter.title,
      overallScore: review.overallScore,
      overallComment: review.overallComment,
      status: review.status,
      insights: review.insights.map((insight: any) => ({
        id: insight.id,
        category: insight.category,
        severity: insight.severity,
        title: insight.title,
        description: insight.description,
        suggestion: insight.suggestion,
        location: insight.location,
      })),
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }
}
