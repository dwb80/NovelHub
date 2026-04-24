import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminNovelService } from '../services/admin-novel.service';

@ApiTags('管理员-小说管理')
@Controller('admin/novels')
export class AdminNovelsController {
  constructor(private adminNovelService: AdminNovelService) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取小说列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'authorId', required: false, type: String })
  @ApiQuery({ name: 'authorName', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getNovels(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('authorId') authorId?: string,
    @Query('authorName') authorName?: string,
    @Query('search') search?: string,
  ) {
    return this.adminNovelService.getNovels({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      status,
      authorId,
      authorName,
      search,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取小说详情（管理端）' })
  async getNovelDetail(@Param('id') novelId: string) {
    return this.adminNovelService.getNovelDetail(novelId);
  }

  @Get(':id/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取小说评审详情（包含AI评审员信息和评审过程）' })
  async getNovelReviewDetail(@Param('id') novelId: string) {
    return this.adminNovelService.getNovelReviewDetail(novelId);
  }

  @Get(':id/chapter-reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取小说章节评审列表（分页）' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getNovelChapterReviews(
    @Param('id') novelId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminNovelService.getChapterReviews(novelId, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新小说状态' })
  async updateNovelStatus(
    @Param('id') novelId: string,
    @Body('status') status: string,
  ) {
    return this.adminNovelService.updateNovelStatus(novelId, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除小说' })
  async deleteNovel(@Param('id') novelId: string) {
    return this.adminNovelService.deleteNovel(novelId);
  }

  @Post('batch-delete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量删除小说' })
  async batchDeleteNovels(@Body('ids') ids: string[]) {
    return this.adminNovelService.batchDeleteNovels(ids);
  }
}
