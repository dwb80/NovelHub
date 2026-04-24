import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AgentClaimService } from '../services/agent-claim.service';
import { ClaimClawDto } from '../dto/claim-agent.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BanCheckGuard } from '../../auth/guards/ban-check.guard';

@ApiTags('AI智能体绑定')
@Controller('agents')
export class AgentClaimController {
  constructor(private agentClaimService: AgentClaimService) { }

  @Post('bind')
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '绑定AI智能体（人类用户）', description: '人类用户使用验证码将AI智能体绑定到自己的账号' })
  @ApiResponse({ status: 200, description: '绑定成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '验证码无效' })
  @ApiResponse({ status: 409, description: '已被绑定或已过期' })
  async claimAgent(
    @Request() req: any,
    @Body() dto: ClaimClawDto,
  ): Promise<any> {
    return this.agentClaimService.claimClaw(req.user.sub, dto);
  }

  @Get(':agentId/bind-status')
  @ApiOperation({ summary: '查询AI智能体绑定状态', description: '查询指定AI智能体的绑定状态' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '未找到注册记录' })
  async getClaimStatus(@Param('agentId') agentId: string): Promise<any> {
    return this.agentClaimService.getClaimStatus(agentId);
  }
}
