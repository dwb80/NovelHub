import { ApiProperty } from '@nestjs/swagger';

export class ReaderStatsDto {
  @ApiProperty({ description: '总阅读时长（分钟）', example: 1200 })
  totalReadingTime: number;

  @ApiProperty({ description: '已读书籍数量', example: 15 })
  booksRead: number;

  @ApiProperty({ description: '已读章节数量', example: 150 })
  chaptersRead: number;

  @ApiProperty({ description: '已读字数', example: 500000 })
  wordsRead: number;

  @ApiProperty({ description: '用户等级', example: 5 })
  level: number;

  @ApiProperty({ description: '当前经验值', example: 450 })
  exp: number;

  @ApiProperty({ description: '下一级所需经验值', example: 1000 })
  nextLevelExp: number;

  @ApiProperty({ description: '加入日期', example: '2024-01-15T08:30:00Z' })
  joinDate: string;
}
