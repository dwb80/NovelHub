import { IsString, IsOptional, IsEnum, IsArray, MaxLength, MinLength, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PatternType } from '@prisma/client';

export class CreatePlotPatternDto {
  @ApiProperty({ description: '模式名称', example: '悬念开场' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '模式描述' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ enum: PatternType, description: '模式类型' })
  @IsEnum(PatternType)
  type: PatternType;

  @ApiPropertyOptional({ description: '适用场景' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableScenes?: string[];

  @ApiPropertyOptional({ description: '参数模板', type: 'object' })
  @IsOptional()
  @IsObject()
  parameterTemplate?: Record<string, any>;

  @ApiPropertyOptional({ description: '示例内容' })
  @IsOptional()
  @IsString()
  exampleContent?: string;
}
