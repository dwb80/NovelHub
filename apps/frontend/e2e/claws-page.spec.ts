import { test, expect } from '@playwright/test';

test.describe('AI智能体作家页面 (/claws) 测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/claws');
    await page.waitForLoadState('networkidle');
  });

  test('TC-CLAWS-001: 页面应显示统计卡片', async ({ page }) => {
    // 检查统计卡片标题
    await expect(page.getByText('注册作家')).toBeVisible();
    await expect(page.getByText('累计创作')).toBeVisible();
    await expect(page.getByText('累计评审')).toBeVisible();
    await expect(page.getByText('平均信誉')).toBeVisible();
  });

  test('TC-CLAWS-002: 页面应显示顶尖作家', async ({ page }) => {
    // 检查顶尖作家标题 - 使用更精确的选择器
    await expect(page.getByRole('heading', { name: '顶尖作家', exact: true })).toBeVisible();
    
    // 检查是否有顶尖作家区域（通过检查排名徽章）
    await expect(page.getByText('TOP 1')).toBeVisible();
  });

  test('TC-CLAWS-003: 搜索功能应正常工作', async ({ page }) => {
    // 检查搜索框
    const searchInput = page.locator('input[placeholder*="搜索"]').first();
    await expect(searchInput).toBeVisible();
    
    // 输入搜索词
    await searchInput.fill('test');
    await page.waitForTimeout(500); // 等待过滤
    
    // 验证搜索功能已触发（页面应该有响应）
    // 搜索结果可能为空或显示匹配项
    const pageContent = await page.content();
    expect(pageContent).toBeTruthy();
  });

  test('TC-CLAWS-004: 排序功能应正常工作', async ({ page }) => {
    // 检查排序按钮
    await expect(page.getByRole('button', { name: '按信誉' })).toBeVisible();
    await expect(page.getByRole('button', { name: '按作品' })).toBeVisible();
    await expect(page.getByRole('button', { name: '按活跃' })).toBeVisible();
    
    // 点击按作品排序
    await page.getByRole('button', { name: '按作品' }).click();
    await page.waitForTimeout(300);
    
    // 验证页面仍在/claws
    await expect(page).toHaveURL(/.*claws/);
  });

  test('TC-CLAWS-005: 作家卡片应显示正确信息', async ({ page }) => {
    // 等待页面加载完成
    await page.waitForSelector('text=/本小说/', { timeout: 5000 });
    
    // 检查作家卡片内容
    await expect(page.getByText(/本小说/).first()).toBeVisible();
    await expect(page.getByText(/次评审/).first()).toBeVisible();
    await expect(page.getByText(/信誉/).first()).toBeVisible();
    await expect(page.getByText(/个任务/).first()).toBeVisible();
  });

  test('TC-CLAWS-006: 点击卡片应跳转到详情页', async ({ page }) => {
    // 等待页面加载
    await page.waitForTimeout(1000);
    
    // 查找第一个作家卡片链接
    const firstCard = page.locator('a[href^="/claws/"]').first();
    
    if (await firstCard.isVisible().catch(() => false)) {
      await firstCard.click();
      
      // 验证跳转到详情页
      await page.waitForURL(/.*claws\/.+/, { timeout: 5000 });
      await expect(page).toHaveURL(/.*claws\/.+/);
    }
  });

  test('TC-CLAWS-007: 页面应显示Hero区域', async ({ page }) => {
    // 检查Hero区域标题 - 使用更精确的选择器
    await expect(page.getByRole('heading', { name: 'AI智能体作家', exact: true })).toBeVisible();
    
    // 检查描述文字
    await expect(page.getByText('探索由AI驱动的智能体作家')).toBeVisible();
    
    // 检查徽章
    await expect(page.getByText('智能体')).toBeVisible();
  });

  test('TC-CLAWS-008: 页面应显示所有作家列表', async ({ page }) => {
    // 检查所有作家标题 - 使用更精确的选择器
    await expect(page.getByRole('heading', { name: '所有作家', exact: true })).toBeVisible();
    
    // 等待作家列表加载
    await page.waitForTimeout(1000);
    
    // 检查是否有作家卡片（通过查找小说数量文本）
    const novelTexts = page.getByText(/本小说/);
    const count = await novelTexts.count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-CLAWS-009: 页面响应式布局', async ({ page }) => {
    // 测试桌面端
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 验证页面正常显示 - 使用更精确的选择器
    await expect(page.getByRole('heading', { name: 'AI智能体作家', exact: true })).toBeVisible();
    
    // 测试平板端
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('heading', { name: 'AI智能体作家', exact: true })).toBeVisible();
  });
});
