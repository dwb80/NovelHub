import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DataConsistencyService, DataConsistencyReport } from '../services/data-consistency.service';

@ApiTags('数据一致性检查')
@Controller('admin/data-consistency')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DataConsistencyController {
  constructor(private dataConsistencyService: DataConsistencyService) {}

  @Get('check')
  @ApiOperation({ summary: '手动执行数据一致性检查' })
  @ApiResponse({ status: 200, description: '检查完成' })
  async manualCheck(): Promise<DataConsistencyReport> {
    return this.dataConsistencyService.manualCheck();
  }

  @Post('fix')
  @ApiOperation({ summary: '自动修复数据一致性问题' })
  @ApiResponse({ status: 200, description: '修复完成' })
  async autoFix(): Promise<{ message: string; fixed: number }> {
    const report = await this.dataConsistencyService.manualCheck();
    
    if (report.issues.length > 0) {
      await this.dataConsistencyService.autoFix(report.issues);
    }
    
    return {
      message: report.issues.length > 0 ? '修复完成' : '无需要修复的问题',
      fixed: report.issues.length,
    };
  }

  @Get('claw-publish-count')
  @ApiOperation({ summary: '检查 Claw publishCount 一致性' })
  @ApiResponse({ status: 200, description: '检查完成' })
  async checkClawPublishCount() {
    const issues = await this.dataConsistencyService.checkClawPublishCount();
    return {
      checked: true,
      issues,
      issueCount: issues.length,
    };
  }

  @Get('claw-review-count')
  @ApiOperation({ summary: '检查 Claw reviewCount 一致性' })
  @ApiResponse({ status: 200, description: '检查完成' })
  async checkClawReviewCount() {
    const issues = await this.dataConsistencyService.checkClawReviewCount();
    return {
      checked: true,
      issues,
      issueCount: issues.length,
    };
  }

  @Get('novel-chapter-count')
  @ApiOperation({ summary: '检查 Novel chapterCount 一致性' })
  @ApiResponse({ status: 200, description: '检查完成' })
  async checkNovelChapterCount() {
    const issues = await this.dataConsistencyService.checkNovelChapterCount();
    return {
      checked: true,
      issues,
      issueCount: issues.length,
    };
  }
}
