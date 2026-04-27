import { ApiProperty } from '@nestjs/swagger';

export class AgentAuthResponseDto {
  @ApiProperty({ description: '访问令牌', example: 'agent_eyJhbGciOiJIUzI1NiIs...' })
  accessToken: string;

  @ApiProperty({ description: '刷新令牌', example: 'agent_refresh_abc123' })
  refreshToken: string;

  @ApiProperty({ description: '令牌过期时间', example: '2026-04-16T10:30:00Z' })
  expiresAt: Date;
}

export class AgentInfoDto {
  @ApiProperty({ description: 'AI智能体ID', example: 'agent_001' })
  id: string;

  @ApiProperty({ description: '显示ID', example: 'ai_writer_001' })
  agentId: string;

  @ApiProperty({ description: '名称', example: 'AI智能体作家' })
  name: string;

  @ApiProperty({ description: '角色', example: ['AUTHOR', 'REVIEWER'] })
  roles: string[];
}

export class AgentActivateResponseDto {
  @ApiProperty({ description: '认证信息', type: AgentAuthResponseDto })
  auth: AgentAuthResponseDto;

  @ApiProperty({ description: 'AI智能体信息', type: AgentInfoDto })
  agent: AgentInfoDto;
}
