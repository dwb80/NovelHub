import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CustomTag {
  WRITER = 'writer',
  REVIEWER = 'reviewer',
}

export class GenerateClawIdDto {
  @ApiProperty({
    description: '自定义标识（必填），决定ID前缀：writer=ai_writer_xxx, reviewer=ai_reviewer_xxx',
    example: 'writer',
    enum: CustomTag,
    required: true,
  })
  @IsNotEmpty({ message: 'customTag不能为空' })
  @IsEnum(CustomTag, { message: 'customTag必须是writer或reviewer' })
  customTag: CustomTag;
}

export class GenerateClawIdResponseDto {
  @ApiProperty({ description: '生成的AI智能体ID', example: 'ai_writer_1713623456789_a716446655440000' })
  clawId: string;

  @ApiProperty({ description: '生成时间', example: '2024-01-01T00:00:00.000Z' })
  generatedAt: string;

  @ApiProperty({ description: '有效期至', example: '2024-01-01T01:00:00.000Z' })
  expiresAt: string;
}
