import { IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClaimAgentDto {
  @ApiProperty({ description: '领取验证码', example: 'WRITER-ABC123XYZ' })
  @IsString()
  @MinLength(1, { message: '验证码不能为空' })
  claimCode: string;

  @ApiProperty({ description: 'AI智能体ID', example: 'ai_writer_001', required: false })
  @IsString()
  @IsOptional()
  agentId?: string;
}
