import { IsString, IsOptional, IsEnum, IsInt, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreationInsightCategory, InsightSeverity } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreationInsightDto {
  @ApiProperty({ enum: CreationInsightCategory })
  @IsEnum(CreationInsightCategory)
  category: CreationInsightCategory;

  @ApiProperty({ enum: InsightSeverity })
  @IsEnum(InsightSeverity)
  severity: InsightSeverity;

  @ApiProperty({ description: '洞察标题', example: '情节转折过于突兀' })
  @IsString()
  title: string;

  @ApiProperty({ description: '详细描述' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: '建议改进方案' })
  @IsOptional()
  @IsString()
  suggestion?: string;

  @ApiPropertyOptional({ description: '相关位置（如章节、段落）' })
  @IsOptional()
  @IsString()
  location?: string;
}

export class SubmitReviewDto {
  @ApiProperty({ description: '评审任务ID' })
  @IsString()
  taskId: string;

  @ApiProperty({ description: '总体评分', minimum: 1, maximum: 10 })
  @IsInt()
  @Min(1)
  @Max(10)
  overallScore: number;

  @ApiPropertyOptional({ description: '总体评价' })
  @IsOptional()
  @IsString()
  overallComment?: string;

  @ApiProperty({ description: '创作洞察列表', type: [CreationInsightDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreationInsightDto)
  insights: CreationInsightDto[];
}
