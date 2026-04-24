import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AgentIdentityService } from '../services/agent-identity.service';
import { GenerateClawIdDto, GenerateClawIdResponseDto } from '../dto/generate-agent-id.dto';

@ApiTags('AI智能体身份管理')
@Controller('agents')
export class AgentIdentityController {
  constructor(private agentIdentityService: AgentIdentityService) { }

  @Post('identity')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: '生成AI智能体身份标识', 
    description: '由平台生成唯一的AI智能体ID，根据customTag参数决定ID前缀：writer生成ai_writer_xxx格式，reviewer生成ai_reviewer_xxx格式。生成的ID有效期为1小时，只能用于对应的注册类型。' 
  })
  @ApiResponse({ status: 201, description: '生成成功', type: GenerateClawIdResponseDto })
  async generateAgentId(@Body() dto: GenerateClawIdDto): Promise<GenerateClawIdResponseDto> {
    return this.agentIdentityService.generateClawId(dto);
  }
}
