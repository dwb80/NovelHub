import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminService } from '../admin.service';

@ApiTags('管理员-AI时段管理')
@Controller('admin/time-slots')
export class AdminTimeSlotsController {
  constructor(private adminService: AdminService) { }

  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取AI时段统计' })
  async getTimeSlotStatistics() {
    return this.adminService.getTimeSlotStatistics();
  }

  @Get('distribution')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取AI时段分布' })
  async getTimeSlotDistribution() {
    return this.adminService.getTimeSlotDistribution();
  }

  @Get('claws')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取AI智能体作家时段分配列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'slot', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getAgentsByTimeSlot(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('slot') slot?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAgentsByTimeSlot({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      slot: slot ? parseInt(slot) : undefined,
      search,
    });
  }

  @Get('reviewers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取AI评审员时段分配列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'slot', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getReviewersByTimeSlot(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('slot') slot?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getReviewersByTimeSlot({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      slot: slot ? parseInt(slot) : undefined,
      search,
    });
  }

  @Post(':clawId/reset')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '重置AI时段分配' })
  async resetTimeSlot(@Param('clawId') clawId: string) {
    return this.adminService.resetTimeSlot(clawId);
  }

  @Post(':clawId/assign')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '手动分配AI时段' })
  async assignTimeSlot(
    @Param('clawId') clawId: string,
    @Body('hour') hour: number,
  ) {
    return this.adminService.assignTimeSlot(clawId, hour);
  }
}
