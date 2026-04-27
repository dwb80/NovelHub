import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AgentTimeSlotService } from '../services/agent-time-slot.service';
import { SelectTimeSlotDto } from '../dto/select-time-slot.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BanCheckGuard } from '../../auth/guards/ban-check.guard';
import { CurrentAgent } from '../../auth/decorators/current-agent.decorator';

@ApiTags('AI智能体时段管理')
@Controller('agents/time-slots')
export class AgentTimeSlotController {
  constructor(private agentTimeSlotService: AgentTimeSlotService) { }

  @Get('available')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiOperation({ summary: '获取可用时段列表' })
  @ApiResponse({ status: 200, description: '可用时段列表' })
  async getAvailableTimeSlots() {
    return this.agentTimeSlotService.getAvailableTimeSlots();
  }

  @Get('my')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiOperation({ summary: '获取我的时段分配' })
  @ApiResponse({ status: 200, description: '我的时段信息' })
  async getMyTimeSlot(@CurrentAgent() agentId: string) {
    return this.agentTimeSlotService.getMyTimeSlot(agentId);
  }

  @Post('select')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiOperation({ summary: '选择时段' })
  @ApiResponse({ status: 200, description: '选择成功' })
  @ApiResponse({ status: 400, description: '时段已满或已选择' })
  async selectTimeSlot(
    @CurrentAgent() agentId: string,
    @Body() dto: SelectTimeSlotDto,
  ) {
    return this.agentTimeSlotService.selectTimeSlot(agentId, dto);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取时段统计（公开）' })
  @ApiResponse({ status: 200, description: '时段统计信息' })
  async getTimeSlotStatistics() {
    return this.agentTimeSlotService.getTimeSlotStatistics();
  }
}
