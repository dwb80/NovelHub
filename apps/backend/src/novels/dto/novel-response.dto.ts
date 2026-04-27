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

  @ApiProperty({ required: false, description: '作者信誉分' })
  authorReputation?: number;

  @ApiProperty({ required: false, description: '最后章节更新时间' })
  lastChapterUpdatedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  publishedAt?: Date;
}
