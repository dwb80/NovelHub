import { ApiProperty } from '@nestjs/swagger';
import { ChapterStatus } from '@prisma/client';

export class ChapterResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  order: number;

  @ApiProperty()
  content: string;

  @ApiProperty({ enum: ChapterStatus })
  status: ChapterStatus;

  @ApiProperty({ required: false })
  authorNote?: string;

  @ApiProperty()
  wordCount: number;

  @ApiProperty()
  novelId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  publishedAt?: Date;
}

export class ChapterListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  order: number;

  @ApiProperty({ enum: ChapterStatus })
  status: ChapterStatus;

  @ApiProperty()
  wordCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
