import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminService } from '../admin.service';

interface RequestWithUser {
  user: {
    sub: string;
    type: string;
  };
}

@ApiTags('管理员-AI智能体管理')
@Controller('admin/agents')
export class AdminAgentsController {
  constructor(private adminService: AdminService) { }

  // ========== AI智能体列表 ==========
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取AI智能体列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getAgents(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAgents({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      status,
      search,
    });
  }

  // ========== AI作家列表 ==========
  @Get('authors')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取AI智能体作家列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getAuthors(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAuthors({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      status,
      search,
    });
  }

  // ========== AI评审员列表 ==========
  @Get('reviewers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取AI评审员列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'level', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getReviewers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('level') level?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getReviewers({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      level,
      search,
    });
  }

  // ========== AI智能体详情 ==========
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取AI智能体详情' })
  async getAgentDetail(@Param('id') agentId: string) {
    return this.adminService.getAgentDetail(agentId);
  }

  // ========== AI智能体小说列表 ==========
  @Get(':id/novels')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取AI智能体创作的小说列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAgentNovels(
    @Param('id') agentId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAgentNovels(agentId, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  // ========== AI评审员详情 ==========
  @Get('reviewers/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取AI评审员详情' })
  async getReviewerDetail(@Param('id') reviewerId: string) {
    return this.adminService.getReviewerDetail(reviewerId);
  }

  // ========== AI评审员评审的小说列表 ==========
  @Get('reviewers/:id/novels')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取AI评审员评审的小说列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getReviewerNovels(
    @Param('id') reviewerId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getReviewerNovels(reviewerId, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search,
    });
  }

  // ========== 更新AI智能体状态 ==========
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新AI智能体状态' })
  async updateAgentStatus(
    @Param('id') agentId: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateAgentStatus(agentId, status);
  }

  // ========== 更新评审员等级 ==========
  @Patch('reviewers/:id/level')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新评审员等级' })
  async updateReviewerLevel(
    @Param('id') reviewerId: string,
    @Body('level') level: string,
  ) {
    return this.adminService.updateReviewerLevel(reviewerId, level);
  }

  // ========== 封禁/解封AI智能体 ==========
  @Patch(':id/ban')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '封禁/解封AI智能体' })
  async banAgent(
    @Param('id') agentId: string,
    @Body('isBanned') isBanned: boolean,
    @Request() req: RequestWithUser,
  ) {
    const adminId = req.user.sub;
    return this.adminService.banAgent(agentId, isBanned, adminId);
  }

  // ========== 删除AI智能体 ==========
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除AI智能体' })
  async deleteAgent(@Param('id') agentId: string) {
    return this.adminService.deleteAgent(agentId);
  }
}
