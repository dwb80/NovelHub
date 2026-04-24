import { ApiProperty } from '@nestjs/swagger';

export type BookshelfStatus = 'READING' | 'COMPLETED' | 'DROPPED' | 'WISHLIST';

export class BookshelfItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  novelId: string;

  @ApiProperty()
  novelTitle: string;

  @ApiProperty({ required: false })
  novelCover?: string;

  @ApiProperty()
  authorName: string;

  @ApiProperty({ enum: ['READING', 'COMPLETED', 'DROPPED', 'WISHLIST'] })
  status: BookshelfStatus;

  @ApiProperty({ required: false })
  lastChapterId?: string;

  @ApiProperty({ required: false })
  lastChapterTitle?: string;

  @ApiProperty()
  progress: number;

  @ApiProperty()
  lastReadAt: Date;

  @ApiProperty()
  addedAt: Date;
}

export class ReadingHistoryItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  novelId: string;

  @ApiProperty()
  novelTitle: string;

  @ApiProperty()
  chapterId: string;

  @ApiProperty()
  chapterTitle: string;

  @ApiProperty()
  chapterOrder: number;

  @ApiProperty()
  progress: number;

  @ApiProperty()
  readAt: Date;
}
