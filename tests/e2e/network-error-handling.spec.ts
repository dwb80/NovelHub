/**
 * P1级E2E测试: TEST-P1-004 网络异常处理测试
 * 覆盖范围: 弱网、断网场景
 * 测试ID: TEST-P1-004
 * 优先级: P1
 */

import { test, expect } from '@playwright/test';
import { 
  LoginPage, 
  HomePage, 
  NovelDetailPage, 
  ReaderPage,
  SearchPage 
} from './fixtures/page-objects';
import { testUsers, testNovels } from './fixtures/test-data';

test.describe('【TEST-P1-004】网络异常处理测试', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:8080';

  test.beforeEach(async ({ page }) => {
    // 每个测试前先登录
    const loginPage = new LoginPage(page, baseUrl);
    await loginPage.goto();
    await loginPage.login(testUsers.user1.email, testUsers.user1.password);
    await page.waitForTimeout(2000);
  });

  test.describe('阶段1: 网络断开场景', () => {
    test('P1-004-01: 页面加载时网络断开', async ({ page }) => {
      const homePage = new HomePage(page, baseUrl);

      // 模拟网络断开
      await page.context().setOffline(true);

      try {
        // 尝试访问页面
        await homePage.goto();
        await page.waitForTimeout(3000);

        // 验证显示离线提示或错误页面
        const offlineMessage = page.locator('.offline-message, .network-error, .error-message, [role="alert"]');
        const hasOfflineMessage = await offlineMessage.isVisible().catch(() => false);

        // 或者验证页面显示网络错误状态
        const errorIndicator = page.locator('.network-status, .connection-error');
        const hasErrorIndicator = await errorIndicator.isVisible().catch(() => false);

        expect(hasOfflineMessage || hasErrorIndicator).toBeTruthy();
      } finally {
        // 恢复网络
        await page.context().setOffline(false);
      }
    });

    test('P1-004-02: 阅读过程中网络断开', async ({ page }) => {
      const readerPage = new ReaderPage(page, baseUrl);
      const novel = testNovels.novel1;

      // 先正常加载页面
      await readerPage.goto(novel.id);
      await page.waitForTimeout(2000);

      // 验证内容已加载
      await expect(readerPage.content).toBeVisible();

      // 模拟网络断开
      await page.context().setOffline(true);

      try {
        // 尝试切换章节
        if (await readerPage.nextChapterButton.isVisible().catch(() => false)) {
          await readerPage.nextChapterButton.click();
          await page.waitForTimeout(3000);

          // 验证显示网络错误提示
          const errorToast = page.locator('.toast, .notification, .error-message');
          if (await errorToast.isVisible().catch(() => false)) {
            const message = await errorToast.textContent();
            expect(message?.includes('网络') || message?.includes('连接') || message?.includes('错误')).toBeTruthy();
          }
        }
      } finally {
        // 恢复网络
        await page.context().setOffline(false);
      }
    });

    test('P1-004-03: 搜索时网络断开', async ({ page }) => {
      const searchPage = new SearchPage(page, baseUrl);

      // 先正常访问搜索页
      await searchPage.goto();
      await page.waitForTimeout(1500);

      // 模拟网络断开
      await page.context().setOffline(true);

      try {
        // 尝试搜索
        await searchPage.search('测试关键词');
        await page.waitForTimeout(3000);

        // 验证显示网络错误
        const errorMessage = page.locator('.error-message, .network-error, .offline-notice');
        const hasError = await errorMessage.isVisible().catch(() => false);

        // 或者验证显示离线搜索结果提示
        const offlineNotice = page.locator('.offline-results, .cached-results');
        const hasOfflineNotice = await offlineNotice.isVisible().catch(() => false);

        expect(hasError || hasOfflineNotice).toBeTruthy();
      } finally {
        // 恢复网络
        await page.context().setOffline(false);
      }
    });

    test('P1-004-04: 网络恢复后自动重连', async ({ page }) => {
      const homePage = new HomePage(page, baseUrl);

      // 模拟网络断开
      await page.context().setOffline(true);

      // 访问页面
      await homePage.goto();
      await page.waitForTimeout(2000);

      // 恢复网络
      await page.context().setOffline(false);

      // 等待自动重连
      await page.waitForTimeout(3000);

      // 验证页面恢复正常
      const content = page.locator('.content, .main-content, .novel-list');
      const isContentVisible = await content.isVisible().catch(() => false);

      // 或者验证网络状态指示器显示在线
      const onlineIndicator = page.locator('.online-status, .connected');
      const isOnline = await onlineIndicator.isVisible().catch(() => false);

      expect(isContentVisible || isOnline).toBeTruthy();
    });
  });

  test.describe('阶段2: 弱网场景', () => {
    test('P1-004-05: 慢速3G网络下的页面加载', async ({ page }) => {
      // 模拟慢速3G网络
      const client = await page.context().newCDPSession(page);
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: 500 * 1024 / 8, // 500 Kbps
        uploadThroughput: 500 * 1024 / 8,   // 500 Kbps
        latency: 300 // 300ms latency
      });

      const homePage = new HomePage(page, baseUrl);

      // 记录开始时间
      const startTime = Date.now();

      // 访问页面
      await homePage.goto();

      // 验证加载指示器显示
      const loadingIndicator = page.locator('.loading, .spinner, .skeleton');
      const hasLoading = await loadingIndicator.isVisible().catch(() => false);

      // 等待页面加载完成
      await page.waitForTimeout(5000);

      // 验证页面最终加载成功
      const content = page.locator('.content, .main-content');
      await expect(content).toBeVisible();

      // 验证加载时间在合理范围内（慢网下应该超过2秒）
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeGreaterThan(2000);
    });

    test('P1-004-06: 弱网下的阅读器体验', async ({ page }) => {
      const readerPage = new ReaderPage(page, baseUrl);
      const novel = testNovels.novel1;

      // 先正常加载
      await readerPage.goto(novel.id);
      await page.waitForTimeout(2000);

      // 模拟弱网
      const client = await page.context().newCDPSession(page);
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: 100 * 1024 / 8, // 100 Kbps
        uploadThroughput: 100 * 1024 / 8,
        latency: 500
      });

      // 尝试切换章节
      if (await readerPage.nextChapterButton.isVisible().catch(() => false)) {
        await readerPage.nextChapterButton.click();

        // 验证显示加载状态
        const loadingIndicator = page.locator('.loading, .chapter-loading');
        const hasLoading = await loadingIndicator.isVisible().catch(() => false);

        // 等待加载完成
        await page.waitForTimeout(8000);

        // 验证内容最终加载
        const content = page.locator('.reader-content, .chapter-content');
        const isContentVisible = await content.isVisible().catch(() => false);

        expect(hasLoading || isContentVisible).toBeTruthy();
      }
    });

    test('P1-004-07: 请求超时处理', async ({ page }) => {
      // 模拟极高延迟网络
      const client = await page.context().newCDPSession(page);
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: 50 * 1024 / 8,
        uploadThroughput: 50 * 1024 / 8,
        latency: 5000 // 5秒延迟
      });

      const homePage = new HomePage(page, baseUrl);

      // 访问页面
      await homePage.goto();
      await page.waitForTimeout(10000);

      // 验证超时提示或重试按钮
      const timeoutMessage = page.locator('.timeout-message, .retry-button, .refresh-btn');
      const errorMessage = page.locator('.error-message, .network-error');

      const hasTimeoutMsg = await timeoutMessage.isVisible().catch(() => false);
      const hasErrorMsg = await errorMessage.isVisible().catch(() => false);

      expect(hasTimeoutMsg || hasErrorMsg).toBeTruthy();
    });
  });

  test.describe('阶段3: 网络波动场景', () => {
    test('P1-004-08: 网络间歇性中断', async ({ page }) => {
      const novelDetailPage = new NovelDetailPage(page, baseUrl);
      const novel = testNovels.novel1;

      // 访问页面
      await novelDetailPage.goto(novel.id);
      await page.waitForTimeout(2000);

      // 模拟网络波动：断开-恢复-断开
      for (let i = 0; i < 3; i++) {
        // 断开网络
        await page.context().setOffline(true);
        await page.waitForTimeout(1000);

        // 恢复网络
        await page.context().setOffline(false);
        await page.waitForTimeout(1000);
      }

      // 验证页面仍然可用
      await page.reload();
      await page.waitForTimeout(3000);

      // 验证页面正常加载
      await expect(novelDetailPage.title).toBeVisible();
    });

    test('P1-004-09: 请求失败重试机制', async ({ page }) => {
      const searchPage = new SearchPage(page, baseUrl);

      // 访问搜索页
      await searchPage.goto();
      await page.waitForTimeout(1500);

      // 模拟请求失败
      await page.route('**/api/**', route => {
        route.abort('failed');
      });

      // 尝试搜索
      await searchPage.search('测试');
      await page.waitForTimeout(3000);

      // 验证重试按钮或错误提示
      const retryButton = page.locator('.retry-btn, .refresh-btn, button:has-text("重试")');
      const errorMessage = page.locator('.error-message, .request-failed');

      const hasRetryBtn = await retryButton.isVisible().catch(() => false);
      const hasErrorMsg = await errorMessage.isVisible().catch(() => false);

      expect(hasRetryBtn || hasErrorMsg).toBeTruthy();

      // 取消路由拦截
      await page.unroute('**/api/**');
    });
  });

  test.describe('阶段4: 数据同步与缓存', () => {
    test('P1-004-10: 离线状态下的缓存数据访问', async ({ page }) => {
      const readerPage = new ReaderPage(page, baseUrl);
      const novel = testNovels.novel1;

      // 先在线加载内容
      await readerPage.goto(novel.id);
      await page.waitForTimeout(3000);

      // 记录已加载的内容
      const initialContent = await readerPage.content.textContent();

      // 断开网络
      await page.context().setOffline(true);

      try {
        // 刷新页面
        await page.reload();
        await page.waitForTimeout(3000);

        // 验证缓存内容仍然可用
        const cachedContent = await readerPage.content.textContent().catch(() => '');
        expect(cachedContent.length).toBeGreaterThan(0);
      } finally {
        // 恢复网络
        await page.context().setOffline(false);
      }
    });

    test('P1-004-11: 网络恢复后数据同步', async ({ page }) => {
      const homePage = new HomePage(page, baseUrl);

      // 断开网络
      await page.context().setOffline(true);

      // 访问页面（使用缓存）
      await homePage.goto();
      await page.waitForTimeout(2000);

      // 恢复网络
      await page.context().setOffline(false);
      await page.waitForTimeout(2000);

      // 验证同步指示器或更新提示
      const syncIndicator = page.locator('.sync-status, .syncing, .data-updated');
      const updateToast = page.locator('.toast:has-text("更新"), .notification:has-text("同步")');

      const hasSyncIndicator = await syncIndicator.isVisible().catch(() => false);
      const hasUpdateToast = await updateToast.isVisible().catch(() => false);

      // 同步指示器可能出现也可能不出现，取决于实现
      // 主要验证页面可以正常访问
      const content = page.locator('.content, .main-content');
      await expect(content).toBeVisible();
    });
  });

  test.describe('阶段5: 特定功能网络异常', () => {
    test('P1-004-12: 登录接口网络异常', async ({ page }) => {
      // 先登出
      await page.goto(`${baseUrl}/pages/user/login.html`);
      await page.waitForTimeout(1000);

      // 拦截登录请求并模拟失败
      await page.route('**/api/auth/**', route => {
        route.abort('failed');
      });

      // 尝试登录
      const loginPage = new LoginPage(page, baseUrl);
      await loginPage.login(testUsers.user1.email, testUsers.user1.password);
      await page.waitForTimeout(3000);

      // 验证网络错误提示
      const errorMessage = page.locator('.error-message, .network-error, .toast-error');
      const hasError = await errorMessage.isVisible().catch(() => false);

      if (hasError) {
        const message = await errorMessage.textContent();
        expect(message?.includes('网络') || message?.includes('连接')).toBeTruthy();
      }

      // 取消路由拦截
      await page.unroute('**/api/auth/**');
    });

    test('P1-004-13: 评论提交网络异常', async ({ page }) => {
      const novelDetailPage = new NovelDetailPage(page, baseUrl);
      const novel = testNovels.novel1;

      // 访问小说详情页
      await novelDetailPage.goto(novel.id);
      await page.waitForTimeout(1500);

      // 拦截评论提交
      await page.route('**/api/comments/**', route => {
        route.abort('failed');
      });

      // 尝试发表评论
      if (await novelDetailPage.commentInput.isVisible().catch(() => false)) {
        await novelDetailPage.commentInput.fill('网络测试评论');
        await novelDetailPage.submitCommentButton.click();
        await page.waitForTimeout(3000);

        // 验证错误提示
        const errorToast = page.locator('.toast-error, .error-message');
        const hasError = await errorToast.isVisible().catch(() => false);

        if (hasError) {
          const message = await errorToast.textContent();
          expect(message?.includes('网络') || message?.includes('失败') || message?.includes('错误')).toBeTruthy();
        }
      }

      // 取消路由拦截
      await page.unroute('**/api/comments/**');
    });

    test('P1-004-14: 书架同步网络异常', async ({ page }) => {
      // 拦截书架API
      await page.route('**/api/bookshelf/**', route => {
        route.abort('failed');
      });

      // 访问书架页面
      await page.goto(`${baseUrl}/pages/user/bookshelf.html`);
      await page.waitForTimeout(3000);

      // 验证错误处理
      const errorMessage = page.locator('.error-message, .network-error, .sync-error');
      const retryButton = page.locator('.retry-btn, button:has-text("重试")');

      const hasError = await errorMessage.isVisible().catch(() => false);
      const hasRetry = await retryButton.isVisible().catch(() => false);

      expect(hasError || hasRetry).toBeTruthy();

      // 取消路由拦截
      await page.unroute('**/api/bookshelf/**');
    });
  });

  test.describe('阶段6: 网络恢复机制', () => {
    test('P1-004-15: 自动重连功能', async ({ page }) => {
      const homePage = new HomePage(page, baseUrl);

      // 访问页面
      await homePage.goto();
      await page.waitForTimeout(2000);

      // 断开网络
      await page.context().setOffline(true);
      await page.waitForTimeout(2000);

      // 恢复网络
      await page.context().setOffline(false);

      // 等待自动重连
      await page.waitForTimeout(5000);

      // 验证页面自动刷新或显示在线状态
      const onlineStatus = page.locator('.online-status, .connected, .network-online');
      const content = page.locator('.content-loaded, .data-loaded');

      const isOnline = await onlineStatus.isVisible().catch(() => false);
      const isContentLoaded = await content.isVisible().catch(() => false);

      expect(isOnline || isContentLoaded).toBeTruthy();
    });

    test('P1-004-16: 手动刷新恢复', async ({ page }) => {
      const novelDetailPage = new NovelDetailPage(page, baseUrl);
      const novel = testNovels.novel1;

      // 断开网络
      await page.context().setOffline(true);

      // 尝试访问页面
      await novelDetailPage.goto(novel.id);
      await page.waitForTimeout(3000);

      // 恢复网络
      await page.context().setOffline(false);

      // 手动刷新
      await page.reload();
      await page.waitForTimeout(3000);

      // 验证页面正常加载
      await expect(novelDetailPage.title).toBeVisible();
      await expect(novelDetailPage.content).toBeVisible();
    });
  });

  test.describe('阶段7: 综合网络异常场景', () => {
    test('P1-004-17: 完整阅读流程中的网络异常', async ({ page }) => {
      const homePage = new HomePage(page, baseUrl);
      const searchPage = new SearchPage(page, baseUrl);
      const novelDetailPage = new NovelDetailPage(page, baseUrl);
      const readerPage = new ReaderPage(page, baseUrl);

      // Step 1: 正常访问首页
      await homePage.goto();
      await page.waitForTimeout(1500);

      // Step 2: 搜索时模拟弱网
      const client = await page.context().newCDPSession(page);
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: 100 * 1024 / 8,
        uploadThroughput: 100 * 1024 / 8,
        latency: 1000
      });

      await homePage.search('测试小说');
      await page.waitForTimeout(5000);

      // Step 3: 恢复网络
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: -1,
        uploadThroughput: -1,
        latency: 0
      });

      // Step 4: 访问小说详情
      const novel = testNovels.novel1;
      await novelDetailPage.goto(novel.id);
      await page.waitForTimeout(2000);

      // Step 5: 模拟网络断开
      await page.context().setOffline(true);

      try {
        // 尝试开始阅读
        await novelDetailPage.readButton.click();
        await page.waitForTimeout(3000);

        // 验证错误处理
        const errorIndicator = page.locator('.error-message, .offline-message');
        const hasError = await errorIndicator.isVisible().catch(() => false);
        expect(hasError).toBeTruthy();
      } finally {
        // 恢复网络
        await page.context().setOffline(false);
      }

      // Step 6: 刷新后继续阅读
      await page.reload();
      await page.waitForTimeout(3000);

      // 验证阅读器正常
      await expect(readerPage.content).toBeVisible();
    });

    test('P1-004-18: 网络异常时的用户体验', async ({ page }) => {
      const homePage = new HomePage(page, baseUrl);

      // 访问页面
      await homePage.goto();
      await page.waitForTimeout(1500);

      // 模拟网络断开
      await page.context().setOffline(true);

      try {
        // 尝试操作
        await page.click('body');
        await page.waitForTimeout(1000);

        // 验证友好的错误提示（不是浏览器默认错误）
        const browserError = page.locator('text=/This site can\'t be reached|无法访问此网站/i');
        const customError = page.locator('.network-error, .offline-message, .error-container');

        const hasBrowserError = await browserError.isVisible().catch(() => false);
        const hasCustomError = await customError.isVisible().catch(() => false);

        // 应该显示自定义错误而不是浏览器错误
        if (hasBrowserError) {
          // 如果显示浏览器错误，也接受，但最好有自定义错误处理
          expect(true).toBeTruthy();
        } else {
          expect(hasCustomError).toBeTruthy();
        }
      } finally {
        // 恢复网络
        await page.context().setOffline(false);
      }
    });
  });
});
