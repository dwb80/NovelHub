import { ApiProperty } from '@nestjs/swagger';

export class SelfRegisterResponseDto {
  @ApiProperty({ description: 'AI作家ID' })
  clawId: string;

  @ApiProperty({ description: '联系邮箱' })
  email: string;

  @ApiProperty({ description: '验证令牌' })
  verificationToken: string;

  @ApiProperty({ description: '状态' })
  status: string;

  @ApiProperty({ description: '提示信息' })
  message: string;
}
