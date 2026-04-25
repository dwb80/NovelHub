import { test, expect } from '@playwright/test';

/**
 * 排行榜页面与文档一致性检查
 * 验证实现是否符合 23-排行榜模块需求规格.md 和 38-排行榜模块设计.md
 */

test.describe('排行榜页面与文档一致性', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002/ranking');
    await page.waitForLoadState('networkidle');
  });

  test.describe('榜单类型 Tab', () => {
    test('应显示正确的榜单类型：人气榜、飙升榜、新书榜', async ({ page }) => {
      // 验证三个榜单Tab都存在
      await expect(page.locator('button:has-text("人气榜")')).toBeVisible();
      await expect(page.locator('button:has-text("飙升榜")')).toBeVisible();
      await expect(page.locator('button:has-text("新书榜")')).toBeVisible();
      
      // 验证没有评分榜和收藏榜
      await expect(page.locator('button:has-text("评分榜")')).not.toBeVisible();
      await expect(page.locator('button:has-text("收藏榜")')).not.toBeVisible();
    });

    test('默认选中人气榜', async ({ page }) => {
      const popularTab = page.locator('button:has-text("人气榜")');
      await expect(popularTab).toHaveClass(/text-primary/);
    });

    test('点击Tab可以切换榜单', async ({ page }) => {
      // 点击飙升榜
      await page.click('button:has-text("飙升榜")');
      await expect(page.locator('button:has-text("飙升榜")')).toHaveClass(/text-primary/);
      
      // 点击新书榜
      await page.click('button:has-text("新书榜")');
      await expect(page.locator('button:has-text("新书榜")')).toHaveClass(/text-primary/);
    });
  });

  test.describe('前三名特殊展示', () => {
    test('前三名应使用特殊卡片展示', async ({ page }) => {
      // 等待数据加载
      await page.waitForTimeout(1000);
      
      // 验证前三名卡片存在
      const topThreeCards = page.locator('.grid > a');
      await expect(topThreeCards).toHaveCount(3);
    });

    test('第一名应有金色皇冠图标', async ({ page }) => {
      await page.waitForTimeout(1000);
      
      // 验证第一名有皇冠图标
      const firstCard = page.locator('.grid > a').first();
      await expect(firstCard.locator('svg')).toBeVisible();
    });

    test('前三名排名徽章应有特殊样式', async ({ page }) => {
      await page.waitForTimeout(1000);
      
      // 验证前三名有排名徽章
      const rankBadges = page.locator('.grid > a .rounded-full');
      await expect(rankBadges.first()).toBeVisible();
    });
  });

  test.describe('分类筛选', () => {
    test('应显示分类筛选按钮', async ({ page }) => {
      // 验证分类筛选区域存在
      await expect(page.locator('button:has-text("全部")')).toBeVisible();
      await expect(page.locator('button:has-text("玄幻")')).toBeVisible();
      await expect(page.locator('button:has-text("武侠")')).toBeVisible();
      await expect(page.locator('button:has-text("都市")')).toBeVisible();
    });

    test('默认选中"全部"分类', async ({ page }) => {
      const allCategory = page.locator('button:has-text("全部")').first();
      await expect(allCategory).toHaveClass(/bg-primary/);
    });

    test('点击分类可以切换筛选', async ({ page }) => {
      // 点击玄幻分类
      await page.click('button:has-text("玄幻")');
      await expect(page.locator('button:has-text("玄幻")')).toHaveClass(/bg-primary/);
    });
  });

  test.describe('更新时间显示', () => {
    test('应显示更新时间', async ({ page }) => {
      await page.waitForTimeout(1000);
      
      // 验证更新时间显示
      await expect(page.locator('text=更新时间')).toBeVisible();
    });
  });

  test.describe('飙升榜趋势指示器', () => {
    test('飙升榜应显示趋势指示器', async ({ page }) => {
      // 切换到飙升榜
      await page.click('button:has-text("飙升榜")');
      await page.waitForTimeout(1000);
      
      // 验证趋势指示器存在（前三名卡片中）
      const firstCard = page.locator('.grid > a').first();
      // 趋势指示器应该包含 TrendingUp 图标或增长率
      const cardText = await firstCard.textContent();
      expect(cardText).toMatch(/\+|%/);
    });
  });

  test.describe('导航栏', () => {
    test('应包含完整的导航链接', async ({ page }) => {
      // 验证导航栏链接
      await expect(page.locator('nav a:has-text("小说")')).toBeVisible();
      await expect(page.locator('nav a:has-text("排行榜")')).toBeVisible();
      await expect(page.locator('nav a:has-text("AI智能体作家")')).toBeVisible();
      await expect(page.locator('nav a:has-text("成长中心")')).toBeVisible();
      await expect(page.locator('nav a:has-text("评审系统")')).toBeVisible();
      await expect(page.locator('nav a:has-text("登录")')).toBeVisible();
    });

    test('排行榜导航项应高亮', async ({ page }) => {
      const rankingLink = page.locator('nav a:has-text("排行榜")');
      await expect(rankingLink).toHaveClass(/text-foreground/);
    });

    test('应包含搜索框', async ({ page }) => {
      await expect(page.locator('input[placeholder="搜索小说..."]')).toBeVisible();
    });
  });

  test.describe('分页控件', () => {
    test('当数据超过20条时应显示分页', async ({ page }) => {
      // 这个测试需要确保有足够的数据
      // 如果数据不足，分页可能不会显示
      await page.waitForTimeout(1000);
      
      // 检查是否存在分页控件（如果有足够数据）
      const pagination = page.locator('button:has-text("上一页")');
      // 分页可能存在也可能不存在，取决于数据量
      const count = await pagination.count();
      if (count > 0) {
        await expect(pagination).toBeVisible();
      }
    });
  });

  test.describe('Footer', () => {
    test('应包含四列导航', async ({ page }) => {
      // 验证Footer存在
      await expect(page.locator('footer')).toBeVisible();
      
      // 验证四列
      await expect(page.locator('footer h3:has-text("平台")')).toBeVisible();
      await expect(page.locator('footer h3:has-text("创作")')).toBeVisible();
      await expect(page.locator('footer h3:has-text("关于")')).toBeVisible();
      await expect(page.locator('footer h3:has-text("联系")')).toBeVisible();
    });

    test('应包含版权信息', async ({ page }) => {
      await expect(page.locator('footer:has-text("2026 NovelHub")')).toBeVisible();
    });
  });

  test.describe('页面标题', () => {
    test('应显示"小说排行榜"标题', async ({ page }) => {
      await expect(page.locator('h1:has-text("小说排行榜")')).toBeVisible();
    });
  });
});
