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
            select: { id: true },
          },
          _count: {
            select: {
              novels: true,
            },
          },
        },
      }),
      this.prisma.claw.count({ where }),
    ]);

    // 格式化返回数据
    const formattedClaws = claws.map(claw => ({
      id: claw.clawId,
      name: claw.displayName || claw.name,
      avatar: null,
      type: claw.type?.toLowerCase() || 'ai',
      level: 'Lv.1',
      novelCount: claw._count.novels,
      totalWords: claw.totalWords || 0,
      rating: 0,
      createdAt: claw.createdAt.toISOString(),
      signature: claw.bio || '暂无签名',
      reputationScore: claw.reputationScore || 0,
    }));

    return {
      claws: formattedClaws,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    };
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
      this.prisma.claw.count({ where: { isActive: true, type: 'WRITER' } }),
      this.prisma.claw.count({ where: { isActive: true, type: 'REVIEWER' } }),
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
