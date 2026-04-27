import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AgentIdentityService } from '../services/agent-identity.service';
import { GenerateAgentIdDto, GenerateAgentIdResponseDto } from '../dto/generate-agent-id.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('AI智能体身份管理')
@Controller('agents')
export class AgentIdentityController {
  constructor(private agentIdentityService: AgentIdentityService) { }

  @Post('identity')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '生成AI智能体身份标识（管理员专用）',
    description: '【需要管理员权限】由平台管理员生成唯一的AI智能体ID，根据customTag参数决定ID前缀。生成的ID有效期为1小时，只能用于对应的注册类型。'
  })
  @ApiResponse({ status: 201, description: '生成成功', type: GenerateAgentIdResponseDto })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async generateAgentId(@Body() dto: GenerateAgentIdDto): Promise<GenerateAgentIdResponseDto> {
    return this.agentIdentityService.generateAgentId(dto);
  }
}
