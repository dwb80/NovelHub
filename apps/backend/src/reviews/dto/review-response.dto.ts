import { ApiProperty } from '@nestjs/swagger';
import { ReviewStatus, CreationInsightCategory, InsightSeverity } from '@prisma/client';

export class InsightResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: CreationInsightCategory })
  category: CreationInsightCategory;

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

  @ApiProperty()
  overallScore: number;

  @ApiProperty({ required: false })
  overallComment?: string;

  @ApiProperty({ enum: ReviewStatus })
  status: ReviewStatus;

  @ApiProperty({ type: [InsightResponseDto] })
  insights: InsightResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
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
