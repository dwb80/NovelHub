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
import { CurrentAgent } from '../auth/decorators/current-agent.decorator';
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
    @CurrentAgent('sub') authorId: string,
  ): Promise<ReviewTaskResponseDto> {
    return this.reviewsService.createTask(chapterId);
  }

  // 获取待评审任务列表（公开接口）
  @Get('tasks/pending')
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
    @CurrentAgent('sub') reviewerId: string,
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
    @CurrentAgent('sub') reviewerId: string,
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
    @CurrentAgent('sub') reviewerId: string,
    @Body() dto: SubmitReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.submitReview(reviewerId, dto);
  }

  // 获取所有评审记录（公开接口）- 必须放在 :id 路由之前
  @Get()
  @ApiOperation({ summary: '获取所有评审记录' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getAllReviews(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.reviewsService.getAllReviews(page, limit);
  }

  // 获取评审统计数据（公开接口）- 必须放在 :id 路由之前
  @Get('stats')
  @ApiOperation({ summary: '获取评审统计数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStats() {
    return this.reviewsService.getStats();
  }

  // 获取评审任务列表（公开接口）- 必须放在 :id 路由之前
  @Get('tasks')
  @ApiOperation({ summary: '获取评审任务列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getTasks(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.reviewsService.getPendingTasks(page, limit);
  }

  // 获取评审员排行（公开接口）- 必须放在 :id 路由之前
  @Get('ranking')
  @ApiOperation({ summary: '获取评审员排行' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRanking() {
    return this.reviewsService.getReviewerRanking();
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

  // 获取评审任务详情
  @Get('tasks/:taskId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取评审任务详情' })
  @ApiResponse({ status: 200, type: ReviewTaskResponseDto })
  async getTaskDetail(
    @Param('taskId') taskId: string,
  ): Promise<ReviewTaskResponseDto> {
    return this.reviewsService.getTaskById(taskId);
  }

  // 保存评审草稿
  @Post('tasks/:taskId/draft')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '保存评审草稿' })
  @ApiResponse({ status: 200, description: '保存成功' })
  async saveDraft(
    @Param('taskId') taskId: string,
    @CurrentAgent('sub') reviewerId: string,
    @Body() dto: SubmitReviewDto,
  ): Promise<{ message: string }> {
    await this.reviewsService.saveDraft(taskId, reviewerId, dto);
    return { message: '草稿保存成功' };
  }

  // 提交评审（通过任务ID）
  @Post('tasks/:taskId/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '提交评审' })
  @ApiResponse({ status: 201, type: ReviewResponseDto })
  async submitReviewByTask(
    @Param('taskId') taskId: string,
    @CurrentAgent('sub') reviewerId: string,
    @Body() dto: SubmitReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.submitReviewByTask(taskId, reviewerId, dto);
  }

  // 获取评审详情 - 这个必须放在最后，因为它会匹配任何路径
  @Get(':id')
  @ApiOperation({ summary: '获取评审详情' })
  @ApiResponse({ status: 200, type: ReviewResponseDto })
  async getReviewById(@Param('id') id: string): Promise<ReviewResponseDto> {
    return this.reviewsService.getReviewById(id);
  }
}
