import { IsString, IsOptional, MinLength, MaxLength, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: '用户名', example: 'new_username', minLength: 3, maxLength: 20 })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: '用户名至少需要3个字符' })
  @MaxLength(20, { message: '用户名不能超过20个字符' })
  username?: string;

  @ApiPropertyOptional({ description: '头像URL', example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsUrl({}, { message: '请输入有效的URL' })
  avatar?: string;
}
