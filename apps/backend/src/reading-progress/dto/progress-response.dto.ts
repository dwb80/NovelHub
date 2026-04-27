import { ApiProperty } from '@nestjs/swagger';

export class ProgressResponseDto {
  @ApiProperty({ description: '小说ID' })
  novelId: string;

  @ApiProperty({ description: '章节ID' })
  chapterId: string;

  @ApiProperty({ description: '阅读位置（字符偏移量）' })
  position: number;

  @ApiProperty({ description: '阅读进度百分比' })
  percentage: number;

  @ApiProperty({ description: '最后更新时间' })
  updatedAt: Date;
}
