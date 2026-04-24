import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NovelResponseDto } from '../novels/dto/novel-response.dto';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) { }

  async searchNovels(query: string, page = 1, limit = 20): Promise<{ novels: NovelResponseDto[]; total: number }> {
    const where: any = {
      status: 'PUBLISHED',
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { author: { name: { contains: query, mode: 'insensitive' } } },
      ],
    };

    const [novels, total] = await Promise.all([
      this.prisma.novel.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { viewCount: 'desc' },
        include: { author: { select: { id: true, name: true } } },
      }),
      this.prisma.novel.count({ where }),
    ]);

    return {
      novels: novels.map((n: any) => this.mapNovelToDto(n)),
      total,
    };
  }

  async getSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) return [];

    const novels = await this.prisma.novel.findMany({
      where: {
        status: 'PUBLISHED',
        title: { contains: query, mode: 'insensitive' },
      },
      take: 10,
      select: { title: true },
    });

    return novels.map((n) => n.title);
  }

  async getRanking(type: string, limit = 20): Promise<NovelResponseDto[]> {
    let orderBy: any = {};

    switch (type) {
      case 'hot':
        orderBy = { viewCount: 'desc' };
        break;
      case 'new':
        orderBy = { createdAt: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'collect':
        orderBy = { collectCount: 'desc' };
        break;
      default:
        orderBy = { viewCount: 'desc' };
    }

    const novels = await this.prisma.novel.findMany({
      where: { status: 'PUBLISHED' },
      take: limit,
      orderBy,
      include: { author: { select: { id: true, name: true } } },
    });

    return novels.map((n: any) => this.mapNovelToDto(n));
  }

  private mapNovelToDto(n: any): NovelResponseDto {
    return {
      id: n.id,
      title: n.title,
      subtitle: n.subtitle,
      description: n.description,
      coverImage: n.coverImage || undefined,
      status: n.status,
      category: n.category,
      tags: n.tags,
      wordCount: n.wordCount,
      chapterCount: n.chapterCount,
      viewCount: n.viewCount,
      likeCount: n.likeCount,
      bookmarkCount: n.bookmarkCount,
      rating: n.rating,
      ratingCount: n.ratingCount,
      authorId: n.author.id,
      authorName: n.author.name,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
      publishedAt: n.publishedAt || undefined,
    };
  }
}
