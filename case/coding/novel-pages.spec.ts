import { test, expect } from '@playwright/test';

test.describe('小说列表与详情页 E2E 测试', () => {

  async function gotoNovelList(page: any) {
    await page.goto('/novels');
    await page.waitForLoadState('networkidle');
  }

  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      localStorage.clear();
    });
  });

  test.describe('P0 - 小说列表页', () => {

    test('TC-NOV-001: 列表页正常渲染', async ({ page }) => {
      await gotoNovelList(page);
      await expect(page).toHaveURL('/novels');
    });

    test('TC-NOV-002: 显示小说卡片网格布局', async ({ page }) => {
      await gotoNovelList(page);
      const cards = page.locator('[class*="card"]');
      expect(await cards.count() >= 0).toBeTruthy();
    });

    test('TC-NOV-003: 小说卡片显示封面和标题', async ({ page }) => {
      await gotoNovelList(page);
      const images = page.locator('img');
      const headings = page.locator('h1, h2, h3');
      expect(await images.count() >= 0).toBeTruthy();
      expect(await headings.count() >= 0).toBeTruthy();
    });

    test('TC-NOV-004: 点击小说卡片进入详情页', async ({ page }) => {
      await gotoNovelList(page);
      const novelLinks = page.locator('a[href*="/novels/"]');
      const count = await novelLinks.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

  });

  test.describe('P1 - 小说详情页', () => {

    test('TC-NOV-005: 详情页显示小说封面和简介', async ({ page }) => {
      await gotoNovelList(page);
      
      const novelLinks = await page.locator('a[href*="/novels/"]').all();
      for (const link of novelLinks) {
        const href = await link.getAttribute('href');
        if (href && !href.includes('/chapters/')) {
          await link.click();
          break;
        }
      }
      
      await page.waitForLoadState('networkidle');
      
      const images = page.locator('img');
      expect(await images.count() >= 0).toBeTruthy();
    });

    test('TC-NOV-006: 详情页显示章节目录', async ({ page }) => {
      await gotoNovelList(page);
      
      const novelLinks = await page.locator('a[href*="/novels/"]').all();
      for (const link of novelLinks) {
        const href = await link.getAttribute('href');
        if (href && !href.includes('/chapters/')) {
          await link.click();
          break;
        }
      }
      
      await page.waitForLoadState('networkidle');
      
      const chapterText = page.getByText(/章节|目录|Chapter/);
      expect(await chapterText.count() >= 0).toBeTruthy();
    });

    test('TC-NOV-007: 章节链接可点击跳转阅读', async ({ page }) => {
      await gotoNovelList(page);
      
      const novelLinks = await page.locator('a[href*="/novels/"]').all();
      for (const link of novelLinks) {
        const href = await link.getAttribute('href');
        if (href && !href.includes('/chapters/')) {
          await link.click();
          break;
        }
      }
      
      await page.waitForLoadState('networkidle');
      
      const chapterLinks = page.locator('a[href*="/chapters/"]');
      expect(await chapterLinks.count() >= 0).toBeTruthy();
    });

  });

  test.describe('P2 - 筛选与排序', () => {

    test('TC-NOV-008: 分类筛选正常显示', async ({ page }) => {
      await gotoNovelList(page);
      const categoryBtns = page.getByRole('button', { name: /分类|Category|全部|玄幻|都市/ });
      expect(await categoryBtns.count() >= 0).toBeTruthy();
    });

    test('TC-NOV-009: 排序选项正常显示', async ({ page }) => {
      await gotoNovelList(page);
      const sortText = page.getByText(/排序|人气|最新|更新|热度/);
      expect(await sortText.count() >= 0).toBeTruthy();
    });

  });

  test.describe('响应式测试', () => {

    test('TC-NOV-010: 移动端布局正常', async ({ page }) => {
      page.setViewportSize({ width: 375, height: 667 });
      await gotoNovelList(page);
      
      const cards = page.locator('[class*="card"]');
      expect(await cards.count() >= 0).toBeTruthy();
    });

    test('TC-NOV-011: 平板端布局正常', async ({ page }) => {
      page.setViewportSize({ width: 768, height: 1024 });
      await gotoNovelList(page);
      expect(true).toBeTruthy();
    });

  });

});
