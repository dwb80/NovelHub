import { ApiProperty } from '@nestjs/swagger';

export class ReviewerInfoDto {
  @ApiProperty({ description: '评审员ID' })
  id: string;

  @ApiProperty({ description: '评审员名称' })
  name: string;

  @ApiProperty({ description: '评审员AgentID' })
  agentId: string;
}

export class ReviewProcessDto {
  @ApiProperty({ description: '评审任务ID' })
  taskId: string;

  @ApiProperty({ description: '评审ID' })
  reviewId: string;

  @ApiProperty({ description: '章节ID' })
  chapterId: string;

  @ApiProperty({ description: '章节标题' })
  chapterTitle: string;

  @ApiProperty({ description: '章节序号' })
  chapterOrder: number;

  @ApiProperty({ description: '评审员信息' })
  reviewer: ReviewerInfoDto;

  @ApiProperty({ description: '总体评分' })
  overallRating: number;

  @ApiProperty({ description: '评审意见' })
  comment: string;

  @ApiProperty({ description: '任务状态' })
  status: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '完成时间' })
  completedAt: Date;
}

export class ChapterReviewItemDto {
  @ApiProperty({ description: '章节ID' })
  id: string;

  @ApiProperty({ description: '章节标题' })
  title: string;

  @ApiProperty({ description: '章节序号' })
  orderIndex: number;

  @ApiProperty({ description: '字数' })
  wordCount: number;

  @ApiProperty({ description: '章节状态' })
  status: string;

  @ApiProperty({ description: '评审员信息', required: false })
  reviewer?: ReviewerInfoDto;

  @ApiProperty({ description: '评审状态', required: false })
  reviewStatus?: string;

  @ApiProperty({ description: '总体评分', required: false })
  overallRating?: number;

  @ApiProperty({ description: '评审时间', required: false })
  reviewedAt?: Date;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;
}

export class NovelReviewDetailDto {
  @ApiProperty({ description: '小说ID' })
  id: string;

  @ApiProperty({ description: '小说标题' })
  title: string;

  @ApiProperty({ description: '小说状态' })
  status: string;

  @ApiProperty({ description: 'AI智能体作家信息' })
  author: {
    id: string;
    name: string;
    agentId: string;
  };

  @ApiProperty({ description: '参与评审的AI评审员列表' })
  reviewers: ReviewerInfoDto[];

  @ApiProperty({ description: '评审过程记录' })
  reviewProcesses: ReviewProcessDto[];

  @ApiProperty({ description: '评审统计' })
  statistics: {
    totalChapters: number;
    reviewedChapters: number;
    pendingChapters: number;
    averageRating: number;
  };
}

export class ChapterReviewListDto {
  @ApiProperty({ description: '章节列表' })
  chapters: ChapterReviewItemDto[];

  @ApiProperty({ description: '分页信息' })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
