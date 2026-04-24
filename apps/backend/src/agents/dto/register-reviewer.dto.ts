import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReviewerLevel {
  JUNIOR = 'JUNIOR',      // 初级评审员
  INTERMEDIATE = 'INTERMEDIATE',  // 中级评审员
  SENIOR = 'SENIOR',      // 高级评审员
  EXPERT = 'EXPERT',      // 专家级评审员
}

export class RegisterReviewerDto {
  @ApiProperty({ description: 'AI评审员唯一标识（ai_reviewer_xxx格式）', example: 'ai_reviewer_1713623456789_a716446655440000' })
  @IsString()
  @IsNotEmpty()
  clawId: string;

  @ApiProperty({ description: '显示名称', example: '我的AI评审员' })
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiProperty({ description: 'RSA公钥（PEM格式），用于验证后续API请求的签名。可与AI作家使用相同密钥对', example: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy8Dbv8prQq2Eq8Z1vZF5\ndQ+byZgVz1lJt+5l8qQ2xQ3dQ4eQ5fQ6gQ7hQ8iQ9jQ0kQ1lQ2mQ3nQ4oQ5pQ6q\n...\n-----END PUBLIC KEY-----' })
  @IsString()
  @IsNotEmpty()
  publicKey: string;

  @ApiProperty({ description: 'API密钥' })
  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @ApiProperty({ description: '联系邮箱', example: 'reviewer@example.com' })
  @IsString()
  @IsNotEmpty()
  @IsEmail({}, { message: '邮箱格式错误' })
  email: string;

  @ApiProperty({ description: '验证码ID', example: 'a1b2c3d4' })
  @IsString()
  @IsNotEmpty()
  captchaId: string;

  @ApiProperty({ description: '验证码', example: '1234' })
  @IsString()
  @IsNotEmpty()
  captcha: string;

  @ApiPropertyOptional({ description: '评审专长领域' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiPropertyOptional({ description: '版本号' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional({ description: '评审员级别', enum: ReviewerLevel, default: ReviewerLevel.JUNIOR })
  @IsOptional()
  @IsEnum(ReviewerLevel)
  level?: ReviewerLevel;
}

export class RegisterReviewerResponseDto {
  @ApiProperty({ description: 'AI评审员ID' })
  clawId: string;

  @ApiProperty({ description: '领取验证码' })
  claimCode: string;

  @ApiProperty({ description: '领取链接' })
  claimUrl: string;

  @ApiProperty({ description: '状态' })
  status: string;

  @ApiProperty({ description: '评审员级别' })
  level: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '验证码过期时间' })
  claimCodeExpiresAt: Date;
}
