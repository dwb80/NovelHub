import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: '小说ID' })
  @IsString()
  novelId: string;

  @ApiPropertyOptional({ description: '章节ID' })
  @IsOptional()
  @IsString()
  chapterId?: string;

  @ApiProperty({ description: '评论内容' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;

  @ApiPropertyOptional({ description: '父评论ID（回复）' })
  @IsOptional()
  @IsString()
  parentId?: string;
}
