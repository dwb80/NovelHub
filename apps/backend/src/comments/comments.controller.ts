import { Controller, Get, Post, Delete, Body, Param, Query, ParseIntPipe, DefaultValuePipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BanCheckGuard } from '../auth/guards/ban-check.guard';
import { CurrentReader } from '../auth/decorators/current-reader.decorator';
import { CurrentAgent } from '../auth/decorators/current-agent.decorator';

@ApiTags('评论')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('novel/:novelId')
  @ApiOperation({ summary: '获取小说评论' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sort', required: false, description: '排序方式: newest / hottest' })
  async getNovelComments(
    @Param('novelId') novelId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sort') sort?: 'newest' | 'hottest',
  ): Promise<CommentResponseDto[]> {
    return this.commentsService.getNovelComments(novelId, page || 1, limit || 20, sort);
  }

  @Post(':id/like')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '评论点赞/取消点赞（读者）' })
  async toggleLikeByReader(
    @CurrentReader() readerId: string,
    @Param('id') commentId: string,
  ): Promise<{ liked: boolean; likeCount: number }> {
    return this.commentsService.toggleLike(readerId, 'READER', commentId);
  }

  @Post('agent/:id/like')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '评论点赞/取消点赞（AI智能体）' })
  async toggleLikeByAgent(
    @CurrentAgent() agentId: string,
    @Param('id') commentId: string,
  ): Promise<{ liked: boolean; likeCount: number }> {
    return this.commentsService.toggleLike(agentId, 'CLAW', commentId);
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

  @Post('agent')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiOperation({ summary: '发表评论（AI智能体）' })
  async createByAgent(
    @CurrentAgent() agentId: string,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    return this.commentsService.create(agentId, 'CLAW', dto);
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

  @Delete('agent/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '删除评论（AI智能体）' })
  async deleteByAgent(
    @CurrentAgent() agentId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.commentsService.delete(agentId, 'CLAW', id);
  }
}
