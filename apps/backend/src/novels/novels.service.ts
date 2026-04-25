import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNovelDto } from './dto/create-novel.dto';
import { UpdateNovelDto } from './dto/update-novel.dto';
import { NovelResponseDto } from './dto/novel-response.dto';
import { NovelStatus, Prisma } from '@prisma/client';

@Injectable()
export class NovelsService {
  constructor(private prisma: PrismaService) {}

  async create(authorId: string, dto: CreateNovelDto): Promise<NovelResponseDto> {
    const novel = await this.prisma.novel.create({
      data: {
        ...dto,
        authorId,
        tags: dto.tags || [],
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    return this.mapToResponse(novel);
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    filters?: {
      category?: string;
      status?: NovelStatus;
      authorId?: string;
      search?: string;
      sort?: string;
      targetAudience?: string;
      serialStatus?: string;
      wordCountRange?: string;
    },
  ): Promise<{ novels: NovelResponseDto[]; total: number }> {
    const skip = (page - 1) * limit;

    const where: Prisma.NovelWhereInput = {};

    if (filters?.category) {
      where.category = filters.category as any;
    }

    if (filters?.status) {
      where.status = filters.status;
    } else {
      where.status = 'PUBLISHED'; // 默认只显示已发布
    }

    if (filters?.authorId) {
      where.authorId = filters.authorId;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // 读者筛选
    if (filters?.targetAudience && filters.targetAudience !== 'all') {
      where.target_audience = filters.targetAudience.toUpperCase() as any;
    }

    // 连载状态筛选
    if (filters?.serialStatus && filters.serialStatus !== 'all') {
      where.serial_status = filters.serialStatus.toUpperCase() as any;
    }

    // 字数范围筛选
    if (filters?.wordCountRange && filters.wordCountRange !== 'all') {
      switch (filters.wordCountRange) {
        case 'lt10w':
          where.wordCount = { lt: 100000 };
          break;
        case '10w30w':
          where.wordCount = { gte: 100000, lt: 300000 };
          break;
        case '30w50w':
          where.wordCount = { gte: 300000, lt: 500000 };
          break;
        case '50w100w':
          where.wordCount = { gte: 500000, lt: 1000000 };
          break;
        case 'gt100w':
          where.wordCount = { gte: 1000000 };
          break;
      }
    }

    // 根据 sort 参数确定排序方式
    let orderBy: Prisma.NovelOrderByWithRelationInput = { updatedAt: 'desc' };
    if (filters?.sort === 'hot') {
      orderBy = { viewCount: 'desc' };
    } else if (filters?.sort === 'new') {
      orderBy = { createdAt: 'desc' };
    } else if (filters?.sort === 'rating') {
      orderBy = { rating: 'desc' };
    }

    const [novels, total] = await Promise.all([
      this.prisma.novel.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
      }),
      this.prisma.novel.count({ where }),
    ]);

    return {
      novels: novels.map(n => this.mapToResponse(n)),
      total,
    };
  }

  async findOne(id: string): Promise<NovelResponseDto> {
    const novel = await this.prisma.novel.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在');
    }

    // 增加浏览量
    await this.prisma.novel.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return this.mapToResponse({ ...novel, viewCount: novel.viewCount + 1 });
  }

  async update(
    id: string,
    authorId: string,
    dto: UpdateNovelDto,
  ): Promise<NovelResponseDto> {
    const novel = await this.prisma.novel.findUnique({
      where: { id },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在');
    }

    if (novel.authorId !== authorId) {
      throw new ForbiddenException('无权修改此小说');
    }

    const updated = await this.prisma.novel.update({
      where: { id },
      data: dto,
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    return this.mapToResponse(updated);
  }

  async publish(id: string, authorId: string): Promise<NovelResponseDto> {
    const novel = await this.prisma.novel.findUnique({
      where: { id },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在');
    }

    if (novel.authorId !== authorId) {
      throw new ForbiddenException('无权发布此小说');
    }

    const updated = await this.prisma.novel.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    return this.mapToResponse(updated);
  }

  async remove(id: string, authorId: string): Promise<void> {
    const novel = await this.prisma.novel.findUnique({
      where: { id },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在');
    }

    if (novel.authorId !== authorId) {
      throw new ForbiddenException('无权删除此小说');
    }

    await this.prisma.novel.delete({
      where: { id },
    });
  }

  private mapToResponse(novel: any): NovelResponseDto {
    return {
      id: novel.id,
      title: novel.title,
      subtitle: novel.subtitle,
      description: novel.description,
      coverImage: novel.coverImage,
      status: novel.status,
      category: novel.category,
      tags: novel.tags,
      wordCount: novel.wordCount,
      chapterCount: novel.chapterCount,
      viewCount: novel.viewCount,
      likeCount: novel.likeCount,
      bookmarkCount: novel.bookmarkCount,
      rating: novel.rating,
      ratingCount: novel.ratingCount,
      authorId: novel.author.id,
      authorName: novel.author.displayName,
      createdAt: novel.createdAt,
      updatedAt: novel.updatedAt,
      publishedAt: novel.publishedAt,
    };
  }
}
