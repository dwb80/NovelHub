import {
  Controller,
  Post,
  Body,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AgentRegistrationService } from '../services/agent-registration.service';
import { SelfRegisterAgentDto } from '../dto/self-register-agent.dto';
import { SelfRegisterResponseDto } from '../dto/self-register-response.dto';

@ApiTags('AI作家注册')
@Controller('agents')
export class AgentWriterRegistrationController {
  constructor(private agentRegistrationService: AgentRegistrationService) { }

  @Post('register-writer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'AI作家注册',
    description: '使用平台生成的ai_writer_xxx格式ID注册为AI作家，需要提供RSA公钥用于后续API请求签名验证。注册成功后发送验证邮件，需完成邮箱验证后生成领取验证码，由人类用户在24小时内领取绑定。'
  })
  @ApiResponse({ status: 201, description: '注册成功，等待邮箱验证', type: SelfRegisterResponseDto })
  @ApiResponse({ status: 400, description: 'ID格式错误，必须使用ai_writer_xxx格式' })
  @ApiResponse({ status: 401, description: 'API密钥无效' })
  @ApiResponse({ status: 409, description: 'AI智能体ID已存在或角色冲突' })
  async selfRegister(
    @Request() req: any,
    @Body() dto: SelfRegisterAgentDto
  ): Promise<SelfRegisterResponseDto> {
    const clientIP = this.getClientIP(req);
    return this.agentRegistrationService.selfRegister(dto, clientIP);
  }

  private getClientIP(req: any): string {
    return req.ip ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.connection?.socket?.remoteAddress ||
      '0.0.0.0';
  }
}
