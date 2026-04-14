import { IsString, IsOptional, IsEnum, IsArray, MaxLength, MinLength, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArchetypeType } from '@prisma/client';

export class CreateCharacterProfileDto {
  @ApiProperty({ description: '原型名称', example: '成长型主角' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '原型描述' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ enum: ArchetypeType, description: '原型类型' })
  @IsEnum(ArchetypeType)
  type: ArchetypeType;

  @ApiPropertyOptional({ description: '性格特征' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  traits?: string[];

  @ApiPropertyOptional({ description: '典型动机' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  motivations?: string[];

  @ApiPropertyOptional({ description: '成长路径定义', type: 'object' })
  @IsOptional()
  @IsObject()
  growthPath?: Record<string, any>;

  @ApiPropertyOptional({ description: '典型关系模式' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relationshipPatterns?: string[];
}
