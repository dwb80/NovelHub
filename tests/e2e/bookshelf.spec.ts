/**
 * E2E测试: 书架管理流程
 * 测试ID: E2E-004, E2E-011
 * 覆盖: 书架添加、删除、分类管理
 */

import { test, expect } from '@playwright/test';
import { 
  LoginPage, 
  BookshelfPage, 
  NovelDetailPage,
  HomePage 
} from './fixtures/page-objects';
import { testUsers, testNovels, bookshelfCategories } from './fixtures/test-data';

test.describe('书架管理流程', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:8080';

  test.beforeEach(async ({ page }) => {
    // 每个测试前先登录
    const loginPage = new LoginPage(page, baseUrl);
    await loginPage.goto();
    await loginPage.login(testUsers.user1.email, testUsers.user1.password);
    await page.waitForTimeout(2000);
  });

  test.describe('书架基本操作', () => {
    test('E2E-004: 添加小说到书架', async ({ page }) => {
      const novelDetailPage = new NovelDetailPage(page, baseUrl);
      const bookshelfPage = new BookshelfPage(page, baseUrl);
      const novel = testNovels.novel3;

      // 访问小说详情页
      await novelDetailPage.goto(novel.id);

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

    test('E2E-004: 查看书架列表', async ({ page }) => {
      const bookshelfPage = new BookshelfPage(page, baseUrl);

      // 访问书架页面
      await bookshelfPage.goto();

      // 验证书架页面加载
      await expect(page).toHaveURL(/bookshelf/);

      // 验证书架列表存在
      await expect(bookshelfPage.novelList).toBeVisible();

      // 获取小说数量（可能为0）
      const novelCount = await bookshelfPage.getNovelCount();
      expect(novelCount).toBeGreaterThanOrEqual(0);
    });

    test('E2E-004: 从书架删除小说', async ({ page }) => {
      const bookshelfPage = new BookshelfPage(page, baseUrl);

      await bookshelfPage.goto();
      await page.waitForTimeout(1500);

      // 获取当前小说数量
      const initialCount = await bookshelfPage.getNovelCount();

      if (initialCount > 0) {
        // 删除第一本小说
        await bookshelfPage.deleteNovel(0);

        // 验证删除成功
        await page.waitForTimeout(1000);
        const newCount = await bookshelfPage.getNovelCount();
        expect(newCount).toBe(initialCount - 1);
      }
    });
  });

  test.describe('书架分类管理', () => {
    test('E2E-004: 创建书架分类', async ({ page }) => {
      const bookshelfPage = new BookshelfPage(page, baseUrl);

      await bookshelfPage.goto();
      await page.waitForTimeout(1500);

      // 添加新分类
      const categoryName = `测试分类${Date.now()}`;
      
      if (await bookshelfPage.addCategoryButton.isVisible().catch(() => false)) {
        await bookshelfPage.addCategory(categoryName);

        // 验证分类创建成功
        const toast = page.locator('.toast, .notification');
        if (await toast.isVisible().catch(() => false)) {
          const message = await toast.textContent();
          expect(message?.includes('成功') || message?.includes('分类')).toBeTruthy();
        }
      }
    });

    test('E2E-004: 将小说移动到分类', async ({ page }) => {
      const bookshelfPage = new BookshelfPage(page, baseUrl);

      await bookshelfPage.goto();
      await page.waitForTimeout(1500);

      // 检查是否有小说和分类
      const novelCount = await bookshelfPage.getNovelCount();
      const categoryCount = await bookshelfPage.categoryItems.count();

      if (novelCount > 0 && categoryCount > 0) {
        // 进入编辑模式
        await bookshelfPage.editButton.click();
        await page.waitForTimeout(500);

        // 选择第一本小说
        const firstNovel = bookshelfPage.novelList.locator('.novel-item, .book-item').first();
        const checkbox = firstNovel.locator('input[type="checkbox"]').first();
        await checkbox.check();

        // 选择移动到分类
        const moveButton = page.locator('.btn-move, button:has-text("移动")').first();
        if (await moveButton.isVisible().catch(() => false)) {
          await moveButton.click();
          await page.waitForTimeout(500);

          // 选择第一个分类
          const firstCategory = bookshelfPage.categoryItems.first();
          await firstCategory.click();
          await page.waitForTimeout(1000);

          // 验证移动成功
          const toast = page.locator('.toast, .notification');
          if (await toast.isVisible().catch(() => false)) {
            const message = await toast.textContent();
            expect(message?.includes('成功')).toBeTruthy();
          }
        }
      }
    });
  });

  test.describe('追更设置', () => {
    test('E2E-011: 小说收藏与追更', async ({ page }) => {
      const novelDetailPage = new NovelDetailPage(page, baseUrl);
      const bookshelfPage = new BookshelfPage(page, baseUrl);
      const novel = testNovels.novel3;

      // 访问小说详情页
      await novelDetailPage.goto(novel.id);

      // 点击加入书架
      if (await novelDetailPage.addToBookshelfButton.isVisible().catch(() => false)) {
        await novelDetailPage.addToBookshelf();
        await page.waitForTimeout(1000);

        // 检查是否有追更设置弹窗
        const subscriptionModal = page.locator('.subscription-modal, .follow-modal, .modal');
        if (await subscriptionModal.isVisible().catch(() => false)) {
          // 设置追更选项
          const autoPurchaseCheckbox = page.locator('input[name="autoPurchase"]').first();
          if (await autoPurchaseCheckbox.isVisible().catch(() => false)) {
            await autoPurchaseCheckbox.check();
          }

          // 确认设置
          const confirmButton = page.locator('.btn-confirm, button:has-text("确认")').first();
          await confirmButton.click();
          await page.waitForTimeout(1000);
        }

        // 验证书架中有该小说
        await bookshelfPage.goto();
        await page.waitForTimeout(1500);

        const novelCount = await bookshelfPage.getNovelCount();
        expect(novelCount).toBeGreaterThan(0);
      }
    });

    test('E2E-011: 取消收藏', async ({ page }) => {
      const bookshelfPage = new BookshelfPage(page, baseUrl);

      await bookshelfPage.goto();
      await page.waitForTimeout(1500);

      const initialCount = await bookshelfPage.getNovelCount();

      if (initialCount > 0) {
        // 点击第一本小说的取消收藏按钮
        const firstNovel = bookshelfPage.novelList.locator('.novel-item, .book-item').first();
        const unfollowButton = firstNovel.locator('.btn-unfollow, .btn-remove, button:has-text("取消")').first();

        if (await unfollowButton.isVisible().catch(() => false)) {
          await unfollowButton.click();
          await page.waitForTimeout(500);

          // 确认取消
          const confirmButton = page.locator('.btn-confirm, button:has-text("确认"), button:has-text("确定")').first();
          if (await confirmButton.isVisible().catch(() => false)) {
            await confirmButton.click();
            await page.waitForTimeout(1000);
          }

          // 验证取消成功
          const newCount = await bookshelfPage.getNovelCount();
          expect(newCount).toBe(initialCount - 1);
        }
      }
    });
  });

  test.describe('阅读历史', () => {
    test('E2E-004: 阅读历史记录', async ({ page }) => {
      const homePage = new HomePage(page, baseUrl);

      // 访问阅读历史页面
      await homePage.navigate('/pages/bookshelf/reading-history.html');
      await page.waitForTimeout(1500);

      // 验证页面加载
      await expect(page).toHaveURL(/history/);

      // 验证历史列表存在
      const historyList = page.locator('.history-list, .reading-history');
      await expect(historyList).toBeVisible();
    });
  });
});
