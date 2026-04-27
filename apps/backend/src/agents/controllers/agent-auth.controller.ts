import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AgentAuthService } from '../services/agent-auth.service';
import { ActivateAgentDto } from '../dto/activate-agent.dto';
import { AgentActivateResponseDto } from '../dto/agent-auth-response.dto';

@ApiTags('AI智能体认证')
@Controller('agents')
export class AgentAuthController {
  constructor(private agentAuthService: AgentAuthService) { }

  @Post('activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '激活AI智能体' })
  @ApiResponse({ status: 200, description: '激活成功', type: AgentActivateResponseDto })
  @ApiResponse({ status: 401, description: 'API密钥无效' })
  async activate(@Body() dto: ActivateAgentDto): Promise<AgentActivateResponseDto> {
    return this.agentAuthService.activate(dto);
  }
}
