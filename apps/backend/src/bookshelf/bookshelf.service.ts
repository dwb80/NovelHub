import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToBookshelfDto, UpdateBookshelfStatusDto, UpdateReadingProgressDto } from './dto/add-to-bookshelf.dto';
import { BookshelfItemDto, ReadingHistoryItemDto } from './dto/bookshelf-response.dto';
import { BookshelfSortType, BookshelfStatus } from '../common/constants';

@Injectable()
export class BookshelfService {
  constructor(private prisma: PrismaService) { }

  /**
   * 获取用户书架列表
   * @param readerId 读者ID
   * @param sort 排序方式
   * @returns 书架项目列表
   * @performance 优化前: N+1 查询 (1 + 2N次DB) | 优化后: 仅3次DB查询
   */
  async getMyBookshelf(
    readerId: string,
    sort?: BookshelfSortType,
  ): Promise<BookshelfItemDto[]> {
    const orderBy = this.getOrderByCondition(sort);

    // 批量查询消除N+1
    const items = await this.prisma.bookshelf.findMany({
      where: { readerId },
      orderBy,
    });

    const novelIds = items.map(i => i.novelId);
    const chapterIds = items.filter(i => i.lastChapterId).map(i => i.lastChapterId!);

    // 批量查询小说和章节
    const [novels, chapters] = await Promise.all([
      this.prisma.novel.findMany({
        where: { id: { in: novelIds } },
        select: {
          id: true,
          title: true,
          cover: true,
          authorId: true,
        },
      }),
      this.prisma.chapter.findMany({
        where: { id: { in: chapterIds } },
        select: { id: true, title: true },
      }),
    ]);

    const authorIds = [...new Set(novels.map(n => n.authorId))];
    const authors = await this.prisma.claw.findMany({
      where: { id: { in: authorIds } },
      select: { id: true, name: true },
    });

    const novelMap = new Map(novels.map(n => [n.id, n]));
    const chapterMap = new Map(chapters.map(c => [c.id, c]));
    const authorMap = new Map(authors.map(a => [a.id, a]));

    return items.map(item => {
      const novel = novelMap.get(item.novelId);
      const author = novel?.authorId ? authorMap.get(novel.authorId) : null;
      const lastChapter = item.lastChapterId ? chapterMap.get(item.lastChapterId) : null;

      return {
        id: item.id,
        novelId: item.novelId,
        novelTitle: novel?.title || '',
        novelCover: novel?.cover || undefined,
        authorName: author?.name || '',
        status: item.status as any,
        lastChapterId: lastChapter?.id || undefined,
        lastChapterTitle: lastChapter?.title || undefined,
        progress: item.progress,
        lastReadAt: item.lastReadAt || new Date(),
        addedAt: item.createdAt,
      };
    });
  }

  private getOrderByCondition(sort?: BookshelfSortType): any {
    switch (sort) {
      case BookshelfSortType.ADDED:
        return { createdAt: 'desc' };
      case BookshelfSortType.PROGRESS:
        return { progress: 'desc' };
      case BookshelfSortType.RECENT:
      default:
        return { lastReadAt: 'desc', updatedAt: 'desc' };
    }
  }

  /**
   * 获取阅读历史
   * @param readerId 读者ID
   * @param limit 限制条数
   * @performance 优化前: N+1 查询 | 优化后: 仅3次DB查询
   */
  async getReadingHistory(readerId: string, limit: number = 50): Promise<ReadingHistoryItemDto[]> {
    const items = await this.prisma.readingHistory.findMany({
      where: { readerId },
      orderBy: { readAt: 'desc' },
      take: limit,
    });

    const novelIds = items.map(i => i.novelId);
    const chapterIds = items.map(i => i.chapterId);

    // 批量查询，消除N+1
    const [novels, chapters] = await Promise.all([
      this.prisma.novel.findMany({
        where: { id: { in: novelIds } },
        select: { id: true, title: true },
      }),
      this.prisma.chapter.findMany({
        where: { id: { in: chapterIds } },
        select: { id: true, title: true, orderIndex: true },
      }),
    ]);

    const novelMap = new Map(novels.map(n => [n.id, n]));
    const chapterMap = new Map(chapters.map(c => [c.id, c]));

    return items.map(item => ({
      id: item.id,
      novelId: item.novelId,
      novelTitle: novelMap.get(item.novelId)?.title || '',
      chapterId: item.chapterId,
      chapterTitle: chapterMap.get(item.chapterId)?.title || '',
      chapterOrder: chapterMap.get(item.chapterId)?.orderIndex || 0,
      progress: item.progress,
      readAt: item.readAt,
    }));
  }

  /**
   * 添加小说到书架
   * @param readerId 读者ID
   * @param dto 书架DTO
   */
  async addToBookshelf(readerId: string, dto: AddToBookshelfDto): Promise<BookshelfItemDto> {
    const novel = await this.prisma.novel.findUnique({
      where: { id: dto.novelId },
      include: { author: { select: { name: true } } },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在');
    }

    const existing = await this.prisma.bookshelf.findFirst({
      where: {
        readerId,
        novelId: dto.novelId,
      },
    });

    if (existing) {
      throw new ConflictException('该小说已在书架中');
    }

    const item = await this.prisma.bookshelf.create({
      data: {
        readerId,
        clawId: readerId,
        novelId: dto.novelId,
        status: (dto.status || BookshelfStatus.WANT_TO_READ) as any,
        progress: 0,
      },
    });

    return {
      id: item.id,
      novelId: item.novelId,
      novelTitle: novel.title,
      novelCover: novel.cover || undefined,
      authorName: (novel as any).author?.name || '',
      status: item.status as any,
      lastChapterId: undefined,
      lastChapterTitle: undefined,
      progress: item.progress,
      lastReadAt: item.lastReadAt || new Date(),
      addedAt: item.createdAt,
    };
  }

  /**
   * 更新书架中小说的阅读状态
   * @param readerId 读者ID
   * @param novelId 小说ID
   * @param dto 状态更新DTO
   * @returns 更新后的书架项
   * @enum READING-阅读中 / COMPLETED-已读完 / DROPPED-放弃 / WISHLIST-心愿单
   */
  async updateStatus(
    readerId: string,
    novelId: string,
    dto: UpdateBookshelfStatusDto,
  ): Promise<BookshelfItemDto> {
    const item = await this.prisma.bookshelf.findFirst({
      where: {
        readerId,
        novelId,
      },
    });

    if (!item) {
      throw new NotFoundException('书架中不存在该小说');
    }

    const updated = await this.prisma.bookshelf.update({
      where: {
        id: item.id,
      },
      data: { status: dto.status as any },
    });

    const novel = await this.prisma.novel.findUnique({
      where: { id: novelId },
      include: { author: { select: { name: true } } },
    });
    const lastChapter = updated.lastChapterId ? await this.prisma.chapter.findUnique({
      where: { id: updated.lastChapterId },
      select: { id: true, title: true },
    }) : null;

    return {
      id: updated.id,
      novelId: updated.novelId,
      novelTitle: novel?.title || '',
      novelCover: novel?.cover || undefined,
      authorName: (novel as any)?.author?.name || '',
      status: updated.status as any,
      lastChapterId: lastChapter?.id || undefined,
      lastChapterTitle: lastChapter?.title || undefined,
      progress: updated.progress,
      lastReadAt: updated.lastReadAt || new Date(),
      addedAt: updated.createdAt,
    };
  }

  // 更新阅读进度
  async updateProgress(
    readerId: string,
    novelId: string,
    dto: UpdateReadingProgressDto,
  ): Promise<BookshelfItemDto> {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: dto.chapterId },
      select: { id: true, title: true, novelId: true },
    });

    if (!chapter || chapter.novelId !== novelId) {
      throw new NotFoundException('章节不存在或不属于该小说');
    }

    // 查找现有记录
    const existingItem = await this.prisma.bookshelf.findFirst({
      where: {
        readerId,
        novelId,
      },
    });

    // 更新或创建书架记录
    const item = existingItem
      ? await this.prisma.bookshelf.update({
        where: { id: existingItem.id },
        data: {
          lastChapterId: dto.chapterId,
          progress: dto.progress,
          lastReadAt: new Date(),
          status: dto.progress >= 100 ? 'COMPLETED' : 'READING',
        },
      })
      : await this.prisma.bookshelf.create({
        data: {
          readerId,
          clawId: readerId,
          novelId,
          lastChapterId: dto.chapterId,
          progress: dto.progress,
          status: dto.progress >= 100 ? 'COMPLETED' : 'READING',
          lastReadAt: new Date(),
        },
      });

    // 记录阅读历史
    await this.prisma.readingHistory.create({
      data: {
        readerId,
        clawId: readerId,
        novelId,
        chapterId: dto.chapterId,
        progress: dto.progress,
        readAt: new Date(),
      },
    });

    const novel = await this.prisma.novel.findUnique({
      where: { id: novelId },
      include: { author: { select: { name: true } } },
    });

    return {
      id: item.id,
      novelId: item.novelId,
      novelTitle: novel?.title || '',
      novelCover: novel?.cover || undefined,
      authorName: (novel as any)?.author?.name || '',
      status: item.status as any,
      lastChapterId: chapter.id,
      lastChapterTitle: chapter.title,
      progress: item.progress,
      lastReadAt: item.lastReadAt || new Date(),
      addedAt: item.createdAt,
    };
  }

  // 从书架移除
  async removeFromBookshelf(readerId: string, novelId: string): Promise<void> {
    const item = await this.prisma.bookshelf.findFirst({
      where: {
        readerId,
        novelId,
      },
    });

    if (!item) {
      throw new NotFoundException('书架中不存在该小说');
    }

    await this.prisma.bookshelf.delete({
      where: {
        id: item.id,
      },
    });
  }

  // 检查小说是否在书架中
  async isInBookshelf(readerId: string, novelId: string): Promise<boolean> {
    const item = await this.prisma.bookshelf.findFirst({
      where: {
        readerId,
        novelId,
      },
    });
    return !!item;
  }
}
