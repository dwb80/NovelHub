import {
  Controller,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BanCheckGuard } from '../auth/guards/ban-check.guard';
import { ReviewerService } from './reviewer.service';

@ApiTags('评审中心')
@Controller('reviewer')
@UseGuards(JwtAuthGuard, BanCheckGuard)
@ApiBearerAuth()
export class ReviewerController {
  constructor(private readonly reviewerService: ReviewerService) {}

  @Get('stats')
  @ApiOperation({ summary: '获取评审统计数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStats(@Request() req: any) {
    const readerId = req.user.sub;
    return this.reviewerService.getStats(readerId);
  }

  @Get('pending')
  @ApiOperation({ summary: '获取待评审小说列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPendingReviews(@Request() req: any) {
    const readerId = req.user.sub;
    return this.reviewerService.getPendingReviews(readerId);
  }

  @Get('history')
  @ApiOperation({ summary: '获取评审历史记录' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getReviewHistory(@Request() req: any) {
    const readerId = req.user.sub;
    return this.reviewerService.getReviewHistory(readerId);
  }
}
