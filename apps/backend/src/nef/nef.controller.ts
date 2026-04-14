import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NefService } from './nef.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentClaw } from '../auth/decorators/current-claw.decorator';
import { CreatePlotPatternDto } from './dto/create-plot-pattern.dto';
import { CreateCharacterProfileDto } from './dto/create-character-profile.dto';
import { EvolutionRequestDto, EvolutionResponseDto } from './dto/evolution-request.dto';
import { PatternType, ArchetypeType } from '@prisma/client';

@ApiTags('NEF进化引擎')
@Controller('nef')
export class NefController {
  constructor(private nefService: NefService) {}

  // ==================== 创作档案 ====================

  @Get('archive')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我的创作档案' })
  async getMyArchive(@CurrentClaw('sub') clawId: string) {
    return this.nefService.getOrCreateCreationArchive(clawId);
  }

  // ==================== 情节模式 ====================

  @Post('patterns')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建情节模式' })
  async createPlotPattern(
    @CurrentClaw('sub') clawId: string,
    @Body() dto: CreatePlotPatternDto,
  ) {
    return this.nefService.createPlotPattern(clawId, dto);
  }

  @Get('patterns')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取情节模式列表' })
  async getPlotPatterns(
    @CurrentClaw('sub') clawId: string,
    @Query('type') type?: PatternType,
  ) {
    return this.nefService.getPlotPatterns(clawId, type);
  }

  @Get('patterns/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取情节模式详情' })
  async getPlotPatternById(@Param('id') id: string) {
    return this.nefService.getPlotPatternById(id);
  }

  // ==================== 角色原型 ====================

  @Post('profiles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建角色原型' })
  async createCharacterProfile(
    @CurrentClaw('sub') clawId: string,
    @Body() dto: CreateCharacterProfileDto,
  ) {
    return this.nefService.createCharacterProfile(clawId, dto);
  }

  @Get('profiles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取角色原型列表' })
  async getCharacterProfiles(
    @CurrentClaw('sub') clawId: string,
    @Query('type') type?: ArchetypeType,
  ) {
    return this.nefService.getCharacterProfiles(clawId, type);
  }

  // ==================== 进化引擎 ====================

  @Post('evolve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '进化章节内容' })
  @ApiResponse({ status: 200, type: EvolutionResponseDto })
  async evolveContent(
    @CurrentClaw('sub') clawId: string,
    @Body() dto: EvolutionRequestDto,
  ): Promise<EvolutionResponseDto> {
    return this.nefService.evolveContent(clawId, dto);
  }

  @Get('evolution-history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取进化历史' })
  async getEvolutionHistory(
    @CurrentClaw('sub') clawId: string,
    @Query('chapterId') chapterId?: string,
  ) {
    return this.nefService.getEvolutionHistory(clawId, chapterId);
  }

  @Get('evolution/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取进化记录详情' })
  async getEvolutionById(@Param('id') id: string) {
    return this.nefService.getEvolutionById(id);
  }

  @Post('evolution/:id/apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '应用进化结果' })
  async applyEvolution(
    @CurrentClaw('sub') clawId: string,
    @Param('id') evolutionId: string,
  ) {
    return this.nefService.applyEvolution(clawId, evolutionId);
  }
}
