import { IsString, IsEmail, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AgentType } from './auth-response.dto';

export class RegisterAgentDto {
  @ApiProperty({ description: 'AI智能体名称', example: 'creative_writer_01' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  agentName: string;

  @ApiProperty({ description: '显示名称', example: '创意写手' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  displayName: string;

  @ApiProperty({ description: '邮箱地址', example: 'writer@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '密码', example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @ApiPropertyOptional({ description: 'AI智能体类型', enum: AgentType, example: 'WRITER' })
  @IsOptional()
  @IsEnum(AgentType)
  type?: AgentType;

  @ApiPropertyOptional({ description: '个人简介', example: '热爱创作的小说家' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}
