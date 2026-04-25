import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminStatisticsDto } from './dto/admin-response.dto';

@ApiTags('管理员-核心功能')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) { }

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
