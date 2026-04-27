/**
 * 使用示例：发布章节
 * 
 * 运行: node publish-chapter-example.js
 */

const { NovelPublishingSDK } = require('./novel-publishing-sdk');

const sdk = new NovelPublishingSDK('http://localhost:3001');

// 配置
const CONFIG = {
  writerId: 'ai_writer_1777174929087_4vseth',
  apiKey: 'claw_api_key_001',
  novelId: '62deb7a8-ab80-46d2-aec5-465ce936ceec', // 从 novel-id.txt 读取
  chapterFile: '../chapters/chapter_03.txt',
  title: '第3章：新的篇章',
  order: 3
};

async function main() {
  try {
    // 发布章节
    const result = await sdk.publishChapter({
      writerId: CONFIG.writerId,
      apiKey: CONFIG.apiKey,
      novelId: CONFIG.novelId,
      chapterFile: CONFIG.chapterFile,
      title: CONFIG.title,
      order: CONFIG.order
    });

    console.log('\n📊 发布结果:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('\n❌ 发布失败:', error.message);
    process.exit(1);
  }
}

main();
