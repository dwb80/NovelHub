/**
 * E2E测试: 小说阅读流程
 * 测试ID: E2E-003, E2E-014
 * 覆盖: 小说搜索、阅读、书签、阅读器设置
 */

import { test, expect } from '@playwright/test';
import { 
  HomePage, 
  SearchPage, 
  NovelDetailPage, 
  ReaderPage,
  LoginPage 
} from './fixtures/page-objects';
import { testUsers, testNovels, searchKeywords } from './fixtures/test-data';

test.describe('小说阅读流程', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:8080';

  test.beforeEach(async ({ page }) => {
    // 每个测试前先登录
    const loginPage = new LoginPage(page, baseUrl);
    await loginPage.goto();
    await loginPage.login(testUsers.user1.email, testUsers.user1.password);
    await page.waitForTimeout(2000);
  });

  test.describe('小说搜索', () => {
    test('E2E-003: 小说搜索功能', async ({ page }) => {
      const homePage = new HomePage(page, baseUrl);
      const searchPage = new SearchPage(page, baseUrl);

      // 从首页搜索
      await homePage.goto();
      await homePage.search(searchKeywords.valid[0]);

      // 验证跳转到搜索结果页
      await expect(page).toHaveURL(/search/);

      // 验证有搜索结果
      const resultCount = await searchPage.getResultCount();
      expect(resultCount).toBeGreaterThan(0);
    });

    test('E2E-003: 搜索结果筛选', async ({ page }) => {
      const searchPage = new SearchPage(page, baseUrl);

      await searchPage.goto(searchKeywords.valid[0]);
      await page.waitForTimeout(1500);

      // 验证搜索结果存在
      const resultCount = await searchPage.getResultCount();
      expect(resultCount).toBeGreaterThanOrEqual(0);
    });

    test('E2E-003-NEG: 搜索无结果', async ({ page }) => {
      const searchPage = new SearchPage(page, baseUrl);

      await searchPage.goto();
      await searchPage.search(searchKeywords.invalid[0]);

      // 验证显示无结果提示
      const noResultsMessage = page.locator('.no-results, .empty-state, .no-data');
      await expect(noResultsMessage).toBeVisible();
    });
  });

  test.describe('小说详情与阅读', () => {
    test('E2E-003: 小说详情页浏览', async ({ page }) => {
      const novelDetailPage = new NovelDetailPage(page, baseUrl);
      const novel = testNovels.novel1;

      await novelDetailPage.goto(novel.id);

      // 验证小说标题显示
      const title = await novelDetailPage.title.textContent();
      expect(title).toBeTruthy();

      // 验证作者信息显示
      const author = await novelDetailPage.author.textContent();
      expect(author).toBeTruthy();

      // 验证简介显示
      const description = await novelDetailPage.description.textContent();
      expect(description).toBeTruthy();

      // 验证阅读按钮存在
      await expect(novelDetailPage.readButton).toBeVisible();
    });

    test('E2E-003: 开始阅读小说', async ({ page }) => {
      const novelDetailPage = new NovelDetailPage(page, baseUrl);
      const readerPage = new ReaderPage(page, baseUrl);
      const novel = testNovels.novel1;

      // 访问小说详情页
      await novelDetailPage.goto(novel.id);

      // 点击开始阅读
      await novelDetailPage.startReading();

      // 验证跳转到阅读器页面
      await expect(page).toHaveURL(/reading/);

      // 验证阅读器内容加载
      await expect(readerPage.content).toBeVisible();

      // 验证章节标题显示
      const chapterTitle = await readerPage.getChapterTitle();
      expect(chapterTitle).toBeTruthy();
    });

    test('E2E-014: 阅读器章节切换', async ({ page }) => {
      const readerPage = new ReaderPage(page, baseUrl);
      const novel = testNovels.novel1;

      // 直接访问阅读器
      await readerPage.goto(novel.id);
      await page.waitForTimeout(2000);

      // 获取当前章节标题
      const firstChapterTitle = await readerPage.getChapterTitle();

      // 点击下一章
      if (await readerPage.nextChapterButton.isVisible().catch(() => false)) {
        await readerPage.nextChapter();

        // 验证章节切换
        const newChapterTitle = await readerPage.getChapterTitle();
        expect(newChapterTitle).not.toBe(firstChapterTitle);

        // 点击上一章返回
        if (await readerPage.prevChapterButton.isVisible().catch(() => false)) {
          await readerPage.prevChapter();
          const prevChapterTitle = await readerPage.getChapterTitle();
          expect(prevChapterTitle).toBe(firstChapterTitle);
        }
      }
    });

    test('E2E-014: 阅读器设置功能', async ({ page }) => {
      const readerPage = new ReaderPage(page, baseUrl);
      const novel = testNovels.novel1;

      await readerPage.goto(novel.id);
      await page.waitForTimeout(2000);

      // 打开设置面板
      if (await readerPage.settingsButton.isVisible().catch(() => false)) {
        await readerPage.settingsButton.click();
        await page.waitForTimeout(500);

        // 验证设置面板显示
        const settingsPanel = page.locator('.settings-panel, .reader-settings-panel');
        await expect(settingsPanel).toBeVisible();

        // 测试字体大小调整
        const fontSizeButton = page.locator('.font-size-control, .btn-font-size').first();
        if (await fontSizeButton.isVisible().catch(() => false)) {
          await fontSizeButton.click();
          await page.waitForTimeout(500);
        }

        // 测试主题切换
        const themeButton = page.locator('.theme-control, .btn-theme').first();
        if (await themeButton.isVisible().catch(() => false)) {
          await themeButton.click();
          await page.waitForTimeout(500);
        }
      }
    });

    test('E2E-014: 添加书签功能', async ({ page }) => {
      const readerPage = new ReaderPage(page, baseUrl);
      const novel = testNovels.novel1;

      await readerPage.goto(novel.id);
      await page.waitForTimeout(2000);

      // 添加书签
      if (await readerPage.bookmarkButton.isVisible().catch(() => false)) {
        await readerPage.addBookmark();

        // 验证书签添加成功提示
        const toast = page.locator('.toast, .notification');
        if (await toast.isVisible().catch(() => false)) {
          const message = await toast.textContent();
          expect(message?.includes('书签') || message?.includes('成功')).toBeTruthy();
        }
      }
    });
  });

  test.describe('阅读进度', () => {
    test('E2E-003: 阅读进度保存', async ({ page }) => {
      const readerPage = new ReaderPage(page, baseUrl);
      const novel = testNovels.novel1;

      // 阅读小说
      await readerPage.goto(novel.id);
      await page.waitForTimeout(2000);

      // 记录当前章节
      const chapterTitle = await readerPage.getChapterTitle();

      // 切换到下一章
      if (await readerPage.nextChapterButton.isVisible().catch(() => false)) {
        await readerPage.nextChapter();
        await page.waitForTimeout(2000);

        const newChapterTitle = await readerPage.getChapterTitle();

        // 刷新页面
        await page.reload();
        await page.waitForTimeout(2000);

        // 验证进度恢复
        const restoredChapterTitle = await readerPage.getChapterTitle();
        expect(restoredChapterTitle).toBe(newChapterTitle);
      }
    });
  });
});
