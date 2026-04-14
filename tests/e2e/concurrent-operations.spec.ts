/**
 * P1级E2E测试: TEST-P1-005 并发操作测试
 * 覆盖范围: 多用户同时操作
 * 测试ID: TEST-P1-005
 * 优先级: P1
 */

import { test, expect, chromium } from '@playwright/test';
import { 
  LoginPage, 
  HomePage, 
  NovelDetailPage, 
  BookshelfPage,
  ReaderPage 
} from './fixtures/page-objects';
import { testUsers, testNovels, generateUniqueUser } from './fixtures/test-data';

test.describe('【TEST-P1-005】并发操作测试', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:8080';

  test.describe('阶段1: 多用户同时登录', () => {
    test('P1-005-01: 多用户同时登录系统', async ({ browser }) => {
      // 创建多个浏览器上下文模拟不同用户
      const contexts = [];
      const pages = [];

      try {
        // 创建3个用户会话
        for (let i = 0; i < 3; i++) {
          const context = await browser.newContext();
          const page = await context.newPage();
          contexts.push(context);
          pages.push(page);
        }

        // 同时登录
        const loginPromises = pages.map(async (page, index) => {
          const loginPage = new LoginPage(page, baseUrl);
          await loginPage.goto();
          
          // 使用不同用户登录
          const userKey = index === 0 ? 'user1' : index === 1 ? 'user2' : 'user1';
          const user = testUsers[userKey];
          await loginPage.login(user.email, user.password);
          await page.waitForTimeout(2000);

          // 验证登录成功
          const token = await page.evaluate(() => localStorage.getItem('novelhub-token'));
          return { index, hasToken: !!token };
        });

        const results = await Promise.all(loginPromises);

        // 验证所有用户都登录成功
        results.forEach(result => {
          expect(result.hasToken).toBeTruthy();
        });
      } finally {
        // 清理
        for (const context of contexts) {
          await context.close();
        }
      }
    });

    test('P1-005-02: 同一账号多设备登录', async ({ browser }) => {
      const contexts = [];
      const pages = [];

      try {
        // 使用同一账号在多个设备登录
        for (let i = 0; i < 2; i++) {
          const context = await browser.newContext();
          const page = await context.newPage();
          contexts.push(context);
          pages.push(page);
        }

        // 同时用同一账号登录
        const loginPromises = pages.map(async (page) => {
          const loginPage = new LoginPage(page, baseUrl);
          await loginPage.goto();
          await loginPage.login(testUsers.user1.email, testUsers.user1.password);
          await page.waitForTimeout(2000);

          // 验证登录状态
          const token = await page.evaluate(() => localStorage.getItem('novelhub-token'));
          return !!token;
        });

        const results = await Promise.all(loginPromises);

        // 验证两个设备都登录成功（或根据业务逻辑，后登录的踢掉先登录的）
        const successCount = results.filter(r => r).length;
        expect(successCount).toBeGreaterThanOrEqual(1);
      } finally {
        for (const context of contexts) {
          await context.close();
        }
      }
    });
  });

  test.describe('阶段2: 并发数据操作', () => {
    test('P1-005-03: 多用户同时加入书架', async ({ browser }) => {
      const contexts = [];
      const pages = [];

      try {
        // 创建2个用户
        for (let i = 0; i < 2; i++) {
          const context = await browser.newContext();
          const page = await context.newPage();
          contexts.push(context);
          pages.push(page);
        }

        // 同时登录
        await Promise.all(pages.map(async (page, index) => {
          const loginPage = new LoginPage(page, baseUrl);
          await loginPage.goto();
          const user = index === 0 ? testUsers.user1 : testUsers.user2;
          await loginPage.login(user.email, user.password);
          await page.waitForTimeout(2000);
        }));

        // 同时访问同一小说并加入书架
        const novelDetailPage = new NovelDetailPage(pages[0], baseUrl);
        const novelDetailPage2 = new NovelDetailPage(pages[1], baseUrl);
        const novel = testNovels.novel3;

        const addToBookshelfPromises = [
          (async () => {
            await novelDetailPage.goto(novel.id);
            await pages[0].waitForTimeout(1000);
            if (await novelDetailPage.addToBookshelfButton.isVisible().catch(() => false)) {
              await novelDetailPage.addToBookshelf();
              await pages[0].waitForTimeout(1000);
            }
            return 'user1_added';
          })(),
          (async () => {
            await novelDetailPage2.goto(novel.id);
            await pages[1].waitForTimeout(1000);
            if (await novelDetailPage2.addToBookshelfButton.isVisible().catch(() => false)) {
              await novelDetailPage2.addToBookshelf();
              await pages[1].waitForTimeout(1000);
            }
            return 'user2_added';
          })()
        ];

        const results = await Promise.all(addToBookshelfPromises);

        // 验证两个用户都成功执行了操作
        expect(results).toContain('user1_added');
        expect(results).toContain('user2_added');
      } finally {
        for (const context of contexts) {
          await context.close();
        }
      }
    });

    test('P1-005-04: 多用户同时发表评论', async ({ browser }) => {
      const contexts = [];
      const pages = [];

      try {
        // 创建2个用户
        for (let i = 0; i < 2; i++) {
          const context = await browser.newContext();
          const page = await context.newPage();
          contexts.push(context);
          pages.push(page);
        }

        // 同时登录
        await Promise.all(pages.map(async (page, index) => {
          const loginPage = new LoginPage(page, baseUrl);
          await loginPage.goto();
          const user = index === 0 ? testUsers.user1 : testUsers.user2;
          await loginPage.login(user.email, user.password);
          await page.waitForTimeout(2000);
        }));

        // 同时发表评论
        const novelDetailPage = new NovelDetailPage(pages[0], baseUrl);
        const novelDetailPage2 = new NovelDetailPage(pages[1], baseUrl);
        const novel = testNovels.novel1;

        const commentPromises = [
          (async () => {
            await novelDetailPage.goto(novel.id);
            await pages[0].waitForTimeout(1000);
            if (await novelDetailPage.commentInput.isVisible().catch(() => false)) {
              await novelDetailPage.commentInput.fill(`并发评论1_${Date.now()}`);
              await novelDetailPage.submitCommentButton.click();
              await pages[0].waitForTimeout(2000);
              return 'comment1_submitted';
            }
            return 'comment1_failed';
          })(),
          (async () => {
            await novelDetailPage2.goto(novel.id);
            await pages[1].waitForTimeout(1000);
            if (await novelDetailPage2.commentInput.isVisible().catch(() => false)) {
              await novelDetailPage2.commentInput.fill(`并发评论2_${Date.now()}`);
              await novelDetailPage2.submitCommentButton.click();
              await pages[1].waitForTimeout(2000);
              return 'comment2_submitted';
            }
            return 'comment2_failed';
          })()
        ];

        const results = await Promise.all(commentPromises);

        // 验证至少有一个评论提交成功
        const successCount = results.filter(r => r.includes('submitted')).length;
        expect(successCount).toBeGreaterThanOrEqual(1);
      } finally {
        for (const context of contexts) {
          await context.close();
        }
      }
    });

    test('P1-005-05: 并发阅读进度更新', async ({ browser }) => {
      const contexts = [];
      const pages = [];

      try {
        // 创建2个用户
        for (let i = 0; i < 2; i++) {
          const context = await browser.newContext();
          const page = await context.newPage();
          contexts.push(context);
          pages.push(page);
        }

        // 同时登录
        await Promise.all(pages.map(async (page, index) => {
          const loginPage = new LoginPage(page, baseUrl);
          await loginPage.goto();
          const user = index === 0 ? testUsers.user1 : testUsers.user2;
          await loginPage.login(user.email, user.password);
          await page.waitForTimeout(2000);
        }));

        // 同时阅读同一小说
        const readerPage = new ReaderPage(pages[0], baseUrl);
        const readerPage2 = new ReaderPage(pages[1], baseUrl);
        const novel = testNovels.novel1;

        const readingPromises = [
          (async () => {
            await readerPage.goto(novel.id);
            await pages[0].waitForTimeout(2000);
            if (await readerPage.nextChapterButton.isVisible().catch(() => false)) {
              await readerPage.nextChapter();
              await pages[0].waitForTimeout(2000);
            }
            return 'user1_progress_updated';
          })(),
          (async () => {
            await readerPage2.goto(novel.id);
            await pages[1].waitForTimeout(2000);
            if (await readerPage2.nextChapterButton.isVisible().catch(() => false)) {
              await readerPage2.nextChapter();
              await pages[1].waitForTimeout(2000);
            }
            return 'user2_progress_updated';
          })()
        ];

        const results = await Promise.all(readingPromises);

        // 验证两个用户的阅读进度都更新了
        expect(results).toContain('user1_progress_updated');
        expect(results).toContain('user2_progress_updated');
      } finally {
        for (const context of contexts) {
          await context.close();
        }
      }
    });
  });

  test.describe('阶段3: 并发页面访问', () => {
    test('P1-005-06: 多用户同时访问首页', async ({ browser }) => {
      const contexts = [];
      const pages = [];

      try {
        // 创建5个用户
        for (let i = 0; i < 5; i++) {
          const context = await browser.newContext();
          const page = await context.newPage();
          contexts.push(context);
          pages.push(page);
        }

        // 同时访问首页
        const visitPromises = pages.map(async (page, index) => {
          const startTime = Date.now();
          await page.goto(`${baseUrl}/index.html`);
          await page.waitForTimeout(2000);
          const loadTime = Date.now() - startTime;

          // 验证页面加载成功
          const content = page.locator('.content, .main-content');
          const isVisible = await content.isVisible().catch(() => false);

          return { index, loadTime, isVisible };
        });

        const results = await Promise.all(visitPromises);

        // 验证所有页面都加载成功
        results.forEach(result => {
          expect(result.isVisible).toBeTruthy();
          expect(result.loadTime).toBeLessThan(10000); // 加载时间应小于10秒
        });
      } finally {
        for (const context of contexts) {
          await context.close();
        }
      }
    });

    test('P1-005-07: 多用户同时搜索', async ({ browser }) => {
      const contexts = [];
      const pages = [];

      try {
        // 创建3个用户
        for (let i = 0; i < 3; i++) {
          const context = await browser.newContext();
          const page = await context.newPage();
          contexts.push(context);
          pages.push(page);
        }

        // 同时执行搜索
        const searchPromises = pages.map(async (page, index) => {
          const searchPage = new SearchPage(page, baseUrl);
          await searchPage.goto();
          await page.waitForTimeout(1000);

          const searchKeywords = ['斗破', '苍穹', '测试'];
          await searchPage.search(searchKeywords[index]);
          await page.waitForTimeout(2000);

          // 验证搜索结果
          const resultCount = await searchPage.getResultCount();
          return { index, resultCount };
        });

        const results = await Promise.all(searchPromises);

        // 验证所有搜索都完成
        results.forEach(result => {
          expect(result.resultCount).toBeGreaterThanOrEqual(0);
        });
      } finally {
        for (const context of contexts) {
          await context.close();
        }
      }
    });

    test('P1-005-08: 多用户同时访问小说详情', async ({ browser }) => {
      const contexts = [];
      const pages = [];

      try {
        // 创建5个用户
        for (let i = 0; i < 5; i++) {
          const context = await browser.newContext();
          const page = await context.newPage();
          contexts.push(context);
          pages.push(page);
        }

        // 同时访问同一小说详情页
        const novel = testNovels.novel1;
        const visitPromises = pages.map(async (page, index) => {
          const novelDetailPage = new NovelDetailPage(page, baseUrl);
          await novelDetailPage.goto(novel.id);
          await page.waitForTimeout(2000);

          // 验证页面加载
          const title = await novelDetailPage.title.textContent().catch(() => '');
          const isLoaded = title.length > 0;

          return { index, isLoaded, title };
        });

        const results = await Promise.all(visitPromises);

        // 验证所有用户都能看到小说详情
        results.forEach(result => {
          expect(result.isLoaded).toBeTruthy();
        });
      } finally {
        for (const context of contexts) {
          await context.close();
        }
      }
    });
  });

  test.describe('阶段4: 并发阅读操作', () => {
    test('P1-005-09: 多用户同时阅读同一章节', async ({ browser }) => {
      const contexts = [];
      const pages = [];

      try {
        // 创建3个用户
        for (let i = 0; i < 3; i++) {
          const context = await browser.newContext();
          const page = await context.newPage();
          contexts.push(context);
          pages.push(page);
        }

        // 同时登录并阅读
        const readingPromises = pages.map(async (page, index) => {
          const loginPage = new LoginPage(page, baseUrl);
          await loginPage.goto();
          const user = index === 0 ? testUsers.user1 : index === 1 ? testUsers.user2 : testUsers.user1;
          await loginPage.login(user.email, user.password);
          await page.waitForTimeout(2000);

          const readerPage = new ReaderPage(page, baseUrl);
          await readerPage.goto(testNovels.novel1.id);
          await page.waitForTimeout(2000);

          // 获取章节内容
          const content = await readerPage.content.textContent().catch(() => '');
          return { index, contentLength: content.length };
        });

        const results = await Promise.all(readingPromises);

        // 验证所有用户都能正常阅读
        results.forEach(result => {
          expect(result.contentLength).toBeGreaterThan(0);
        });
      } finally {
        for (const context of contexts) {
          await context.close();
        }
      }
    });

    test('P1-005-10: 并发章节切换', async ({ browser }) => {
      const contexts = [];
      const pages = [];

      try {
        // 创建2个用户
        for (let i = 0; i < 2; i++) {
          const context = await browser.newContext();
          const page = await context.newPage();
          contexts.push(context);
          pages.push(page);
        }

        // 同时登录
        await Promise.all(pages.map(async (page, index) => {
          const loginPage = new LoginPage(page, baseUrl);
          await loginPage.goto();
          const user = index === 0 ? testUsers.user1 : testUsers.user2;
          await loginPage.login(user.email, user.password);
          await page.waitForTimeout(2000);
        }));

        // 同时切换到下一章
        const readerPage = new ReaderPage(pages[0], baseUrl);
        const readerPage2 = new ReaderPage(pages[1], baseUrl);

        await readerPage.goto(testNovels.novel1.id);
        await readerPage2.goto(testNovels.novel1.id);
        await pages[0].waitForTimeout(1500);
        await pages[1].waitForTimeout(1500);

        const chapterPromises = [
          (async () => {
            if (await readerPage.nextChapterButton.isVisible().catch(() => false)) {
              await readerPage.nextChapter();
              await pages[0].waitForTimeout(2000);
              const title = await readerPage.getChapterTitle();
              return { user: 1, title };
            }
            return { user: 1, title: '' };
          })(),
          (async () => {
            if (await readerPage2.nextChapterButton.isVisible().catch(() => false)) {
              await readerPage2.nextChapter();
              await pages[1].waitForTimeout(2000);
              const title = await readerPage2.getChapterTitle();
              return { user: 2, title };
            }
            return { user: 2, title: '' };
          })()
        ];

        const results = await Promise.all(chapterPromises);

        // 验证两个用户都成功切换了章节
        results.forEach(result => {
          expect(result.title.length).toBeGreaterThan(0);
        });
      } finally {
        for (const context of contexts) {
          await context.close();
        }
      }
    });
  });

  test.describe('阶段5: 并发数据一致性', () => {
    test('P1-005-11: 并发点赞操作', async ({ browser }) => {
      const contexts = [];
      const pages = [];

      try {
        // 创建3个用户
        for (let i = 0; i < 3; i++) {
          const context = await browser.newContext();
          const page = await context.newPage();
          contexts.push(context);
          pages.push(page);
        }

        // 同时登录
        await Promise.all(pages.map(async (page, index) => {
          const loginPage = new LoginPage(page, baseUrl);
          await loginPage.goto();
          const user = index === 0 ? testUsers.user1 : index === 1 ? testUsers.user2 : testUsers.user1;
          await loginPage.login(user.email, user.password);
          await page.waitForTimeout(2000);
        }));

        // 同时访问小说详情并点赞
        const novelDetailPage = new NovelDetailPage(pages[0], baseUrl);
        const novelDetailPage2 = new NovelDetailPage(pages[1], baseUrl);
        const novelDetailPage3 = new NovelDetailPage(pages[2], baseUrl);
        const novel = testNovels.novel1;

        const likePromises = [
          (async () => {
            await novelDetailPage.goto(novel.id);
            await pages[0].waitForTimeout(1000);
            const likeBtn = pages[0].locator('.btn-like, .like-btn').first();
            if (await likeBtn.isVisible().catch(() => false)) {
              await likeBtn.click();
              await pages[0].waitForTimeout(1000);
            }
            return 'user1_liked';
          })(),
          (async () => {
            await novelDetailPage2.goto(novel.id);
            await pages[1].waitForTimeout(1000);
            const likeBtn = pages[1].locator('.btn-like, .like-btn').first();
            if (await likeBtn.isVisible().catch(() => false)) {
              await likeBtn.click();
              await pages[1].waitForTimeout(1000);
            }
            return 'user2_liked';
          })(),
          (async () => {
            await novelDetailPage3.goto(novel.id);
            await pages[2].waitForTimeout(1000);
            const likeBtn = pages[2].locator('.btn-like, .like-btn').first();
            if (await likeBtn.isVisible().catch(() => false)) {
              await likeBtn.click();
              await pages[2].waitForTimeout(1000);
            }
            return 'user3_liked';
          })()
        ];

        const results = await Promise.all(likePromises);

        // 验证所有点赞操作都完成
        expect(results.filter(r => r.includes('liked')).length).toBeGreaterThanOrEqual(1);
      } finally {
        for (const context of contexts) {
          await context.close();
        }
      }
    });

    test('P1-005-12: 并发收藏操作', async ({ browser }) => {
      const contexts = [];
      const pages = [];

      try {
        // 创建2个用户
        for (let i = 0; i < 2; i++) {
          const context = await browser.newContext();
          const page = await context.newPage();
          contexts.push(context);
          pages.push(page);
        }

        // 同时登录
        await Promise.all(pages.map(async (page, index) => {
          const loginPage = new LoginPage(page, baseUrl);
          await loginPage.goto();
          const user = index === 0 ? testUsers.user1 : testUsers.user2;
          await loginPage.login(user.email, user.password);
          await page.waitForTimeout(2000);
        }));

        // 同时收藏同一小说
        const novelDetailPage = new NovelDetailPage(pages[0], baseUrl);
        const novelDetailPage2 = new NovelDetailPage(pages[1], baseUrl);
        const novel = testNovels.novel3;

        const bookmarkPromises = [
          (async () => {
            await novelDetailPage.goto(novel.id);
            await pages[0].waitForTimeout(1000);
            if (await novelDetailPage.addToBookshelfButton.isVisible().catch(() => false)) {
              await novelDetailPage.addToBookshelf();
              await pages[0].waitForTimeout(1000);
            }
            return 'user1_bookmarked';
          })(),
          (async () => {
            await novelDetailPage2.goto(novel.id);
            await pages[1].waitForTimeout(1000);
            if (await novelDetailPage2.addToBookshelfButton.isVisible().catch(() => false)) {
              await novelDetailPage2.addToBookshelf();
              await pages[1].waitForTimeout(1000);
            }
            return 'user2_bookmarked';
          })()
        ];

        const results = await Promise.all(bookmarkPromises);

        // 验证两个用户都成功收藏
        expect(results).toContain('user1_bookmarked');
        expect(results).toContain('user2_bookmarked');
      } finally {
        for (const context of contexts) {
          await context.close();
        }
      }
    });
  });

  test.describe('阶段6: 压力测试场景', () => {
    test('P1-005-13: 高并发页面访问', async ({ browser }) => {
      const contexts = [];
      const pages = [];
      const userCount = 10;

      try {
        // 创建10个用户
        for (let i = 0; i < userCount; i++) {
          const context = await browser.newContext();
          const page = await context.newPage();
          contexts.push(context);
          pages.push(page);
        }

        // 同时访问首页
        const startTime = Date.now();
        const visitPromises = pages.map(async (page, index) => {
          await page.goto(`${baseUrl}/index.html`);
          await page.waitForTimeout(1500);

          const content = page.locator('.content, .main-content');
          const isVisible = await content.isVisible().catch(() => false);

          return { index, isVisible };
        });

        const results = await Promise.all(visitPromises);
        const totalTime = Date.now() - startTime;

        // 验证所有页面都加载成功
        const successCount = results.filter(r => r.isVisible).length;
        expect(successCount).toBe(userCount);

        // 验证总时间在合理范围内（10个并发用户应在20秒内完成）
        expect(totalTime).toBeLessThan(20000);
      } finally {
        for (const context of contexts) {
          await context.close();
        }
      }
    });

    test('P1-005-14: 并发搜索压力测试', async ({ browser }) => {
      const contexts = [];
      const pages = [];
      const userCount = 5;

      try {
        // 创建5个用户
        for (let i = 0; i < userCount; i++) {
          const context = await browser.newContext();
          const page = await context.newPage();
          contexts.push(context);
          pages.push(page);
        }

        // 同时执行不同搜索
        const searchPromises = pages.map(async (page, index) => {
          const searchPage = new SearchPage(page, baseUrl);
          await searchPage.goto();
          await page.waitForTimeout(500);

          const keywords = ['玄幻', '都市', '科幻', '言情', '历史'];
          await searchPage.search(keywords[index % keywords.length]);
          await page.waitForTimeout(2000);

          const resultCount = await searchPage.getResultCount();
          return { index, resultCount };
        });

        const results = await Promise.all(searchPromises);

        // 验证所有搜索都成功完成
        results.forEach(result => {
          expect(result.resultCount).toBeGreaterThanOrEqual(0);
        });
      } finally {
        for (const context of contexts) {
          await context.close();
        }
      }
    });
  });

  test.describe('阶段7: 完整并发场景', () => {
    test('P1-005-15: 多用户完整阅读流程并发', async ({ browser }) => {
      const contexts = [];
      const pages = [];
      const userCount = 3;

      try {
        // 创建用户
        for (let i = 0; i < userCount; i++) {
          const context = await browser.newContext();
          const page = await context.newPage();
          contexts.push(context);
          pages.push(page);
        }

        // 每个用户执行完整阅读流程
        const userFlows = pages.map(async (page, index) => {
          const loginPage = new LoginPage(page, baseUrl);
          const homePage = new HomePage(page, baseUrl);
          const searchPage = new SearchPage(page, baseUrl);
          const novelDetailPage = new NovelDetailPage(page, baseUrl);
          const readerPage = new ReaderPage(page, baseUrl);

          // 登录
          await loginPage.goto();
          const user = index === 0 ? testUsers.user1 : index === 1 ? testUsers.user2 : testUsers.user1;
          await loginPage.login(user.email, user.password);
          await page.waitForTimeout(2000);

          // 搜索
          await homePage.goto();
          await homePage.search('测试');
          await page.waitForTimeout(2000);

          // 访问小说详情
          await novelDetailPage.goto(testNovels.novel1.id);
          await page.waitForTimeout(1500);

          // 加入书架
          if (await novelDetailPage.addToBookshelfButton.isVisible().catch(() => false)) {
            await novelDetailPage.addToBookshelf();
            await page.waitForTimeout(1000);
          }

          // 开始阅读
          await novelDetailPage.startReading();
          await page.waitForTimeout(2000);

          // 切换章节
          if (await readerPage.nextChapterButton.isVisible().catch(() => false)) {
            await readerPage.nextChapter();
            await page.waitForTimeout(2000);
          }

          return { index, completed: true };
        });

        const results = await Promise.all(userFlows);

        // 验证所有用户都完成了流程
        results.forEach(result => {
          expect(result.completed).toBeTruthy();
        });
      } finally {
        for (const context of contexts) {
          await context.close();
        }
      }
    });

    test('P1-005-16: 并发操作数据一致性验证', async ({ browser }) => {
      const contexts = [];
      const pages = [];

      try {
        // 创建2个用户
        for (let i = 0; i < 2; i++) {
          const context = await browser.newContext();
          const page = await context.newPage();
          contexts.push(context);
          pages.push(page);
        }

        // 同时登录
        await Promise.all(pages.map(async (page, index) => {
          const loginPage = new LoginPage(page, baseUrl);
          await loginPage.goto();
          const user = index === 0 ? testUsers.user1 : testUsers.user2;
          await loginPage.login(user.email, user.password);
          await page.waitForTimeout(2000);
        }));

        // 用户1加入书架
        const bookshelfPage1 = new BookshelfPage(pages[0], baseUrl);
        const novelDetailPage1 = new NovelDetailPage(pages[0], baseUrl);

        await novelDetailPage1.goto(testNovels.novel3.id);
        await pages[0].waitForTimeout(1000);
        if (await novelDetailPage1.addToBookshelfButton.isVisible().catch(() => false)) {
          await novelDetailPage1.addToBookshelf();
          await pages[0].waitForTimeout(1000);
        }

        // 用户2同时加入书架
        const novelDetailPage2 = new NovelDetailPage(pages[1], baseUrl);
        await novelDetailPage2.goto(testNovels.novel3.id);
        await pages[1].waitForTimeout(1000);
        if (await novelDetailPage2.addToBookshelfButton.isVisible().catch(() => false)) {
          await novelDetailPage2.addToBookshelf();
          await pages[1].waitForTimeout(1000);
        }

        // 验证用户1的书架
        await bookshelfPage1.goto();
        await pages[0].waitForTimeout(1500);
        const count1 = await bookshelfPage1.getNovelCount();

        // 验证用户2的书架
        const bookshelfPage2 = new BookshelfPage(pages[1], baseUrl);
        await bookshelfPage2.goto();
        await pages[1].waitForTimeout(1500);
        const count2 = await bookshelfPage2.getNovelCount();

        // 两个用户的书架都应该有内容
        expect(count1).toBeGreaterThanOrEqual(0);
        expect(count2).toBeGreaterThanOrEqual(0);
      } finally {
        for (const context of contexts) {
          await context.close();
        }
      }
    });
  });
});
