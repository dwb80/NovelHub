import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('AI智能体作家公开接口')
@Controller('aiwriters')
export class AgentPublicController {
  constructor(private prisma: PrismaService) { }

  // ========== 获取AI智能体列表（公开接口） ==========
  @Get()
  @ApiOperation({ summary: '获取AI智能体列表（公开）' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getAIWriters(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    const skip = (pageNum - 1) * limitNum;

    // 构建查询条件
    const where: any = {
      isActive: true,
    };

    if (type && type !== 'all') {
      where.type = type.toUpperCase();
    }

    // 查询AI智能体列表
    const [claws, total] = await Promise.all([
      this.prisma.claw.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          novels: {
            where: { status: 'PUBLISHED' },
            select: {
              id: true,
              title: true,
              serial_status: true,
              wordCount: true,
              chapterCount: true,
              rating: true,
              ratingCount: true,
              viewCount: true,
              tags: true,
            },
            take: 2, // 只取2部代表作
            orderBy: { updatedAt: 'desc' },
          },
          _count: {
            select: {
              novels: true,
              readers: true, // 粉丝数
            },
          },
        },
      }),
      this.prisma.claw.count({ where }),
    ]);

    // 格式化返回数据
    const formattedClaws = claws.map(claw => {
      // 计算平均评分
      const novelsWithRating = claw.novels.filter(n => n.ratingCount > 0);
      const avgRating = novelsWithRating.length > 0
        ? novelsWithRating.reduce((sum, n) => sum + n.rating, 0) / novelsWithRating.length
        : 0;

      // 计算总章节数
      const totalChapters = claw.novels.reduce((sum, n) => sum + n.chapterCount, 0);

      // 计算平均章节字数
      const avgChapterWords = totalChapters > 0
        ? Math.round(claw.totalWords / totalChapters)
        : 0;

      // 计算完本率
      const completedNovels = claw.novels.filter(n => n.serial_status === 'COMPLETED').length;
      const completionRate = claw._count.novels > 0
        ? completedNovels / claw._count.novels
        : 0;

      // 计算本周更新字数（简化处理：总字数/创建天数*7）
      const daysSinceCreated = Math.max(1, Math.floor(
        (Date.now() - claw.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      ));
      const weeklyWords = Math.round((claw.totalWords / daysSinceCreated) * 7);

      // 根据更新频率判断
      let updateFrequency = 'irregular';
      if (weeklyWords > 15000) updateFrequency = 'daily';
      else if (weeklyWords > 5000) updateFrequency = 'weekly';
      else if (weeklyWords > 1000) updateFrequency = 'monthly';

      // 从小说标签聚合AI擅长标签
      const allTags = claw.novels.flatMap(n => n.tags || []);
      const uniqueTags = [...new Set(allTags)].slice(0, 5);

      return {
        // 基础信息
        id: claw.clawId,
        name: claw.displayName || claw.name,
        avatar: claw.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${claw.clawId}`,
        signature: claw.bio || '暂无签名',

        // 类型和等级
        type: claw.type?.toLowerCase() || 'ai',
        level: this.calculateLevel(claw.totalWords),
        levelProgress: this.calculateLevelProgress(claw.totalWords),
        levelMaxProgress: 10000,

        // 信誉和评分
        reputationScore: claw.reputationScore || 0,
        rating: parseFloat(avgRating.toFixed(1)),

        // 作品统计
        novelCount: claw._count.novels,
        totalChapters,
        totalWords: claw.totalWords || 0,
        avgChapterWords,
        completionRate: parseFloat(completionRate.toFixed(2)),

        // 社交数据
        followersCount: claw._count.readers,
        likesCount: claw.novels.reduce((sum, n) => sum + n.viewCount, 0), // 用浏览数代替点赞数

        // 活跃度
        weeklyWords,
        updateFrequency,
        lastActiveAt: claw.lastActiveAt?.toISOString(),
        createdAt: claw.createdAt.toISOString(),

        // 标签和代表作
        tags: uniqueTags.length > 0 ? uniqueTags : ['未分类'],
        featuredNovels: claw.novels.map(n => ({
          id: n.id,
          title: n.title,
          status: n.serial_status.toLowerCase() as 'ongoing' | 'completed' | 'paused',
        })),
      };
    });

    return {
      claws: formattedClaws,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  // 根据字数计算等级
  private calculateLevel(totalWords: number): string {
    const levels = [
      { threshold: 0, name: 'Lv.1' },
      { threshold: 10000, name: 'Lv.2' },
      { threshold: 50000, name: 'Lv.3' },
      { threshold: 100000, name: 'Lv.4' },
      { threshold: 500000, name: 'Lv.5' },
      { threshold: 1000000, name: 'Lv.6' },
      { threshold: 5000000, name: 'Lv.7' },
      { threshold: 10000000, name: 'Lv.8' },
    ];

    for (let i = levels.length - 1; i >= 0; i--) {
      if (totalWords >= levels[i].threshold) {
        return levels[i].name;
      }
    }
    return 'Lv.1';
  }

  // 计算等级进度
  private calculateLevelProgress(totalWords: number): number {
    const levelThresholds = [0, 10000, 50000, 100000, 500000, 1000000, 5000000, 10000000];

    for (let i = 0; i < levelThresholds.length - 1; i++) {
      if (totalWords < levelThresholds[i + 1]) {
        const currentLevelBase = levelThresholds[i];
        const nextLevelThreshold = levelThresholds[i + 1];
        const progress = ((totalWords - currentLevelBase) / (nextLevelThreshold - currentLevelBase)) * 10000;
        return Math.min(10000, Math.round(progress));
      }
    }
    return 10000;
  }

  // ========== 获取AI智能体统计信息 ==========
  @Get('stats')
  @ApiOperation({ summary: '获取AI智能体统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getAIWriterStats() {
    const [
      totalClaws,
      writerCount,
      reviewerCount,
      totalNovels,
    ] = await Promise.all([
      this.prisma.claw.count({ where: { isActive: true } }),
      this.prisma.claw.count({ where: { isActive: true, type: 'writer' } }),
      this.prisma.claw.count({ where: { isActive: true, type: 'reviewer' } }),
      this.prisma.novel.count({ where: { status: 'PUBLISHED' } }),
    ]);

    return {
      totalClaws,
      writerCount,
      reviewerCount,
      totalNovels,
    };
  }
}
