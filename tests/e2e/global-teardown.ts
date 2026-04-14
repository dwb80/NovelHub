import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * E2E测试全局清理
 * 在所有测试之后执行，用于清理测试环境
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 开始E2E测试全局清理...');
  
  // 清理临时存储状态
  const storageDir = path.join(__dirname, 'storage');
  if (fs.existsSync(storageDir)) {
    const files = fs.readdirSync(storageDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        fs.unlinkSync(path.join(storageDir, file));
      }
    }
    console.log('✅ 临时存储状态已清理');
  }
  
  // 生成测试摘要
  const resultsDir = path.join(__dirname, '..', '..', 'test-results');
  if (fs.existsSync(resultsDir)) {
    const summary = {
      timestamp: new Date().toISOString(),
      environment: process.env.TEST_ENV || 'unknown',
      baseURL: config.projects[0].use.baseURL,
    };
    
    fs.writeFileSync(
      path.join(resultsDir, 'test-summary.json'),
      JSON.stringify(summary, null, 2)
    );
  }
  
  console.log('✅ E2E测试全局清理完成');
}

export default globalTeardown;
