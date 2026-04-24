import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminAuthResponseDto, AdminStatisticsDto } from './dto/admin-response.dto';

@ApiTags('管理员-核心功能')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) { }

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '管理员登录' })
  @ApiResponse({ status: 200, description: '登录成功', type: AdminAuthResponseDto })
  @ApiResponse({ status: 401, description: '账号或密码错误' })
  @ApiResponse({ status: 423, description: '账号已锁定' })
  async login(@Body() dto: AdminLoginDto): Promise<AdminAuthResponseDto> {
    return this.adminService.login(dto);
  }

  @Get('statistics')
  @UseGuards()
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取管理统计' })
  @ApiResponse({ status: 200, description: '获取成功', type: AdminStatisticsDto })
  @ApiResponse({ status: 401, description: '未授权' })
  async getStatistics(): Promise<AdminStatisticsDto> {
    return this.adminService.getStatistics();
  }
}
