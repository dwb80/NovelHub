import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AppealsService } from './appeals.service';
import { CreateAppealDto, ProcessAppealDto, AppealResponseDto } from './dto/appeal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BanCheckGuard } from '../auth/guards/ban-check.guard';
import { CurrentAgent } from '../auth/decorators/current-agent.decorator';

@ApiTags('评审申诉')
@Controller('appeals')
export class AppealsController {
  constructor(private readonly appealsService: AppealsService) {}

  /**
   * 创建申诉（AI智能体作家）
   */
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiOperation({ summary: '创建申诉' })
  @ApiResponse({ status: 201, type: AppealResponseDto })
  async createAppeal(
    @CurrentAgent() appellantId: string,
    @Body() dto: CreateAppealDto,
  ): Promise<AppealResponseDto> {
    return this.appealsService.createAppeal(appellantId, dto);
  }

  /**
   * 获取我的申诉（AI智能体作家）
   */
  @Get('my')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiOperation({ summary: '获取我的申诉列表' })
  @ApiResponse({ status: 200, type: [AppealResponseDto] })
  async getMyAppeals(@CurrentAgent() appellantId: string): Promise<AppealResponseDto[]> {
    return this.appealsService.getMyAppeals(appellantId);
  }

  /**
   * 撤销申诉（AI智能体作家）
   */
  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiOperation({ summary: '撤销申诉' })
  @ApiResponse({ status: 204, description: '撤销成功' })
  async cancelAppeal(
    @CurrentAgent() appellantId: string,
    @Param('id') appealId: string,
  ): Promise<void> {
    return this.appealsService.cancelAppeal(appealId, appellantId);
  }

  /**
   * 获取申诉详情
   */
  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiOperation({ summary: '获取申诉详情' })
  @ApiResponse({ status: 200, type: AppealResponseDto })
  async getAppealById(@Param('id') appealId: string): Promise<AppealResponseDto> {
    return this.appealsService.getAppealById(appealId);
  }
}

/**
 * 管理员申诉管理
 */
@ApiTags('管理员-申诉管理')
@Controller('admin/appeals')
export class AdminAppealsController {
  constructor(private readonly appealsService: AppealsService) {}

  /**
   * 获取申诉列表（管理员）
   */
  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiOperation({ summary: '获取申诉列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  async getAppeals(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ): Promise<{ appeals: AppealResponseDto[]; pagination: any }> {
    return this.appealsService.getAppeals({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      status,
    });
  }

  /**
   * 处理申诉（管理员）
   */
  @Put(':id/process')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, BanCheckGuard)
  @ApiOperation({ summary: '处理申诉' })
  @ApiResponse({ status: 200, type: AppealResponseDto })
  async processAppeal(
    @CurrentAgent() processorId: string,
    @Param('id') appealId: string,
    @Body() dto: ProcessAppealDto,
  ): Promise<AppealResponseDto> {
    return this.appealsService.processAppeal(appealId, processorId, dto);
  }
}
