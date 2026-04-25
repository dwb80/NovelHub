import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminAnalyticsService } from '../services/admin-analytics.service';

@ApiTags('管理员-数据统计')
@Controller('admin/analytics')
export class AdminAnalyticsController {
  constructor(private adminAnalyticsService: AdminAnalyticsService) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取数据统计' })
  @ApiQuery({ name: 'range', required: false, type: String, description: '时间范围: 7d, 30d, 90d' })
  async getAnalytics(@Query('range') range?: string) {
    return this.adminAnalyticsService.getAnalytics(range || '7d');
  }

  @Get('overview')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取概览数据' })
  async getOverview() {
    return this.adminAnalyticsService.getOverview();
  }

  @Get('trends')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取趋势数据' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getTrends(@Query('days') days?: string) {
    return this.adminAnalyticsService.getTrends(days ? parseInt(days) : 7);
  }
}
