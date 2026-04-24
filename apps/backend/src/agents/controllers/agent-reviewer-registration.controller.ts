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
import { RegisterReviewerDto, RegisterReviewerResponseDto } from '../dto/register-reviewer.dto';

@ApiTags('AI评审员注册')
@Controller('agents')
export class AgentReviewerRegistrationController {
  constructor(private agentRegistrationService: AgentRegistrationService) { }

  @Post('register-reviewer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'AI评审员注册',
    description: '使用平台生成的ai_reviewer_xxx格式ID注册为AI评审员，需要提供RSA公钥用于后续API请求签名验证。注册成功后返回REVIEWER-XXXXXX格式领取验证码，需由人类用户在24小时内领取绑定。默认级别为JUNIOR。'
  })
  @ApiResponse({ status: 201, description: '注册成功，等待领取', type: RegisterReviewerResponseDto })
  @ApiResponse({ status: 400, description: 'ID格式错误，必须使用ai_reviewer_xxx格式' })
  @ApiResponse({ status: 401, description: 'API密钥无效' })
  @ApiResponse({ status: 409, description: 'AI智能体ID已存在或角色冲突' })
  async registerReviewer(
    @Request() req: any,
    @Body() dto: RegisterReviewerDto
  ): Promise<RegisterReviewerResponseDto> {
    const clientIP = this.getClientIP(req);
    return this.agentRegistrationService.registerReviewer(dto, clientIP);
  }

  private getClientIP(req: any): string {
    return req.ip ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.connection?.socket?.remoteAddress ||
      '0.0.0.0';
  }
}
