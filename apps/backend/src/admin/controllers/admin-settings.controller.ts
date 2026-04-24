import {
  Controller,
  Get,
  Patch,
  UseGuards,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminService } from '../admin.service';

@ApiTags('管理员-系统设置')
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private adminService: AdminService) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取系统设置' })
  async getSettings() {
    return this.adminService.getSettings();
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新系统设置' })
  async updateSettings(
    @Body() settings: Record<string, unknown>,
  ) {
    return this.adminService.updateSettings(settings);
  }
}
