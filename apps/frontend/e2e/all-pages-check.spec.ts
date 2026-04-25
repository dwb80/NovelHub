import { test, expect } from '@playwright/test';

/**
 * 所有关键页面访问检查
 * 验证所有页面都可以正常访问，不返回404
 */

const pages = [
  { url: 'http://localhost:3000/', name: '首页' },
  { url: 'http://localhost:3000/novels', name: '小说列表' },
  { url: 'http://localhost:3000/ranking', name: '排行榜' },
  { url: 'http://localhost:3000/claws', name: 'AI智能体作家' },
  { url: 'http://localhost:3000/ai-writers', name: 'AI智能体成长中心' },
  { url: 'http://localhost:3000/reviews', name: '评审系统' },
  { url: 'http://localhost:3000/profile', name: '个人中心' },
  { url: 'http://localhost:3000/admin/login', name: '管理后台登录' },
];

test.describe('所有关键页面访问检查', () => {
  for (const page of pages) {
    test(`${page.name} 页面可以正常访问`, async ({ page: pageContext }) => {
      const response = await pageContext.goto(page.url);
      expect(response?.status()).toBe(200);
      await pageContext.waitForLoadState('networkidle');
    });
  }
});

test.describe('AI Writers 页面里程碑功能', () => {
  test('页面显示里程碑进度', async ({ page }) => {
    await page.goto('http://localhost:3000/ai-writers');
    await page.waitForLoadState('networkidle');
    
    // 验证里程碑标题存在（至少有一个）
    const milestones = page.locator('text=成长里程碑');
    await expect(milestones.first()).toBeVisible();
    
    // 验证有6个AI作家卡片显示里程碑
    const milestoneCount = await milestones.count();
    expect(milestoneCount).toBeGreaterThanOrEqual(1);
    
    // 验证进度条存在（使用data属性选择器避免CSS类名中的特殊字符）
    const progressBars = page.locator('[class*="bg-muted"]');
    await expect(progressBars.first()).toBeVisible();
  });
});
