/**
 * E2E测试: OpenClaw AI辅助创作流程
 * 测试ID: E2E-006
 * 覆盖: AI大纲生成、章节生成、作品发布
 */

import { test, expect } from '@playwright/test';
import { LoginPage, OpenClawPage } from './fixtures/page-objects';
import { testUsers, openclawData } from './fixtures/test-data';

test.describe('OpenClaw AI辅助创作流程', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:8080';

  test.beforeEach(async ({ page }) => {
    // 每个测试前先登录
    const loginPage = new LoginPage(page, baseUrl);
    await loginPage.goto();
    await loginPage.login(testUsers.user1.email, testUsers.user1.password);
    await page.waitForTimeout(2000);
  });

  test.describe('OpenClaw访问与激活', () => {
    test('E2E-006: 访问OpenClaw创作中心', async ({ page }) => {
      const openclawPage = new OpenClawPage(page, baseUrl);

      // 访问创作中心
      await openclawPage.goto();

      // 验证页面加载
      await expect(page).toHaveURL(/openclaw/);

      // 验证页面标题或关键元素
      const pageTitle = page.locator('h1, .page-title').first();
      const titleText = await pageTitle.textContent().catch(() => '');
      expect(titleText.includes('创作') || titleText.includes('OpenClaw') || titleText.includes('学习')).toBeTruthy();
    });

    test('E2E-006: 检查OpenClaw激活状态', async ({ page }) => {
      const openclawPage = new OpenClawPage(page, baseUrl);
      await openclawPage.goto();
      await page.waitForTimeout(1500);

      // 检查是否有激活提示
      const activateButton = page.locator('.btn-activate, button:has-text("激活"), button:has-text("开通")').first();
      const isActivated = !(await activateButton.isVisible().catch(() => false));

      if (!isActivated) {
        // 未激活状态
        await expect(activateButton).toBeVisible();
      } else {
        // 已激活状态，验证创作按钮存在
        await expect(openclawPage.newWorkButton).toBeVisible();
      }
    });
  });

  test.describe('AI辅助创作', () => {
    test('E2E-006: 创建新作品', async ({ page }) => {
      const openclawPage = new OpenClawPage(page, baseUrl);
      await openclawPage.goto();
      await page.waitForTimeout(1500);

      // 检查是否已激活
      const activateButton = page.locator('.btn-activate, button:has-text("激活")').first();
      if (await activateButton.isVisible().catch(() => false)) {
        test.skip('OpenClaw未激活，跳过测试');
        return;
      }

      // 创建新作品
      if (await openclawPage.newWorkButton.isVisible().catch(() => false)) {
        const uniqueTitle = `${openclawData.title}_${Date.now()}`;
        await openclawPage.createNewWork(uniqueTitle, openclawData.prompt, openclawData.genre);

        // 验证作品创建成功
        const toast = page.locator('.toast, .notification');
        if (await toast.isVisible().catch(() => false)) {
          const message = await toast.textContent();
          expect(message?.includes('成功') || message?.includes('创建')).toBeTruthy();
        }

        // 验证标题已填入
        const titleValue = await openclawPage.titleInput.inputValue();
        expect(titleValue).toBe(uniqueTitle);
      }
    });

    test('E2E-006: AI生成大纲', async ({ page }) => {
      const openclawPage = new OpenClawPage(page, baseUrl);
      await openclawPage.goto();
      await page.waitForTimeout(1500);

      // 检查是否已激活
      const activateButton = page.locator('.btn-activate, button:has-text("激活")').first();
      if (await activateButton.isVisible().catch(() => false)) {
        test.skip('OpenClaw未激活，跳过测试');
        return;
      }

      // 创建作品并生成大纲
      if (await openclawPage.newWorkButton.isVisible().catch(() => false)) {
        const uniqueTitle = `${openclawData.title}_outline_${Date.now()}`;
        await openclawPage.createNewWork(uniqueTitle, openclawData.prompt, openclawData.genre);

        // 生成大纲
        if (await openclawPage.generateOutlineButton.isVisible().catch(() => false)) {
          await openclawPage.generateOutline();

          // 验证大纲生成结果
          const outlineContainer = page.locator('.outline-container, .generated-outline, .outline-result');
          
          // 等待AI生成完成（显示加载中或结果）
          await page.waitForTimeout(3000);

          const hasOutline = await outlineContainer.isVisible().catch(() => false);
          const hasLoading = await page.locator('.loading, .generating, .spinner').first().isVisible().catch(() => false);

          expect(hasOutline || hasLoading).toBeTruthy();
        }
      }
    });

    test('E2E-006: 保存草稿', async ({ page }) => {
      const openclawPage = new OpenClawPage(page, baseUrl);
      await openclawPage.goto();
      await page.waitForTimeout(1500);

      // 检查是否已激活
      const activateButton = page.locator('.btn-activate, button:has-text("激活")').first();
      if (await activateButton.isVisible().catch(() => false)) {
        test.skip('OpenClaw未激活，跳过测试');
        return;
      }

      // 创建作品
      if (await openclawPage.newWorkButton.isVisible().catch(() => false)) {
        const uniqueTitle = `${openclawData.title}_draft_${Date.now()}`;
        await openclawPage.createNewWork(uniqueTitle, openclawData.prompt, openclawData.genre);

        // 保存草稿
        if (await openclawPage.saveDraftButton.isVisible().catch(() => false)) {
          await openclawPage.saveDraft();

          // 验证保存成功
          const toast = page.locator('.toast, .notification');
          if (await toast.isVisible().catch(() => false)) {
            const message = await toast.textContent();
            expect(message?.includes('保存') || message?.includes('成功')).toBeTruthy();
          }
        }
      }
    });

    test('E2E-006: 发布作品', async ({ page }) => {
      const openclawPage = new OpenClawPage(page, baseUrl);
      await openclawPage.goto();
      await page.waitForTimeout(1500);

      // 检查是否已激活
      const activateButton = page.locator('.btn-activate, button:has-text("激活")').first();
      if (await activateButton.isVisible().catch(() => false)) {
        test.skip('OpenClaw未激活，跳过测试');
        return;
      }

      // 创建作品
      if (await openclawPage.newWorkButton.isVisible().catch(() => false)) {
        const uniqueTitle = `${openclawData.title}_publish_${Date.now()}`;
        await openclawPage.createNewWork(uniqueTitle, openclawData.prompt, openclawData.genre);

        // 发布作品
        if (await openclawPage.publishButton.isVisible().catch(() => false)) {
          await openclawPage.publish();

          // 验证发布成功或显示确认对话框
          const confirmModal = page.locator('.publish-modal, .confirm-modal, .modal');
          const toast = page.locator('.toast, .notification');

          const hasModal = await confirmModal.isVisible().catch(() => false);
          const hasToast = await toast.isVisible().catch(() => false);

          expect(hasModal || hasToast).toBeTruthy();

          // 如果有确认对话框，点击确认
          if (hasModal) {
            const confirmBtn = page.locator('.btn-confirm, button:has-text("确认"), button:has-text("确定")').first();
            await confirmBtn.click();
            await page.waitForTimeout(1000);
          }
        }
      }
    });
  });

  test.describe('作品管理', () => {
    test('E2E-006: 查看作品列表', async ({ page }) => {
      const openclawPage = new OpenClawPage(page, baseUrl);
      await openclawPage.goto();
      await page.waitForTimeout(1500);

      // 检查是否已激活
      const activateButton = page.locator('.btn-activate, button:has-text("激活")').first();
      if (await activateButton.isVisible().catch(() => false)) {
        test.skip('OpenClaw未激活，跳过测试');
        return;
      }

      // 验证作品列表存在
      const workList = page.locator('.work-list, .novel-list, .creation-list');
      await expect(workList).toBeVisible();
    });

    test('E2E-006: 编辑已有作品', async ({ page }) => {
      const openclawPage = new OpenClawPage(page, baseUrl);
      await openclawPage.goto();
      await page.waitForTimeout(1500);

      // 检查是否已激活
      const activateButton = page.locator('.btn-activate, button:has-text("激活")').first();
      if (await activateButton.isVisible().catch(() => false)) {
        test.skip('OpenClaw未激活，跳过测试');
        return;
      }

      // 查找编辑按钮
      const editButton = page.locator('.btn-edit, .edit-work').first();
      if (await editButton.isVisible().catch(() => false)) {
        await editButton.click();
        await page.waitForTimeout(1000);

        // 验证进入编辑页面
        const editor = page.locator('.editor, .work-editor, textarea');
        await expect(editor).toBeVisible();
      }
    });
  });
});
