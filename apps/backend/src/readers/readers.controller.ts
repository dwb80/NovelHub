import { Controller, Post, Body, HttpCode, HttpStatus, Get, Put, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReadersService } from './readers.service';
import { RegisterReaderDto } from './dto/register-reader.dto';
import { LoginReaderDto } from './dto/login-reader.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ReaderProfileDto, ReaderAuthResponseDto } from './dto/reader-response.dto';
import { ReaderStatsDto } from './dto/reader-stats.dto';
import { ReadingHistoryResponseDto } from './dto/reading-history.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BanCheckGuard } from '../auth/guards/ban-check.guard';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    type: string;
  };
}

@ApiTags('读者')
@Controller('readers')
export class ReadersController {
  constructor(private readersService: ReadersService) { }

  @Post('register')
  @ApiOperation({ summary: '读者注册' })
  @ApiResponse({ status: 201, description: '注册成功', type: ReaderAuthResponseDto })
  @ApiResponse({ status: 409, description: '邮箱或用户名已存在' })
  async register(@Body() dto: RegisterReaderDto): Promise<ReaderAuthResponseDto> {
    return this.readersService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '读者登录' })
  @ApiResponse({ status: 200, description: '登录成功', type: ReaderAuthResponseDto })
  @ApiResponse({ status: 401, description: '认证失败' })
  async login(@Body() dto: LoginReaderDto): Promise<ReaderAuthResponseDto> {
    return this.readersService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiResponse({ status: 200, description: '刷新成功', type: ReaderAuthResponseDto })
  @ApiResponse({ status: 401, description: '无效的刷新令牌' })
  async refresh(@Body('refreshToken') refreshToken: string): Promise<ReaderAuthResponseDto> {
    return this.readersService.refreshTokens(refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前读者信息' })
  @ApiResponse({ status: 200, description: '获取成功', type: ReaderProfileDto })
  @ApiResponse({ status: 401, description: '未授权' })
  async getProfile(@Request() req: AuthenticatedRequest): Promise<ReaderProfileDto> {
    return this.readersService.getProfile(req.user.sub);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新读者信息' })
  @ApiResponse({ status: 200, description: '更新成功', type: ReaderProfileDto })
  @ApiResponse({ status: 401, description: '未授权' })
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ): Promise<ReaderProfileDto> {
    return this.readersService.updateProfile(req.user.sub, dto);
  }

  @Get('me/agents')
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前读者绑定的AI智能体' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getBoundAgents(@Request() req: AuthenticatedRequest): Promise<any[]> {
    return this.readersService.getBoundAgents(req.user.sub);
  }

  @Get('me/stats')
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前读者阅读统计' })
  @ApiResponse({ status: 200, description: '获取成功', type: ReaderStatsDto })
  @ApiResponse({ status: 401, description: '未授权' })
  async getReaderStats(@Request() req: AuthenticatedRequest): Promise<ReaderStatsDto> {
    return this.readersService.getReaderStats(req.user.sub);
  }

  @Get('me/reading-history')
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前读者阅读历史' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 10 })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiResponse({ status: 200, description: '获取成功', type: ReadingHistoryResponseDto })
  @ApiResponse({ status: 401, description: '未授权' })
  async getReadingHistory(
    @Request() req: AuthenticatedRequest,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ): Promise<ReadingHistoryResponseDto> {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const pageNum = page ? parseInt(page, 10) : 1;
    return this.readersService.getReadingHistory(req.user.sub, limitNum, pageNum);
  }

  @Delete('me/reading-history')
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '清空阅读历史' })
  @ApiResponse({ status: 200, description: '清空成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async clearReadingHistory(@Request() req: AuthenticatedRequest): Promise<{ message: string }> {
    await this.readersService.clearReadingHistory(req.user.sub);
    return { message: '阅读历史已清空' };
  }

  @Get('verify-email')
  @ApiOperation({ summary: '验证邮箱' })
  @ApiResponse({ status: 200, description: '验证成功' })
  @ApiResponse({ status: 400, description: '验证失败' })
  async verifyEmail(@Query('token') token: string): Promise<{ message: string }> {
    await this.readersService.verifyEmail(token);
    return { message: '邮箱验证成功' };
  }
}
