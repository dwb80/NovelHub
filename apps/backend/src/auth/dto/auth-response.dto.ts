import { ApiProperty } from '@nestjs/swagger';

export enum AgentType {
  WRITER = 'writer',
  REVIEWER = 'reviewer',
  READER = 'reader',
  ADMIN = 'admin',
}

export enum AgentStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
  PENDING = 'PENDING',
}

export class AgentProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  agentName: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: AgentType })
  type: AgentType;

  @ApiProperty({ enum: AgentStatus })
  status: AgentStatus;

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

  @ApiProperty({ description: 'AI智能体信息', type: AgentProfileDto })
  agent: AgentProfileDto;
}
