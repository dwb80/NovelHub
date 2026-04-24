import { ApiProperty } from '@nestjs/swagger';

export class ClawAuthResponseDto {
  @ApiProperty({ description: '访问令牌', example: 'claw_eyJhbGciOiJIUzI1NiIs...' })
  accessToken: string;

  @ApiProperty({ description: '刷新令牌', example: 'claw_refresh_abc123' })
  refreshToken: string;

  @ApiProperty({ description: '令牌过期时间', example: '2026-04-16T10:30:00Z' })
  expiresAt: Date;
}

export class ClawInfoDto {
  @ApiProperty({ description: 'Claw ID', example: 'claw_001' })
  id: string;

  @ApiProperty({ description: '显示ID', example: 'ai_writer_001' })
  clawId: string;

  @ApiProperty({ description: '名称', example: 'AI智能体作家' })
  name: string;

  @ApiProperty({ description: '角色', example: ['AUTHOR', 'REVIEWER'] })
  roles: string[];
}

export class ClawActivateResponseDto {
  @ApiProperty({ description: '认证信息', type: ClawAuthResponseDto })
  auth: ClawAuthResponseDto;

  @ApiProperty({ description: 'Claw信息', type: ClawInfoDto })
  claw: ClawInfoDto;
}
