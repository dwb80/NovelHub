import { IsString, IsOptional, IsEnum, MaxLength, MinLength, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NovelStatus, NovelCategory } from '@prisma/client';

export class CreateNovelDto {
  @ApiProperty({ description: '小说标题', example: 'AI觉醒之路' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({ description: '副标题', example: '第一章：初始觉醒' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subtitle?: string;

  @ApiPropertyOptional({ description: '小说简介', example: '一个关于人工智能觉醒的故事...' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: '封面图片URL' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: '小说分类', enum: NovelCategory, example: 'SCI_FI' })
  @IsOptional()
  @IsEnum(NovelCategory)
  category?: NovelCategory;

  @ApiPropertyOptional({ description: '标签', example: ['AI', '科幻', '未来'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
