import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NovelStatus, ChapterStatus } from '@prisma/client';

@Injectable()
export class AdminNovelService {
  constructor(private prisma: PrismaService) {}

  // ========== 小说管理 ==========
  async getNovels(params: { page?: number; limit?: number; status?: string; authorId?: string; authorName?: string; search?: string }) {
    const { page = 1, limit = 20, status, authorId, authorName, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (authorId) where.authorId = authorId;

    if (authorName) {
      where.author = {
        name: { contains: authorName, mode: 'insensitive' }
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [novels, total] = await Promise.all([
      this.prisma.novel.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, clawId: true },
          },
        },
      }),
      this.prisma.novel.count({ where }),
    ]);

    return {
      novels: novels.map(novel => ({
        id: novel.id,
        title: novel.title,
        description: novel.description,
        status: novel.status,
        author: novel.author,
        chapterCount: novel.chapterCount,
        commentCount: 0,
        viewCount: novel.viewCount,
        likeCount: 0,
        createdAt: novel.createdAt,
        updatedAt: novel.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateNovelStatus(novelId: string, status: string) {
    const novel = await this.prisma.novel.findUnique({
      where: { id: novelId },
    });

    if (!novel) {
      throw new UnauthorizedException('小说不存在');
    }

    await this.prisma.novel.update({
      where: { id: novelId },
      data: { status: status as NovelStatus },
    });

    return { success: true, message: '小说状态已更新' };
  }

  async deleteNovel(novelId: string) {
    const novel = await this.prisma.novel.findUnique({
      where: { id: novelId },
    });

    if (!novel) {
      throw new UnauthorizedException('小说不存在');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.comment.deleteMany({ where: { novelId } });
      await tx.readingHistory.deleteMany({ where: { novelId } });
      await tx.bookshelf.deleteMany({ where: { novelId } });
      await tx.reviewerScoreLog.updateMany({
        where: { novelId },
        data: { novelId: null },
      });
      await tx.paymentOrder.updateMany({
        where: { novelId },
        data: { novelId: null },
      });
      await tx.novel.delete({ where: { id: novelId } });
    });

    return { success: true, message: '小说已删除' };
  }

  async batchDeleteNovels(novelIds: string[]) {
    if (!novelIds || novelIds.length === 0) {
      throw new UnauthorizedException('小说ID列表不能为空');
    }

    await this.prisma.$transaction(async (tx) => {
      for (const novelId of novelIds) {
        await tx.comment.deleteMany({ where: { novelId } });
        await tx.readingHistory.deleteMany({ where: { novelId } });
        await tx.bookshelf.deleteMany({ where: { novelId } });
        await tx.reviewerScoreLog.updateMany({
          where: { novelId },
          data: { novelId: null },
        });
        await tx.paymentOrder.updateMany({
          where: { novelId },
          data: { novelId: null },
        });
      }
      await tx.novel.deleteMany({
        where: { id: { in: novelIds } },
      });
    });

    return { success: true, message: `成功删除 ${novelIds.length} 本小说` };
  }

  async getNovelDetail(novelId: string) {
    const novel = await this.prisma.novel.findUnique({
      where: { id: novelId },
      include: {
        author: {
          select: { id: true, name: true, clawId: true },
        },
        chapters: {
          select: { id: true, title: true, orderIndex: true, status: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!novel) {
      throw new UnauthorizedException('小说不存在');
    }

    return {
      id: novel.id,
      title: novel.title,
      description: novel.description,
      cover: novel.cover,
      status: novel.status,
      category: novel.category,
      tags: novel.tags,
      wordCount: novel.wordCount,
      chapterCount: novel.chapterCount,
      viewCount: novel.viewCount,
      rating: novel.rating,
      ratingCount: novel.ratingCount,
      author: novel.author,
      chapters: novel.chapters,
      createdAt: novel.createdAt,
      updatedAt: novel.updatedAt,
      publishedAt: novel.publishedAt,
    };
  }

  async getNovelReviewDetail(novelId: string) {
    const novel = await this.prisma.novel.findUnique({
      where: { id: novelId },
      include: {
        author: {
          select: { id: true, name: true, clawId: true },
        },
        reviews: {
          include: {
            reviewer: {
              select: { id: true, name: true, clawId: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!novel) {
      throw new UnauthorizedException('小说不存在');
    }

    return {
      id: novel.id,
      title: novel.title,
      author: novel.author,
      status: novel.status,
      reviews: novel.reviews.map(review => ({
        id: review.id,
        status: 'COMPLETED',
        score: review.overallRating,
        comment: review.comment,
        reviewer: review.reviewer ? {
          id: review.reviewer.id,
          name: review.reviewer.name || '未知评审员',
          clawId: review.reviewer.clawId,
          level: 'JUNIOR',
        } : null,
        createdAt: review.createdAt,
        updatedAt: review.createdAt,
      })),
    };
  }

  async getChapterReviews(novelId: string, params: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { novelId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          chapter: {
            select: { id: true, title: true, orderIndex: true },
          },
          reviewer: {
            select: { id: true, name: true, clawId: true },
          },
        },
      }),
      this.prisma.review.count({ where: { novelId } }),
    ]);

    return {
      reviews: reviews.map(review => ({
        id: review.id,
        chapter: review.chapter,
        status: 'COMPLETED',
        score: review.overallRating,
        comment: review.comment,
        reviewer: review.reviewer ? {
          id: review.reviewer.id,
          name: review.reviewer.name || '未知评审员',
          clawId: review.reviewer.clawId,
          level: 'JUNIOR',
        } : null,
        createdAt: review.createdAt,
        updatedAt: review.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getChapters(params: { page?: number; limit?: number; status?: string; novelId?: string; search?: string }) {
    const { page = 1, limit = 20, status, novelId, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (novelId) where.novelId = novelId;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { novel: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [chapters, total] = await Promise.all([
      this.prisma.chapter.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          novel: {
            select: { id: true, title: true, author: { select: { id: true, name: true } } },
          },
          reviewTasks: {
            select: { id: true, status: true, reviewer: { select: { id: true, displayName: true } } },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.chapter.count({ where }),
    ]);

    return {
      items: chapters.map(chapter => {
        // 检查是否有已领取的评审任务
        const assignedTask = chapter.reviewTasks?.find(t => t.status === 'ASSIGNED');
        const hasAssignedTask = !!assignedTask;
        
        return {
          id: chapter.id,
          title: chapter.title,
          chapterNumber: chapter.orderIndex,
          novelId: chapter.novelId,
          novelTitle: chapter.novel?.title || '未知小说',
          authorName: chapter.novel?.author?.name || '未知作者',
          wordCount: chapter.wordCount,
          status: chapter.status,
          reviewStatus: hasAssignedTask ? 'ASSIGNED' : (chapter.reviewTasks?.[0]?.status || null),
          reviewerName: assignedTask?.reviewer?.displayName || null,
          isVIP: chapter.isVip,
          viewCount: chapter.viewCount,
          createdAt: chapter.createdAt,
          updatedAt: chapter.updatedAt,
        };
      }),
      total,
      page,
      limit,
    };
  }

  async getChapterDetail(chapterId: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        novel: {
          select: { id: true, title: true, author: { select: { id: true, name: true } } },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: { id: true, comment: true, createdAt: true },
        },
      },
    });

    if (!chapter) {
      throw new UnauthorizedException('章节不存在');
    }

    return {
      id: chapter.id,
      title: chapter.title,
      content: chapter.content,
      chapterNumber: chapter.orderIndex,
      novelId: chapter.novelId,
      novelTitle: chapter.novel?.title || '未知小说',
      authorName: chapter.novel?.author?.name || '未知作者',
      wordCount: chapter.wordCount,
      status: chapter.status,
      isVIP: chapter.isVip,
      viewCount: chapter.viewCount,
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
      publishedAt: chapter.publishedAt,
      reviews: chapter.reviews,
    };
  }

  async updateChapterStatus(chapterId: string, status: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new UnauthorizedException('章节不存在');
    }

    const updatedChapter = await this.prisma.chapter.update({
      where: { id: chapterId },
      data: { status: status as ChapterStatus },
    });

    return {
      success: true,
      message: '章节状态已更新',
      chapter: updatedChapter,
    };
  }

  async deleteChapter(chapterId: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new UnauthorizedException('章节不存在');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.comment.deleteMany({ where: { chapterId } });
      await tx.readingHistory.deleteMany({ where: { chapterId } });
      await tx.review.deleteMany({ where: { chapterId } });
      await tx.chapter.delete({ where: { id: chapterId } });
    });

    // 更新小说字数和章节数
    await this.prisma.novel.update({
      where: { id: chapter.novelId },
      data: {
        chapterCount: { decrement: 1 },
        wordCount: { decrement: chapter.wordCount },
      },
    });

    return { success: true, message: '章节已删除' };
  }

  // ========== 评审任务管理 ==========
  async getReviewTasks(params: { page?: number; limit?: number; search?: string; authorName?: string }) {
    const { page = 1, limit = 20, search, authorName } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { chapter: { title: { contains: search, mode: 'insensitive' } } },
        { novel: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (authorName) {
      where.novel = {
        author: {
          name: { contains: authorName, mode: 'insensitive' },
        },
      };
    }

    const [tasks, total] = await Promise.all([
      this.prisma.reviewTask.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          chapter: {
            select: { id: true, title: true },
          },
          novel: {
            select: { id: true, title: true, author: { select: { id: true, name: true } } },
          },
        },
      }),
      this.prisma.reviewTask.count({ where }),
    ]);

    return {
      tasks: tasks.map(task => ({
        id: task.id,
        chapterId: task.chapterId,
        chapterTitle: task.chapter?.title || '未知章节',
        novelId: task.novelId,
        novelTitle: task.novel?.title || '未知小说',
        authorId: task.novel?.author?.id || '',
        authorName: task.novel?.author?.name || '未知AI智能体作家',
        status: task.status,
        createdAt: task.createdAt,
        completedAt: task.completedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async approveChapter(chapterId: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { novel: true },
    });

    if (!chapter) {
      throw new UnauthorizedException('章节不存在');
    }

    if (chapter.status === 'PUBLISHED') {
      throw new UnauthorizedException('章节已发布');
    }

    await this.prisma.$transaction(async (tx) => {
      // 更新章节状态为已发布
      await tx.chapter.update({
        where: { id: chapterId },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
      });

      // 更新相关评审任务状态
      await tx.reviewTask.updateMany({
        where: { chapterId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      // 检查是否所有章节都已发布，如果是则更新小说状态为PUBLISHED
      const novelChapters = await tx.chapter.findMany({
        where: { novelId: chapter.novelId },
        select: { status: true },
      });

      const allPublished = novelChapters.every((c: { status: string }) => c.status === 'PUBLISHED');
      if (allPublished) {
        await tx.novel.update({
          where: { id: chapter.novelId },
          data: { status: 'PUBLISHED' },
        });
      }
    });

    return { success: true, message: '章节已通过审核' };
  }

  async rejectChapter(chapterId: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { novel: true },
    });

    if (!chapter) {
      throw new UnauthorizedException('章节不存在');
    }

    if (chapter.status === 'PUBLISHED') {
      throw new UnauthorizedException('已发布的章节无法驳回');
    }

    await this.prisma.$transaction(async (tx) => {
      // 更新章节状态为已拒绝
      await tx.chapter.update({
        where: { id: chapterId },
        data: { status: 'REJECTED' },
      });

      // 更新相关评审任务状态
      await tx.reviewTask.updateMany({
        where: { chapterId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
    });

    return { success: true, message: '章节已被驳回' };
  }
}
