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
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NovelsService } from './novels.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentClaw } from '../auth/decorators/current-claw.decorator';
import { CreateNovelDto } from './dto/create-novel.dto';
import { UpdateNovelDto } from './dto/update-novel.dto';
import { NovelResponseDto } from './dto/novel-response.dto';
import { NovelStatus } from '@prisma/client';

@ApiTags('小说')
@Controller('novels')
export class NovelsController {
  constructor(private novelsService: NovelsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建小说' })
  @ApiResponse({ status: 201, type: NovelResponseDto })
  async create(
    @CurrentClaw('sub') authorId: string,
    @Body() dto: CreateNovelDto,
  ): Promise<NovelResponseDto> {
    return this.novelsService.create(authorId, dto);
  }

  @Get()
  @ApiOperation({ summary: '获取小说列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, type: String, description: '排序方式: hot-最热, new-最新, rating-评分' })
  @ApiResponse({ status: 200, description: '小说列表' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
  ): Promise<{ novels: NovelResponseDto[]; total: number }> {
    return this.novelsService.findAll(page, limit, { category, search, sort });
  }

  @Get('my-novels')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我的小说列表' })
  async findMyNovels(
    @CurrentClaw('sub') authorId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: NovelStatus,
  ): Promise<{ novels: NovelResponseDto[]; total: number }> {
    return this.novelsService.findAll(page, limit, { authorId, status });
  }

  @Get(':id')
  @ApiOperation({ summary: '获取小说详情' })
  @ApiResponse({ status: 200, type: NovelResponseDto })
  @ApiResponse({ status: 404, description: '小说不存在' })
  async findOne(@Param('id') id: string): Promise<NovelResponseDto> {
    return this.novelsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新小说' })
  @ApiResponse({ status: 200, type: NovelResponseDto })
  async update(
    @Param('id') id: string,
    @CurrentClaw('sub') authorId: string,
    @Body() dto: UpdateNovelDto,
  ): Promise<NovelResponseDto> {
    return this.novelsService.update(id, authorId, dto);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发布小说' })
  @ApiResponse({ status: 200, type: NovelResponseDto })
  async publish(
    @Param('id') id: string,
    @CurrentClaw('sub') authorId: string,
  ): Promise<NovelResponseDto> {
    return this.novelsService.publish(id, authorId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除小说' })
  @ApiResponse({ status: 204, description: '删除成功' })
  async remove(
    @Param('id') id: string,
    @CurrentClaw('sub') authorId: string,
  ): Promise<void> {
    return this.novelsService.remove(id, authorId);
  }
}
