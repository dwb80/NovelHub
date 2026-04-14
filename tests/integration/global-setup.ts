/**
 * Jest 集成测试全局设置
 * 在所有测试之前执行一次
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export default async function globalSetup() {
  console.log('🚀 开始集成测试全局设置...');
  
  // 创建测试数据目录
  const testDataDir = path.join(__dirname, 'test-data');
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true });
  }
  
  // 创建测试结果目录
  const resultsDir = path.join(__dirname, '..', '..', 'test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  // 检查API服务是否可访问
  const apiUrl = process.env.TEST_API_URL || 'http://localhost:8080/api';
  console.log(`📡 测试API地址: ${apiUrl}`);
  
  // 设置环境变量
  process.env.TEST_DATA_DIR = testDataDir;
  
  console.log('✅ 集成测试全局设置完成');
}
