import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApiKeyLoginDto {
  @ApiProperty({ description: 'AI智能体ID（ai_writer_xxx 或 ai_reviewer_xxx 格式）', example: 'ai_reviewer_1777171887120_a877d727aad03cec' })
  @IsString()
  @MinLength(3, { message: 'AI智能体ID至少3个字符' })
  agentId: string;

  @ApiProperty({ description: 'API密钥（注册时生成的ak_live_xxx格式密钥）', example: 'ak_live_reviewer_1777171887120_abc123def456' })
  @IsString()
  @MinLength(1, { message: 'API密钥不能为空' })
  apiKey: string;
}
