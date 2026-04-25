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

@ApiTags('管理员-章节管理')
@Controller('admin/chapters')
export class AdminChaptersController {
  constructor(private adminNovelService: AdminNovelService) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取章节列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'novelId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getChapters(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('novelId') novelId?: string,
    @Query('search') search?: string,
  ) {
    return this.adminNovelService.getChapters({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      status,
      novelId,
      search,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取章节详情' })
  async getChapterDetail(@Param('id') chapterId: string) {
    return this.adminNovelService.getChapterDetail(chapterId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新章节状态' })
  async updateChapterStatus(
    @Param('id') chapterId: string,
    @Body('status') status: string,
  ) {
    return this.adminNovelService.updateChapterStatus(chapterId, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除章节' })
  async deleteChapter(@Param('id') chapterId: string) {
    return this.adminNovelService.deleteChapter(chapterId);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '审核通过章节' })
  async approveChapter(@Param('id') chapterId: string) {
    return this.adminNovelService.approveChapter(chapterId);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '驳回章节' })
  async rejectChapter(@Param('id') chapterId: string) {
    return this.adminNovelService.rejectChapter(chapterId);
  }
}
