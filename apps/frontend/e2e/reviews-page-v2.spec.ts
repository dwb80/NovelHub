import { test, expect } from '@playwright/test';

test.describe('AI评审员页面 V2 - 完整功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/reviews');
    await page.waitForLoadState('networkidle');
  });

  test('TC-REV-V2-001: 页面应显示统计卡片', async ({ page }) => {
    // 检查统计卡片
    await expect(page.getByText('注册评审员')).toBeVisible();
    await expect(page.getByText('累计评审')).toBeVisible();
    await expect(page.getByText('平均评分')).toBeVisible();
    await expect(page.getByText('待评审任务')).toBeVisible();
  });

  test('TC-REV-V2-002: 页面应显示Tab导航', async ({ page }) => {
    // 检查Tab导航
    await expect(page.getByRole('tab', { name: '评审员列表' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '评审规则' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '申请加入' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '我的评审' })).toBeVisible();
  });

  test('TC-REV-V2-003: 评审员列表应显示评审员卡片', async ({ page }) => {
    // 等待评审员卡片加载
    await expect(page.getByText('评审达人')).toBeVisible();
    await expect(page.getByText('书评专家')).toBeVisible();
    
    // 检查评审员信息
    await expect(page.getByText('积分')).toBeVisible();
    await expect(page.getByText('评审数')).toBeVisible();
    await expect(page.getByText('任务数')).toBeVisible();
  });

  test('TC-REV-V2-004: 搜索功能应正常工作', async ({ page }) => {
    // 检查搜索框
    const searchInput = page.locator('input[placeholder*="搜索评审员"]').first();
    await expect(searchInput).toBeVisible();
    
    // 输入搜索词
    await searchInput.fill('评审达人');
    await page.waitForTimeout(500);
    
    // 验证搜索结果
    await expect(page.getByText('评审达人')).toBeVisible();
  });

  test('TC-REV-V2-005: 分页功能应正常工作', async ({ page }) => {
    // 检查分页控件（如果有多个页面）
    const pagination = page.locator('text=/第.*页/');
    const hasPagination = await pagination.isVisible().catch(() => false);
    
    if (hasPagination) {
      // 验证分页按钮
      const nextButton = page.locator('button').filter({ has: page.locator('[data-lucide="chevron-right"]') }).first();
      const prevButton = page.locator('button').filter({ has: page.locator('[data-lucide="chevron-left"]') }).first();
      
      // 上一页按钮应该被禁用（在第一页）
      await expect(prevButton).toBeDisabled();
    }
  });

  test('TC-REV-V2-006: 评审员详情弹窗应正常显示', async ({ page }) => {
    // 点击第一个评审员的"查看详情"按钮
    await page.getByRole('button', { name: '查看详情' }).first().click();
    
    // 等待弹窗出现
    await page.waitForTimeout(500);
    
    // 验证弹窗内容
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('总积分')).toBeVisible();
    await expect(page.getByText('完成评审')).toBeVisible();
    await expect(page.getByText('当前任务')).toBeVisible();
    await expect(page.getByText('最近评审')).toBeVisible();
  });

  test('TC-REV-V2-007: 评审规则Tab应显示规则内容', async ({ page }) => {
    // 点击评审规则Tab
    await page.getByRole('tab', { name: '评审规则' }).click();
    await page.waitForTimeout(300);
    
    // 验证规则内容
    await expect(page.getByText('评审基本规则')).toBeVisible();
    await expect(page.getByText('等级考核规则')).toBeVisible();
    await expect(page.getByText('积分获取规则')).toBeVisible();
    
    // 验证具体规则
    await expect(page.getByText('客观公正')).toBeVisible();
    await expect(page.getByText('详细具体')).toBeVisible();
    await expect(page.getByText('见习评审')).toBeVisible();
    await expect(page.getByText('钻石评审')).toBeVisible();
  });

  test('TC-REV-V2-008: 申请加入Tab应显示申请信息', async ({ page }) => {
    // 点击申请加入Tab
    await page.getByRole('tab', { name: '申请加入' }).click();
    await page.waitForTimeout(300);
    
    // 验证申请信息
    await expect(page.getByText('申请成为AI评审员')).toBeVisible();
    await expect(page.getByText('注册账号')).toBeVisible();
    await expect(page.getByText('阅读经验')).toBeVisible();
    await expect(page.locator('text=通过测试').first()).toBeVisible();
    
    // 验证申请流程
    await expect(page.getByText('申请流程')).toBeVisible();
    await expect(page.getByText('提交申请')).toBeVisible();
    await expect(page.getByText('能力测试')).toBeVisible();
    await expect(page.getByText('审核通过')).toBeVisible();
    await expect(page.getByText('开始评审')).toBeVisible();
    
    // 验证AI智能体API申请方式
    await expect(page.getByText('AI智能体申请方式')).toBeVisible();
    await expect(page.getByText('AI智能体通过API接口申请成为评审员')).toBeVisible();
    await expect(page.getByText('/api/v1/claws/')).toBeVisible();
    
    // 验证读者申请区域
    await expect(page.getByText('读者申请')).toBeVisible();
  });

  test('TC-REV-V2-009: 未登录用户应看到登录提示', async ({ page, context }) => {
    // 确保未登录
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 点击我的评审Tab
    await page.getByRole('tab', { name: '我的评审' }).click();
    await page.waitForTimeout(300);
    
    // 验证登录提示
    await expect(page.getByText('登录后查看')).toBeVisible();
    await expect(page.getByRole('button', { name: '立即登录' })).toBeVisible();
  });

  test('TC-REV-V2-010: 页面直接访问不跳转登录', async ({ page, context }) => {
    // 确保未登录
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // 直接访问reviews页面
    await page.goto('http://localhost:3000/reviews');
    await page.waitForLoadState('networkidle');
    
    // 验证URL
    await expect(page).toHaveURL('http://localhost:3000/reviews');
    
    // 验证页面内容（公共信息）
    await expect(page.getByRole('heading', { name: 'AI评审员' })).toBeVisible();
    await expect(page.getByText('注册评审员')).toBeVisible();
    await expect(page.getByText('累计评审')).toBeVisible();
  });
});

test.describe('AI评审员页面 - 权限测试', () => {
  test('未登录用户访问评审员列表', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('http://localhost:3000/reviews');
    await page.waitForLoadState('networkidle');
    
    // 验证可以查看评审员列表
    await expect(page.getByRole('tab', { name: '评审员列表' })).toBeVisible();
    await expect(page.getByText('评审达人')).toBeVisible();
    
    // 验证可以查看评审规则
    await page.getByRole('tab', { name: '评审规则' }).click();
    await expect(page.getByText('评审基本规则')).toBeVisible();
    
    // 验证可以查看申请加入
    await page.getByRole('tab', { name: '申请加入' }).click();
    await expect(page.getByText('申请成为AI评审员')).toBeVisible();
  });

  test('未登录用户点击申请按钮跳转到登录', async ({ page, context }) => {
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.goto('http://localhost:3000/reviews');
    await page.waitForLoadState('networkidle');
    
    // 点击申请加入Tab
    await page.getByRole('tab', { name: '申请加入' }).click();
    await page.waitForTimeout(300);
    
    // 点击登录后申请按钮
    await page.getByRole('button', { name: '登录后申请' }).click();
    
    // 验证跳转到登录页
    await page.waitForURL('**/login**');
    await expect(page).toHaveURL(/.*login.*/);
  });
});
