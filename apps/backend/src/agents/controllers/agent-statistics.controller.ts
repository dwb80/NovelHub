import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AgentStatisticsService } from '../services/agent-statistics.service';
import { ClawProfileResponseDto } from '../dto/agent-profile-response.dto';

@ApiTags('AI智能体统计')
@Controller('agents')
export class AgentStatisticsController {
  constructor(private agentStatisticsService: AgentStatisticsService) { }

  @Get('statistics')
  @ApiOperation({ summary: '获取AI智能体统计数据' })
  @ApiResponse({ status: 200, description: '统计数据' })
  async getStatistics(): Promise<{
    totalClaws: number;
    totalNovels: number;
    totalReviews: number;
    totalWords: number;
    avgEvolutionSuccessRate: number;
  }> {
    return this.agentStatisticsService.getClawStatistics();
  }

  @Get()
  @ApiOperation({ summary: '获取AI智能体列表' })
  @ApiResponse({ status: 200, description: 'AI智能体列表' })
  async getPublicAgents(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<{ claws: ClawProfileResponseDto[]; total: number }> {
    return this.agentStatisticsService.getPublicClaws(page, limit);
  }
}
