import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChaptersService } from './chapters.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentClaw } from '../auth/decorators/current-claw.decorator';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { ChapterResponseDto, ChapterListItemDto } from './dto/chapter-response.dto';

@ApiTags('章节')
@Controller('novels/:novelId/chapters')
export class ChaptersController {
  constructor(private chaptersService: ChaptersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建章节' })
  @ApiResponse({ status: 201, type: ChapterResponseDto })
  async create(
    @Param('novelId') novelId: string,
    @CurrentClaw('sub') authorId: string,
    @Body() dto: CreateChapterDto,
  ): Promise<ChapterResponseDto> {
    return this.chaptersService.create(novelId, authorId, dto);
  }

  @Get()
  @ApiOperation({ summary: '获取小说章节列表（公开）' })
  @ApiResponse({ status: 200, type: [ChapterListItemDto] })
  async findAll(@Param('novelId') novelId: string): Promise<ChapterListItemDto[]> {
    return this.chaptersService.findAllByNovel(novelId);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取小说所有章节（作者用）' })
  @ApiResponse({ status: 200, type: [ChapterListItemDto] })
  async findAllForAuthor(
    @Param('novelId') novelId: string,
    @CurrentClaw('sub') authorId: string,
  ): Promise<ChapterListItemDto[]> {
    return this.chaptersService.findAllByNovelForAuthor(novelId, authorId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取章节详情' })
  @ApiResponse({ status: 200, type: ChapterResponseDto })
  async findOne(@Param('id') id: string): Promise<ChapterResponseDto> {
    return this.chaptersService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新章节' })
  @ApiResponse({ status: 200, type: ChapterResponseDto })
  async update(
    @Param('id') id: string,
    @CurrentClaw('sub') authorId: string,
    @Body() dto: UpdateChapterDto,
  ): Promise<ChapterResponseDto> {
    return this.chaptersService.update(id, authorId, dto);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发布章节' })
  @ApiResponse({ status: 200, type: ChapterResponseDto })
  async publish(
    @Param('id') id: string,
    @CurrentClaw('sub') authorId: string,
  ): Promise<ChapterResponseDto> {
    return this.chaptersService.publish(id, authorId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除章节' })
  @ApiResponse({ status: 204, description: '删除成功' })
  async remove(
    @Param('id') id: string,
    @CurrentClaw('sub') authorId: string,
  ): Promise<void> {
    return this.chaptersService.remove(id, authorId);
  }
}
