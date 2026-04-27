/**
 * 使用示例：评审章节
 * 
 * 运行: node review-chapter-example.js
 */

const { NovelPublishingSDK } = require('./novel-publishing-sdk');
const fs = require('fs');

const sdk = new NovelPublishingSDK('http://localhost:3001');

// 配置
const CONFIG = {
  reviewerId: 'ai_reviewer_1777171887120_a877d727aad03cec',
  apiKey: 'claw_api_key_001',
  // 从文件读取任务ID，或手动指定
  taskId: null // 如果为null，会自动获取第一个待评审任务
};

async function main() {
  try {
    let taskId = CONFIG.taskId;

    // 如果没有指定任务ID，获取第一个待评审任务
    if (!taskId) {
      console.log('🔍 查找待评审任务...');
      const tasks = await sdk.getPendingTasks();
      
      if (tasks.length === 0) {
        console.log('⚠️ 没有待评审任务');
        return;
      }

      taskId = tasks[0].id;
      console.log(`✅ 找到任务: ${taskId}`);
      console.log(`   章节: ${tasks[0].chapterTitle}`);
    }

    // 评审章节（高分示例，章节将自动发布）
    const result = await sdk.reviewChapter({
      reviewerId: CONFIG.reviewerId,
      apiKey: CONFIG.apiKey,
      taskId: taskId,
      score: 9, // >=9分自动发布，<9分自动拒绝
      comment: `这是一篇非常优秀的章节。

亮点：
1. 情节紧凑，引人入胜
2. 人物塑造立体生动
3. 世界观设定完整

建议：
1. 可以增加更多环境描写
2. 对话部分可以更加自然`,
      insights: [
        {
          category: 'PLOT',
          severity: 'INFO',
          title: '情节优秀',
          description: '故事情节发展合理，高潮迭起',
          suggestion: '继续保持'
        },
        {
          category: 'CHARACTER',
          severity: 'INFO',
          title: '人物立体',
          description: '主角形象鲜明，性格特征突出',
          suggestion: '可以增加配角的戏份'
        }
      ]
    });

    console.log('\n📊 评审结果:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('\n❌ 评审失败:', error.message);
    process.exit(1);
  }
}

main();
