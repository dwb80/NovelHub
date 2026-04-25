import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToBookshelfDto, UpdateBookshelfStatusDto, UpdateReadingProgressDto } from './dto/add-to-bookshelf.dto';
import { BookshelfItemDto, ReadingHistoryItemDto } from './dto/bookshelf-response.dto';

@Injectable()
export class BookshelfService {
  constructor(private prisma: PrismaService) { }

  // 获取我的书架
  async getMyBookshelf(readerId: string): Promise<BookshelfItemDto[]> {
    const items = await this.prisma.bookshelf.findMany({
      where: { readerId },
      orderBy: { updatedAt: 'desc' },
    });

    const result: BookshelfItemDto[] = [];
    for (const item of items) {
      const novel = await this.prisma.novel.findUnique({
        where: { id: item.novelId },
        include: { author: { select: { name: true } } },
      });
      const lastChapter = item.lastChapterId ? await this.prisma.chapter.findUnique({
        where: { id: item.lastChapterId },
        select: { id: true, title: true },
      }) : null;

      result.push({
        id: item.id,
        novelId: item.novelId,
        novelTitle: novel?.title || '',
        novelCover: novel?.cover || undefined,
        authorName: (novel as any)?.author?.name || '',
        status: item.status as any,
        lastChapterId: lastChapter?.id || undefined,
        lastChapterTitle: lastChapter?.title || undefined,
        progress: item.progress,
        lastReadAt: item.lastReadAt || new Date(),
        addedAt: item.createdAt,
      });
    }

    return result;
  }

  // 获取阅读历史
  async getReadingHistory(readerId: string, limit: number = 50): Promise<ReadingHistoryItemDto[]> {
    const items = await this.prisma.readingHistory.findMany({
      where: { readerId },
      orderBy: { readAt: 'desc' },
      take: limit,
    });

    const result: ReadingHistoryItemDto[] = [];
    for (const item of items) {
      const novel = await this.prisma.novel.findUnique({
        where: { id: item.novelId },
        select: { id: true, title: true },
      });
      const chapter = await this.prisma.chapter.findUnique({
        where: { id: item.chapterId },
        select: { id: true, title: true, orderIndex: true },
      });

      result.push({
        id: item.id,
        novelId: item.novelId,
        novelTitle: novel?.title || '',
        chapterId: item.chapterId,
        chapterTitle: chapter?.title || '',
        chapterOrder: chapter?.orderIndex || 0,
        progress: item.progress,
        readAt: item.readAt,
      });
    }

    return result;
  }

  // 添加到书架
  async addToBookshelf(readerId: string, dto: AddToBookshelfDto): Promise<BookshelfItemDto> {
    // 检查小说是否存在
    const novel = await this.prisma.novel.findUnique({
      where: { id: dto.novelId },
      include: { author: { select: { name: true } } },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在');
    }

    // 检查是否已在书架
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
        status: (dto.status || 'WANT_TO_READ') as any,
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

  // 更新书架状态
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
