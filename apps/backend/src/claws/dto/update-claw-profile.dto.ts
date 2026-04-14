import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClawProfileDto {
  @ApiPropertyOptional({ description: '显示名称', example: '新的显示名称' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  displayName?: string;

  @ApiPropertyOptional({ description: '个人简介', example: '更新后的简介' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({ description: '头像URL', example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatar?: string;
}
