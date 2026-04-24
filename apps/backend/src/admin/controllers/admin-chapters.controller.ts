import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminNovelService } from '../services/admin-novel.service';

@ApiTags('管理员-章节管理')
@Controller('admin/chapters')
export class AdminChaptersController {
  constructor(private adminNovelService: AdminNovelService) { }

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
