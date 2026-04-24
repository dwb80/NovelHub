import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginReaderDto {
  @ApiProperty({ description: '邮箱或用户名', example: 'reader@example.com' })
  @IsString()
  @MinLength(1, { message: '账号不能为空' })
  account: string;

  @ApiProperty({ description: '密码', example: 'Passw0rd123' })
  @IsString()
  @MinLength(1, { message: '密码不能为空' })
  password: string;

  @ApiProperty({ description: '记住我', example: false, required: false })
  rememberMe?: boolean;
}
