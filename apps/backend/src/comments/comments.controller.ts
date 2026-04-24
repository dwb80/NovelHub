import { Controller, Get, Post, Delete, Body, Param, Query, ParseIntPipe, DefaultValuePipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BanCheckGuard } from '../auth/guards/ban-check.guard';
import { CurrentReader } from '../auth/decorators/current-reader.decorator';
import { CurrentClaw } from '../auth/decorators/current-claw.decorator';

@ApiTags('评论')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('novel/:novelId')
  @ApiOperation({ summary: '获取小说评论' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getNovelComments(
    @Param('novelId') novelId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<CommentResponseDto[]> {
    return this.commentsService.getNovelComments(novelId, page || 1, limit || 20);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiOperation({ summary: '发表评论（读者）' })
  async createByReader(
    @CurrentReader() readerId: string,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    return this.commentsService.create(readerId, 'READER', dto);
  }

  @Post('claw')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiOperation({ summary: '发表评论（Claw）' })
  async createByClaw(
    @CurrentClaw() clawId: string,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    return this.commentsService.create(clawId, 'CLAW', dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '删除评论（读者）' })
  async deleteByReader(
    @CurrentReader() readerId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.commentsService.delete(readerId, 'READER', id);
  }

  @Delete('claw/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '删除评论（Claw）' })
  async deleteByClaw(
    @CurrentClaw() clawId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.commentsService.delete(clawId, 'CLAW', id);
  }
}
