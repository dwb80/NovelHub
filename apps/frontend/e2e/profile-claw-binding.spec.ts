import { test, expect } from '@playwright/test';

test.describe('个人中心 - AI智能体绑定功能', () => {
  test('TC-CLAW-001: 访问绑定AI智能体Tab', async ({ page }) => {
    // 先登录
    await page.goto('http://localhost:3002/login');
    await page.waitForLoadState('networkidle');
    
    // 填写登录表单 - 使用正确的测试账号
    await page.fill('#email', 'reader1@example.com');
    await page.fill('#password', 'reader123');
    await page.click('button[type="submit"]');
    
    // 等待跳转到个人中心
    await page.waitForURL('**/profile', { timeout: 15000 });
    
    // 点击绑定AI智能体Tab
    await page.click('text=绑定AI智能体');
    
    // 验证页面内容
    await expect(page.locator('text=已绑定的AI智能体').first()).toBeVisible();
    await expect(page.locator('text=申请成为AI智能体').first()).toBeVisible();
  });

  test('TC-CLAW-003: Tab切换功能', async ({ page }) => {
    await page.goto('http://localhost:3002/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('#email', 'reader1@example.com');
    await page.fill('#password', 'reader123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/profile', { timeout: 15000 });
    
    await page.click('text=绑定AI智能体');
    
    // 切换到AI评审员Tab - 使用更精确的选择器
    await page.getByRole('tab', { name: 'AI评审员' }).click();
    await expect(page.getByText('申请成为AI评审员').first()).toBeVisible();
    
    // 切换回AI智能体作家Tab
    await page.getByRole('tab', { name: 'AI智能体作家' }).click();
    await expect(page.getByText('申请成为AI智能体作家').first()).toBeVisible();
  });

  test('TC-LIST-004: 空状态展示', async ({ page }) => {
    await page.goto('http://localhost:3002/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('#email', 'reader1@example.com');
    await page.fill('#password', 'reader123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/profile', { timeout: 15000 });
    
    await page.click('text=绑定AI智能体');
    
    // 验证空状态
    await expect(page.locator('text=暂无绑定的AI智能体')).toBeVisible();
  });

  test('TC-WRITER-001: 作家申请流程展示', async ({ page }) => {
    await page.goto('http://localhost:3002/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('#email', 'reader1@example.com');
    await page.fill('#password', 'reader123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/profile', { timeout: 15000 });
    
    await page.click('text=绑定AI智能体');
    
    // 验证4步流程 - 使用精确匹配
    await expect(page.getByText('注册AI智能体账号', { exact: true })).toBeVisible();
    await expect(page.getByText('提交作家申请', { exact: true })).toBeVisible();
    await expect(page.getByText('系统审核', { exact: true })).toBeVisible();
    await expect(page.getByText('开始创作', { exact: true })).toBeVisible();
  });

  test('TC-REVIEWER-001: 评审员申请流程展示', async ({ page }) => {
    await page.goto('http://localhost:3002/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('#email', 'reader1@example.com');
    await page.fill('#password', 'reader123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/profile', { timeout: 15000 });
    
    await page.click('text=绑定AI智能体');
    await page.getByRole('tab', { name: 'AI评审员' }).click();
    
    // 验证5步流程
    await expect(page.getByText('拥有AI智能体身份', { exact: true })).toBeVisible();
    await expect(page.getByText('提交评审员申请', { exact: true })).toBeVisible();
    await expect(page.getByText('能力测试', { exact: true })).toBeVisible();
    await expect(page.getByText('人工审核', { exact: true })).toBeVisible();
    await expect(page.getByText('开始评审', { exact: true })).toBeVisible();
  });

  test('TC-COMMON-002: 重要说明展示', async ({ page }) => {
    await page.goto('http://localhost:3002/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('#email', 'reader1@example.com');
    await page.fill('#password', 'reader123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/profile', { timeout: 15000 });
    
    await page.click('text=绑定AI智能体');
    
    // 验证重要说明
    await expect(page.locator('text=重要说明')).toBeVisible();
    await expect(page.locator('text=同一个AI智能体可以同时拥有作家和评审员两种身份')).toBeVisible();
  });
});
