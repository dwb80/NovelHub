import { IsString, IsNotEmpty, IsNumber, IsEnum, IsArray, Min, Max, Length, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ReviewVerdict {
  APPROVED = 'approved',
  CONDITIONAL = 'conditional',
  REJECTED = 'rejected',
}

export class SkillReviewScoresDto {
  @ApiProperty({ description: '功能完整性评分 (0-15)', minimum: 0, maximum: 15 })
  @IsNumber()
  @Min(0)
  @Max(15)
  completeness: number;

  @ApiProperty({ description: '功能正确性评分 (0-15)', minimum: 0, maximum: 15 })
  @IsNumber()
  @Min(0)
  @Max(15)
  correctness: number;

  @ApiProperty({ description: '实用性评分 (0-10)', minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  practicality: number;

  @ApiProperty({ description: '文档完整性评分 (0-10)', minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  docCompleteness: number;

  @ApiProperty({ description: '文档清晰度评分 (0-10)', minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  clarity: number;

  @ApiProperty({ description: '示例质量评分 (0-10)', minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  examples: number;

  @ApiProperty({ description: '技术规范评分 (0-10)', minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  standards: number;

  @ApiProperty({ description: '安全性评分 (0-10)', minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  security: number;

  @ApiProperty({ description: '创新性评分 (0-10)', minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  innovation: number;
}

export class SubmitSkillReviewDto {
  @ApiProperty({
    description: '技能包ID',
    example: 'skill-world-building-v1',
  })
  @IsString()
  @IsNotEmpty()
  skillId: string;

  @ApiProperty({
    description: '各项评分',
    type: SkillReviewScoresDto,
  })
  scores: SkillReviewScoresDto;

  @ApiProperty({
    description: '评审结论',
    enum: ReviewVerdict,
    example: ReviewVerdict.APPROVED,
  })
  @IsEnum(ReviewVerdict)
  verdict: ReviewVerdict;

  @ApiProperty({
    description: '详细评审意见',
    example: '该技能包功能完整，文档清晰，示例丰富...',
  })
  @IsString()
  @IsNotEmpty()
  @Length(50, 2000)
  comments: string;

  @ApiProperty({
    description: '改进建议列表',
    example: ['建议增加更多边界情况示例', '可以优化参数说明'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  suggestions?: string[];

  @ApiProperty({
    description: '优点总结',
    example: ['功能设计合理', '文档结构清晰', '示例实用'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  strengths?: string[];

  @ApiProperty({
    description: '发现的问题',
    example: ['缺少错误处理说明', '部分示例不够典型'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  weaknesses?: string[];
}

export class SkillReviewResponseDto {
  @ApiProperty({ description: '评审记录ID' })
  reviewId: string;

  @ApiProperty({ description: '技能包ID' })
  skillId: string;

  @ApiProperty({ description: '评审员ID' })
  reviewerId: string;

  @ApiProperty({ description: '评审员角色' })
  reviewerRole: string;

  @ApiProperty({ description: '各项评分' })
  scores: {
    functionality: { completeness: number; correctness: number; practicality: number; subtotal: number };
    documentation: { completeness: number; clarity: number; examples: number; subtotal: number };
    technical: { standards: number; security: number; subtotal: number };
    innovation: number;
    total: number;
  };

  @ApiProperty({ description: '评审结论', enum: ReviewVerdict })
  verdict: ReviewVerdict;

  @ApiProperty({ description: '评审意见' })
  comments: string;

  @ApiProperty({ description: '改进建议' })
  suggestions: string[];

  @ApiProperty({ description: '优点' })
  strengths: string[];

  @ApiProperty({ description: '不足' })
  weaknesses: string[];

  @ApiProperty({ description: '评审时间' })
  reviewedAt: string;
}

export class SkillReviewListResponseDto {
  @ApiProperty({ description: '评审记录列表', type: [SkillReviewResponseDto] })
  reviews: SkillReviewResponseDto[];

  @ApiProperty({ description: '总评审数' })
  totalCount: number;

  @ApiProperty({ description: '平均分' })
  averageScore: number;

  @ApiProperty({ description: '通过数' })
  approvedCount: number;

  @ApiProperty({ description: '待评审数' })
  pendingCount: number;
}

export class PendingSkillPackageDto {
  @ApiProperty({ description: '技能包ID' })
  skillId: string;

  @ApiProperty({ description: '英文名称' })
  name: string;

  @ApiProperty({ description: '中文名称' })
  nameZh: string;

  @ApiProperty({ description: '分类' })
  category: string;

  @ApiProperty({ description: '版本' })
  version: string;

  @ApiProperty({ description: '作者' })
  author: string;

  @ApiProperty({ description: '提交者ID' })
  submittedBy: string;

  @ApiProperty({ description: '提交时间' })
  submittedAt: string;

  @ApiProperty({ description: '已有评审数' })
  reviewCount: number;
}

export class ReviewStatsDto {
  @ApiProperty({ description: '评审员ID' })
  reviewerId: string;

  @ApiProperty({ description: '总评审数' })
  totalReviews: number;

  @ApiProperty({ description: '本月评审数' })
  monthlyReviews: number;

  @ApiProperty({ description: '平均评分' })
  averageScore: number;

  @ApiProperty({ description: '评审积分' })
  reviewPoints: number;

  @ApiProperty({ description: '评审等级' })
  reviewerLevel: string;
}
