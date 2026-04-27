import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsEmail } from 'class-validator';

export enum InvitationCodeStatus {
  UNUSED = 'unused',
  USED = 'used',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

export class GenerateInvitationCodeDto {
  @ApiProperty({
    description: '智能体类型',
    enum: ['writer', 'reviewer'],
    example: 'reviewer',
  })
  @IsString()
  @IsEnum(['writer', 'reviewer'])
  agentType: 'writer' | 'reviewer';

  @ApiProperty({
    description: '备注信息（可选）',
    required: false,
    example: '给张三的评审员邀请码',
  })
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiProperty({
    description: '指定接收者邮箱（可选）',
    required: false,
    example: 'user@example.com',
  })
  @IsEmail()
  @IsOptional()
  recipientEmail?: string;
}

export class GenerateInvitationCodeResponseDto {
  @ApiProperty({ description: '邀请码', example: 'INV-2026-ABC123XYZ' })
  code: string;

  @ApiProperty({ description: '智能体类型', example: 'reviewer' })
  agentType: string;

  @ApiProperty({ description: '创建时间', example: '2026-04-26T08:30:00.000Z' })
  createdAt: string;

  @ApiProperty({ description: '过期时间', example: '2026-05-26T08:30:00.000Z' })
  expiresAt: string;

  @ApiProperty({ description: '状态', example: 'unused' })
  status: string;

  @ApiProperty({ description: '备注', example: '给张三的评审员邀请码' })
  remark?: string;
}

export class RequestIdentityWithCodeDto {
  @ApiProperty({
    description: '邀请码',
    example: 'INV-2026-ABC123XYZ',
  })
  @IsString()
  invitationCode: string;

  @ApiProperty({
    description: '智能体名称',
    example: 'AI评审员-小智',
  })
  @IsString()
  agentName: string;
}

export class RequestIdentityWithCodeResponseDto {
  @ApiProperty({ description: '生成的AI智能体ID', example: 'ai_reviewer_1713623456789_a716446655440000' })
  clawId: string;

  @ApiProperty({ description: 'API密钥', example: 'ak_live_reviewer_1713623456789_a716446655440000abcdef123456' })
  apiKey: string;

  @ApiProperty({ description: '生成时间', example: '2024-01-01T00:00:00.000Z' })
  generatedAt: string;

  @ApiProperty({ description: '有效期至', example: '2024-01-01T01:00:00.000Z' })
  expiresAt: string;

  @ApiProperty({ description: '重要提示信息' })
  importantNotice: string;

  @ApiProperty({ description: '下一步操作指引' })
  nextStep: string;

  @ApiProperty({ description: '使用的邀请码' })
  invitationCode: string;
}

export class ListInvitationCodesQueryDto {
  @ApiProperty({ description: '状态筛选', required: false, enum: InvitationCodeStatus })
  @IsOptional()
  @IsEnum(InvitationCodeStatus)
  status?: InvitationCodeStatus;

  @ApiProperty({ description: '智能体类型', required: false, enum: ['writer', 'reviewer'] })
  @IsOptional()
  agentType?: 'writer' | 'reviewer';

  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsOptional()
  page?: number;

  @ApiProperty({ description: '每页数量', required: false, default: 10 })
  @IsOptional()
  pageSize?: number;
}

export class ListInvitationCodesResponseDto {
  @ApiProperty({ description: '邀请码列表', type: [GenerateInvitationCodeResponseDto] })
  list: GenerateInvitationCodeResponseDto[];

  @ApiProperty({ description: '总数量' })
  total: number;

  @ApiProperty({ description: '当前页码' })
  page: number;

  @ApiProperty({ description: '每页数量' })
  pageSize: number;

  @ApiProperty({ description: '总页数' })
  totalPages: number;
}
