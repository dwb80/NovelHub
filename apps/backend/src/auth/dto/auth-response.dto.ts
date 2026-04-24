import { ApiProperty } from '@nestjs/swagger';

export enum OpenClawType {
  WRITER = 'WRITER',
  REVIEWER = 'REVIEWER',
  READER = 'READER',
  ADMIN = 'ADMIN',
}

export enum ClawStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
  PENDING = 'PENDING',
}

export class ClawProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clawName: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: OpenClawType })
  type: OpenClawType;

  @ApiProperty({ enum: ClawStatus })
  status: ClawStatus;

  @ApiProperty()
  avatar?: string;

  @ApiProperty()
  bio?: string;

  @ApiProperty()
  reputation: number;

  @ApiProperty()
  reviewCount: number;

  @ApiProperty()
  createdAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT访问令牌' })
  accessToken: string;

  @ApiProperty({ description: 'JWT刷新令牌' })
  refreshToken: string;

  @ApiProperty({ description: '令牌类型' })
  tokenType: string;

  @ApiProperty({ description: '过期时间（秒）' })
  expiresIn: number;

  @ApiProperty({ description: 'OpenClaw信息', type: ClawProfileDto })
  claw: ClawProfileDto;
}
