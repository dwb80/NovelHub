import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * E2E测试全局设置
 * 在所有测试之前执行，用于准备测试环境
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 开始E2E测试全局设置...');
  
  const { baseURL } = config.projects[0].use;
  
  // 创建测试数据目录
  const testDataDir = path.join(__dirname, 'test-data');
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true });
  }
  
  // 创建存储目录
  const storageDir = path.join(__dirname, 'storage');
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  
  // 预创建测试用户会话
  const browser = await chromium.launch();
  
  try {
    // 创建测试用户1的认证状态
    const user1Context = await browser.newContext();
    const user1Page = await user1Context.newPage();
    
    // 尝试登录或注册测试用户
    await user1Page.goto(`${baseURL}/pages/user/login.html`);
    
    // 检查是否已经在首页（已登录）
    const currentUrl = user1Page.url();
    if (currentUrl.includes('login')) {
      // 尝试登录
      await user1Page.fill('input[name="email"]', 'test_user_001@example.com');
      await user1Page.fill('input[name="password"]', 'Test@123456');
      await user1Page.click('button[type="submit"]');
      
      // 等待登录完成
      await user1Page.waitForTimeout(2000);
    }
    
    // 保存认证状态
    await user1Context.storageState({ 
      path: path.join(storageDir, 'user1-auth.json') 
    });
    await user1Context.close();
    
    console.log('✅ 测试用户认证状态已保存');
    
  } catch (error) {
    console.log('⚠️  预登录失败，测试将使用独立认证:', error.message);
  }
  
  await browser.close();
  
  // 设置环境变量
  process.env.TEST_ENV = process.env.TEST_ENV || 'development';
  process.env.TEST_DATA_DIR = testDataDir;
  
  console.log('✅ E2E测试全局设置完成');
}

export default globalSetup;
