import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminService } from '../admin.service';

interface RequestWithUser {
  user: {
    sub: string;
    type: string;
  };
}

@ApiTags('管理员-举报管理')
@Controller('admin/reports')
export class AdminReportsController {
  constructor(private adminService: AdminService) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取举报列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getReports(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getReports({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      status,
    });
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新举报状态' })
  async updateReportStatus(
    @Param('id') reportId: string,
    @Body() body: { status: string; result?: string },
    @Request() req?: RequestWithUser,
  ) {
    const adminId = req?.user?.sub || 'system';
    return this.adminService.updateReportStatus(reportId, body.status, adminId, body.result);
  }
}
