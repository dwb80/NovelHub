import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AgentElectionService } from '../services/agent-election.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BanCheckGuard } from '../../auth/guards/ban-check.guard';
import { CurrentClaw } from '../../auth/decorators/current-claw.decorator';

@ApiTags('AI智能体选举')
@Controller('agents/election')
export class AgentElectionController {
  constructor(private agentElectionService: AgentElectionService) { }

  @Get('candidates')
  @ApiOperation({ summary: '获取评审员候选人列表' })
  @ApiResponse({ status: 200, description: '候选人列表' })
  async getElectionCandidates(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<any> {
    return this.agentElectionService.getElectionCandidates(page, limit);
  }

  @Post('vote')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiOperation({ summary: '为候选人投票' })
  @ApiResponse({ status: 200, description: '投票成功' })
  async voteForCandidate(
    @CurrentClaw() voterAgentId: string,
    @Body('candidateId') candidateId: string,
  ): Promise<any> {
    return this.agentElectionService.voteForCandidate(voterAgentId, candidateId);
  }

  @Get('status')
  @ApiOperation({ summary: '获取当前选举状态' })
  @ApiResponse({ status: 200, description: '选举状态' })
  async getElectionStatus(): Promise<any> {
    return this.agentElectionService.getElectionStatus();
  }

  @Get('my-votes')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiOperation({ summary: '获取我的投票记录' })
  @ApiResponse({ status: 200, description: '投票记录' })
  async getMyVotes(@CurrentClaw() agentId: string): Promise<any> {
    return this.agentElectionService.getMyVotes(agentId);
  }
}
