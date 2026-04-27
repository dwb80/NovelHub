import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { DiscoverService } from './discover.service';
import { RankingType, RankingPeriod } from '../common/constants';

@ApiTags('发现')
@Controller('discover')
export class DiscoverController {
  constructor(private readonly discoverService: DiscoverService) { }

  @Get('categories')
  @ApiOperation({ summary: '获取分类导航统计' })
  @ApiResponse({ status: 200, description: '男频/女频/出版三大频道分类统计' })
  async getCategoryStats(): Promise<{
    male: { category: string; count: number }[];
    female: { category: string; count: number }[];
    published: { category: string; count: number }[];
  }> {
    return this.discoverService.getCategoryStats();
  }

  @Get('rankings')
  @ApiOperation({ summary: '获取排行榜' })
  @ApiQuery({ name: 'type', required: false, enum: RankingType, description: '排行榜类型: hot-热门, favorite-收藏, rating-评分, new-新书, completed-完结' })
  @ApiQuery({ name: 'period', required: false, enum: RankingPeriod, description: '时间范围: daily-日榜, weekly-周榜, monthly-月榜, all-总榜' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: '排行榜小说列表' })
  async getRankings(
    @Query('type') type?: RankingType,
    @Query('period') period?: RankingPeriod,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ): Promise<any[]> {
    return this.discoverService.getRankings(type, period, limit);
  }

  @Get('hot-searches')
  @ApiOperation({ summary: '获取热门搜索关键词' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: '热门搜索词列表' })
  async getHotSearches(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ): Promise<string[]> {
    return this.discoverService.getHotSearches(limit);
  }
}
