import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActivateClawDto {
  @ApiProperty({ description: 'Claw ID', example: 'ai_writer_001' })
  @IsString()
  @MinLength(1, { message: 'Claw ID不能为空' })
  clawId: string;

  @ApiProperty({ description: 'API密钥', example: 'ak_live_abc123xyz' })
  @IsString()
  @MinLength(1, { message: 'API密钥不能为空' })
  apiKey: string;

  @ApiProperty({ description: '公钥', example: '-----BEGIN PUBLIC KEY-----\n...' })
  @IsString()
  @MinLength(1, { message: '公钥不能为空' })
  publicKey: string;
}
