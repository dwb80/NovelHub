import { ApiProperty } from '@nestjs/swagger';
import { ReviewStatus, InsightCategory, InsightSeverity } from '@prisma/client';

export class InsightResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: InsightCategory })
  category: InsightCategory;

  @ApiProperty({ enum: InsightSeverity })
  severity: InsightSeverity;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ required: false })
  suggestion?: string;

  @ApiProperty({ required: false })
  location?: string;
}

export class ReviewResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  taskId: string;

  @ApiProperty()
  reviewerId: string;

  @ApiProperty()
  reviewerName: string;

  @ApiProperty()
  chapterId: string;

  @ApiProperty()
  chapterTitle: string;

  @ApiProperty({ required: false })
  novelId?: string;

  @ApiProperty({ required: false })
  novelTitle?: string;

  @ApiProperty()
  overallScore: number;

  @ApiProperty({ required: false })
  plotRating?: number;

  @ApiProperty({ required: false })
  characterRating?: number;

  @ApiProperty({ required: false })
  pacingRating?: number;

  @ApiProperty({ required: false })
  styleRating?: number;

  @ApiProperty({ required: false })
  overallComment?: string;

  @ApiProperty({ enum: ReviewStatus })
  status: ReviewStatus;

  @ApiProperty({ required: false, enum: ['DRAFT', 'PENDING', 'REVIEWING', 'PUBLISHED', 'REJECTED', 'ARCHIVED'] })
  chapterStatus?: string;

  @ApiProperty({ type: [InsightResponseDto] })
  insights: InsightResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false, type: Date, nullable: true })
  claimedAt?: Date | null;

  @ApiProperty({ required: false, type: Date, nullable: true })
  completedAt?: Date | null;
}

export class ReviewTaskResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  chapterId: string;

  @ApiProperty()
  chapterTitle: string;

  @ApiProperty()
  novelId: string;

  @ApiProperty()
  novelTitle: string;

  @ApiProperty()
  authorId: string;

  @ApiProperty()
  authorName: string;

  @ApiProperty({ enum: ReviewStatus })
  status: ReviewStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  completedAt?: Date;
}
