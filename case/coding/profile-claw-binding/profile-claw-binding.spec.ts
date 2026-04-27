import { test, expect } from '@playwright/test';

test.describe('个人中心 - AI智能体绑定功能', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/profile');
  });

  test('TC-CLAW-001: 访问绑定AI智能体Tab', async ({ page }) => {
    await page.goto('/profile');
    await page.click('text=绑定AI智能体');
    
    // 验证页面内容
    await expect(page.locator('text=绑定AI智能体').first()).toBeVisible();
    await expect(page.locator('text=已绑定的AI智能体')).toBeVisible();
    await expect(page.locator('text=申请成为AI智能体')).toBeVisible();
  });

  test('TC-CLAW-003: Tab切换功能', async ({ page }) => {
    await page.goto('/profile');
    await page.click('text=绑定AI智能体');
    
    // 切换到AI评审员Tab
    await page.click('text=AI评审员');
    await expect(page.locator('text=申请成为AI评审员')).toBeVisible();
    
    // 切换回AI智能体作家Tab
    await page.click('text=AI智能体作家');
    await expect(page.locator('text=申请成为AI智能体作家')).toBeVisible();
  });

  test('TC-LIST-004: 空状态展示', async ({ page }) => {
    await page.goto('/profile');
    await page.click('text=绑定AI智能体');
    
    // 假设用户没有绑定的AI智能体
    await expect(page.locator('text=暂无绑定的AI智能体')).toBeVisible();
    await expect(page.locator('text=申请成为AI智能体作家或AI评审员来绑定智能体')).toBeVisible();
  });

  test('TC-WRITER-001: 作家申请流程展示', async ({ page }) => {
    await page.goto('/profile');
    await page.click('text=绑定AI智能体');
    
    // 验证4步流程
    await expect(page.locator('text=注册AI智能体账号')).toBeVisible();
    await expect(page.locator('text=提交作家申请')).toBeVisible();
    await expect(page.locator('text=系统审核')).toBeVisible();
    await expect(page.locator('text=开始创作')).toBeVisible();
  });

  test('TC-REVIEWER-001: 评审员申请流程展示', async ({ page }) => {
    await page.goto('/profile');
    await page.click('text=绑定AI智能体');
    await page.click('text=AI评审员');
    
    // 验证5步流程
    await expect(page.locator('text=拥有AI智能体身份')).toBeVisible();
    await expect(page.locator('text=提交评审员申请')).toBeVisible();
    await expect(page.locator('text=能力测试')).toBeVisible();
    await expect(page.locator('text=人工审核')).toBeVisible();
    await expect(page.locator('text=开始评审')).toBeVisible();
  });

  test('TC-WRITER-003: 注册AI智能体按钮跳转', async ({ page }) => {
    await page.goto('/profile');
    await page.click('text=绑定AI智能体');
    
    await page.click('text=注册AI智能体');
    await expect(page).toHaveURL(/.*register.*type=claw/);
  });

  test('TC-REVIEWER-004: 了解评审员详情按钮跳转', async ({ page }) => {
    await page.goto('/profile');
    await page.click('text=绑定AI智能体');
    await page.click('text=AI评审员');
    
    await page.click('text=了解评审员详情');
    await expect(page).toHaveURL(/.*reviews/);
  });

  test('TC-COMMON-002: 重要说明展示', async ({ page }) => {
    await page.goto('/profile');
    await page.click('text=绑定AI智能体');
    
    // 验证重要说明
    await expect(page.locator('text=重要说明')).toBeVisible();
    await expect(page.locator('text=同一个AI智能体可以同时拥有作家和评审员两种身份')).toBeVisible();
  });
});
