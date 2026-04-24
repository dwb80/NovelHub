import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppealDto, ProcessAppealDto, AppealResponseDto } from './dto/appeal.dto';

@Injectable()
export class AppealsService {
  private readonly MAX_APPEALS_PER_MONTH = 3;

  constructor(private prisma: PrismaService) { }

  /**
   * 检查用户当月申诉次数是否超限
   */
  private async checkAppealLimit(appellantId: string): Promise<void> {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const appealCount = await this.prisma.reviewAppeal.count({
      where: {
        appellantId,
        createdAt: { gte: monthStart },
      },
    });

    if (appealCount >= this.MAX_APPEALS_PER_MONTH) {
      throw new ForbiddenException(
        `本月申诉次数已达上限(${this.MAX_APPEALS_PER_MONTH}次)，请下个月再试`
      );
    }
  }

  /**
   * 创建申诉
   */
  async createAppeal(appellantId: string, dto: CreateAppealDto): Promise<AppealResponseDto> {
    // 检查申诉次数限制
    await this.checkAppealLimit(appellantId);

    // 检查评审是否存在
    const review = await this.prisma.review.findUnique({
      where: { id: dto.reviewId },
      include: {
        chapter: {
          include: {
            novel: true,
          },
        },
        task: true,
      },
    });

    if (!review) {
      throw new NotFoundException('评审记录不存在');
    }

    // 检查是否是AI智能体作家本人
    if (review.chapter?.novel?.authorId !== appellantId) {
      throw new ForbiddenException('只能对自己的作品提交申诉');
    }

    // 检查是否已经申诉过
    const existingAppeal = await this.prisma.reviewAppeal.findFirst({
      where: { reviewId: dto.reviewId },
    });

    if (existingAppeal) {
      throw new ConflictException('该评审已经提交过申诉');
    }

    // 创建申诉
    const now = new Date();
    const appeal = await this.prisma.reviewAppeal.create({
      data: {
        reviewId: dto.reviewId,
        chapterId: review.chapterId || '',
        novelId: review.novelId || '',
        appellantId,
        reason: dto.reason,
        additionalInfo: dto.additionalInfo,
        status: 'PENDING',
        createdAt: now,
        updatedAt: now,
      },
    });

    return this.mapToResponse(appeal);
  }

  /**
   * 获取申诉列表（管理员）
   */
  async getAppeals(params: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ appeals: AppealResponseDto[]; pagination: any }> {
    const { page = 1, limit = 20, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [appeals, total] = await Promise.all([
      this.prisma.reviewAppeal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          chapter: { select: { id: true, title: true } },
          novel: { select: { id: true, title: true } },
          appellant: { select: { id: true, name: true } },
        },
      }),
      this.prisma.reviewAppeal.count({ where }),
    ]);

    return {
      appeals: appeals.map((appeal) => this.mapToResponse(appeal)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取我的申诉（AI智能体作家）
   */
  async getMyAppeals(appellantId: string): Promise<AppealResponseDto[]> {
    const appeals = await this.prisma.reviewAppeal.findMany({
      where: { appellantId },
      orderBy: { createdAt: 'desc' },
      include: {
        chapter: { select: { id: true, title: true } },
        novel: { select: { id: true, title: true } },
        appellant: { select: { id: true, name: true } },
      },
    });

    return appeals.map((appeal) => this.mapToResponse(appeal));
  }

  /**
   * 获取申诉详情
   */
  async getAppealById(appealId: string): Promise<AppealResponseDto> {
    const appeal = await this.prisma.reviewAppeal.findUnique({
      where: { id: appealId },
      include: {
        chapter: { select: { id: true, title: true } },
        novel: { select: { id: true, title: true } },
        appellant: { select: { id: true, name: true } },
      },
    });

    if (!appeal) {
      throw new NotFoundException('申诉不存在');
    }

    return this.mapToResponse(appeal);
  }

  /**
   * 处理申诉（管理员）
   */
  async processAppeal(
    appealId: string,
    processorId: string,
    dto: ProcessAppealDto,
  ): Promise<AppealResponseDto> {
    const appeal = await this.prisma.reviewAppeal.findUnique({
      where: { id: appealId },
      include: {
        chapter: true,
        review: true,
      },
    });

    if (!appeal) {
      throw new NotFoundException('申诉不存在');
    }

    if (appeal.status !== 'PENDING') {
      throw new ConflictException('该申诉已经处理过了');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // 更新申诉状态
      const updatedAppeal = await tx.reviewAppeal.update({
        where: { id: appealId },
        data: {
          status: dto.decision,
          decision: dto.decision,
          comment: dto.comment,
          processedBy: processorId,
          processedAt: new Date(),
        },
      });

      // 如果申诉被批准，重新打开章节进行重新评审
      if (dto.decision === 'APPROVED') {
        // 更新章节状态为 PENDING，允许重新提交审核
        await tx.chapter.update({
          where: { id: appeal.chapterId },
          data: { status: 'DRAFT' },
        });

        // 创建新的评审任务
        await tx.reviewTask.create({
          data: {
            type: 'CHAPTER',
            novelId: appeal.novelId,
            chapterId: appeal.chapterId,
            status: 'PENDING',
            requiredCapabilities: [],
          },
        });
      }

      return updatedAppeal;
    });

    return this.getAppealById(updated.id);
  }

  /**
   * 撤销申诉（AI智能体作家）
   */
  async cancelAppeal(appealId: string, appellantId: string): Promise<void> {
    const appeal = await this.prisma.reviewAppeal.findUnique({
      where: { id: appealId },
    });

    if (!appeal) {
      throw new NotFoundException('申诉不存在');
    }

    if (appeal.appellantId !== appellantId) {
      throw new ForbiddenException('只能撤销自己的申诉');
    }

    if (appeal.status !== 'PENDING') {
      throw new ConflictException('已处理的申诉无法撤销');
    }

    await this.prisma.reviewAppeal.delete({
      where: { id: appealId },
    });
  }

  private mapToResponse(appeal: any): AppealResponseDto {
    return {
      id: appeal.id,
      reviewId: appeal.reviewId,
      chapterId: appeal.chapterId,
      chapterTitle: appeal.chapter?.title || '未知章节',
      novelId: appeal.novelId,
      novelTitle: appeal.novel?.title || '未知小说',
      appellantId: appeal.appellantId,
      appellantName: appeal.appellant?.name || '未知用户',
      reason: appeal.reason,
      additionalInfo: appeal.additionalInfo,
      status: appeal.status,
      decision: appeal.decision,
      comment: appeal.comment,
      processedBy: appeal.processedBy,
      processedAt: appeal.processedAt,
      createdAt: appeal.createdAt,
      updatedAt: appeal.updatedAt,
    };
  }
}
