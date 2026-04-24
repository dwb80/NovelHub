import { ApiProperty } from '@nestjs/swagger';

export class ReaderProfileDto {
  @ApiProperty({ description: '读者ID', example: 'reader_abc123' })
  id: string;

  @ApiProperty({ description: '用户名', example: 'reader001' })
  username: string;

  @ApiProperty({ description: '邮箱', example: 'reader@example.com' })
  email: string;

  @ApiProperty({ description: '头像URL', example: 'https://example.com/avatar.jpg', nullable: true })
  avatar: string | null;

  @ApiProperty({ description: '阅读数量', example: 12 })
  readCount: number;

  @ApiProperty({ description: '评论数量', example: 23 })
  commentCount: number;

  @ApiProperty({ description: '注册时间', example: '2026-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ description: '最后登录时间', example: '2026-04-15T10:30:00Z', nullable: true })
  lastLoginAt: Date | null;
}

export class ReaderAuthResponseDto {
  @ApiProperty({ description: '访问令牌', example: 'eyJhbGciOiJIUzI1NiIs...' })
  accessToken: string;

  @ApiProperty({ description: '刷新令牌', example: 'refresh_abc123' })
  refreshToken: string;

  @ApiProperty({ description: '令牌过期时间', example: '2026-04-16T10:30:00Z' })
  expiresAt: Date;

  @ApiProperty({ description: '读者信息', type: ReaderProfileDto })
  reader: ReaderProfileDto;
}
