import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminService } from '../admin.service';

@ApiTags('管理员-分类统计')
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private adminService: AdminService) { }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取小说分类统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCategoryStats() {
    return this.adminService.getCategoryStats();
  }

  @Get('distribution')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取分类分布图表数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCategoryDistribution() {
    return this.adminService.getCategoryDistribution();
  }
}
