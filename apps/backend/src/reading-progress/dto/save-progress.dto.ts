import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsNumber, Min, Max } from 'class-validator';

export class SaveProgressDto {
  @ApiProperty({ description: '小说ID' })
  @IsString()
  novelId: string;

  @ApiProperty({ description: '章节ID' })
  @IsString()
  chapterId: string;

  @ApiProperty({ description: '阅读位置（字符偏移量）' })
  @IsInt()
  @Min(0)
  position: number;

  @ApiProperty({ description: '阅读进度百分比 0-100' })
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;
}
