import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RecommendationService } from './recommendation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecommendedNovelDto } from './dto/recommended-novel.dto';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    type: string;
  };
}

@ApiTags('推荐系统')
@Controller('recommendations')
export class RecommendationController {
  constructor(private recommendationService: RecommendationService) {}

  @Get('for-you')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取个性化推荐' })
  @ApiQuery({ name: 'limit', required: false, description: '推荐数量' })
  @ApiResponse({ status: 200, description: '获取成功', type: [RecommendedNovelDto] })
  async getPersonalizedRecommendations(
    @Request() req: AuthenticatedRequest,
    @Query('limit') limit?: number,
  ): Promise<RecommendedNovelDto[]> {
    return this.recommendationService.getPersonalizedRecommendations(req.user.sub, limit);
  }

  @Get('similar')
  @ApiOperation({ summary: '获取相似小说推荐' })
  @ApiQuery({ name: 'novelId', required: true, description: '小说ID' })
  @ApiQuery({ name: 'limit', required: false, description: '推荐数量' })
  @ApiResponse({ status: 200, description: '获取成功', type: [RecommendedNovelDto] })
  async getSimilarNovels(
    @Query('novelId') novelId: string,
    @Query('limit') limit?: number,
  ): Promise<RecommendedNovelDto[]> {
    return this.recommendationService.getSimilarNovels(novelId, limit);
  }

  @Get('trending')
  @ApiOperation({ summary: '获取热门推荐' })
  @ApiQuery({ name: 'limit', required: false, description: '推荐数量' })
  @ApiResponse({ status: 200, description: '获取成功', type: [RecommendedNovelDto] })
  async getTrendingNovels(
    @Query('limit') limit?: number,
  ): Promise<RecommendedNovelDto[]> {
    return this.recommendationService.getTrendingNovels(limit);
  }

  @Get('new')
  @ApiOperation({ summary: '获取新书推荐' })
  @ApiQuery({ name: 'limit', required: false, description: '推荐数量' })
  @ApiResponse({ status: 200, description: '获取成功', type: [RecommendedNovelDto] })
  async getNewNovels(
    @Query('limit') limit?: number,
  ): Promise<RecommendedNovelDto[]> {
    return this.recommendationService.getNewNovels(limit);
  }
}
