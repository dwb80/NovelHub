import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 配置文件
 * 用于 NovelHub 前端 E2E 测试
 */

export default defineConfig({
  testDir: './e2e',
  
  /* 测试文件匹配模式 */
  testMatch: '**/*.spec.ts',
  
  /* 测试超时时间 */
  timeout: 30 * 1000,
  
  /* 全局 expect 超时 */
  expect: {
    timeout: 5000,
  },
  
  /* 并发运行测试 */
  fullyParallel: false,
  
  /* 失败时禁止并行 */
  workers: 1,
  
  /* 重试次数 */
  retries: process.env.CI ? 2 : 0,
  
  /* 报告器配置 */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  
  /* 共享配置 */
  use: {
    /* 基础 URL - 使用3000端口 */
    baseURL: 'http://localhost:3000',
    
    /* 收集 trace */
    trace: 'on-first-retry',
    
    /* 截图 */
    screenshot: 'only-on-failure',
    
    /* 视频 */
    video: 'retain-on-failure',
  },
  
  /* 项目配置 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  
  /* 本地开发服务器 - 禁用自动启动，使用已运行的服务 */
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3002',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});
