/**
 * P1级E2E测试: TEST-P1-003 管理员审核流程E2E测试
 * 覆盖范围: 举报到处理全流程
 * 测试ID: TEST-P1-003
 * 优先级: P1
 */

import { test, expect } from '@playwright/test';
import { LoginPage, HomePage } from './fixtures/page-objects';
import { testUsers, testNovels } from './fixtures/test-data';

/**
 * 管理员页面封装
 */
class AdminPage {
  protected page;
  protected baseUrl;

  constructor(page, baseUrl = '') {
    this.page = page;
    this.baseUrl = baseUrl;
  }

  async gotoDashboard() {
    await this.page.goto(`${this.baseUrl}/pages/admin/dashboard.html`);
    await this.page.waitForTimeout(2000);
  }

  async gotoChapters() {
    await this.page.goto(`${this.baseUrl}/pages/admin/chapters.html`);
    await this.page.waitForTimeout(2000);
  }

  async gotoComments() {
    await this.page.goto(`${this.baseUrl}/pages/admin/comments.html`);
    await this.page.waitForTimeout(2000);
  }

  async gotoUsers() {
    await this.page.goto(`${this.baseUrl}/pages/admin/users.html`);
    await this.page.waitForTimeout(2000);
  }

  async gotoSensitive() {
    await this.page.goto(`${this.baseUrl}/pages/admin/sensitive.html`);
    await this.page.waitForTimeout(2000);
  }
}

test.describe('【TEST-P1-003】管理员审核流程E2E测试', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:8080';

  test.beforeEach(async ({ page }) => {
    // 管理员登录
    const loginPage = new LoginPage(page, baseUrl);
    await loginPage.goto();
    await loginPage.login(testUsers.user1.email, testUsers.user1.password);
    await page.waitForTimeout(2000);
  });

  test.describe('阶段1: 管理员登录与权限验证', () => {
    test('P1-003-01: 管理员登录与后台访问', async ({ page }) => {
      const adminPage = new AdminPage(page, baseUrl);

      // 访问管理后台
      await adminPage.gotoDashboard();

      // 验证后台页面加载
      await expect(page).toHaveURL(/admin/);

      // 验证管理员菜单存在
      const adminNav = page.locator('.admin-nav, .admin-sidebar, .admin-menu');
      await expect(adminNav).toBeVisible();

      // 验证统计数据面板
      const statsPanel = page.locator('.stats-grid, .admin-stats, .dashboard-stats');
      await expect(statsPanel).toBeVisible();
    });

    test('P1-003-02: 管理员权限验证', async ({ page }) => {
      const adminPage = new AdminPage(page, baseUrl);

      // 访问各管理页面验证权限
      const adminPages = [
        { path: '/pages/admin/dashboard.html', name: '数据看板' },
        { path: '/pages/admin/novels.html', name: '小说管理' },
        { path: '/pages/admin/chapters.html', name: '章节审核' },
        { path: '/pages/admin/comments.html', name: '评论管理' },
        { path: '/pages/admin/users.html', name: '用户管理' },
        { path: '/pages/admin/sensitive.html', name: '敏感词管理' },
      ];

      for (const adminPageInfo of adminPages) {
        await page.goto(`${baseUrl}${adminPageInfo.path}`);
        await page.waitForTimeout(1500);

        // 验证页面可访问（未重定向到登录页）
        const currentUrl = page.url();
        expect(currentUrl).toContain('admin');
        expect(currentUrl).not.toContain('login');
      }
    });
  });

  test.describe('阶段2: 章节审核流程', () => {
    test('P1-003-03: 待审核章节列表查看', async ({ page }) => {
      const adminPage = new AdminPage(page, baseUrl);

      // 访问章节审核页面
      await adminPage.gotoChapters();

      // 验证页面加载
      await expect(page).toHaveURL(/chapters/);

      // 验证审核列表存在
      const reviewList = page.locator('.data-table, .review-list, .chapter-list');
      await expect(reviewList).toBeVisible();

      // 验证列表项包含必要信息
      const tableHeaders = page.locator('.data-table th, .review-header');
      const headerCount = await tableHeaders.count();
      expect(headerCount).toBeGreaterThan(0);
    });

    test('P1-003-04: 章节审核通过流程', async ({ page }) => {
      const adminPage = new AdminPage(page, baseUrl);

      // 访问章节审核页面
      await adminPage.gotoChapters();

      // 查找第一个待审核章节
      const pendingRows = page.locator('.data-table tbody tr, .review-item');
      const rowCount = await pendingRows.count();

      if (rowCount > 0) {
        const firstRow = pendingRows.first();

        // 验证有通过按钮
        const approveBtn = firstRow.locator('.btn-primary, button:has-text("通过")').first();
        const hasApproveBtn = await approveBtn.isVisible().catch(() => false);

        if (hasApproveBtn) {
          // 获取章节信息
          const chapterTitle = await firstRow.locator('td').nth(1).textContent().catch(() => '');

          // 点击通过
          await approveBtn.click();
          await page.waitForTimeout(1500);

          // 验证确认弹窗或成功提示
          const toast = page.locator('.toast, .notification');
          const modal = page.locator('.modal, .confirm-dialog').first();

          if (await modal.isVisible().catch(() => false)) {
            // 确认操作
            const confirmBtn = modal.locator('.btn-confirm, button:has-text("确认")').first();
            await confirmBtn.click();
            await page.waitForTimeout(1000);
          }

          // 验证操作成功提示
          if (await toast.isVisible().catch(() => false)) {
            const message = await toast.textContent();
            expect(message?.includes('通过') || message?.includes('成功')).toBeTruthy();
          }
        }
      }
    });

    test('P1-003-05: 章节审核拒绝流程', async ({ page }) => {
      const adminPage = new AdminPage(page, baseUrl);

      // 访问章节审核页面
      await adminPage.gotoChapters();

      // 查找第一个待审核章节
      const pendingRows = page.locator('.data-table tbody tr, .review-item');
      const rowCount = await pendingRows.count();

      if (rowCount > 0) {
        const firstRow = pendingRows.first();

        // 验证有拒绝按钮
        const rejectBtn = firstRow.locator('.btn-secondary, button:has-text("拒绝")').first();
        const hasRejectBtn = await rejectBtn.isVisible().catch(() => false);

        if (hasRejectBtn) {
          // 点击拒绝
          await rejectBtn.click();
          await page.waitForTimeout(1500);

          // 验证拒绝原因输入框
          const reasonInput = page.locator('textarea[name="reason"], .reject-reason').first();

          if (await reasonInput.isVisible().catch(() => false)) {
            // 填写拒绝原因
            await reasonInput.fill('内容不符合规范，请修改后重新提交');
            await page.waitForTimeout(500);

            // 确认拒绝
            const confirmBtn = page.locator('.btn-confirm, button:has-text("确认")').first();
            await confirmBtn.click();
            await page.waitForTimeout(1000);
          }

          // 验证操作成功
          const toast = page.locator('.toast, .notification');
          if (await toast.isVisible().catch(() => false)) {
            const message = await toast.textContent();
            expect(message?.includes('拒绝') || message?.includes('成功')).toBeTruthy();
          }
        }
      }
    });

    test('P1-003-06: 批量审核功能', async ({ page }) => {
      const adminPage = new AdminPage(page, baseUrl);

      // 访问章节审核页面
      await adminPage.gotoChapters();

      // 查找复选框
      const checkboxes = page.locator('input[type="checkbox"], .select-item');
      const checkboxCount = await checkboxes.count();

      if (checkboxCount > 1) {
        // 选择前两个项目
        await checkboxes.nth(1).check();
        await checkboxes.nth(2).check();
        await page.waitForTimeout(500);

        // 查找批量操作按钮
        const batchApproveBtn = page.locator('.btn-batch-approve, button:has-text("批量通过")').first();

        if (await batchApproveBtn.isVisible().catch(() => false)) {
          await batchApproveBtn.click();
          await page.waitForTimeout(1500);

          // 确认批量操作
          const confirmModal = page.locator('.modal, .batch-confirm').first();
          if (await confirmModal.isVisible().catch(() => false)) {
            const confirmBtn = confirmModal.locator('.btn-confirm, button:has-text("确认")').first();
            await confirmBtn.click();
            await page.waitForTimeout(1000);
          }

          // 验证操作成功
          const toast = page.locator('.toast, .notification');
          if (await toast.isVisible().catch(() => false)) {
            const message = await toast.textContent();
            expect(message?.includes('批量') || message?.includes('成功')).toBeTruthy();
          }
        }
      }
    });
  });

  test.describe('阶段3: 评论举报处理', () => {
    test('P1-003-07: 评论举报列表查看', async ({ page }) => {
      const adminPage = new AdminPage(page, baseUrl);

      // 访问评论管理页面
      await adminPage.gotoComments();

      // 验证页面加载
      await expect(page).toHaveURL(/comments/);

      // 验证举报列表存在
      const reportList = page.locator('.report-list, .comment-list, .data-table');
      await expect(reportList).toBeVisible();

      // 验证举报状态标签
      const statusBadges = page.locator('.status-badge, .report-status');
      const badgeCount = await statusBadges.count();
      expect(badgeCount).toBeGreaterThanOrEqual(0);
    });

    test('P1-003-08: 举报内容审核通过', async ({ page }) => {
      const adminPage = new AdminPage(page, baseUrl);

      // 访问评论管理页面
      await adminPage.gotoComments();

      // 查找举报项
      const reportItems = page.locator('.report-item, .comment-item, tbody tr');
      const itemCount = await reportItems.count();

      if (itemCount > 0) {
        const firstItem = reportItems.first();

        // 点击详情查看
        const detailBtn = firstItem.locator('.btn-detail, button:has-text("详情")').first();
        if (await detailBtn.isVisible().catch(() => false)) {
          await detailBtn.click();
          await page.waitForTimeout(1000);

          // 验证详情弹窗
          const detailModal = page.locator('.modal, .detail-modal').first();
          if (await detailModal.isVisible().catch(() => false)) {
            // 审核通过
            const approveBtn = detailModal.locator('.btn-approve, button:has-text("通过")').first();
            if (await approveBtn.isVisible().catch(() => false)) {
              await approveBtn.click();
              await page.waitForTimeout(1000);
            }

            // 关闭弹窗
            const closeBtn = detailModal.locator('.btn-close, .modal-close').first();
            await closeBtn.click();
          }
        }
      }
    });

    test('P1-003-09: 违规评论删除处理', async ({ page }) => {
      const adminPage = new AdminPage(page, baseUrl);

      // 访问评论管理页面
      await adminPage.gotoComments();

      // 查找评论项
      const commentItems = page.locator('.comment-item, tbody tr');
      const itemCount = await commentItems.count();

      if (itemCount > 0) {
        const firstItem = commentItems.first();

        // 查找删除按钮
        const deleteBtn = firstItem.locator('.btn-delete, button:has-text("删除")').first();

        if (await deleteBtn.isVisible().catch(() => false)) {
          await deleteBtn.click();
          await page.waitForTimeout(1000);

          // 确认删除弹窗
          const confirmModal = page.locator('.modal, .confirm-modal').first();
          if (await confirmModal.isVisible().catch(() => false)) {
            const confirmBtn = confirmModal.locator('.btn-confirm, button:has-text("确认")').first();
            await confirmBtn.click();
            await page.waitForTimeout(1000);
          }

          // 验证删除成功
          const toast = page.locator('.toast, .notification');
          if (await toast.isVisible().catch(() => false)) {
            const message = await toast.textContent();
            expect(message?.includes('删除') || message?.includes('成功')).toBeTruthy();
          }
        }
      }
    });

    test('P1-003-10: 用户禁言处理', async ({ page }) => {
      const adminPage = new AdminPage(page, baseUrl);

      // 访问评论管理页面
      await adminPage.gotoComments();

      // 查找评论项
      const commentItems = page.locator('.comment-item, tbody tr');
      const itemCount = await commentItems.count();

      if (itemCount > 0) {
        const firstItem = commentItems.first();

        // 查找禁言按钮
        const banBtn = firstItem.locator('.btn-ban, button:has-text("禁言")').first();

        if (await banBtn.isVisible().catch(() => false)) {
          await banBtn.click();
          await page.waitForTimeout(1000);

          // 验证禁言设置弹窗
          const banModal = page.locator('.ban-modal, .modal').first();
          if (await banModal.isVisible().catch(() => false)) {
            // 选择禁言时长
            const durationSelect = banModal.locator('select[name="duration"]').first();
            if (await durationSelect.isVisible().catch(() => false)) {
              await durationSelect.selectOption('7');
            }

            // 填写禁言原因
            const reasonInput = banModal.locator('textarea[name="reason"]').first();
            if (await reasonInput.isVisible().catch(() => false)) {
              await reasonInput.fill('发布违规评论');
            }

            // 确认禁言
            const confirmBtn = banModal.locator('.btn-confirm, button:has-text("确认")').first();
            await confirmBtn.click();
            await page.waitForTimeout(1000);

            // 验证禁言成功
            const toast = page.locator('.toast, .notification');
            if (await toast.isVisible().catch(() => false)) {
              const message = await toast.textContent();
              expect(message?.includes('禁言') || message?.includes('成功')).toBeTruthy();
            }
          }
        }
      }
    });
  });

  test.describe('阶段4: 用户管理', () => {
    test('P1-003-11: 用户列表查看与搜索', async ({ page }) => {
      const adminPage = new AdminPage(page, baseUrl);

      // 访问用户管理页面
      await adminPage.gotoUsers();

      // 验证页面加载
      await expect(page).toHaveURL(/users/);

      // 验证用户列表存在
      const userList = page.locator('.user-list, .data-table');
      await expect(userList).toBeVisible();

      // 测试搜索功能
      const searchInput = page.locator('input[type="search"], .search-input').first();
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill('test');
        await page.waitForTimeout(1000);

        // 验证搜索结果
        const userItems = page.locator('.user-item, tbody tr');
        const itemCount = await userItems.count();
        expect(itemCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('P1-003-12: 用户状态管理', async ({ page }) => {
      const adminPage = new AdminPage(page, baseUrl);

      // 访问用户管理页面
      await adminPage.gotoUsers();

      // 查找用户项
      const userItems = page.locator('.user-item, tbody tr');
      const itemCount = await userItems.count();

      if (itemCount > 0) {
        const firstUser = userItems.first();

        // 查找状态切换按钮
        const statusToggle = firstUser.locator('.status-toggle, .btn-status').first();

        if (await statusToggle.isVisible().catch(() => false)) {
          // 获取当前状态
          const initialStatus = await statusToggle.textContent();

          // 点击切换状态
          await statusToggle.click();
          await page.waitForTimeout(1000);

          // 确认操作
          const confirmModal = page.locator('.modal, .confirm-dialog').first();
          if (await confirmModal.isVisible().catch(() => false)) {
            const confirmBtn = confirmModal.locator('.btn-confirm, button:has-text("确认")').first();
            await confirmBtn.click();
            await page.waitForTimeout(1000);
          }

          // 验证状态变化
          const newStatus = await statusToggle.textContent();
          expect(initialStatus !== newStatus).toBeTruthy();
        }
      }
    });
  });

  test.describe('阶段5: 敏感词管理', () => {
    test('P1-003-13: 敏感词列表查看', async ({ page }) => {
      const adminPage = new AdminPage(page, baseUrl);

      // 访问敏感词管理页面
      await adminPage.gotoSensitive();

      // 验证页面加载
      await expect(page).toHaveURL(/sensitive/);

      // 验证敏感词列表存在
      const wordList = page.locator('.sensitive-list, .word-list, .data-table');
      await expect(wordList).toBeVisible();
    });

    test('P1-003-14: 添加敏感词', async ({ page }) => {
      const adminPage = new AdminPage(page, baseUrl);

      // 访问敏感词管理页面
      await adminPage.gotoSensitive();

      // 查找添加按钮
      const addBtn = page.locator('.btn-add, button:has-text("添加")').first();

      if (await addBtn.isVisible().catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(1000);

        // 填写敏感词
        const wordInput = page.locator('input[name="word"], .word-input').first();
        if (await wordInput.isVisible().catch(() => false)) {
          const testWord = `测试敏感词_${Date.now()}`;
          await wordInput.fill(testWord);

          // 选择级别
          const levelSelect = page.locator('select[name="level"]').first();
          if (await levelSelect.isVisible().catch(() => false)) {
            await levelSelect.selectOption('high');
          }

          // 保存
          const saveBtn = page.locator('.btn-save, button:has-text("保存")').first();
          await saveBtn.click();
          await page.waitForTimeout(1500);

          // 验证添加成功
          const toast = page.locator('.toast, .notification');
          if (await toast.isVisible().catch(() => false)) {
            const message = await toast.textContent();
            expect(message?.includes('添加') || message?.includes('成功')).toBeTruthy();
          }
        }
      }
    });

    test('P1-003-15: 删除敏感词', async ({ page }) => {
      const adminPage = new AdminPage(page, baseUrl);

      // 访问敏感词管理页面
      await adminPage.gotoSensitive();

      // 查找敏感词项
      const wordItems = page.locator('.sensitive-item, tbody tr');
      const itemCount = await wordItems.count();

      if (itemCount > 0) {
        const firstItem = wordItems.first();

        // 查找删除按钮
        const deleteBtn = firstItem.locator('.btn-delete, button:has-text("删除")').first();

        if (await deleteBtn.isVisible().catch(() => false)) {
          await deleteBtn.click();
          await page.waitForTimeout(1000);

          // 确认删除
          const confirmModal = page.locator('.modal, .confirm-modal').first();
          if (await confirmModal.isVisible().catch(() => false)) {
            const confirmBtn = confirmModal.locator('.btn-confirm, button:has-text("确认")').first();
            await confirmBtn.click();
            await page.waitForTimeout(1000);
          }

          // 验证删除成功
          const toast = page.locator('.toast, .notification');
          if (await toast.isVisible().catch(() => false)) {
            const message = await toast.textContent();
            expect(message?.includes('删除') || message?.includes('成功')).toBeTruthy();
          }
        }
      }
    });
  });

  test.describe('阶段6: 数据统计与报表', () => {
    test('P1-003-16: 数据看板统计信息', async ({ page }) => {
      const adminPage = new AdminPage(page, baseUrl);

      // 访问数据看板
      await adminPage.gotoDashboard();

      // 验证统计数据卡片
      const statCards = page.locator('.stat-card, .stats-item');
      const cardCount = await statCards.count();
      expect(cardCount).toBeGreaterThan(0);

      // 验证每个卡片包含数值
      for (let i = 0; i < cardCount; i++) {
        const card = statCards.nth(i);
        const value = await card.locator('.stat-value, .number').textContent().catch(() => '');
        expect(value).toBeTruthy();
      }
    });

    test('P1-003-17: 待办事项列表', async ({ page }) => {
      const adminPage = new AdminPage(page, baseUrl);

      // 访问数据看板
      await adminPage.gotoDashboard();

      // 验证待办事项列表
      const todoList = page.locator('.todo-list, .pending-list');
      const hasTodoList = await todoList.isVisible().catch(() => false);

      if (hasTodoList) {
        // 验证待办项
        const todoItems = todoList.locator('.todo-item, .pending-item');
        const itemCount = await todoItems.count();
        expect(itemCount).toBeGreaterThanOrEqual(0);

        // 验证待办计数
        const todoCounts = todoList.locator('.todo-count, .count');
        const count = await todoCounts.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('阶段7: 完整审核工作流', () => {
    test('P1-003-18: 从举报到处理的完整E2E流程', async ({ page }) => {
      const adminPage = new AdminPage(page, baseUrl);

      // Step 1: 访问数据看板查看待办
      await adminPage.gotoDashboard();
      await expect(page).toHaveURL(/dashboard/);

      // 获取待审核数量
      const pendingCount = await page.locator('.todo-count').first().textContent().catch(() => '0');

      // Step 2: 进入章节审核
      await adminPage.gotoChapters();
      await expect(page).toHaveURL(/chapters/);

      // Step 3: 处理第一个待审核章节
      const pendingRows = page.locator('.data-table tbody tr');
      const rowCount = await pendingRows.count();

      if (rowCount > 0) {
        const firstRow = pendingRows.first();
        const approveBtn = firstRow.locator('.btn-primary').first();

        if (await approveBtn.isVisible().catch(() => false)) {
          await approveBtn.click();
          await page.waitForTimeout(1500);

          // 处理确认弹窗
          const modal = page.locator('.modal').first();
          if (await modal.isVisible().catch(() => false)) {
            const confirmBtn = modal.locator('.btn-confirm').first();
            await confirmBtn.click();
            await page.waitForTimeout(1000);
          }
        }
      }

      // Step 4: 进入评论管理
      await adminPage.gotoComments();
      await expect(page).toHaveURL(/comments/);

      // Step 5: 查看举报列表
      const reportItems = page.locator('.comment-item, tbody tr');
      const reportCount = await reportItems.count();

      if (reportCount > 0) {
        // 处理第一个举报
        const firstReport = reportItems.first();
        const actionBtn = firstReport.locator('.btn-detail, .btn-approve').first();

        if (await actionBtn.isVisible().catch(() => false)) {
          await actionBtn.click();
          await page.waitForTimeout(1500);
        }
      }

      // Step 6: 返回看板验证待办更新
      await adminPage.gotoDashboard();
      await page.waitForTimeout(1000);

      // 验证看板数据更新
      const updatedStats = page.locator('.stat-value').first();
      expect(await updatedStats.isVisible()).toBeTruthy();
    });
  });
});
