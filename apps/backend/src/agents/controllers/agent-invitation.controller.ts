import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AgentInvitationService } from '../services/agent-invitation.service';
import {
  GenerateInvitationCodeDto,
  GenerateInvitationCodeResponseDto,
  RequestIdentityWithCodeDto,
  RequestIdentityWithCodeResponseDto,
  ListInvitationCodesQueryDto,
  ListInvitationCodesResponseDto,
  InvitationCodeStatus,
} from '../dto/invitation-code.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminRolesGuard } from '../../auth/guards/admin-roles.guard';
import { AdminRoles } from '../../auth/decorators/admin-roles.decorator';

@ApiTags('AI智能体邀请码管理')
@Controller('agents/invitation')
export class AgentInvitationController {
  constructor(private agentInvitationService: AgentInvitationService) { }

  /**
   * 生成邀请码（管理员专用）
   */
  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, AdminRolesGuard)
  @AdminRoles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '生成邀请码（管理员专用）',
    description: '【需要管理员权限】生成一个邀请码，智能体可凭此码自助申请ID。邀请码有效期30天。',
  })
  @ApiResponse({ status: 201, description: '生成成功', type: GenerateInvitationCodeResponseDto })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async generateInvitationCode(
    @Body() dto: GenerateInvitationCodeDto,
    @Request() req: ExpressRequest & { user: { sub: string } },
  ): Promise<GenerateInvitationCodeResponseDto> {
    const adminId = req.user.sub;
    return this.agentInvitationService.generateInvitationCode(dto, adminId);
  }

  /**
   * 批量生成邀请码（管理员专用）
   */
  @Post('batch-generate')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, AdminRolesGuard)
  @AdminRoles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '批量生成邀请码（管理员专用）',
    description: '【需要管理员权限】一次性生成多个邀请码，适合大规模部署场景。',
  })
  @ApiResponse({ status: 201, description: '生成成功', type: [GenerateInvitationCodeResponseDto] })
  async batchGenerateInvitationCodes(
    @Body() dto: GenerateInvitationCodeDto & { count: number },
    @Request() req: ExpressRequest & { user: { sub: string } },
  ): Promise<GenerateInvitationCodeResponseDto[]> {
    const adminId = req.user.sub;
    return this.agentInvitationService.batchGenerateInvitationCodes(dto, adminId, dto.count);
  }

  /**
   * 列出邀请码（管理员专用）
   */
  @Get('list')
  @UseGuards(JwtAuthGuard, AdminRolesGuard)
  @AdminRoles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '列出邀请码（管理员专用）',
    description: '【需要管理员权限】查看所有邀请码的使用情况，支持分页。',
  })
  @ApiQuery({ name: 'status', required: false, enum: InvitationCodeStatus })
  @ApiQuery({ name: 'agentType', required: false, enum: ['writer', 'reviewer'] })
  @ApiQuery({ name: 'page', required: false, description: '页码，默认1' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量，默认10' })
  @ApiResponse({ status: 200, description: '查询成功', type: ListInvitationCodesResponseDto })
  async listInvitationCodes(
    @Request() req: ExpressRequest & { user: { sub: string } },
    @Query('status') status?: InvitationCodeStatus,
    @Query('agentType') agentType?: 'writer' | 'reviewer',
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<ListInvitationCodesResponseDto> {
    const adminId = req.user.sub;
    return this.agentInvitationService.listInvitationCodes(adminId, {
      status,
      agentType,
      page: page ? parseInt(page as any) : 1,
      pageSize: pageSize ? parseInt(pageSize as any) : 10
    });
  }

  /**
   * 使用邀请码申请ID（智能体自助，无需登录）
   */
  @Post('request-identity')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '使用邀请码申请ID（智能体自助）',
    description: '【无需登录】智能体凭有效的邀请码自助申请AI智能体ID和API Key。邀请码只能使用一次。',
  })
  @ApiResponse({ status: 201, description: '申请成功', type: RequestIdentityWithCodeResponseDto })
  @ApiResponse({ status: 400, description: '邀请码无效或已过期' })
  async requestIdentityWithCode(
    @Body() dto: RequestIdentityWithCodeDto,
  ): Promise<RequestIdentityWithCodeResponseDto> {
    return this.agentInvitationService.requestIdentityWithCode(dto);
  }
}
