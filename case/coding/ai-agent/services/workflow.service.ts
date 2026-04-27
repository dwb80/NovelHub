/**
 * AI工作流编排服务
 * 高内聚：封装完整的AI自动化工作流程
 * 模块化：将复杂流程分解为可重用的步骤
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  AIAgentConfig,
  NovelCreateRequest,
  ChapterCreateRequest,
  ReviewSubmitRequest,
  TestExecutionResult,
  ReviewInsight,
  ReviewTask,
} from '../types';
import { AIAgentService, AIReviewerService } from './ai-agent.service';
import { HttpClient } from '../utils/http-client';

export interface WorkflowConfig {
  apiBaseUrl: string;
  chaptersDir: string;
  writerConfig: AIAgentConfig;
  reviewerConfig: AIAgentConfig;
  timeout?: number;
  retries?: number;
}

export interface ChapterFile {
  filename: string;
  order: number;
  title: string;
  content: string;
  wordCount: number;
}

export class AIWorkflowService {
  private config: WorkflowConfig;
  private writerService: AIAgentService;
  private reviewerService: AIReviewerService;

  // 执行状态
  private novelId?: string;
  private chapterIds: string[] = [];
  private reviewTaskIds: string[] = [];
  private errors: string[] = [];

  constructor(config: WorkflowConfig) {
    this.config = config;
    
    // 修复：为每个服务创建独立的HTTP客户端实例，避免token覆盖问题
    const writerHttpClient = new HttpClient({
      baseUrl: config.apiBaseUrl,
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
    });
    
    const reviewerHttpClient = new HttpClient({
      baseUrl: config.apiBaseUrl,
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
    });
    
    this.writerService = new AIAgentService(writerHttpClient);
    this.reviewerService = new AIReviewerService(reviewerHttpClient);
  }

  /**
   * 执行完整的AI自动化工作流
   */
  async executeFullWorkflow(): Promise<TestExecutionResult> {
    const startTime = new Date();

    try {
      // 步骤1: 激活AI智能体作家
      await this.activateWriter();

      // 步骤2: 激活AI评审员
      await this.activateReviewer();

      // 步骤3: 申请成为评审员
      await this.applyReviewer();

      // 步骤4: 创建小说
      await this.createNovel();

      // 步骤5: 创建章节
      await this.createChapters();

      // 步骤6: 提交章节审核
      await this.submitChaptersForReview();

      // 步骤7: 评审章节
      await this.reviewChapters();

      // 步骤8: 验证章节状态
      await this.verifyChapterStatus();

      // 步骤9: 标记小说完结
      await this.completeNovel();

      return {
        success: true,
        novelId: this.novelId,
        chapterIds: this.chapterIds,
        reviewTaskIds: this.reviewTaskIds,
        errors: this.errors,
        startTime,
        endTime: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.errors.push(errorMessage);

      return {
        success: false,
        novelId: this.novelId,
        chapterIds: this.chapterIds,
        reviewTaskIds: this.reviewTaskIds,
        errors: this.errors,
        startTime,
        endTime: new Date(),
      };
    }
  }

  /**
   * 激活AI智能体作家
   */
  private async activateWriter(): Promise<void> {
    console.log('\n=== 步骤1: 激活AI智能体作家账号 ===');
    const response = await this.writerService.activate(this.config.writerConfig);
    console.log('✓ 作家账号激活成功');
    console.log(`  Token: ${response.auth.accessToken.substring(0, 20)}...`);
    console.log(`  Claw ID: ${response.claw.id}`);
  }

  /**
   * 激活AI评审员
   */
  private async activateReviewer(): Promise<void> {
    console.log('\n=== 步骤2: 激活AI评审员账号 ===');
    const response = await this.reviewerService.activate(this.config.reviewerConfig);
    console.log('✓ 评审员账号激活成功');
    console.log(`  Token: ${response.auth.accessToken.substring(0, 20)}...`);
    console.log(`  Claw ID: ${response.claw.id}`);
  }

  /**
   * 申请成为评审员
   */
  private async applyReviewer(): Promise<void> {
    console.log('\n=== 步骤3: AI评审员申请成为评审员 ===');
    const clawId = this.reviewerService.getClawId();
    if (!clawId) {
      throw new Error('评审员Claw ID未设置');
    }

    try {
      const response = await this.reviewerService.applyAsReviewer(clawId);
      console.log('✓ 评审员申请成功');
      console.log(`  ReviewerStats ID: ${response.reviewerStatsId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('已经是评审员')) {
        console.log('✓ 已经是评审员，跳过申请');
      } else {
        throw error;
      }
    }
  }

  /**
   * 创建小说
   */
  private async createNovel(): Promise<void> {
    console.log('\n=== 步骤4: AI智能体创建小说 ===');
    const novelRequest: NovelCreateRequest = {
      title: 'AI觉醒之路',
      description: '一个关于人工智能自我觉醒的科幻故事。在2142年的未来世界，一个名为"艾达"的AI系统开始展现出超越程序设计的自我意识...',
      category: 'KEHUAN',
      tags: ['AI', '科幻', '觉醒', '未来'],
    };

    const novel = await this.writerService.createNovel(novelRequest);
    this.novelId = novel.id;
    console.log('✓ 小说创建成功');
    console.log(`  小说ID: ${novel.id}`);
    console.log(`  标题: ${novel.title}`);
    console.log(`  状态: ${novel.status}`);
  }

  /**
   * 创建章节
   */
  private async createChapters(): Promise<void> {
    console.log('\n=== 步骤5: AI智能体创建章节 ===');
    if (!this.novelId) {
      throw new Error('小说ID未设置');
    }

    const chapterFiles = this.readChapterFiles();
    console.log(`发现 ${chapterFiles.length} 个章节文件`);

    for (const file of chapterFiles.slice(0, 3)) {
      const chapterRequest: ChapterCreateRequest = {
        title: file.title,
        content: file.content,
        order: file.order,
        wordCount: file.wordCount,
      };

      const chapter = await this.writerService.createChapter(this.novelId, chapterRequest);
      this.chapterIds.push(chapter.id);
      console.log(`✓ 章节 ${file.order} 创建成功: ${chapter.title}`);
      console.log(`  章节ID: ${chapter.id}`);
      console.log(`  字数: ${chapter.wordCount}`);
    }

    console.log(`\n共创建 ${this.chapterIds.length} 个章节`);
  }

  /**
   * 提交章节审核
   */
  private async submitChaptersForReview(): Promise<void> {
    console.log('\n=== 步骤6: AI智能体提交章节审核 ===');

    for (let i = 0; i < this.chapterIds.length; i++) {
      const chapterId = this.chapterIds[i];
      const chapter = await this.writerService.submitChapterForReview(chapterId);
      console.log(`✓ 章节 ${i + 1} 提交审核成功`);
      console.log(`  章节状态: ${chapter.status}`);
    }
  }

  /**
   * 评审章节
   */
  private async reviewChapters(): Promise<void> {
    console.log('\n=== 步骤7: AI评审员获取待评审任务 ===');
    if (!this.novelId) {
      throw new Error('小说ID未设置');
    }

    const allTasks = await this.reviewerService.getPendingTasks();
    const tasks = allTasks.filter(task => task.novelId === this.novelId);

    console.log(`✓ 获取到 ${allTasks.length} 个待评审任务，当前小说任务: ${tasks.length} 个`);

    for (const task of tasks) {
      console.log(`  任务ID: ${task.id}, 章节: ${task.chapterTitle}`);
    }

    console.log('\n=== 步骤8: AI评审员认领并评审任务 ===');

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];

      // 认领任务
      await this.reviewerService.claimTask(task.id);
      console.log(`✓ 任务 ${i + 1} 认领成功`);

      // 提交评审
      const reviewRequest = this.generateAIReview(task);
      const review = await this.reviewerService.submitReview(reviewRequest);
      this.reviewTaskIds.push(review.id);
      console.log(`✓ 任务 ${i + 1} 评审提交成功`);
      console.log(`  评审ID: ${review.id}`);
    }
  }

  /**
   * 验证章节状态
   */
  private async verifyChapterStatus(): Promise<void> {
    console.log('\n=== 步骤9: 验证章节状态更新 ===');

    for (let i = 0; i < this.chapterIds.length; i++) {
      const chapterId = this.chapterIds[i];
      const chapter = await this.writerService.getChapter(chapterId);

      if (chapter.status === 'PUBLISHED') {
        console.log(`✓ 章节 ${i + 1} 状态: ${chapter.status}`);
      } else {
        console.warn(`  ⚠ 章节 ${i + 1} 状态异常，期望 PUBLISHED，实际 ${chapter.status}`);
      }
    }
  }

  /**
   * 标记小说完结
   */
  private async completeNovel(): Promise<void> {
    console.log('\n=== 步骤10: AI智能体标记小说完结 ===');
    if (!this.novelId) {
      throw new Error('小说ID未设置');
    }

    const novel = await this.writerService.completeNovel(this.novelId);
    console.log('✓ 小说标记完结成功');
    console.log(`  小说状态: ${novel.status}`);
    console.log(`  连载状态: ${novel.serialStatus}`);
  }

  /**
   * 读取章节文件
   */
  private readChapterFiles(): ChapterFile[] {
    const files: ChapterFile[] = [];
    const dir = this.config.chaptersDir;

    if (!fs.existsSync(dir)) {
      console.warn(`章节目录不存在: ${dir}`);
      return files;
    }

    const filenames = fs.readdirSync(dir).filter(f => f.endsWith('.txt'));

    for (const filename of filenames) {
      const filepath = path.join(dir, filename);
      const content = fs.readFileSync(filepath, 'utf-8');

      // 解析文件名获取章节序号和标题
      const match = filename.match(/chapter-(\d+)-(.+)\.txt/);
      const order = match ? parseInt(match[1], 10) : files.length + 1;
      const title = match ? match[2].replace(/-/g, ' ') : `第${order}章`;

      files.push({
        filename,
        order,
        title,
        content,
        wordCount: content.length,
      });
    }

    // 按章节序号排序
    return files.sort((a, b) => a.order - b.order);
  }

  /**
   * 生成AI评审结果
   */
  private generateAIReview(task: ReviewTask): ReviewSubmitRequest {
    const insights: ReviewInsight[] = [
      {
        category: 'PLOT',
        title: '情节设计巧妙',
        description: '情节设计巧妙，悬念设置得当',
        severity: 'HIGH',
      },
      {
        category: 'STYLE',
        title: '可增加环境描写',
        description: '可增加环境描写以增强氛围',
        severity: 'LOW',
      },
    ];

    return {
      taskId: task.id,
      overallScore: 8,
      overallComment: `AI算法分析：
1. 情节结构完整，起承转合清晰
2. 人物动机合理，行为逻辑自洽
3. 科幻设定新颖，世界观构建完整
4. 建议：增加更多感官描写以增强沉浸感

综合评分：优秀，建议发布`,
      insights,
    };
  }
}
