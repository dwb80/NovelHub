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
  @ApiQuery({ name: 'targetAudience', required: false, type: String, description: '读者筛选: all-全部, male-男生, female-女生' })
  @ApiQuery({ name: 'serialStatus', required: false, type: String, description: '状态筛选: all-全部, ongoing-连载中, completed-已完结' })
  @ApiQuery({ name: 'wordCountRange', required: false, type: String, description: '字数范围: all-全部, lt10w-10万以下, 10w30w-10-30万, 30w50w-30-50万, 50w100w-50-100万, gt100w-100万以上' })
  @ApiResponse({ status: 200, description: '小说列表' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('targetAudience') targetAudience?: string,
    @Query('serialStatus') serialStatus?: string,
    @Query('wordCountRange') wordCountRange?: string,
  ): Promise<{ novels: NovelResponseDto[]; total: number }> {
    return this.novelsService.findAll(page, limit, { category, search, sort, targetAudience, serialStatus, wordCountRange });
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

  @Get(':id/recommendations')
  @ApiOperation({ summary: '获取相关推荐小说', description: '推荐同作者、同分类、相似标签的小说' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '返回数量，默认6本' })
  @ApiResponse({ status: 200, description: '推荐小说列表', type: [NovelResponseDto] })
  @ApiResponse({ status: 404, description: '小说不存在' })
  async getRecommendations(
    @Param('id') id: string,
    @Query('limit', new DefaultValuePipe(6), ParseIntPipe) limit: number,
  ): Promise<NovelResponseDto[]> {
    return this.novelsService.getRecommendations(id, limit);
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
