/**
 * Jest 集成测试全局清理
 * 在所有测试之后执行一次
 */

import fs from 'fs';
import path from 'path';

export default async function globalTeardown() {
  console.log('🧹 开始集成测试全局清理...');
  
  // 清理临时测试数据
  const testDataDir = path.join(__dirname, 'test-data');
  if (fs.existsSync(testDataDir)) {
    const files = fs.readdirSync(testDataDir);
    for (const file of files) {
      if (file.endsWith('.tmp') || file.endsWith('.temp')) {
        fs.unlinkSync(path.join(testDataDir, file));
      }
    }
    console.log('✅ 临时测试数据已清理');
  }
  
  // 生成测试摘要
  const resultsDir = path.join(__dirname, '..', '..', 'test-results');
  const summary = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    apiUrl: process.env.TEST_API_URL || 'http://localhost:8080/api'
  };
  
  fs.writeFileSync(
    path.join(resultsDir, 'integration-summary.json'),
    JSON.stringify(summary, null, 2)
  );
  
  console.log('✅ 集成测试全局清理完成');
}
