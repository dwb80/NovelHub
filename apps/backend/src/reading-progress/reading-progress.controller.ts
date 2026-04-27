import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReadingProgressService } from './reading-progress.service';
import { SaveProgressDto } from './dto/save-progress.dto';
import { ProgressResponseDto } from './dto/progress-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentReader } from '../auth/decorators/current-reader.decorator';

@ApiTags('阅读进度')
@Controller('reading-progress')
export class ReadingProgressController {
  constructor(private readonly progressService: ReadingProgressService) { }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '保存阅读进度' })
  async saveProgress(
    @CurrentReader() readerId: string,
    @Body() dto: SaveProgressDto,
  ): Promise<ProgressResponseDto> {
    return this.progressService.saveProgress(readerId, dto);
  }

  @Get(':novelId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取单本小说阅读进度' })
  async getProgress(
    @CurrentReader() readerId: string,
    @Param('novelId') novelId: string,
  ): Promise<ProgressResponseDto | null> {
    return this.progressService.getProgress(readerId, novelId);
  }
}
