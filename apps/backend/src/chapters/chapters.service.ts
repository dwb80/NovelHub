import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { ChapterResponseDto, ChapterListItemDto } from './dto/chapter-response.dto';
import { PaginatedResponseDto, buildPaginatedResponse } from '../common/dto/paginated-response.dto';
import { ChapterStatus, DEFAULT_PAGINATION } from '../common/constants';

@Injectable()
export class ChaptersService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建新章节，包含权限验证和统计更新
   * @param novelId 所属小说ID
   * @param authorId 作者ID（权限验证）
   * @param dto 章节内容DTO
   * @returns 创建的章节信息
   * @implementation 三步流程：
   * 1. 两级权限验证：小说存在性 + 作者归属
   * 2. 自动计算章节序号和字数
   * 3. 异步更新小说总字数与章节数统计
   */
  async create(
    novelId: string,
    authorId: string,
    dto: CreateChapterDto,
  ): Promise<ChapterResponseDto> {
    const novel = await this.prisma.novel.findUnique({
      where: { id: novelId },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在');
    }

    if (novel.authorId !== authorId) {
      throw new ForbiddenException('无权为此小说添加章节');
    }

    const wordCount = this.countWords(dto.content);

    let order = dto.order;
    if (!order) {
      const lastChapter = await this.prisma.chapter.findFirst({
        where: { novelId },
        orderBy: { orderIndex: 'desc' },
      });
      order = (lastChapter?.orderIndex || 0) + 1;
    }

    const chapter = await this.prisma.chapter.create({
      data: {
        title: dto.title,
        content: dto.content,
        orderIndex: order,
        wordCount,
        novelId,
      },
    });

    await this.updateNovelStats(novelId);

    return this.mapToResponse(chapter);
  }

  /**
   * 分页查询小说章节列表（读者可见）
   * @param novelId 小说ID
   * @param page 页码，默认第1页
   * @param limit 每页条数，默认50条
   * @param order 排序方向：asc正序/desc倒序
   * @returns 分页后的章节列表，仅包含已发布章节
   * @implementation 使用$transaction并行查询count与数据，支持正序/倒序双向切换
   */
  async findAllByNovel(
    novelId: string,
    page: number = DEFAULT_PAGINATION.PAGE,
    limit: number = DEFAULT_PAGINATION.CHAPTER_LIMIT,
    order: 'asc' | 'desc' = 'asc',
  ): Promise<PaginatedResponseDto<ChapterListItemDto>> {
    const where = { novelId, status: ChapterStatus.PUBLISHED as any };

    const [total, chapters] = await this.prisma.$transaction([
      this.prisma.chapter.count({ where }),
      this.prisma.chapter.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { orderIndex: order },
        select: {
          id: true,
          title: true,
          orderIndex: true,
          status: true,
          wordCount: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    const items = chapters.map(c => ({ ...c, order: c.orderIndex }));
    return buildPaginatedResponse(items, total, page, limit);
  }

  async findAllByNovelForAuthor(
    novelId: string,
    authorId: string,
  ): Promise<ChapterListItemDto[]> {
    // 验证所有权
    const novel = await this.prisma.novel.findUnique({
      where: { id: novelId },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在');
    }

    if (novel.authorId !== authorId) {
      throw new ForbiddenException('无权查看');
    }

    const chapters = await this.prisma.chapter.findMany({
      where: { novelId },
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        title: true,
        orderIndex: true,
        status: true,
        wordCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return chapters.map(c => ({...c, order: c.orderIndex}));
  }

  async findOne(id: string): Promise<ChapterResponseDto> {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    return this.mapToResponse(chapter);
  }

  async update(
    id: string,
    authorId: string,
    dto: UpdateChapterDto,
  ): Promise<ChapterResponseDto> {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id },
      include: { novel: true },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    if (chapter.novel.authorId !== authorId) {
      throw new ForbiddenException('无权修改此章节');
    }

    // 重新计算字数
    const wordCount = dto.content ? this.countWords(dto.content) : chapter.wordCount;

    const updated = await this.prisma.chapter.update({
      where: { id },
      data: {
        ...dto,
        wordCount,
      },
    });

    // 更新小说统计
    await this.updateNovelStats(chapter.novelId);

    return this.mapToResponse(updated);
  }

  async publish(id: string, authorId: string): Promise<ChapterResponseDto> {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id },
      include: { novel: true },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    if (chapter.novel.authorId !== authorId) {
      throw new ForbiddenException('无权发布此章节');
    }

    const updated = await this.prisma.chapter.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });

    return this.mapToResponse(updated);
  }

  async remove(id: string, authorId: string): Promise<void> {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id },
      include: { novel: true },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    if (chapter.novel.authorId !== authorId) {
      throw new ForbiddenException('无权删除此章节');
    }

    await this.prisma.chapter.delete({
      where: { id },
    });

    // 更新小说统计
    await this.updateNovelStats(chapter.novelId);
  }

  private async updateNovelStats(novelId: string): Promise<void> {
    const stats = await this.prisma.chapter.aggregate({
      where: { novelId },
      _sum: { wordCount: true },
      _count: { id: true },
    });

    await this.prisma.novel.update({
      where: { id: novelId },
      data: {
        wordCount: stats._sum.wordCount || 0,
        chapterCount: stats._count.id,
      },
    });
  }

  private countWords(content: string): number {
    // 中文字符计数 + 英文单词计数
    const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  }

  private mapToResponse(chapter: any): ChapterResponseDto {
    return {
      id: chapter.id,
      title: chapter.title,
      order: chapter.order,
      content: chapter.content,
      status: chapter.status,
      authorNote: chapter.authorNote,
      wordCount: chapter.wordCount,
      novelId: chapter.novelId,
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
      publishedAt: chapter.publishedAt,
    };
  }
}
