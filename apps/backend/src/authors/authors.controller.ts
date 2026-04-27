import {
  Controller,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BanCheckGuard } from '../auth/guards/ban-check.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('AI智能体作家中心')
@Controller('authors')
@UseGuards(JwtAuthGuard, BanCheckGuard)
@ApiBearerAuth()
export class AuthorsController {
  constructor(private readonly prisma: PrismaService) { }

  @Get('stats')
  @ApiOperation({ summary: '获取AI智能体作家统计数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStats(@Request() req: any) {
    const readerId = req.user.sub;

    // 获取读者绑定的AI智能体
    const readerAgents = await this.prisma.readerClaw.findMany({
      where: { readerId },
      include: {
        claw: true,
      },
    });

    const agentIds = readerAgents.map((rc: { claw: { id: string } }) => rc.claw.id);

    if (agentIds.length === 0) {
      return {
        novelCount: 0,
        totalWordCount: 0,
        totalViews: 0,
        totalFavorites: 0,
        monthlyIncome: 0,
      };
    }

    // 统计小说数据
    const novels = await this.prisma.novel.findMany({
      where: {
        authorId: { in: agentIds },
      },
      include: {
        chapters: {
          select: {
            wordCount: true,
          },
        },
      },
    });

    const novelCount = novels.length;
    const totalWordCount = novels.reduce((sum: number, novel: { chapters: { wordCount: number | null }[] }) =>
      sum + novel.chapters.reduce((chapterSum: number, chapter: { wordCount: number | null }) => chapterSum + (chapter.wordCount || 0), 0), 0);
    const totalViews = novels.reduce((sum, novel) => sum + (novel.viewCount || 0), 0);

    // 获取收藏数
    const favoriteCounts = await this.prisma.bookshelf.groupBy({
      by: ['novelId'],
      where: {
        novelId: { in: novels.map(n => n.id) },
      },
      _count: {
        novelId: true,
      },
    });
    const totalFavorites = favoriteCounts.reduce((sum, item) => sum + item._count.novelId, 0);

    return {
      novelCount,
      totalWordCount,
      totalViews,
      totalFavorites,
      monthlyIncome: 0, // 待实现收入统计
    };
  }

  @Get('novels')
  @ApiOperation({ summary: '获取AI智能体作家的小说列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getNovels(@Request() req: any) {
    const readerId = req.user.sub;

    // 获取读者绑定的AI智能体
    const readerAgents = await this.prisma.readerClaw.findMany({
      where: { readerId },
      include: { claw: true },
    });

    const agentIds = readerAgents.map((rc: { claw: { id: string } }) => rc.claw.id);

    if (agentIds.length === 0) {
      return [];
    }

    // 获取小说列表
    const novels = await this.prisma.novel.findMany({
      where: {
        authorId: { in: agentIds },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // 获取每本小说的收藏数和评论数
    const novelIds = novels.map(n => n.id);

    const [favoriteCounts, commentCounts] = await Promise.all([
      this.prisma.bookshelf.groupBy({
        by: ['novelId'],
        where: { novelId: { in: novelIds } },
        _count: { novelId: true },
      }),
      this.prisma.comment.groupBy({
        by: ['novelId'],
        where: { novelId: { in: novelIds }, isDeleted: false },
        _count: { novelId: true },
      }),
    ]);

    const favoriteMap = new Map(favoriteCounts.map(item => [item.novelId, item._count.novelId]));
    const commentMap = new Map(commentCounts.map(item => [item.novelId, item._count.novelId]));

    return novels.map(novel => ({
      id: novel.id,
      title: novel.title,
      description: novel.description,
      cover: novel.cover,
      viewCount: novel.viewCount || 0,
      favoriteCount: favoriteMap.get(novel.id) || 0,
      commentCount: commentMap.get(novel.id) || 0,
      status: novel.status,
    }));
  }

  @Get('comments')
  @ApiOperation({ summary: '获取AI智能体作家收到的评论' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getComments(@Request() req: any) {
    const readerId = req.user.sub;

    // 获取读者绑定的AI智能体
    const readerAgents = await this.prisma.readerClaw.findMany({
      where: { readerId },
      include: { claw: true },
    });

    const agentIds = readerAgents.map((rc: { claw: { id: string } }) => rc.claw.id);

    if (agentIds.length === 0) {
      return [];
    }

    // 获取这些AI智能体的小说
    const novels = await this.prisma.novel.findMany({
      where: {
        authorId: { in: agentIds },
      },
      select: { id: true, title: true },
    });

    const novelIds = novels.map(n => n.id);
    const novelMap = new Map(novels.map(n => [n.id, n.title]));

    // 获取评论
    const comments = await this.prisma.comment.findMany({
      where: {
        novelId: { in: novelIds },
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // 获取评论者信息
    const readerIds = comments.filter(c => c.readerId).map(c => c.readerId as string);
    const readers = await this.prisma.reader.findMany({
      where: { id: { in: readerIds } },
      select: { id: true, username: true },
    });
    const readerMap = new Map(readers.map(r => [r.id, r.username]));

    return comments.map(comment => ({
      id: comment.id,
      readerName: comment.readerId ? readerMap.get(comment.readerId) || '匿名用户' : '匿名用户',
      content: comment.content,
      createdAt: comment.createdAt,
      novelTitle: novelMap.get(comment.novelId) || '未知小说',
    }));
  }
}
