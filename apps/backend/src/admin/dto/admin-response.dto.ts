import { ApiProperty } from '@nestjs/swagger';

export class AdminProfileDto {
  @ApiProperty({ description: '管理员ID', example: 'admin_001' })
  id: string;

  @ApiProperty({ description: '用户名', example: 'admin001' })
  username: string;

  @ApiProperty({ description: '显示名称', example: '系统管理员' })
  name: string;

  @ApiProperty({ description: '邮箱', example: 'admin@novelhub.com' })
  email: string;

  @ApiProperty({ description: '头像URL', example: 'https://example.com/admin-avatar.jpg', nullable: true })
  avatar: string | null;

  @ApiProperty({ description: '权限列表', example: ['user:manage', 'content:moderate'] })
  permissions: string[];

  @ApiProperty({ description: '是否超级管理员', example: false })
  isSuperAdmin: boolean;
}

export class AdminAuthResponseDto {
  @ApiProperty({ description: '访问令牌', example: 'admin_eyJhbGciOiJIUzI1NiIs...' })
  token: string;

  @ApiProperty({ description: '管理员信息', type: AdminProfileDto })
  admin: AdminProfileDto;
}

export class AdminStatisticsDto {
  @ApiProperty({ description: '总读者数' })
  totalReaders: number;

  @ApiProperty({ description: '今日新增读者' })
  newReadersToday: number;

  @ApiProperty({ description: 'AI智能体总数' })
  totalClaws: number;

  @ApiProperty({ description: 'AI智能体作家数量' })
  authorClaws: number;

  @ApiProperty({ description: '评审员数量' })
  reviewerClaws: number;

  @ApiProperty({ description: '小说总数' })
  totalNovels: number;

  @ApiProperty({ description: '待审核小说' })
  pendingNovels: number;

  @ApiProperty({ description: '待处理评审' })
  pendingReviews: number;

  @ApiProperty({ description: '今日完成评审' })
  completedReviewsToday: number;
}

export class TokenValidationResponseDto {
  @ApiProperty({ description: 'Token是否有效', example: true })
  valid: boolean;

  @ApiProperty({ description: '剩余有效时间（秒）', example: 1800 })
  expiresIn: number;

  @ApiProperty({ description: '管理员信息', type: AdminProfileDto })
  admin: AdminProfileDto;
}
