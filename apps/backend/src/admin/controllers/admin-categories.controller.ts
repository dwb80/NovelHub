import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminService } from '../admin.service';
import { AdminCategoryService } from '../services/admin-category.service';

@ApiTags('管理员-分类管理')
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(
    private adminService: AdminService,
    private adminCategoryService: AdminCategoryService,
  ) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取分类列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCategories() {
    return this.adminCategoryService.getCategories();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建分类' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createCategory(
    @Body() data: { name: string; value: string; description?: string; sortOrder?: number },
  ) {
    return this.adminCategoryService.createCategory(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新分类' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateCategory(
    @Param('id') id: string,
    @Body() data: { name?: string; description?: string; sortOrder?: number; isActive?: boolean },
  ) {
    return this.adminCategoryService.updateCategory(id, data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '部分更新分类' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async patchCategory(
    @Param('id') id: string,
    @Body() data: { name?: string; description?: string; sortOrder?: number; isActive?: boolean },
  ) {
    return this.adminCategoryService.updateCategory(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除分类' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteCategory(@Param('id') id: string) {
    return this.adminCategoryService.deleteCategory(id);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取小说分类统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCategoryStats() {
    return this.adminService.getCategoryStats();
  }

  @Get('distribution')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取分类分布图表数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCategoryDistribution() {
    return this.adminService.getCategoryDistribution();
  }
}
