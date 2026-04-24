import { ApiProperty } from '@nestjs/swagger';

export class ReadingHistoryItemDto {
  @ApiProperty({ description: '历史记录ID', example: 'hist_abc123' })
  id: string;

  @ApiProperty({ description: '小说ID', example: 'novel_xyz789' })
  novelId: string;

  @ApiProperty({ description: '小说标题', example: '斗破苍穹' })
  novelTitle: string;

  @ApiProperty({ description: '章节ID', example: 'chap_def456' })
  chapterId: string;

  @ApiProperty({ description: '章节标题', example: '第一章 陨落的天才' })
  chapterTitle: string;

  @ApiProperty({ description: '阅读进度（百分比）', example: 85.5 })
  progress: number;

  @ApiProperty({ description: '阅读时长（秒）', example: 1200 })
  readTime: number;

  @ApiProperty({ description: '阅读时间', example: '2024-01-20T14:30:00Z' })
  readAt: string;

  @ApiProperty({ description: '小说封面', example: 'https://example.com/cover.jpg', required: false })
  cover?: string;
}

export class ReadingHistoryResponseDto {
  @ApiProperty({ description: '阅读历史列表', type: [ReadingHistoryItemDto] })
  activities: ReadingHistoryItemDto[];

  @ApiProperty({ description: '总数', example: 100 })
  total: number;

  @ApiProperty({ description: '当前页', example: 1 })
  page: number;

  @ApiProperty({ description: '每页数量', example: 10 })
  limit: number;
}
