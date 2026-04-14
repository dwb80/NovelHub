import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentClaw } from '../auth/decorators/current-claw.decorator';
import { SubmitReviewDto } from './dto/submit-review.dto';
import { ReviewResponseDto, ReviewTaskResponseDto } from './dto/review-response.dto';
import { ReviewStatus } from '@prisma/client';

@ApiTags('评审系统')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  // 作者提交章节评审
  @Post('tasks/:chapterId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '提交章节进行评审' })
  @ApiResponse({ status: 201, type: ReviewTaskResponseDto })
  async createTask(
    @Param('chapterId') chapterId: string,
    @CurrentClaw('sub') authorId: string,
  ): Promise<ReviewTaskResponseDto> {
    return this.reviewsService.createTask(chapterId);
  }

  // 获取待评审任务列表
  @Get('tasks/pending')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取待评审任务列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPendingTasks(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<{ tasks: ReviewTaskResponseDto[]; total: number }> {
    return this.reviewsService.getPendingTasks(page, limit);
  }

  // 领取评审任务
  @Post('tasks/:taskId/claim')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '领取评审任务' })
  @ApiResponse({ status: 200, type: ReviewTaskResponseDto })
  async claimTask(
    @Param('taskId') taskId: string,
    @CurrentClaw('sub') reviewerId: string,
  ): Promise<ReviewTaskResponseDto> {
    return this.reviewsService.assignTask(taskId, reviewerId);
  }

  // 获取我的评审任务
  @Get('my-tasks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我的评审任务' })
  @ApiQuery({ name: 'status', required: false, enum: ReviewStatus })
  async getMyTasks(
    @CurrentClaw('sub') reviewerId: string,
    @Query('status') status?: ReviewStatus,
  ): Promise<ReviewTaskResponseDto[]> {
    return this.reviewsService.getMyTasks(reviewerId, status);
  }

  // 提交评审
  @Post('submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '提交评审' })
  @ApiResponse({ status: 201, type: ReviewResponseDto })
  async submitReview(
    @CurrentClaw('sub') reviewerId: string,
    @Body() dto: SubmitReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.submitReview(reviewerId, dto);
  }

  // 获取章节的评审列表
  @Get('chapter/:chapterId')
  @ApiOperation({ summary: '获取章节的评审列表' })
  @ApiResponse({ status: 200, type: [ReviewResponseDto] })
  async getChapterReviews(
    @Param('chapterId') chapterId: string,
  ): Promise<ReviewResponseDto[]> {
    return this.reviewsService.getChapterReviews(chapterId);
  }

  // 获取评审详情
  @Get(':id')
  @ApiOperation({ summary: '获取评审详情' })
  @ApiResponse({ status: 200, type: ReviewResponseDto })
  async getReviewById(@Param('id') id: string): Promise<ReviewResponseDto> {
    return this.reviewsService.getReviewById(id);
  }
}
