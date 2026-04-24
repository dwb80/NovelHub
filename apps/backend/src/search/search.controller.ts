import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { NovelResponseDto } from '../novels/dto/novel-response.dto';

@ApiTags('搜索')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('novels')
  @ApiOperation({ summary: '搜索小说' })
  @ApiQuery({ name: 'q', description: '搜索关键词' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async searchNovels(
    @Query('q') query: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ novels: NovelResponseDto[]; total: number }> {
    return this.searchService.searchNovels(query, page || 1, limit || 20);
  }

  @Get('suggestions')
  @ApiOperation({ summary: '获取搜索建议' })
  @ApiQuery({ name: 'q', description: '搜索关键词' })
  async getSuggestions(@Query('q') query: string): Promise<string[]> {
    return this.searchService.getSuggestions(query);
  }

  @Get('ranking')
  @ApiOperation({ summary: '获取排行榜' })
  @ApiQuery({ name: 'type', description: '排行类型: hot, new, rating, collect', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getRanking(
    @Query('type') type: string = 'hot',
    @Query('limit') limit?: number,
  ): Promise<NovelResponseDto[]> {
    return this.searchService.getRanking(type, limit || 20);
  }
}
