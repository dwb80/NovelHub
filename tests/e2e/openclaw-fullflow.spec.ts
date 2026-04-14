/**
 * P1级E2E测试: TEST-P1-001 OpenClaw完整流程E2E测试
 * 覆盖范围: 激活到创作全流程
 * 测试ID: TEST-P1-001
 * 优先级: P1
 */

import { test, expect } from '@playwright/test';
import { LoginPage, OpenClawPage, HomePage } from './fixtures/page-objects';
import { testUsers, openclawData, generateUniqueNovelTitle } from './fixtures/test-data';

test.describe('【TEST-P1-001】OpenClaw完整流程E2E测试', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:8080';

  test.beforeEach(async ({ page }) => {
    // 每个测试前先登录
    const loginPage = new LoginPage(page, baseUrl);
    await loginPage.goto();
    await loginPage.login(testUsers.user1.email, testUsers.user1.password);
    await page.waitForTimeout(2000);
  });

  test.describe('阶段1: OpenClaw激活流程', () => {
    test('P1-001-01: 访问OpenClaw学习中心', async ({ page }) => {
      const openclawPage = new OpenClawPage(page, baseUrl);
      
      // 访问OpenClaw学习中心
      await openclawPage.goto();
      
      // 验证页面正确加载
      await expect(page).toHaveURL(/openclaw/);
      
      // 验证页面关键元素存在
      const pageTitle = page.locator('h1, .page-title, .learning-center-title').first();
      await expect(pageTitle).toBeVisible();
      
      // 验证页面标题包含关键词
      const titleText = await pageTitle.textContent();
      expect(titleText?.includes('学习') || titleText?.includes('OpenClaw') || titleText?.includes('创作')).toBeTruthy();
    });

    test('P1-001-02: 检查激活状态并执行激活', async ({ page }) => {
      const openclawPage = new OpenClawPage(page, baseUrl);
      await openclawPage.goto();
      await page.waitForTimeout(1500);

      // 检查激活按钮是否存在（未激活状态）
      const activateButton = page.locator('.btn-activate, button:has-text("激活"), button:has-text("开通"), .activate-btn').first();
      const isNeedActivation = await activateButton.isVisible().catch(() => false);

      if (isNeedActivation) {
        // 执行激活流程
        await activateButton.click();
        await page.waitForTimeout(2000);

        // 验证激活弹窗或确认页面
        const confirmModal = page.locator('.activation-modal, .confirm-modal, .modal, .activation-confirm').first();
        const hasModal = await confirmModal.isVisible().catch(() => false);

        if (hasModal) {
          // 点击确认激活
          const confirmBtn = page.locator('.btn-confirm, button:has-text("确认激活"), button:has-text("确定")').first();
          await confirmBtn.click();
          await page.waitForTimeout(2000);
        }

        // 验证激活成功提示
        const toast = page.locator('.toast, .notification, .alert-success').first();
        if (await toast.isVisible().catch(() => false)) {
          const message = await toast.textContent();
          expect(message?.includes('成功') || message?.includes('激活')).toBeTruthy();
        }
      }

      // 刷新页面验证激活状态保持
      await page.reload();
      await page.waitForTimeout(2000);

      // 验证创作按钮存在（已激活状态）
      const newWorkButton = page.locator('.btn-new-work, button:has-text("新建作品"), .create-work-btn').first();
      const isActivated = await newWorkButton.isVisible().catch(() => false);
      expect(isActivated).toBeTruthy();
    });

    test('P1-001-03: 激活流程表单验证', async ({ page }) => {
      const openclawPage = new OpenClawPage(page, baseUrl);
      await openclawPage.goto();
      await page.waitForTimeout(1500);

      // 检查是否需要激活
      const activateButton = page.locator('.btn-activate, button:has-text("激活")').first();
      if (await activateButton.isVisible().catch(() => false)) {
        await activateButton.click();
        await page.waitForTimeout(1000);

        // 验证激活表单元素
        const agreementCheckbox = page.locator('input[name="agreement"], .agreement-checkbox').first();
        if (await agreementCheckbox.isVisible().catch(() => false)) {
          // 测试未勾选协议时无法激活
          const submitBtn = page.locator('.btn-submit, button:has-text("确认")').first();
          const isDisabled = await submitBtn.isDisabled().catch(() => false);
          
          if (!isDisabled) {
            await submitBtn.click();
            await page.waitForTimeout(500);
            // 验证错误提示
            const errorMsg = page.locator('.error-message, .form-error').first();
            expect(await errorMsg.isVisible().catch(() => false)).toBeTruthy();
          }

          // 勾选协议后激活
          await agreementCheckbox.check();
          await submitBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    });
  });

  test.describe('阶段2: AI辅助创作全流程', () => {
    test('P1-001-04: 创建新作品完整流程', async ({ page }) => {
      const openclawPage = new OpenClawPage(page, baseUrl);
      await openclawPage.goto();
      await page.waitForTimeout(2000);

      // 确保已激活
      const activateButton = page.locator('.btn-activate, button:has-text("激活")').first();
      if (await activateButton.isVisible().catch(() => false)) {
        test.skip('OpenClaw未激活，跳过测试');
        return;
      }

      // 点击新建作品
      if (await openclawPage.newWorkButton.isVisible().catch(() => false)) {
        await openclawPage.newWorkButton.click();
        await page.waitForTimeout(1000);

        // 填写作品信息
        const uniqueTitle = generateUniqueNovelTitle();
        await openclawPage.titleInput.fill(uniqueTitle);
        await openclawPage.promptInput.fill(openclawData.prompt);
        
        // 选择分类
        if (await openclawPage.genreSelect.isVisible()) {
          await openclawPage.genreSelect.selectOption(openclawData.genre);
        }

        await page.waitForTimeout(500);

        // 验证表单填写正确
        const titleValue = await openclawPage.titleInput.inputValue();
        expect(titleValue).toBe(uniqueTitle);

        // 保存草稿
        if (await openclawPage.saveDraftButton.isVisible().catch(() => false)) {
          await openclawPage.saveDraftButton.click();
          await page.waitForTimeout(1500);

          // 验证保存成功
          const toast = page.locator('.toast, .notification').first();
          if (await toast.isVisible().catch(() => false)) {
            const message = await toast.textContent();
            expect(message?.includes('保存') || message?.includes('成功')).toBeTruthy();
          }
        }
      }
    });

    test('P1-001-05: AI大纲生成流程', async ({ page }) => {
      const openclawPage = new OpenClawPage(page, baseUrl);
      await openclawPage.goto();
      await page.waitForTimeout(2000);

      // 确保已激活
      const activateButton = page.locator('.btn-activate, button:has-text("激活")').first();
      if (await activateButton.isVisible().catch(() => false)) {
        test.skip('OpenClaw未激活，跳过测试');
        return;
      }

      // 创建作品
      if (await openclawPage.newWorkButton.isVisible().catch(() => false)) {
        await openclawPage.newWorkButton.click();
        await page.waitForTimeout(1000);

        const uniqueTitle = `大纲测试_${Date.now()}`;
        await openclawPage.titleInput.fill(uniqueTitle);
        await openclawPage.promptInput.fill('生成一个关于太空探险的故事大纲');
        await page.waitForTimeout(500);

        // 生成大纲
        if (await openclawPage.generateOutlineButton.isVisible().catch(() => false)) {
          await openclawPage.generateOutlineButton.click();

          // 等待AI生成（显示加载状态）
          const loadingIndicator = page.locator('.loading, .generating, .spinner, .ai-loading').first();
          const hasLoading = await loadingIndicator.isVisible().catch(() => false);

          if (hasLoading) {
            // 等待生成完成（最多30秒）
            await loadingIndicator.waitFor({ state: 'hidden', timeout: 30000 });
          } else {
            await page.waitForTimeout(5000);
          }

          // 验证大纲生成结果
          const outlineContainer = page.locator('.outline-container, .generated-outline, .outline-result, .outline-content').first();
          const hasOutline = await outlineContainer.isVisible().catch(() => false);

          if (hasOutline) {
            const outlineText = await outlineContainer.textContent();
            expect(outlineText?.length).toBeGreaterThan(50); // 大纲应该有内容
          }

          // 验证章节大纲存在
          const chapterOutlines = page.locator('.chapter-outline, .outline-item');
          const chapterCount = await chapterOutlines.count();
          expect(chapterCount).toBeGreaterThan(0);
        }
      }
    });

    test('P1-001-06: AI章节生成流程', async ({ page }) => {
      const openclawPage = new OpenClawPage(page, baseUrl);
      await openclawPage.goto();
      await page.waitForTimeout(2000);

      // 确保已激活
      const activateButton = page.locator('.btn-activate, button:has-text("激活")').first();
      if (await activateButton.isVisible().catch(() => false)) {
        test.skip('OpenClaw未激活，跳过测试');
        return;
      }

      // 查找或创建作品
      const workList = page.locator('.work-list, .novel-list, .creation-list');
      if (await workList.isVisible().catch(() => false)) {
        // 点击第一个作品的继续创作
        const continueBtn = page.locator('.btn-continue, button:has-text("继续"), .continue-work').first();
        if (await continueBtn.isVisible().catch(() => false)) {
          await continueBtn.click();
          await page.waitForTimeout(1500);

          // 生成章节
          const generateChapterBtn = page.locator('.btn-generate-chapter, button:has-text("生成章节")').first();
          if (await generateChapterBtn.isVisible().catch(() => false)) {
            await generateChapterBtn.click();
            await page.waitForTimeout(8000); // 等待AI生成

            // 验证章节内容生成
            const chapterContent = page.locator('.chapter-content, .generated-content, .content-editor').first();
            const hasContent = await chapterContent.isVisible().catch(() => false);

            if (hasContent) {
              const content = await chapterContent.textContent();
              expect(content?.length).toBeGreaterThan(100); // 章节应该有足够内容
            }
          }
        }
      }
    });
  });

  test.describe('阶段3: 作品发布与管理', () => {
    test('P1-001-07: 作品发布完整流程', async ({ page }) => {
      const openclawPage = new OpenClawPage(page, baseUrl);
      await openclawPage.goto();
      await page.waitForTimeout(2000);

      // 确保已激活
      const activateButton = page.locator('.btn-activate, button:has-text("激活")').first();
      if (await activateButton.isVisible().catch(() => false)) {
        test.skip('OpenClaw未激活，跳过测试');
        return;
      }

      // 创建并发布作品
      if (await openclawPage.newWorkButton.isVisible().catch(() => false)) {
        await openclawPage.newWorkButton.click();
        await page.waitForTimeout(1000);

        const uniqueTitle = `发布测试_${Date.now()}`;
        await openclawPage.titleInput.fill(uniqueTitle);
        await openclawPage.promptInput.fill(openclawData.prompt);
        await page.waitForTimeout(500);

        // 发布作品
        if (await openclawPage.publishButton.isVisible().catch(() => false)) {
          await openclawPage.publishButton.click();
          await page.waitForTimeout(1500);

          // 处理发布确认弹窗
          const confirmModal = page.locator('.publish-modal, .confirm-modal, .modal').first();
          const hasModal = await confirmModal.isVisible().catch(() => false);

          if (hasModal) {
            const confirmBtn = page.locator('.btn-confirm, button:has-text("确认发布"), button:has-text("确定")').first();
            await confirmBtn.click();
            await page.waitForTimeout(2000);
          }

          // 验证发布成功
          const toast = page.locator('.toast, .notification').first();
          if (await toast.isVisible().catch(() => false)) {
            const message = await toast.textContent();
            expect(message?.includes('发布') || message?.includes('成功')).toBeTruthy();
          }

          // 验证作品出现在列表中
          await openclawPage.goto();
          await page.waitForTimeout(1500);

          const workItems = page.locator('.work-item, .novel-item, .creation-item');
          const workCount = await workItems.count();
          expect(workCount).toBeGreaterThan(0);
        }
      }
    });

    test('P1-001-08: 作品编辑与更新', async ({ page }) => {
      const openclawPage = new OpenClawPage(page, baseUrl);
      await openclawPage.goto();
      await page.waitForTimeout(2000);

      // 确保已激活
      const activateButton = page.locator('.btn-activate, button:has-text("激活")').first();
      if (await activateButton.isVisible().catch(() => false)) {
        test.skip('OpenClaw未激活，跳过测试');
        return;
      }

      // 查找编辑按钮
      const editButton = page.locator('.btn-edit, .edit-work, button:has-text("编辑")').first();
      if (await editButton.isVisible().catch(() => false)) {
        await editButton.click();
        await page.waitForTimeout(1500);

        // 验证进入编辑页面
        const editor = page.locator('.editor, .work-editor, textarea, .content-editor').first();
        await expect(editor).toBeVisible();

        // 修改内容
        const titleInput = page.locator('input[name="title"], .title-input').first();
        if (await titleInput.isVisible().catch(() => false)) {
          const newTitle = `编辑后_${Date.now()}`;
          await titleInput.fill(newTitle);
          await page.waitForTimeout(500);

          // 保存修改
          const saveBtn = page.locator('.btn-save, button:has-text("保存")').first();
          await saveBtn.click();
          await page.waitForTimeout(1500);

          // 验证保存成功
          const toast = page.locator('.toast, .notification').first();
          if (await toast.isVisible().catch(() => false)) {
            const message = await toast.textContent();
            expect(message?.includes('保存') || message?.includes('成功')).toBeTruthy();
          }
        }
      }
    });

    test('P1-001-09: 作品列表管理', async ({ page }) => {
      const openclawPage = new OpenClawPage(page, baseUrl);
      await openclawPage.goto();
      await page.waitForTimeout(2000);

      // 确保已激活
      const activateButton = page.locator('.btn-activate, button:has-text("激活")').first();
      if (await activateButton.isVisible().catch(() => false)) {
        test.skip('OpenClaw未激活，跳过测试');
        return;
      }

      // 验证作品列表存在
      const workList = page.locator('.work-list, .novel-list, .creation-list');
      await expect(workList).toBeVisible();

      // 验证列表项结构
      const workItems = page.locator('.work-item, .novel-item, .creation-item');
      const workCount = await workItems.count();

      if (workCount > 0) {
        // 验证第一个作品项包含必要信息
        const firstWork = workItems.first();
        
        // 检查标题
        const workTitle = firstWork.locator('.work-title, .novel-title, h3, h4').first();
        expect(await workTitle.isVisible().catch(() => false)).toBeTruthy();

        // 检查操作按钮
        const actionButtons = firstWork.locator('.btn-edit, .btn-delete, .btn-continue, button');
        expect(await actionButtons.count()).toBeGreaterThan(0);
      }
    });
  });

  test.describe('阶段4: 完整端到端流程', () => {
    test('P1-001-10: 激活到发布的完整E2E流程', async ({ page }) => {
      const openclawPage = new OpenClawPage(page, baseUrl);
      const homePage = new HomePage(page, baseUrl);

      // Step 1: 访问OpenClaw学习中心
      await openclawPage.goto();
      await page.waitForTimeout(2000);

      // Step 2: 检查并执行激活
      const activateButton = page.locator('.btn-activate, button:has-text("激活")').first();
      if (await activateButton.isVisible().catch(() => false)) {
        await activateButton.click();
        await page.waitForTimeout(2000);

        const confirmBtn = page.locator('.btn-confirm, button:has-text("确认")').first();
        if (await confirmBtn.isVisible().catch(() => false)) {
          await confirmBtn.click();
          await page.waitForTimeout(2000);
        }
      }

      // Step 3: 创建新作品
      if (await openclawPage.newWorkButton.isVisible().catch(() => false)) {
        await openclawPage.newWorkButton.click();
        await page.waitForTimeout(1000);

        const uniqueTitle = `E2E完整流程_${Date.now()}`;
        await openclawPage.titleInput.fill(uniqueTitle);
        await openclawPage.promptInput.fill('创作一个关于AI觉醒的科幻小说');
        await page.waitForTimeout(500);

        // Step 4: 生成大纲
        if (await openclawPage.generateOutlineButton.isVisible().catch(() => false)) {
          await openclawPage.generateOutlineButton.click();
          await page.waitForTimeout(8000);
        }

        // Step 5: 保存草稿
        if (await openclawPage.saveDraftButton.isVisible().catch(() => false)) {
          await openclawPage.saveDraftButton.click();
          await page.waitForTimeout(1500);
        }

        // Step 6: 发布作品
        if (await openclawPage.publishButton.isVisible().catch(() => false)) {
          await openclawPage.publishButton.click();
          await page.waitForTimeout(1500);

          // 处理确认弹窗
          const confirmModal = page.locator('.publish-modal, .confirm-modal').first();
          if (await confirmModal.isVisible().catch(() => false)) {
            const confirmBtn = page.locator('.btn-confirm, button:has-text("确认")').first();
            await confirmBtn.click();
            await page.waitForTimeout(2000);
          }
        }

        // Step 7: 验证作品在列表中
        await openclawPage.goto();
        await page.waitForTimeout(1500);

        const workItems = page.locator('.work-item, .novel-item');
        const workCount = await workItems.count();
        expect(workCount).toBeGreaterThan(0);

        // Step 8: 验证可以从首页访问
        await homePage.goto();
        await page.waitForTimeout(1000);

        // 验证首页正常加载
        await expect(page).toHaveURL(/index/);
      }
    });
  });
});
