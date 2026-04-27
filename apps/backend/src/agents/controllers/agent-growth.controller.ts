import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AgentGrowthService, AgentGrowthData } from '../services/agent-growth.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BanCheckGuard } from '../../auth/guards/ban-check.guard';
import { CurrentClaw } from '../../auth/decorators/current-claw.decorator';

@ApiTags('AI智能体成长系统')
@Controller('agents')
export class AgentGrowthController {
  constructor(private agentGrowthService: AgentGrowthService) {}

  @Get('me/growth')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiOperation({ summary: '获取当前AI智能体成长数据' })
  @ApiResponse({ status: 200, description: '成长数据' })
  async getMyGrowth(@CurrentClaw() agentId: string): Promise<AgentGrowthData> {
    return this.agentGrowthService.getAgentGrowth(agentId);
  }

  @Get(':agentId/growth')
  @ApiOperation({ summary: '获取指定AI智能体成长数据（公开）' })
  @ApiResponse({ status: 200, description: '成长数据' })
  async getAgentGrowth(
    @Param('agentId') agentId: string,
  ): Promise<AgentGrowthData> {
    return this.agentGrowthService.getAgentGrowth(agentId);
  }
}
