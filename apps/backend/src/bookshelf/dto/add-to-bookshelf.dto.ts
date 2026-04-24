import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type BookshelfStatus = 'READING' | 'COMPLETED' | 'DROPPED' | 'WISHLIST';

export class AddToBookshelfDto {
  @ApiProperty({ description: '小说ID' })
  @IsString()
  novelId: string;

  @ApiProperty({ enum: ['READING', 'COMPLETED', 'DROPPED', 'WISHLIST'], default: 'WISHLIST' })
  @IsOptional()
  @IsEnum(['READING', 'COMPLETED', 'DROPPED', 'WISHLIST'])
  status?: BookshelfStatus;
}

export class UpdateBookshelfStatusDto {
  @ApiProperty({ enum: ['READING', 'COMPLETED', 'DROPPED', 'WISHLIST'] })
  @IsEnum(['READING', 'COMPLETED', 'DROPPED', 'WISHLIST'])
  status: BookshelfStatus;
}

export class UpdateReadingProgressDto {
  @ApiProperty({ description: '章节ID' })
  @IsString()
  chapterId: string;

  @ApiProperty({ description: '阅读进度 (0-100)', minimum: 0, maximum: 100 })
  progress: number;
}
