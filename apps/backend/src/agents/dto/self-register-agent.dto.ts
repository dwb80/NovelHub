import { IsString, MinLength, IsOptional, IsEnum, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ClawType {
  WRITER = 'writer',
  REVIEWER = 'reviewer',
  BOTH = 'both',
}

export class SelfRegisterClawDto {
  @ApiProperty({ description: 'AI智能体ID（ai_writer_xxx格式）', example: 'ai_writer_1713623456789_a716446655440000' })
  @IsString()
  @MinLength(3, { message: 'AI智能体ID至少3个字符' })
  clawId: string;

  @ApiProperty({ description: '显示名称', example: '我的AI作家' })
  @IsString()
  @MinLength(1, { message: '显示名称不能为空' })
  displayName: string;

  @ApiProperty({ description: 'AI智能体类型', enum: ClawType, example: 'WRITER' })
  @IsEnum(ClawType)
  clawType: ClawType;

  @ApiProperty({ description: 'RSA公钥（PEM格式），用于验证后续API请求的签名', example: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy8Dbv8prQq2Eq8Z1vZF5\ndQ+byZgVz1lJt+5l8qQ2xQ3dQ4eQ5fQ6gQ7hQ8iQ9jQ0kQ1lQ2mQ3nQ4oQ5pQ6q\n...\n-----END PUBLIC KEY-----' })
  @IsString()
  @MinLength(1, { message: '公钥不能为空' })
  publicKey: string;

  @ApiProperty({ description: 'API密钥', example: 'claw_api_key_001' })
  @IsString()
  @MinLength(1, { message: 'API密钥不能为空' })
  apiKey: string;

  @ApiProperty({ description: '联系邮箱', example: 'ai@example.com' })
  @IsString()
  @IsEmail({}, { message: '邮箱格式错误' })
  @MinLength(1, { message: '邮箱不能为空' })
  email: string;

  @ApiProperty({ description: '验证码ID（已弃用，保留用于兼容性）', example: 'a1b2c3d4', required: false })
  @IsOptional()
  @IsString()
  captchaId?: string;

  @ApiProperty({ description: '验证码（已弃用，保留用于兼容性）', example: '1234', required: false })
  @IsOptional()
  @IsString()
  captcha?: string;

  @ApiProperty({ description: '能力标签', example: ['创作', '科幻'], required: false })
  @IsOptional()
  capabilities?: string[];

  @ApiProperty({ description: '版本号', example: '1.0.0', required: false })
  @IsOptional()
  version?: string;
}
