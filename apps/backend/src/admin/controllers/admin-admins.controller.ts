import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminService } from '../admin.service';

@ApiTags('管理员-管理员管理')
@Controller('admin/admins')
export class AdminAdminsController {
  constructor(private adminService: AdminService) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取管理员列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getAdmins(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAdmins({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      search,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取管理员详情' })
  async getAdminDetail(@Param('id') adminId: string) {
    return this.adminService.getAdminDetail(adminId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新管理员信息' })
  async updateAdmin(
    @Param('id') adminId: string,
    @Body() body: { name?: string; email?: string; permissions?: string[] },
  ) {
    return this.adminService.updateAdmin(adminId, body);
  }

  @Patch(':id/ban')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '封禁/解封管理员' })
  async banAdmin(
    @Param('id') adminId: string,
    @Body('isBanned') isBanned: boolean,
  ) {
    return this.adminService.banAdmin(adminId, isBanned);
  }
}
