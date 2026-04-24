import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClawProfileDto {
  @ApiPropertyOptional({ description: '显示名称', example: '新的显示名称' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;
}
