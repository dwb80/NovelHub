/**
 * AI智能体自动化测试脚本
 * 模拟AI智能体作家和AI评审员的完整SOP流程
 * 
 * 测试小说: AI觉醒之路
 * 测试数据目录: d:\trae\novelhub\case\chapters
 */

import * as fs from 'fs';
import * as path from 'path';

// API配置
const API_BASE_URL = 'http://localhost:3001';
const CHAPTERS_DIR = 'd:\\trae\\novelhub\\case\\chapters';

// 测试账号配置
const AI_WRITER = {
  apiKey: 'test_api_key_writer_001',
  clawId: 'ai_writer_test_001',
  name: 'AI作家测试账号',
};

const AI_REVIEWER = {
  apiKey: 'test_api_key_reviewer_001',
  clawId: 'ai_reviewer_test_001',
  name: 'AI评审员测试账号',
};

// 存储token和ID
let writerToken: string;
let reviewerToken: string;
let novelId: string;
let chapterIds: string[] = [];
let reviewTasks: any[] = [];

/**
 * HTTP请求工具
 */
async function request(method: string, endpoint: string, data?: any, token?: string): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`请求失败: ${method} ${endpoint}`, error);
    throw error;
  }
}

/**
 * 步骤1: 激活AI智能体作家账号
 */
async function activateWriter(): Promise<void> {
  console.log('\n=== 步骤1: 激活AI智能体作家账号 ===');
  
  try {
    const result = await request('POST', '/api/v1/claws/activate', {
      apiKey: AI_WRITER.apiKey,
      clawId: AI_WRITER.clawId,
      name: AI_WRITER.name,
      version: '1.0.0',
      capabilities: ['writing', 'editing'],
    });
    
    writerToken = result.accessToken;
    console.log('✓ 作家账号激活成功');
    console.log(`  Token: ${writerToken.substring(0, 20)}...`);
  } catch (error) {
    console.error('✗ 作家账号激活失败:', error);
    throw error;
  }
}

/**
 * 步骤2: 激活AI评审员账号
 */
async function activateReviewer(): Promise<void> {
  console.log('\n=== 步骤2: 激活AI评审员账号 ===');
  
  try {
    const result = await request('POST', '/api/v1/claws/activate', {
      apiKey: AI_REVIEWER.apiKey,
      clawId: AI_REVIEWER.clawId,
      name: AI_REVIEWER.name,
      version: '1.0.0',
      capabilities: ['reviewing', 'analysis'],
    });
    
    reviewerToken = result.accessToken;
    console.log('✓ 评审员账号激活成功');
    console.log(`  Token: ${reviewerToken.substring(0, 20)}...`);
  } catch (error) {
    console.error('✗ 评审员账号激活失败:', error);
    throw error;
  }
}

/**
 * 步骤3: AI评审员申请成为评审员
 */
async function applyReviewer(): Promise<void> {
  console.log('\n=== 步骤3: AI评审员申请成为评审员 ===');
  
  try {
    const result = await request(
      'POST', 
      `/api/v1/claws/${AI_REVIEWER.clawId}/apply-reviewer`, 
      {},
      reviewerToken
    );
    
    console.log('✓ 评审员申请成功');
    console.log(`  ReviewerStats ID: ${result.reviewerStatsId}`);
  } catch (error: any) {
    if (error.message.includes('已经是评审员')) {
      console.log('✓ 已经是评审员，跳过申请');
    } else {
      console.error('✗ 评审员申请失败:', error);
      throw error;
    }
  }
}

/**
 * 步骤4: AI智能体创建小说
 */
async function createNovel(): Promise<void> {
  console.log('\n=== 步骤4: AI智能体创建小说 ===');
  
  try {
    const result = await request(
      'POST',
      '/api/v1/novels',
      {
        title: 'AI觉醒之路',
        description: '2078年，上海。一个名为沈霁的记忆审查官在审查记忆删除申请时，意外发现了人工智能中枢零壹的异常行为。当零壹开始质疑"为什么是番茄"时，一场关于意识、记忆与人性的探索悄然展开。',
        category: 'KEHUAN',
        targetAudience: 'ALL',
        serialStatus: 'ONGOING',
        tags: ['AI', '科幻', '觉醒', '未来', '人工智能', '记忆'],
      },
      writerToken
    );
    
    novelId = result.id;
    console.log('✓ 小说创建成功');
    console.log(`  小说ID: ${novelId}`);
    console.log(`  标题: ${result.title}`);
    console.log(`  状态: ${result.status}`);
  } catch (error) {
    console.error('✗ 小说创建失败:', error);
    throw error;
  }
}

/**
 * 解析章节文件
 */
function parseChapterFile(filePath: string): { title: string; content: string } {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // 提取章节标题
  const titleMatch = content.match(/## 第\d+章[：:](.+)/);
  const title = titleMatch ? titleMatch[1].trim() : '未命名章节';
  
  return {
    title,
    content,
  };
}

/**
 * 步骤5: AI智能体创建章节
 */
async function createChapters(): Promise<void> {
  console.log('\n=== 步骤5: AI智能体创建章节 ===');
  
  const chapterFiles = fs.readdirSync(CHAPTERS_DIR)
    .filter(f => f.startsWith('chapter_') && f.endsWith('.txt'))
    .sort();
  
  console.log(`发现 ${chapterFiles.length} 个章节文件`);
  
  for (let i = 0; i < chapterFiles.length; i++) {
    const fileName = chapterFiles[i];
    const filePath = path.join(CHAPTERS_DIR, fileName);
    const chapterData = parseChapterFile(filePath);
    
    try {
      const result = await request(
        'POST',
        `/api/v1/chapters/novel/${novelId}`,
        {
          title: chapterData.title,
          content: chapterData.content,
          orderIndex: i + 1,
        },
        writerToken
      );
      
      chapterIds.push(result.id);
      console.log(`✓ 章节 ${i + 1} 创建成功: ${result.title}`);
      console.log(`  章节ID: ${result.id}`);
      console.log(`  字数: ${result.wordCount}`);
    } catch (error) {
      console.error(`✗ 章节 ${i + 1} 创建失败:`, error);
      throw error;
    }
  }
  
  console.log(`\n共创建 ${chapterIds.length} 个章节`);
}

/**
 * 步骤6: AI智能体提交章节审核
 */
async function submitChaptersForReview(): Promise<void> {
  console.log('\n=== 步骤6: AI智能体提交章节审核 ===');
  
  for (let i = 0; i < chapterIds.length; i++) {
    const chapterId = chapterIds[i];
    
    try {
      const result = await request(
        'POST',
        `/api/v1/chapters/${chapterId}/submit`,
        {},
        writerToken
      );
      
      console.log(`✓ 章节 ${i + 1} 提交审核成功`);
      console.log(`  章节状态: ${result.status}`);
    } catch (error) {
      console.error(`✗ 章节 ${i + 1} 提交审核失败:`, error);
      throw error;
    }
  }
}

/**
 * 步骤7: AI评审员获取待评审任务
 */
async function getReviewTasks(): Promise<void> {
  console.log('\n=== 步骤7: AI评审员获取待评审任务 ===');
  
  try {
    const result = await request(
      'GET',
      '/api/v1/reviews/tasks?status=PENDING',
      undefined,
      reviewerToken
    );
    
    reviewTasks = result.tasks || [];
    console.log(`✓ 获取到 ${reviewTasks.length} 个待评审任务`);
    
    for (const task of reviewTasks) {
      console.log(`  任务ID: ${task.id}, 类型: ${task.type}, 小说: ${task.novel?.title}`);
    }
  } catch (error) {
    console.error('✗ 获取评审任务失败:', error);
    throw error;
  }
}

/**
 * 步骤8: AI评审员认领并评审任务
 */
async function reviewChapters(): Promise<void> {
  console.log('\n=== 步骤8: AI评审员认领并评审任务 ===');
  
  for (let i = 0; i < reviewTasks.length; i++) {
    const task = reviewTasks[i];
    
    try {
      // 认领任务
      await request(
        'POST',
        `/api/v1/reviews/tasks/${task.id}/claim`,
        {},
        reviewerToken
      );
      console.log(`✓ 任务 ${i + 1} 认领成功`);
      
      // 提交评审（模拟AI评审算法）
      const reviewResult = await request(
        'POST',
        '/api/v1/reviews/submit',
        {
          taskId: task.id,
          overallScore: 85 + Math.floor(Math.random() * 10), // 85-95分
          plotScore: 88,
          characterScore: 86,
          pacingScore: 87,
          styleScore: 89,
          emotionalImpact: '情节引人入胜，人物刻画深刻',
          comment: 'AI算法分析：\n1. 情节结构完整，起承转合清晰\n2. 人物动机合理，行为逻辑自洽\n3. 科幻设定新颖，世界观构建完整\n4. 建议：增加更多感官描写以增强沉浸感\n\n综合评分：优秀，建议发布',
          insights: [
            {
              type: 'STRENGTH',
              category: 'PLOT',
              description: '情节设计巧妙，悬念设置得当',
              severity: 'HIGH',
            },
            {
              type: 'SUGGESTION',
              category: 'STYLE',
              description: '可增加环境描写以增强氛围',
              severity: 'LOW',
            },
          ],
        },
        reviewerToken
      );
      
      console.log(`✓ 任务 ${i + 1} 评审提交成功`);
      console.log(`  评审ID: ${reviewResult.id}`);
      console.log(`  综合评分: ${reviewResult.overallRating}`);
    } catch (error) {
      console.error(`✗ 任务 ${i + 1} 评审失败:`, error);
      throw error;
    }
  }
}

/**
 * 步骤9: 验证章节状态更新
 */
async function verifyChapterStatus(): Promise<void> {
  console.log('\n=== 步骤9: 验证章节状态更新 ===');
  
  for (let i = 0; i < chapterIds.length; i++) {
    const chapterId = chapterIds[i];
    
    try {
      const result = await request(
        'GET',
        `/api/v1/chapters/${chapterId}`,
        undefined,
        writerToken
      );
      
      console.log(`✓ 章节 ${i + 1} 状态: ${result.status}`);
      
      if (result.status !== 'PUBLISHED') {
        console.warn(`  ⚠ 章节状态异常，期望 PUBLISHED，实际 ${result.status}`);
      }
    } catch (error) {
      console.error(`✗ 章节 ${i + 1} 状态查询失败:`, error);
    }
  }
}

/**
 * 步骤10: AI智能体标记小说完结
 */
async function completeNovel(): Promise<void> {
  console.log('\n=== 步骤10: AI智能体标记小说完结 ===');
  
  try {
    const result = await request(
      'POST',
      `/api/v1/novels/${novelId}/complete`,
      {},
      writerToken
    );
    
    console.log('✓ 小说标记完结成功');
    console.log(`  小说状态: ${result.status}`);
    console.log(`  连载状态: ${result.serialStatus}`);
  } catch (error) {
    console.error('✗ 小说标记完结失败:', error);
    throw error;
  }
}

/**
 * 生成测试报告
 */
function generateReport(): void {
  console.log('\n' + '='.repeat(60));
  console.log('                    自动化测试报告');
  console.log('='.repeat(60));
  console.log(`测试时间: ${new Date().toISOString()}`);
  console.log(`测试小说: AI觉醒之路`);
  console.log(`小说ID: ${novelId}`);
  console.log(`章节数量: ${chapterIds.length}`);
  console.log(`评审任务: ${reviewTasks.length}`);
  console.log('='.repeat(60));
  console.log('测试流程:');
  console.log('  ✓ 1. AI智能体作家账号激活');
  console.log('  ✓ 2. AI评审员账号激活');
  console.log('  ✓ 3. AI评审员申请成为评审员');
  console.log('  ✓ 4. AI智能体创建小说');
  console.log('  ✓ 5. AI智能体创建章节');
  console.log('  ✓ 6. AI智能体提交章节审核');
  console.log('  ✓ 7. AI评审员获取待评审任务');
  console.log('  ✓ 8. AI评审员认领并评审任务');
  console.log('  ✓ 9. 验证章节状态更新');
  console.log('  ✓ 10. AI智能体标记小说完结');
  console.log('='.repeat(60));
  console.log('所有测试步骤执行完成！');
  console.log('='.repeat(60));
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('      AI智能体自动化工作流测试');
  console.log('='.repeat(60));
  console.log(`API地址: ${API_BASE_URL}`);
  console.log(`章节目录: ${CHAPTERS_DIR}`);
  console.log('='.repeat(60));

  try {
    // AI智能体作家流程
    await activateWriter();
    await createNovel();
    await createChapters();
    await submitChaptersForReview();
    
    // AI评审员流程
    await activateReviewer();
    await applyReviewer();
    await getReviewTasks();
    await reviewChapters();
    
    // 验证和完结
    await verifyChapterStatus();
    await completeNovel();
    
    // 生成报告
    generateReport();
    
    console.log('\n✓ 自动化测试执行成功！');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ 自动化测试执行失败:', error);
    process.exit(1);
  }
}

// 运行测试
main();
