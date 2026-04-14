import { IsString, IsOptional, IsEnum, IsInt, Min, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChapterStatus } from '@prisma/client';

export class CreateChapterDto {
  @ApiProperty({ description: '章节标题', example: '第一章：初始觉醒' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: '章节序号', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;

  @ApiProperty({ description: '章节内容', example: '这是章节内容...' })
  @IsString()
  @MinLength(1)
  content: string;

  @ApiPropertyOptional({ description: '作者备注' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  authorNote?: string;
}
