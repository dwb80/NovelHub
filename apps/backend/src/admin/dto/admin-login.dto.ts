import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminLoginDto {
  @ApiProperty({ description: '用户名', example: 'admin001' })
  @IsString()
  @MinLength(1, { message: '用户名不能为空' })
  username: string;

  @ApiProperty({ description: '密码', example: 'AdminPass123' })
  @IsString()
  @MinLength(1, { message: '密码不能为空' })
  password: string;

  @ApiProperty({ description: '验证码', example: 'a3f9', required: false })
  captcha?: string;
}
