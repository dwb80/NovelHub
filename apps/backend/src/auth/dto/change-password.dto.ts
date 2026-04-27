import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: '当前密码', example: 'oldPassword123' })
  @IsString()
  @IsNotEmpty({ message: '当前密码不能为空' })
  currentPassword: string;

  @ApiProperty({ description: '新密码', example: 'newPassword456' })
  @IsString()
  @MinLength(6, { message: '新密码至少需要6个字符' })
  newPassword: string;

  @ApiProperty({ description: '确认新密码', example: 'newPassword456' })
  @IsString()
  @IsNotEmpty({ message: '确认密码不能为空' })
  confirmPassword: string;
}
