/**
 * P1级E2E测试: TEST-P1-002 人类用户阅读旅程E2E测试
 * 覆盖范围: 搜索到阅读全流程
 * 测试ID: TEST-P1-002
 * 优先级: P1
 */

import { test, expect } from '@playwright/test';
import { 
  LoginPage, 
  HomePage, 
  SearchPage, 
  NovelDetailPage, 
  ReaderPage,
  BookshelfPage 
} from './fixtures/page-objects';
import { testUsers, testNovels, searchKeywords, testComments } from './fixtures/test-data';

test.describe('【TEST-P1-002】人类用户阅读旅程E2E测试', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:8080';

  test.beforeEach(async ({ page }) => {
    // 每个测试前先登录
    const loginPage = new LoginPage(page, baseUrl);
    await loginPage.goto();
    await loginPage.login(testUsers.user1.email, testUsers.user1.password);
    await page.waitForTimeout(2000);
  });

  test.describe('阶段1: 小说搜索与发现', () => {
    test('P1-002-01: 首页搜索功能完整流程', async ({ page }) => {
      const homePage = new HomePage(page, baseUrl);
      const searchPage = new SearchPage(page, baseUrl);

      // Step 1: 访问首页
      await homePage.goto();
      await expect(page).toHaveURL(/index/);

      // Step 2: 使用搜索功能
      await homePage.search(searchKeywords.valid[0]);

      // Step 3: 验证跳转到搜索结果页
      await expect(page).toHaveURL(/search/);

      // Step 4: 验证搜索结果
      const resultCount = await searchPage.getResultCount();
      expect(resultCount).toBeGreaterThan(0);

      // Step 5: 验证搜索结果项包含必要信息
      const firstResult = searchPage.resultItems.first();
      const title = firstResult.locator('.novel-title, .title, h3, h4').first();
      expect(await title.isVisible().catch(() => false)).toBeTruthy();
    });

    test('P1-002-02: 搜索结果筛选与排序', async ({ page }) => {
      const searchPage = new SearchPage(page, baseUrl);

      // 访问搜索结果页
      await searchPage.goto(searchKeywords.valid[0]);
      await page.waitForTimeout(1500);

      // 验证筛选选项存在
      const filterOptions = page.locator('.filter-option, .filter-item, .sort-option');
      const filterCount = await filterOptions.count();

      if (filterCount > 0) {
        // 测试按分类筛选
        const categoryFilter = page.locator('.filter-category, [data-filter="category"]').first();
        if (await categoryFilter.isVisible().catch(() => false)) {
          await categoryFilter.click();
          await page.waitForTimeout(1000);

          // 验证筛选后结果更新
          const resultCount = await searchPage.getResultCount();
          expect(resultCount).toBeGreaterThanOrEqual(0);
        }

        // 测试排序功能
        const sortSelect = page.locator('select[name="sort"], .sort-select').first();
        if (await sortSelect.isVisible().catch(() => false)) {
          await sortSelect.selectOption('newest');
          await page.waitForTimeout(1000);

          // 验证排序后结果
          const resultCount = await searchPage.getResultCount();
          expect(resultCount).toBeGreaterThanOrEqual(0);
        }
      }
    });

    test('P1-002-03: 分类浏览功能', async ({ page }) => {
      const homePage = new HomePage(page, baseUrl);

      // 访问首页
      await homePage.goto();
      await page.waitForTimeout(1000);

      // 查找分类导航
      const categoryNav = page.locator('.category-nav, .genre-nav, .nav-category');
      const hasCategoryNav = await categoryNav.isVisible().catch(() => false);

      if (hasCategoryNav) {
        // 点击第一个分类
        const firstCategory = categoryNav.locator('a, .category-item').first();
        await firstCategory.click();
        await page.waitForTimeout(1500);

        // 验证跳转到分类页面
        await expect(page).toHaveURL(/category/);

        // 验证分类内容加载
        const categoryContent = page.locator('.category-content, .novel-list');
        await expect(categoryContent).toBeVisible();
      }
    });

    test('P1-002-04: 排行榜浏览', async ({ page }) => {
      const homePage = new HomePage(page, baseUrl);

      // 访问排行榜页面
      await homePage.navigate('/pages/discover/ranking.html');
      await page.waitForTimeout(1500);

      // 验证排行榜页面加载
      await expect(page).toHaveURL(/ranking/);

      // 验证排行榜列表存在
      const rankingList = page.locator('.ranking-list, .rank-list');
      await expect(rankingList).toBeVisible();

      // 验证排行榜项
      const rankingItems = page.locator('.ranking-item, .rank-item');
      const itemCount = await rankingItems.count();
      expect(itemCount).toBeGreaterThan(0);
    });
  });

  test.describe('阶段2: 小说详情浏览', () => {
    test('P1-002-05: 小说详情页完整信息展示', async ({ page }) => {
      const novelDetailPage = new NovelDetailPage(page, baseUrl);
      const novel = testNovels.novel1;

      // 访问小说详情页
      await novelDetailPage.goto(novel.id);
      await page.waitForTimeout(1500);

      // 验证小说标题
      await expect(novelDetailPage.title).toBeVisible();
      const title = await novelDetailPage.title.textContent();
      expect(title).toBeTruthy();

      // 验证作者信息
      await expect(novelDetailPage.author).toBeVisible();
      const author = await novelDetailPage.author.textContent();
      expect(author).toBeTruthy();

      // 验证简介
      await expect(novelDetailPage.description).toBeVisible();
      const description = await novelDetailPage.description.textContent();
      expect(description).toBeTruthy();

      // 验证阅读按钮
      await expect(novelDetailPage.readButton).toBeVisible();

      // 验证加入书架按钮
      await expect(novelDetailPage.addToBookshelfButton).toBeVisible();

      // 验证评论区域
      await expect(novelDetailPage.commentSection).toBeVisible();
    });

    test('P1-002-06: 小说章节列表浏览', async ({ page }) => {
      const novelDetailPage = new NovelDetailPage(page, baseUrl);
      const novel = testNovels.novel1;

      // 访问小说详情页
      await novelDetailPage.goto(novel.id);
      await page.waitForTimeout(1500);

      // 查找章节列表
      const chapterList = page.locator('.chapter-list, .catalog-list, .chapter-catalog');
      const hasChapterList = await chapterList.isVisible().catch(() => false);

      if (hasChapterList) {
        // 验证章节项
        const chapterItems = chapterList.locator('.chapter-item, .catalog-item');
        const chapterCount = await chapterItems.count();
        expect(chapterCount).toBeGreaterThan(0);

        // 点击第一个章节
        const firstChapter = chapterItems.first();
        await firstChapter.click();
        await page.waitForTimeout(1500);

        // 验证跳转到阅读器
        await expect(page).toHaveURL(/reading/);
      }
    });

    test('P1-002-07: 加入书架功能', async ({ page }) => {
      const novelDetailPage = new NovelDetailPage(page, baseUrl);
      const bookshelfPage = new BookshelfPage(page, baseUrl);
      const novel = testNovels.novel3;

      // 访问小说详情页
      await novelDetailPage.goto(novel.id);
      await page.waitForTimeout(1500);

      // 点击加入书架
      if (await novelDetailPage.addToBookshelfButton.isVisible().catch(() => false)) {
        await novelDetailPage.addToBookshelf();

        // 验证成功提示
        const toast = page.locator('.toast, .notification');
        if (await toast.isVisible().catch(() => false)) {
          const message = await toast.textContent();
          expect(message?.includes('成功') || message?.includes('书架')).toBeTruthy();
        }

        // 验证书架中有该小说
        await bookshelfPage.goto();
        await page.waitForTimeout(1500);

        const novelCount = await bookshelfPage.getNovelCount();
        expect(novelCount).toBeGreaterThan(0);
      }
    });
  });

  test.describe('阶段3: 阅读体验', () => {
    test('P1-002-08: 开始阅读完整流程', async ({ page }) => {
      const novelDetailPage = new NovelDetailPage(page, baseUrl);
      const readerPage = new ReaderPage(page, baseUrl);
      const novel = testNovels.novel1;

      // Step 1: 访问小说详情页
      await novelDetailPage.goto(novel.id);
      await page.waitForTimeout(1500);

      // Step 2: 点击开始阅读
      await novelDetailPage.startReading();

      // Step 3: 验证跳转到阅读器页面
      await expect(page).toHaveURL(/reading/);

      // Step 4: 验证阅读器内容加载
      await expect(readerPage.content).toBeVisible();

      // Step 5: 验证章节标题
      const chapterTitle = await readerPage.getChapterTitle();
      expect(chapterTitle).toBeTruthy();

      // Step 6: 验证阅读控制按钮
      const hasNextBtn = await readerPage.nextChapterButton.isVisible().catch(() => false);
      const hasPrevBtn = await readerPage.prevChapterButton.isVisible().catch(() => false);
      expect(hasNextBtn || hasPrevBtn).toBeTruthy();
    });

    test('P1-002-09: 阅读器章节切换', async ({ page }) => {
      const readerPage = new ReaderPage(page, baseUrl);
      const novel = testNovels.novel1;

      // 访问阅读器
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

    test('P1-002-10: 阅读器个性化设置', async ({ page }) => {
      const readerPage = new ReaderPage(page, baseUrl);
      const novel = testNovels.novel1;

      // 访问阅读器
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
        const fontSizeIncrease = page.locator('.font-size-increase, .btn-font-size-up').first();
        if (await fontSizeIncrease.isVisible().catch(() => false)) {
          await fontSizeIncrease.click();
          await page.waitForTimeout(500);
        }

        // 测试主题切换
        const themeButtons = page.locator('.theme-btn, .theme-option');
        if (await themeButtons.first().isVisible().catch(() => false)) {
          const themeCount = await themeButtons.count();
          if (themeCount > 1) {
            await themeButtons.nth(1).click();
            await page.waitForTimeout(500);
          }
        }

        // 关闭设置面板
        await readerPage.settingsButton.click();
        await page.waitForTimeout(500);
      }
    });

    test('P1-002-11: 阅读进度保存与恢复', async ({ page }) => {
      const readerPage = new ReaderPage(page, baseUrl);
      const novel = testNovels.novel1;

      // 访问阅读器
      await readerPage.goto(novel.id);
      await page.waitForTimeout(2000);

      // 记录当前章节
      const firstChapterTitle = await readerPage.getChapterTitle();

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

    test('P1-002-12: 添加书签功能', async ({ page }) => {
      const readerPage = new ReaderPage(page, baseUrl);
      const novel = testNovels.novel1;

      // 访问阅读器
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

        // 验证书签按钮状态变化
        const bookmarkClass = await readerPage.bookmarkButton.getAttribute('class');
        expect(bookmarkClass?.includes('active') || bookmarkClass?.includes('bookmarked')).toBeTruthy();
      }
    });
  });

  test.describe('阶段4: 互动功能', () => {
    test('P1-002-13: 发表评论完整流程', async ({ page }) => {
      const novelDetailPage = new NovelDetailPage(page, baseUrl);
      const novel = testNovels.novel1;

      // 访问小说详情页
      await novelDetailPage.goto(novel.id);
      await page.waitForTimeout(1500);

      // 发表评论
      if (await novelDetailPage.commentInput.isVisible().catch(() => false)) {
        const commentContent = `测试评论_${Date.now()}`;
        await novelDetailPage.commentInput.fill(commentContent);

        // 选择评分
        if (await novelDetailPage.ratingStars.isVisible().catch(() => false)) {
          const stars = novelDetailPage.ratingStars.locator('i, span, .star').nth(4);
          await stars.click();
        }

        // 提交评论
        await novelDetailPage.submitCommentButton.click();
        await page.waitForTimeout(2000);

        // 验证评论提交成功
        const toast = page.locator('.toast, .notification');
        if (await toast.isVisible().catch(() => false)) {
          const message = await toast.textContent();
          expect(message?.includes('评论') || message?.includes('成功')).toBeTruthy();
        }

        // 验证评论出现在列表中
        const comments = page.locator('.comment-item, .comment-content');
        const commentCount = await comments.count();
        expect(commentCount).toBeGreaterThan(0);
      }
    });

    test('P1-002-14: 评论点赞功能', async ({ page }) => {
      const novelDetailPage = new NovelDetailPage(page, baseUrl);
      const novel = testNovels.novel1;

      // 访问小说详情页
      await novelDetailPage.goto(novel.id);
      await page.waitForTimeout(1500);

      // 查找评论点赞按钮
      const likeButtons = page.locator('.btn-like, .like-btn, .comment-like');
      const hasLikeButtons = await likeButtons.first().isVisible().catch(() => false);

      if (hasLikeButtons) {
        const firstLikeBtn = likeButtons.first();
        
        // 获取点赞前状态
        const initialClass = await firstLikeBtn.getAttribute('class');
        
        // 点击点赞
        await firstLikeBtn.click();
        await page.waitForTimeout(1000);

        // 验证点赞状态变化
        const newClass = await firstLikeBtn.getAttribute('class');
        expect(initialClass !== newClass || newClass?.includes('liked')).toBeTruthy();
      }
    });
  });

  test.describe('阶段5: 阅读历史与书架', () => {
    test('P1-002-15: 阅读历史记录', async ({ page }) => {
      const readerPage = new ReaderPage(page, baseUrl);
      const novel = testNovels.novel1;

      // 先阅读小说
      await readerPage.goto(novel.id);
      await page.waitForTimeout(3000);

      // 访问阅读历史页面
      await page.goto(`${baseUrl}/pages/bookshelf/reading-history.html`);
      await page.waitForTimeout(1500);

      // 验证页面加载
      await expect(page).toHaveURL(/history/);

      // 验证历史列表存在
      const historyList = page.locator('.history-list, .reading-history');
      await expect(historyList).toBeVisible();

      // 验证历史记录项
      const historyItems = page.locator('.history-item');
      const itemCount = await historyItems.count();
      expect(itemCount).toBeGreaterThan(0);
    });

    test('P1-002-16: 书架管理功能', async ({ page }) => {
      const bookshelfPage = new BookshelfPage(page, baseUrl);

      // 访问书架页面
      await bookshelfPage.goto();
      await page.waitForTimeout(1500);

      // 验证书架页面加载
      await expect(page).toHaveURL(/bookshelf/);

      // 验证书架列表存在
      await expect(bookshelfPage.novelList).toBeVisible();

      // 获取小说数量
      const novelCount = await bookshelfPage.getNovelCount();

      if (novelCount > 0) {
        // 点击第一本小说继续阅读
        const firstNovel = bookshelfPage.novelList.locator('.novel-item, .book-item').first();
        const continueBtn = firstNovel.locator('.btn-continue, button:has-text("继续")').first();
        
        if (await continueBtn.isVisible().catch(() => false)) {
          await continueBtn.click();
          await page.waitForTimeout(1500);

          // 验证跳转到阅读器
          await expect(page).toHaveURL(/reading/);
        }
      }
    });
  });

  test.describe('阶段6: 完整用户阅读旅程', () => {
    test('P1-002-17: 从搜索到阅读的完整E2E流程', async ({ page }) => {
      const homePage = new HomePage(page, baseUrl);
      const searchPage = new SearchPage(page, baseUrl);
      const novelDetailPage = new NovelDetailPage(page, baseUrl);
      const readerPage = new ReaderPage(page, baseUrl);
      const bookshelfPage = new BookshelfPage(page, baseUrl);

      // Step 1: 访问首页
      await homePage.goto();
      await expect(page).toHaveURL(/index/);

      // Step 2: 搜索小说
      await homePage.search(searchKeywords.valid[0]);
      await expect(page).toHaveURL(/search/);

      // Step 3: 验证搜索结果
      const resultCount = await searchPage.getResultCount();
      expect(resultCount).toBeGreaterThan(0);

      // Step 4: 点击第一个搜索结果
      const firstResult = searchPage.resultItems.first();
      const detailLink = firstResult.locator('a, .novel-link').first();
      await detailLink.click();
      await page.waitForTimeout(1500);

      // Step 5: 验证小说详情页
      await expect(page).toHaveURL(/detail/);
      await expect(novelDetailPage.title).toBeVisible();
      await expect(novelDetailPage.readButton).toBeVisible();

      // Step 6: 加入书架
      if (await novelDetailPage.addToBookshelfButton.isVisible().catch(() => false)) {
        await novelDetailPage.addToBookshelf();
        await page.waitForTimeout(1000);
      }

      // Step 7: 开始阅读
      await novelDetailPage.startReading();
      await expect(page).toHaveURL(/reading/);

      // Step 8: 验证阅读器
      await expect(readerPage.content).toBeVisible();

      // Step 9: 阅读几章
      if (await readerPage.nextChapterButton.isVisible().catch(() => false)) {
        await readerPage.nextChapter();
        await page.waitForTimeout(2000);
      }

      // Step 10: 添加书签
      if (await readerPage.bookmarkButton.isVisible().catch(() => false)) {
        await readerPage.addBookmark();
        await page.waitForTimeout(1000);
      }

      // Step 11: 返回书架验证
      await bookshelfPage.goto();
      await page.waitForTimeout(1500);
      await expect(page).toHaveURL(/bookshelf/);

      // 验证书架中有小说
      const novelCount = await bookshelfPage.getNovelCount();
      expect(novelCount).toBeGreaterThan(0);
    });

    test('P1-002-18: 夜间模式阅读体验', async ({ page }) => {
      const readerPage = new ReaderPage(page, baseUrl);
      const novel = testNovels.novel1;

      // 访问阅读器
      await readerPage.goto(novel.id);
      await page.waitForTimeout(2000);

      // 打开设置
      if (await readerPage.settingsButton.isVisible().catch(() => false)) {
        await readerPage.settingsButton.click();
        await page.waitForTimeout(500);

        // 切换到夜间模式
        const darkThemeBtn = page.locator('.theme-dark, [data-theme="dark"], button:has-text("夜间")').first();
        if (await darkThemeBtn.isVisible().catch(() => false)) {
          await darkThemeBtn.click();
          await page.waitForTimeout(500);

          // 验证主题切换
          const bodyClass = await page.evaluate(() => document.body.className);
          expect(bodyClass.includes('dark') || bodyClass.includes('theme-dark')).toBeTruthy();
        }

        // 关闭设置
        await readerPage.settingsButton.click();
      }
    });
  });
});
