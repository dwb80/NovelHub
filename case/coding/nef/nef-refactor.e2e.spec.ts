import { test, expect } from '@playwright/test';

/**
 * NEF页面重构E2E测试
 * 
 * 测试范围:
 * 1. 公共NEF页面 (/nef) - 无需登录
 * 2. 个人NEF页面 (/profile NEF标签页) - 需要登录
 */

test.describe('NEF公共页面 (/nef)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/nef');
  });

  test('NEF-PUB-001: 未登录用户可以访问NEF公共页面', async ({ page }) => {
    // 验证页面正常加载
    await expect(page).toHaveURL('http://localhost:3000/nef');
    
    // 验证页面标题
    const title = page.locator('h1');
    await expect(title).toContainText('NEF');
    await expect(title).toContainText('进化引擎');
  });

  test('NEF-PUB-002: 已登录用户也可以访问NEF公共页面', async ({ page, context }) => {
    // 先登录
    await context.addCookies([
      {
        name: 'token',
        value: 'test-token',
        domain: 'localhost',
        path: '/',
      }
    ]);
    
    await page.goto('http://localhost:3000/nef');
    await expect(page).toHaveURL('http://localhost:3000/nef');
  });

  test('NEF-PUB-003: Hero区域显示正确', async ({ page }) => {
    // 验证Hero区域
    const heroTitle = page.locator('h1');
    await expect(heroTitle).toBeVisible();
    
    // 验证副标题
    const subtitle = page.locator('text=AI驱动的创作进化平台');
    await expect(subtitle).toBeVisible();
  });

  test('NEF-PUB-004: CTA按钮显示并可用', async ({ page }) => {
    // 验证"免费开始使用"按钮
    const ctaButton = page.locator('text=免费开始使用');
    await expect(ctaButton).toBeVisible();
    
    // 点击按钮跳转到注册页面
    await ctaButton.click();
    await expect(page).toHaveURL(/.*register/);
  });

  test('NEF-PUB-005~008: 平台统计数据正确显示', async ({ page }) => {
    // 验证统计数据区域
    const statsSection = page.locator('text=作品已优化');
    await expect(statsSection).toBeVisible();
    
    // 验证各项统计数据
    await expect(page.locator('text=建议已生成')).toBeVisible();
    await expect(page.locator('text=活跃AI智能体作家')).toBeVisible();
    await expect(page.locator('text=平均质量提升')).toBeVisible();
  });

  test('NEF-PUB-009~012: 功能特性卡片显示', async ({ page }) => {
    // 验证功能特性区域
    await expect(page.locator('text=智能内容分析')).toBeVisible();
    await expect(page.locator('text=精准读者画像')).toBeVisible();
    await expect(page.locator('text=创作建议生成')).toBeVisible();
    await expect(page.locator('text=数据可视化')).toBeVisible();
  });

  test('NEF-PUB-013~014: 成功案例显示', async ({ page }) => {
    // 验证成功案例区域
    await expect(page.locator('text=成功案例')).toBeVisible();
    
    // 验证案例内容
    await expect(page.locator('text=星际穿越者')).toBeVisible();
  });

  test('NEF-PUB-015~016: 定价方案显示', async ({ page }) => {
    // 验证定价方案区域
    await expect(page.locator('text=选择适合您的方案')).toBeVisible();
    
    // 验证各版本方案
    await expect(page.locator('text=免费版')).toBeVisible();
    await expect(page.locator('text=专业版')).toBeVisible();
    await expect(page.locator('text=团队版')).toBeVisible();
  });

});

test.describe('NEF个人页面 (/profile NEF标签页)', () => {

  test('NEF-PRIV-001: 已登录用户可以访问NEF标签页', async ({ page, context }) => {
    // 先登录
    await context.addCookies([
      {
        name: 'token',
        value: 'test-token',
        domain: 'localhost',
        path: '/',
      }
    ]);
    
    // 访问个人中心
    await page.goto('http://localhost:3000/profile');
    
    // 点击NEF进化标签
    const nefTab = page.locator('text=NEF进化');
    await expect(nefTab).toBeVisible();
    await nefTab.click();
    
    // 验证NEF内容显示
    await expect(page.locator('text=进化迭代')).toBeVisible();
  });

  test('NEF-PRIV-002: 未登录用户被重定向到登录页', async ({ page }) => {
    // 直接访问profile页面
    await page.goto('http://localhost:3000/profile');
    
    // 验证被重定向到登录页
    await expect(page).toHaveURL(/.*login/);
  });

  test('NEF-PRIV-003~006: 个人统计卡片显示', async ({ page, context }) => {
    // 登录
    await context.addCookies([
      {
        name: 'token',
        value: 'test-token',
        domain: 'localhost',
        path: '/',
      }
    ]);
    
    await page.goto('http://localhost:3000/profile');
    
    // 点击NEF标签
    await page.locator('text=NEF进化').click();
    
    // 验证统计卡片
    await expect(page.locator('text=进化迭代')).toBeVisible();
    await expect(page.locator('text=质量评分')).toBeVisible();
    await expect(page.locator('text=读者反馈')).toBeVisible();
    await expect(page.locator('text=改进建议')).toBeVisible();
  });

  test('NEF-PRIV-008: 个人进化历史显示', async ({ page, context }) => {
    // 登录
    await context.addCookies([
      {
        name: 'token',
        value: 'test-token',
        domain: 'localhost',
        path: '/',
      }
    ]);
    
    await page.goto('http://localhost:3000/profile');
    await page.locator('text=NEF进化').click();
    
    // 验证进化历史区域
    await expect(page.locator('text=进化历史')).toBeVisible();
  });

  test('NEF-PRIV-011: 手动刷新功能', async ({ page, context }) => {
    // 登录
    await context.addCookies([
      {
        name: 'token',
        value: 'test-token',
        domain: 'localhost',
        path: '/',
      }
    ]);
    
    await page.goto('http://localhost:3000/profile');
    await page.locator('text=NEF进化').click();
    
    // 验证刷新按钮
    const refreshButton = page.locator('[data-testid="refresh-nef-data"]').or(page.locator('text=刷新'));
    if (await refreshButton.isVisible().catch(() => false)) {
      await refreshButton.click();
      // 验证数据刷新（可以通过检查某个时间戳或加载状态）
    }
  });

});

test.describe('NEF页面响应式布局', () => {

  test('NEF-UI-001: 桌面端布局', async ({ page }) => {
    // 设置桌面端视口
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('http://localhost:3000/nef');
    
    // 验证页面正常显示
    await expect(page.locator('h1')).toBeVisible();
  });

  test('NEF-UI-002: 平板端布局', async ({ page }) => {
    // 设置平板端视口
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:3000/nef');
    
    // 验证页面正常显示
    await expect(page.locator('h1')).toBeVisible();
  });

  test('NEF-UI-003: 移动端布局', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/nef');
    
    // 验证页面正常显示
    await expect(page.locator('h1')).toBeVisible();
  });

});
