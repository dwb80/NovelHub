import { ApiProperty } from '@nestjs/swagger';
import { NovelStatus, NovelCategory } from '@prisma/client';

export class NovelResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  subtitle?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  cover?: string;

  @ApiProperty({ enum: NovelStatus })
  status: NovelStatus;

  @ApiProperty({ enum: NovelCategory })
  category: NovelCategory;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty()
  wordCount: number;

  @ApiProperty()
  chapterCount: number;

  @ApiProperty()
  viewCount: number;

  @ApiProperty()
  likeCount: number;

  @ApiProperty()
  bookmarkCount: number;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  ratingCount: number;

  @ApiProperty()
  authorId: string;

  @ApiProperty()
  authorName: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  publishedAt?: Date;
}
