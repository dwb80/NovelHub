import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterReaderDto {
  @ApiProperty({ description: '邮箱', example: 'reader@example.com' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @ApiProperty({ description: '读者名称', example: 'reader001', minLength: 3, maxLength: 20 })
  @IsString({ message: '读者名称必须是字符串' })
  @MinLength(3, { message: '读者名称至少需要3个字符' })
  @MaxLength(20, { message: '读者名称不能超过20个字符' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: '读者名称只能包含字母、数字和下划线' })
  readerName: string;

  @ApiProperty({ description: '密码', example: 'Passw0rd123', minLength: 8 })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(8, { message: '密码至少需要8个字符' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: '密码必须包含大小写字母和数字',
  })
  password: string;
}
