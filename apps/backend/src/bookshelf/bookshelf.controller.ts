import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { BookshelfService } from './bookshelf.service';
import { AddToBookshelfDto, UpdateBookshelfStatusDto, UpdateReadingProgressDto } from './dto/add-to-bookshelf.dto';
import { BookshelfItemDto, ReadingHistoryItemDto } from './dto/bookshelf-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BanCheckGuard } from '../auth/guards/ban-check.guard';
import { CurrentReader } from '../auth/decorators/current-reader.decorator';

@ApiTags('书架')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, BanCheckGuard)
@Controller('bookshelf')
export class BookshelfController {
  constructor(private readonly bookshelfService: BookshelfService) {}

  @Get()
  @ApiOperation({ summary: '获取我的书架' })
  @ApiQuery({ name: 'sort', required: false, enum: ['recent', 'added', 'progress'], description: '排序方式：最近阅读/添加时间/阅读进度' })
  async getMyBookshelf(
    @CurrentReader() readerId: string,
    @Query('sort') sort?: 'recent' | 'added' | 'progress',
  ): Promise<BookshelfItemDto[]> {
    return this.bookshelfService.getMyBookshelf(readerId, sort as any);
  }

  @Get('history')
  @ApiOperation({ summary: '获取阅读历史' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getReadingHistory(
    @CurrentReader() readerId: string,
    @Query('limit') limit?: number,
  ): Promise<ReadingHistoryItemDto[]> {
    return this.bookshelfService.getReadingHistory(readerId, limit || 50);
  }

  @Get('check')
  @ApiOperation({ summary: '检查小说是否已收藏' })
  @ApiQuery({ name: 'novelId', required: true, type: String })
  async checkCollectionStatus(
    @CurrentReader() readerId: string,
    @Query('novelId') novelId: string,
  ): Promise<{ isCollected: boolean }> {
    const isCollected = await this.bookshelfService.isInBookshelf(readerId, novelId);
    return { isCollected };
  }

  @Post()
  @ApiOperation({ summary: '添加小说到书架' })
  async addToBookshelf(
    @CurrentReader() readerId: string,
    @Body() dto: AddToBookshelfDto,
  ): Promise<BookshelfItemDto> {
    return this.bookshelfService.addToBookshelf(readerId, dto);
  }

  @Put(':novelId/status')
  @ApiOperation({ summary: '更新阅读状态' })
  async updateStatus(
    @CurrentReader() readerId: string,
    @Param('novelId') novelId: string,
    @Body() dto: UpdateBookshelfStatusDto,
  ): Promise<BookshelfItemDto> {
    return this.bookshelfService.updateStatus(readerId, novelId, dto);
  }

  @Put(':novelId/progress')
  @ApiOperation({ summary: '更新阅读进度' })
  async updateProgress(
    @CurrentReader() readerId: string,
    @Param('novelId') novelId: string,
    @Body() dto: UpdateReadingProgressDto,
  ): Promise<BookshelfItemDto> {
    return this.bookshelfService.updateProgress(readerId, novelId, dto);
  }

  @Delete(':novelId')
  @ApiOperation({ summary: '从书架移除' })
  async removeFromBookshelf(
    @CurrentReader() readerId: string,
    @Param('novelId') novelId: string,
  ): Promise<void> {
    return this.bookshelfService.removeFromBookshelf(readerId, novelId);
  }
}
