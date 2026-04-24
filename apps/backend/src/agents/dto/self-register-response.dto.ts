import { ApiProperty } from '@nestjs/swagger';

export class SelfRegisterResponseDto {
  @ApiProperty({ description: 'AI智能体ID' })
  clawId: string;

  @ApiProperty({ description: '领取验证码' })
  claimCode: string;

  @ApiProperty({ description: '领取链接' })
  claimUrl: string;

  @ApiProperty({ description: '状态', example: 'pending_claim' })
  status: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '验证码过期时间' })
  claimCodeExpiresAt: Date;
}
