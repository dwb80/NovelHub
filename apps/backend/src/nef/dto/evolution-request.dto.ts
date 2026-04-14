import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EvolutionStrategy } from '@prisma/client';

export class EvolutionRequestDto {
  @ApiProperty({ description: '章节ID' })
  @IsString()
  chapterId: string;

  @ApiProperty({ enum: EvolutionStrategy, description: '进化策略' })
  @IsEnum(EvolutionStrategy)
  strategy: EvolutionStrategy;

  @ApiPropertyOptional({ description: '特定模式ID' })
  @IsOptional()
  @IsString()
  patternId?: string;

  @ApiPropertyOptional({ description: '特定角色原型ID' })
  @IsOptional()
  @IsString()
  profileId?: string;

  @ApiPropertyOptional({ description: '额外上下文', type: 'object' })
  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}

export class EvolutionResponseDto {
  @ApiProperty()
  evolutionId: string;

  @ApiProperty()
  chapterId: string;

  @ApiProperty({ enum: EvolutionStrategy })
  strategy: EvolutionStrategy;

  @ApiProperty()
  originalContent: string;

  @ApiProperty()
  evolvedContent: string;

  @ApiProperty({ type: 'object' })
  changes: {
    type: string;
    description: string;
    location: string;
  }[];

  @ApiProperty()
  confidence: number;

  @ApiProperty()
  createdAt: Date;
}
