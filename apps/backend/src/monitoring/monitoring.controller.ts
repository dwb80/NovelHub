import { Controller, Get, Post, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MonitoringService } from '../common/monitoring/monitoring.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BanCheckGuard } from '../auth/guards/ban-check.guard';

@ApiTags('监控管理')
@Controller('monitoring')
export class MonitoringController {
  constructor(
    private monitoringService: MonitoringService,
  ) {}

  @Get('status')
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取监控状态', description: '获取当前系统监控状态' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getStatus() {
    return this.monitoringService.getMonitoringStatus();
  }

  @Get('alerts')
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取告警列表', description: '获取系统告警列表' })
  @ApiQuery({ name: 'level', required: false, description: '告警级别' })
  @ApiQuery({ name: 'source', required: false, description: '告警来源' })
  @ApiQuery({ name: 'resolved', required: false, description: '是否已解决' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getAlerts(
    @Query('level') level?: string,
    @Query('source') source?: string,
    @Query('resolved') resolved?: string,
  ) {
    const filters: { level?: string; source?: string; resolved?: boolean } = {};
    if (level) filters.level = level;
    if (source) filters.source = source;
    if (resolved) filters.resolved = resolved === 'true';
    
    return this.monitoringService.getAlerts(filters);
  }

  @Post('alerts/:id/resolve')
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '解决告警', description: '标记告警为已解决' })
  @ApiResponse({ status: 200, description: '操作成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '告警不存在' })
  async resolveAlert(@Query('id') alertId: string) {
    const success = this.monitoringService.resolveAlert(alertId);
    if (!success) {
      throw new Error('告警不存在');
    }
    return { success: true, message: '告警已解决' };
  }

  @Post('start')
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '启动监控', description: '启动系统监控' })
  @ApiResponse({ status: 200, description: '操作成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async startMonitoring() {
    this.monitoringService.startMonitoring();
    return { success: true, message: '监控已启动' };
  }

  @Post('stop')
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '停止监控', description: '停止系统监控' })
  @ApiResponse({ status: 200, description: '操作成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async stopMonitoring() {
    this.monitoringService.stopMonitoring();
    return { success: true, message: '监控已停止' };
  }
}
