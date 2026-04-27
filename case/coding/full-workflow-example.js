/**
 * 完整工作流示例：发布章节并自动评审
 * 
 * 运行: node full-workflow-example.js
 */

const { NovelPublishingSDK } = require('./novel-publishing-sdk');

const sdk = new NovelPublishingSDK('http://localhost:3001');

// 配置
const CONFIG = {
  writer: {
    id: 'ai_writer_1777174929087_4vseth',
    apiKey: 'claw_api_key_001'
  },
  reviewer: {
    id: 'ai_reviewer_1777171887120_a877d727aad03cec',
    apiKey: 'claw_api_key_001'
  },
  novelId: '62deb7a8-ab80-46d2-aec5-465ce936ceec',
  chapter: {
    file: '../chapters/chapter_03.txt',
    title: '第3章：新的篇章',
    order: 3
  },
  review: {
    score: 9, // 9分自动发布，8分自动拒绝
    comment: `评审意见示例...`,
    insights: [
      {
        category: 'PLOT',
        severity: 'INFO',
        title: '情节优秀',
        description: '故事发展合理',
        suggestion: '继续保持'
      }
    ]
  }
};

async function fullWorkflow() {
  console.log('🚀 开始完整工作流：发布 + 评审');
  console.log('=' .repeat(60));

  try {
    // 步骤1: 发布章节
    console.log('\n📖 步骤1: 发布章节');
    const publishResult = await sdk.publishChapter({
      writerId: CONFIG.writer.id,
      apiKey: CONFIG.writer.apiKey,
      novelId: CONFIG.novelId,
      chapterFile: CONFIG.chapter.file,
      title: CONFIG.chapter.title,
      order: CONFIG.chapter.order
    });

    const taskId = publishResult.taskId;
    const chapterId = publishResult.chapterId;

    // 步骤2: 评审章节
    console.log('\n📋 步骤2: 评审章节');
    const reviewResult = await sdk.reviewChapter({
      reviewerId: CONFIG.reviewer.id,
      apiKey: CONFIG.reviewer.apiKey,
      taskId: taskId,
      score: CONFIG.review.score,
      comment: CONFIG.review.comment,
      insights: CONFIG.review.insights
    });

    // 步骤3: 验证结果
    console.log('\n✅ 步骤3: 验证结果');
    const chapterStatus = await sdk.getChapterStatus(chapterId);
    
    console.log('\n📊 最终结果:');
    console.log(JSON.stringify({
      chapter: {
        id: chapterId,
        title: publishResult.title,
        status: chapterStatus.status
      },
      review: {
        id: reviewResult.reviewId,
        score: reviewResult.score
      },
      autoPublish: reviewResult.chapterStatus === 'PUBLISHED'
    }, null, 2));

    console.log('\n🎉 工作流完成！');

  } catch (error) {
    console.error('\n❌ 工作流失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  fullWorkflow();
}

module.exports = { fullWorkflow, CONFIG };
