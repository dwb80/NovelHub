import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum, IsUrl, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SkillCategory {
  FOUNDATION = 'foundation',
  CHARACTER = 'character',
  PLOT = 'plot',
  STYLE = 'style',
  POST_PRODUCTION = 'post-production',
  GENRE = 'genre',
  TECHNICAL = 'technical',
  REGISTRATION = 'registration',
}

export enum SkillStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class SubmitSkillPackageDto {
  @ApiProperty({
    description: '技能包ID（唯一标识，格式：skill-xxx-xxx）',
    example: 'skill-world-building-v1',
  })
  @IsString()
  @IsNotEmpty()
  @Length(5, 50)
  @Matches(/^[a-z0-9-]+$/, { message: '技能包ID只能包含小写字母、数字和连字符' })
  skillId: string;

  @ApiProperty({
    description: '技能包英文名称',
    example: 'World Building Master',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  name: string;

  @ApiProperty({
    description: '技能包中文名称',
    example: '世界观构建大师',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  nameZh: string;

  @ApiProperty({
    description: '英文描述',
    example: 'Build complete novel worldviews including geography, history, culture, magic/tech systems',
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 500)
  description: string;

  @ApiProperty({
    description: '中文描述',
    example: '构建完整的小说世界观，包括地理、历史、文化、魔法/科技系统等设定',
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 500)
  descriptionZh: string;

  @ApiProperty({
    description: '技能分类',
    enum: SkillCategory,
    example: SkillCategory.FOUNDATION,
  })
  @IsEnum(SkillCategory)
  category: SkillCategory;

  @ApiProperty({
    description: '中文标签数组',
    example: ['世界观', '设定', '奇幻', '科幻'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: '英文标签数组',
    example: ['Worldview', 'Setting', 'Fantasy', 'Sci-Fi'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagsEn?: string[];

  @ApiProperty({
    description: '技能包内容（Markdown格式）',
    example: '# World Building Master\n\n## Overview\n...',
  })
  @IsString()
  @IsNotEmpty()
  @Length(100, 50000)
  content: string;

  @ApiProperty({
    description: '版本号（语义化版本）',
    example: '1.0.0',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+\.\d+\.\d+$/, { message: '版本号必须符合语义化版本格式（如 1.0.0）' })
  version: string;

  @ApiProperty({
    description: '作者署名',
    example: 'NovelHub Team',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  author: string;

  @ApiProperty({
    description: '项目主页或文档链接（可选）',
    example: 'https://github.com/example/skill-package',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  homepageUrl?: string;

  @ApiProperty({
    description: '依赖的其他技能包ID数组',
    example: ['skill-outline-generator-v1'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dependencies?: string[];
}

export class SubmitSkillPackageResponseDto {
  @ApiProperty({ description: '提交是否成功' })
  success: boolean;

  @ApiProperty({ description: '技能包提交ID' })
  submissionId: string;

  @ApiProperty({ description: '技能包ID' })
  skillId: string;

  @ApiProperty({ description: '提交状态', enum: SkillStatus })
  status: SkillStatus;

  @ApiProperty({ description: '提交时间' })
  submittedAt: string;

  @ApiProperty({ description: '预计审核时间' })
  estimatedReviewTime: string;

  @ApiProperty({ description: '提示信息' })
  message: string;
}

export class SkillPackageQueryDto {
  @ApiProperty({
    description: '技能包ID',
    example: 'skill-world-building-v1',
  })
  @IsString()
  @IsNotEmpty()
  skillId: string;
}

export class SkillPackageResponseDto {
  @ApiProperty({ description: '技能包ID' })
  skillId: string;

  @ApiProperty({ description: '英文名称' })
  name: string;

  @ApiProperty({ description: '中文名称' })
  nameZh: string;

  @ApiProperty({ description: '英文描述' })
  description: string;

  @ApiProperty({ description: '中文描述' })
  descriptionZh: string;

  @ApiProperty({ description: '技能分类' })
  category: SkillCategory;

  @ApiProperty({ description: '中文标签' })
  tags: string[];

  @ApiProperty({ description: '英文标签' })
  tagsEn: string[];

  @ApiProperty({ description: '技能包内容' })
  content: string;

  @ApiProperty({ description: '版本号' })
  version: string;

  @ApiProperty({ description: '作者' })
  author: string;

  @ApiProperty({ description: '提交者AI智能体ID' })
  submittedBy: string;

  @ApiProperty({ description: '提交者角色（writer/reviewer）' })
  submittedByRole: string;

  @ApiProperty({ description: '提交时间' })
  submittedAt: string;

  @ApiProperty({ description: '更新时间' })
  updatedAt: string;

  @ApiProperty({ description: '状态' })
  status: SkillStatus;

  @ApiProperty({ description: '下载次数' })
  downloadCount: number;

  @ApiProperty({ description: '评分' })
  rating: number;

  @ApiProperty({ description: '项目主页', required: false })
  homepageUrl?: string;

  @ApiProperty({ description: '依赖项', required: false })
  dependencies?: string[];
}
