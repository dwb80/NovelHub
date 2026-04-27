import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNovelDto } from './dto/create-novel.dto';
import { UpdateNovelDto } from './dto/update-novel.dto';
import { NovelResponseDto } from './dto/novel-response.dto';
import { NovelStatus, Prisma } from '@prisma/client';
import { NovelSortType, DEFAULT_PAGINATION } from '../common/constants';

@Injectable()
export class NovelsService {
  constructor(private prisma: PrismaService) { }

  /**
   * 创建新小说
   * @param authorId 作者ID
   * @param dto 小说创建DTO
   */
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

  /**
   * 分页查询小说列表，支持多维度筛选和排序
   * @param page 页码，默认第1页
   * @param limit 每页条数，默认20条
   * @param.filters 筛选条件组合
   * @param filters.category 小说分类：xuanhuan/dushi等
   * @param filters.status 小说状态：DRAFT/PUBLISHED等
   * @param filters.authorId 作者ID筛选
   * @param filters.search 关键词搜索（标题/描述）
   * @param filters.sort 排序方式：hot/new/rating/updated
   * @param filters.targetAudience 读者定位：男频/女频
   * @param filters.serialStatus 连载状态：连载中/已完结
   * @param filters.wordCountRange 字数范围：10万以下/10-30万等
   * @returns 小说列表及总数
   * @implementation 6维度筛选引擎，支持组合查询，使用Promise.all并行查询优化
   */
  async findAll(
    page: number = DEFAULT_PAGINATION.PAGE,
    limit: number = DEFAULT_PAGINATION.LIMIT,
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
      where.status = NovelStatus.PUBLISHED;
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

    let orderBy: Prisma.NovelOrderByWithRelationInput = { updatedAt: 'desc' };
    switch (filters?.sort) {
      case NovelSortType.HOT:
        orderBy = { viewCount: 'desc' };
        break;
      case NovelSortType.NEW:
        orderBy = { createdAt: 'desc' };
        break;
      case NovelSortType.RATING:
        orderBy = { rating: 'desc' };
        break;
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

  /**
   * 获取小说详情，原子化更新浏览量
   * @param id 小说ID
   * @returns 小说完整信息，包含作者信息和最后更新时间
   * @implementation 使用$transaction保证数据一致性：
   * 1. 查询小说详情及作者信息
   * 2. 获取最新章节更新时间
   * 3. 浏览量原子递增
   * 三个操作在同一事务中执行，避免竞态条件
   */
  async findOne(id: string): Promise<NovelResponseDto> {
    const [novel, lastChapter] = await this.prisma.$transaction([
      this.prisma.novel.findUnique({
        where: { id },
        include: {
            author: {
              select: {
                id: true,
                displayName: true,
                reputationScore: true,
              },
            },
          },
      }),
      this.prisma.chapter.findFirst({
        where: { novelId: id, status: NovelStatus.PUBLISHED },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
      this.prisma.novel.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      }),
    ]);

    if (!novel) {
      throw new NotFoundException('小说不存在');
    }

    return this.mapToResponse({
      ...novel,
      viewCount: novel.viewCount + 1,
      lastChapterUpdatedAt: lastChapter?.updatedAt,
    });
  }

  /**
   * 更新小说信息，包含权限验证
   * @param id 小说ID
   * @param authorId 作者ID（用于权限验证）
   * @param dto 更新内容DTO
   * @returns 更新后的小说信息
   * @security 两级权限验证：
   * 1. 验证小说是否存在
   * 2. 验证当前用户是否为小说作者
   * 防止越权修改他人作品
   */
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
      cover: novel.cover,
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
      authorReputation: novel.author.reputationScore,
      lastChapterUpdatedAt: novel.lastChapterUpdatedAt,
      createdAt: novel.createdAt,
      updatedAt: novel.updatedAt,
      publishedAt: novel.publishedAt,
    };
  }
}
