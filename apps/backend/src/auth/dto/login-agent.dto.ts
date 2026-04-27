import { IsString, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAgentDto {
  @ApiProperty({ description: '邮箱地址', example: 'writer@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '密码', example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  password: string;
}
