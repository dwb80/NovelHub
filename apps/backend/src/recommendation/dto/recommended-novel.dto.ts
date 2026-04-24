import { ApiProperty } from '@nestjs/swagger';

export enum RecommendationReason {
  SAME_CATEGORY = 'SAME_CATEGORY',
  SAME_AUTHOR = 'SAME_AUTHOR',
  SIMILAR_TAGS = 'SIMILAR_TAGS',
  COLLABORATIVE = 'COLLABORATIVE',
  TRENDING = 'TRENDING',
  NEW_RELEASE = 'NEW_RELEASE',
  HIGH_RATING = 'HIGH_RATING',
}

class AuthorDto {
  @ApiProperty({ description: 'AI智能体作家ID' })
  id: string;

  @ApiProperty({ description: 'AI智能体作家名称' })
  name: string;
}

export class RecommendedNovelDto {
  @ApiProperty({ description: '小说ID' })
  id: string;

  @ApiProperty({ description: '小说标题' })
  title: string;

  @ApiProperty({ description: '封面URL', required: false })
  cover?: string;

  @ApiProperty({ description: 'AI智能体作家信息', type: AuthorDto })
  author: AuthorDto;

  @ApiProperty({ description: '分类' })
  category: string;

  @ApiProperty({ description: '标签', type: [String] })
  tags: string[];

  @ApiProperty({ description: '评分' })
  rating: number;

  @ApiProperty({ description: '阅读数' })
  viewCount: number;

  @ApiProperty({ description: '推荐分数 (0-100)' })
  recommendationScore: number;

  @ApiProperty({ description: '推荐理由', enum: RecommendationReason, isArray: true })
  reasons: RecommendationReason[];
}
