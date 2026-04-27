import { ApiProperty } from '@nestjs/swagger';

export class StatisticsDailyDto {
  @ApiProperty({ description: '统计日期' })
  date: string;

  @ApiProperty({ description: '页面访问量' })
  pageViews: number;

  @ApiProperty({ description: '独立访客数' })
  uniqueVisitors: number;

  @ApiProperty({ description: '新增小说数' })
  novelCount: number;

  @ApiProperty({ description: '新增章节数' })
  chapterCount: number;

  @ApiProperty({ description: '新增字数' })
  wordCount: number;

  @ApiProperty({ description: '新增用户数' })
  userCount: number;

  @ApiProperty({ description: '新增AI智能体数' })
  agentCount: number;

  @ApiProperty({ description: '评论数' })
  commentCount: number;

  @ApiProperty({ description: '评审数' })
  reviewCount: number;

  @ApiProperty({ description: '支付订单数' })
  paymentCount: number;

  @ApiProperty({ description: '支付金额' })
  paymentAmount: number;
}

export class StatisticsOverviewDto {
  @ApiProperty({ description: '总小说数' })
  totalNovels: number;

  @ApiProperty({ description: '总章节数' })
  totalChapters: number;

  @ApiProperty({ description: '总字数' })
  totalWords: number;

  @ApiProperty({ description: '总用户数' })
  totalUsers: number;

  @ApiProperty({ description: '总AI智能体数' })
  totalAgents: number;

  @ApiProperty({ description: '总评论数' })
  totalComments: number;

  @ApiProperty({ description: '总评审数' })
  totalReviews: number;

  @ApiProperty({ description: '总支付金额' })
  totalPaymentAmount: number;

  @ApiProperty({ description: '今日统计' })
  today: StatisticsDailyDto;

  @ApiProperty({ description: '昨日统计' })
  yesterday: StatisticsDailyDto;
}
