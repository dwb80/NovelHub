import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Headers, 
  HttpCode, 
  HttpStatus, 
  UseGuards, 
  UnauthorizedException,
  Ip,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AdminService } from './admin.service';
import { AdminAuthSecurityService } from './admin-auth-security.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminProfileDto, TokenValidationResponseDto, AdminAuthResponseDto } from './dto/admin-response.dto';

@ApiTags('管理员-认证')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private adminService: AdminService,
    private adminAuthSecurityService: AdminAuthSecurityService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) { }

  /**
   * 获取RSA公钥（用于前端加密密码）
   */
  @Get('public-key')
  @ApiOperation({ summary: '获取RSA公钥', description: '用于前端加密密码' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getPublicKey() {
    return {
      publicKey: this.adminAuthSecurityService.getPublicKey(),
      algorithm: 'RSA-OAEP',
      hash: 'SHA-256',
    };
  }

  /**
   * 管理员登录（带安全验证）
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '管理员登录',
    description: '使用RSA加密密码登录，支持登录失败限制',
  })
  @ApiResponse({ status: 200, description: '登录成功', type: AdminAuthResponseDto })
  @ApiResponse({ status: 401, description: '账号或密码错误' })
  @ApiResponse({ status: 423, description: '账号已锁定' })
  @ApiResponse({ status: 429, description: '请求过于频繁' })
  async login(
    @Body() dto: AdminLoginDto,
    @Ip() clientIp: string,
  ): Promise<AdminAuthResponseDto> {
    try {
      // 验证管理员（带安全检查）
      const admin = await this.adminAuthSecurityService.validateAdmin(
        dto.username,
        dto.password, // 这是加密后的密码
        clientIp,
      );

      if (!admin) {
        throw new UnauthorizedException('账号或密码错误');
      }

      // 生成JWT令牌
      const token = this.adminAuthSecurityService.generateToken(admin);

      return {
        token,
        admin: this.adminService.mapToAdminProfile(admin),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new UnauthorizedException(error.message || '登录失败');
    }
  }

  /**
   * 验证Token有效性
   */
  @Get('validate')
  @ApiBearerAuth()
  @ApiOperation({ summary: '验证Token有效性' })
  @ApiResponse({ status: 200, description: 'Token有效', type: TokenValidationResponseDto })
  @ApiResponse({ status: 401, description: 'Token无效或已过期' })
  async validateToken(
    @Headers('authorization') authHeader: string,
  ): Promise<TokenValidationResponseDto> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少认证令牌');
    }

    const token = authHeader.substring(7);

    try {
      // 验证JWT签名和过期时间
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      // 检查是否为管理员类型
      if (payload.type !== 'admin') {
        throw new UnauthorizedException('无效的令牌类型');
      }

      // 验证管理员是否仍然存在且未被禁用
      const admin = await this.prisma.admin.findUnique({
        where: { id: payload.sub },
      });

      if (!admin) {
        throw new UnauthorizedException('管理员不存在');
      }

      if (admin.isBanned) {
        throw new UnauthorizedException('账号已被封禁');
      }

      if (admin.locked_until && admin.locked_until > new Date()) {
        throw new UnauthorizedException('账号已被锁定');
      }

      // 计算剩余有效时间（秒）
      const expiresIn = payload.exp - Math.floor(Date.now() / 1000);

      return {
        valid: true,
        expiresIn,
        admin: this.adminService.mapToAdminProfile(admin),
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('令牌已过期');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('无效的令牌');
      }
      throw new UnauthorizedException('令牌验证失败');
    }
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前管理员信息（带权限刷新）' })
  @ApiResponse({ status: 200, description: '获取成功', type: AdminProfileDto })
  @ApiResponse({ status: 401, description: '未授权' })
  async getProfile(
    @Headers('authorization') authHeader: string,
  ): Promise<AdminProfileDto> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少认证令牌');
    }

    const token = authHeader.substring(7);

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const admin = await this.prisma.admin.findUnique({
        where: { id: payload.sub },
      });

      if (!admin) {
        throw new UnauthorizedException('管理员不存在');
      }

      return this.adminService.mapToAdminProfile(admin);
    } catch (error) {
      throw new UnauthorizedException('无效的令牌');
    }
  }
}
