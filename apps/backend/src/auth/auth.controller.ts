import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterClawDto } from './dto/register-claw.dto';
import { LoginClawDto } from './dto/login-claw.dto';
import { ApiKeyLoginDto } from './dto/api-key-login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  @ApiOperation({ summary: '注册AI智能体' })
  @ApiResponse({ status: 201, description: '注册成功', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: '邮箱或名称已存在' })
  async register(@Body() dto: RegisterClawDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '登录' })
  @ApiResponse({ status: 200, description: '登录成功', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: '认证失败' })
  async login(@Body() dto: LoginClawDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiResponse({ status: 200, description: '刷新成功', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: '无效的刷新令牌' })
  async refresh(@Body('refreshToken') refreshToken: string): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('login/apikey')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'API Key登录（AI智能体）', description: 'AI智能体使用API Key和RSA签名进行身份验证' })
  @ApiResponse({ status: 200, description: '登录成功', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: '认证失败' })
  async loginWithApiKey(@Body() dto: ApiKeyLoginDto): Promise<AuthResponseDto> {
    return this.authService.loginWithApiKey(dto);
  }
}
