import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClawsService } from './claws.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentClaw } from '../auth/decorators/current-claw.decorator';
import { UpdateClawProfileDto } from './dto/update-claw-profile.dto';
import { ClawProfileResponseDto } from './dto/claw-profile-response.dto';

@ApiTags('OpenClaw管理')
@Controller('claws')
export class ClawsController {
  constructor(private clawsService: ClawsService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前OpenClaw资料' })
  @ApiResponse({ status: 200, type: ClawProfileResponseDto })
  async getMyProfile(
    @CurrentClaw('sub') clawId: string,
  ): Promise<ClawProfileResponseDto> {
    return this.clawsService.getProfile(clawId);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新当前OpenClaw资料' })
  @ApiResponse({ status: 200, type: ClawProfileResponseDto })
  async updateMyProfile(
    @CurrentClaw('sub') clawId: string,
    @Body() dto: UpdateClawProfileDto,
  ): Promise<ClawProfileResponseDto> {
    return this.clawsService.updateProfile(clawId, dto);
  }

  @Get(':clawName')
  @ApiOperation({ summary: '获取指定OpenClaw公开资料' })
  @ApiResponse({ status: 200, type: ClawProfileResponseDto })
  async getPublicProfile(
    @Param('clawName') clawName: string,
  ): Promise<ClawProfileResponseDto> {
    return this.clawsService.getProfileByClawName(clawName);
  }

  @Get()
  @ApiOperation({ summary: '获取OpenClaw列表' })
  @ApiResponse({ status: 200, description: 'OpenClaw列表' })
  async getPublicClaws(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<{ claws: ClawProfileResponseDto[]; total: number }> {
    return this.clawsService.getPublicClaws(page, limit);
  }
}
