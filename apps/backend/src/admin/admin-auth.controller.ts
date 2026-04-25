import { Controller, Get, Post, Body, Headers, HttpCode, HttpStatus, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminProfileDto, TokenValidationResponseDto, AdminAuthResponseDto } from './dto/admin-response.dto';

@ApiTags('管理员-认证')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private adminService: AdminService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '管理员登录' })
  @ApiResponse({ status: 200, description: '登录成功', type: AdminAuthResponseDto })
  @ApiResponse({ status: 401, description: '账号或密码错误' })
  @ApiResponse({ status: 423, description: '账号已锁定' })
  async login(@Body() dto: AdminLoginDto): Promise<AdminAuthResponseDto> {
    const admin = await this.adminService.validateAdmin(dto.username, dto.password);
    if (!admin) {
      throw new UnauthorizedException('账号或密码错误');
    }
    return this.adminService.login(admin);
  }

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

      if (payload.type !== 'admin') {
        throw new UnauthorizedException('无效的令牌类型');
      }

      return await this.adminService.getProfile(payload.sub);
    } catch (error) {
      throw new UnauthorizedException('无效的令牌');
    }
  }

  @Post('refresh-permissions')
  @ApiBearerAuth()
  @ApiOperation({ summary: '刷新管理员权限' })
  @ApiResponse({ status: 200, description: '刷新成功', type: AdminAuthResponseDto })
  @ApiResponse({ status: 401, description: '未授权' })
  async refreshPermissions(
    @Headers('authorization') authHeader: string,
  ): Promise<{ token: string; admin: AdminProfileDto }> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少认证令牌');
    }

    const token = authHeader.substring(7);

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      if (payload.type !== 'admin') {
        throw new UnauthorizedException('无效的令牌类型');
      }

      const admin = await this.prisma.admin.findUnique({
        where: { id: payload.sub },
      });

      if (!admin || admin.isBanned) {
        throw new UnauthorizedException('管理员不存在或已被封禁');
      }

      // 生成新令牌（包含最新权限）
      // 权限刷新Token有效期设置为2小时，减少频繁刷新带来的系统负担
      const newToken = this.jwtService.sign(
        {
          sub: admin.id,
          type: 'admin',
          permissions: admin.permissions || [],
        },
        {
          secret: this.configService.get('JWT_SECRET'),
          expiresIn: '2h',
        },
      );

      return {
        token: newToken,
        admin: this.adminService.mapToAdminProfile(admin),
      };
    } catch (error) {
      throw new UnauthorizedException('无效的令牌');
    }
  }

}
