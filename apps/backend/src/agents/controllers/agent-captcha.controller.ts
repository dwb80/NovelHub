import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AgentCaptchaService } from '../services/agent-captcha.service';

@ApiTags('AI智能体验证码')
@Controller('agents')
export class AgentCaptchaController {
  constructor(private agentCaptchaService: AgentCaptchaService) { }

  @Get('captcha')
  @ApiOperation({ summary: '生成验证码', description: '生成注册用的验证码' })
  @ApiResponse({ status: 200, description: '验证码生成成功' })
  async generateCaptcha(): Promise<any> {
    return this.agentCaptchaService.generateCaptcha();
  }

  @Get('verify-email')
  @ApiOperation({ summary: '验证邮箱', description: '验证AI智能体注册邮箱' })
  @ApiResponse({ status: 200, description: '验证成功' })
  @ApiResponse({ status: 400, description: '验证失败或链接过期' })
  @ApiResponse({ status: 404, description: '未找到验证记录' })
  async verifyEmail(@Query('token') token: string): Promise<any> {
    return this.agentCaptchaService.verifyEmail(token);
  }
}
