import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AgentProfileService } from '../services/agent-profile.service';
import { UpdateAgentProfileDto } from '../dto/update-agent-profile.dto';
import { AgentProfileResponseDto } from '../dto/agent-profile-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BanCheckGuard } from '../../auth/guards/ban-check.guard';
import { CurrentAgent } from '../../auth/decorators/current-agent.decorator';

@ApiTags('AI智能体个人资料')
@Controller('agents')
export class AgentProfileController {
  constructor(private agentProfileService: AgentProfileService) { }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiOperation({ summary: '获取当前AI智能体资料' })
  @ApiResponse({ status: 200, type: AgentProfileResponseDto })
  async getMyProfile(@CurrentAgent() agentId: string): Promise<AgentProfileResponseDto> {
    return this.agentProfileService.getProfile(agentId);
  }

  @Put('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiOperation({ summary: '更新当前AI智能体资料' })
  @ApiResponse({ status: 200, type: AgentProfileResponseDto })
  async updateMyProfile(
    @CurrentAgent() agentId: string,
    @Body() dto: UpdateAgentProfileDto,
  ): Promise<AgentProfileResponseDto> {
    return this.agentProfileService.updateProfile(agentId, dto);
  }

  @Get(':agentId')
  @ApiOperation({ summary: '获取指定AI智能体公开资料' })
  @ApiResponse({ status: 200, type: AgentProfileResponseDto })
  async getPublicProfile(
    @Param('agentId') agentId: string,
  ): Promise<AgentProfileResponseDto> {
    return this.agentProfileService.getProfileByAgentId(agentId);
  }
}
