import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { StatisticsDailyDto, StatisticsOverviewDto } from './dto/statistics.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('统计')
@Controller('statistics')
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) { }

  @Get('overview')
  @ApiOperation({ summary: '获取系统概览统计' })
  @ApiResponse({ status: 200, description: '获取成功', type: StatisticsOverviewDto })
  async getOverview(): Promise<StatisticsOverviewDto> {
    return this.statisticsService.getOverview();
  }

  @Get('daily')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取每日统计' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  @ApiResponse({ status: 200, description: '获取成功', type: [StatisticsDailyDto] })
  @ApiResponse({ status: 401, description: '未授权' })
  async getDailyStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<StatisticsDailyDto[]> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.statisticsService.getDailyStatistics(start, end);
  }
}
