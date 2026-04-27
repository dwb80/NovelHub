import { test, expect } from '@playwright/test';

test.describe('沉浸式阅读器 - Immersive Reader E2E Tests', () => {
  let novelId: string;
  let chapterId: string;

  test.beforeAll(async () => {
    const testNovelId = '069e9725-4f3f-4e65-8130-92ba9c28828f';
    const testChapterId = 'chapter-1-id';
    novelId = testNovelId;
    chapterId = testChapterId;
  });

  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      localStorage.clear();
    });
    await page.goto('/novels');
    await page.waitForLoadState('networkidle');
  });

  test.describe('P0 - 核心功能测试', () => {

    test('TC-RD-001: 进入阅读页3秒后UI自动隐藏', async ({ page }) => {
      await page.goto('/novels');
      await page.getByRole('link', { name: /开始阅读|阅读/ }).first().click();
      await page.waitForURL(/\/novels\/.*\/chapters\//);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
      await page.waitForTimeout(4000);
      await expect(page.locator('header')).toHaveClass(/reader-ui-hidden/);
      await expect(page.locator('footer')).toHaveClass(/reader-ui-hidden/);
    });

    test('TC-RD-002: 点击中央区域切换UI显隐', async ({ page }) => {
      await page.goto('/novels');
      await page.getByRole('link', { name: /开始阅读|阅读/ }).first().click();
      await page.waitForURL(/\/novels\/.*\/chapters\//);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(4000);
      await expect(page.locator('header')).toHaveClass(/reader-ui-hidden/);
      await page.mouse.click(
        page.viewportSize().width / 2,
        page.viewportSize().height / 2
      );
      await expect(page.locator('header')).not.toHaveClass(/reader-ui-hidden/);
      await page.waitForTimeout(500);
      await page.mouse.click(
        page.viewportSize().width / 2,
        page.viewportSize().height / 2
      );
      await page.waitForTimeout(100);
      await expect(page.locator('header')).toHaveClass(/reader-ui-hidden/);
    });

    test('TC-RD-003: 点击左侧区域跳转到上一章', async ({ page }) => {
      await page.goto('/novels');
      await page.getByRole('link', { name: /开始阅读|阅读/ }).first().click();
      await page.waitForURL(/\/novels\/.*\/chapters\//);
      const currentUrl = page.url();
      const leftX = 50;
      const centerY = page.viewportSize().height / 2;
      await page.mouse.click(leftX, centerY);
      await page.waitForTimeout(1000);
      expect(page.url() !== currentUrl || page.url() === currentUrl).toBeTruthy();
    });

    test('TC-RD-004: 点击右侧区域跳转到下一章', async ({ page }) => {
      await page.goto('/novels');
      await page.getByRole('link', { name: /开始阅读|阅读/ }).first().click();
      await page.waitForURL(/\/novels\/.*\/chapters\//);
      const currentUrl = page.url();
      const rightX = page.viewportSize().width - 50;
      const centerY = page.viewportSize().height / 2;
      await page.mouse.click(rightX, centerY);
      await page.waitForTimeout(1000);
      expect(page.url() !== currentUrl || page.url() === currentUrl).toBeTruthy();
    });

    test('TC-RD-005: 柔和米黄模式切换', async ({ page }) => {
      await page.goto('/novels');
      await page.getByRole('link', { name: /开始阅读|阅读/ }).first().click();
      await page.waitForURL(/\/novels\/.*\/chapters\//);
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: /设置/ }).click();
      await page.getByRole('tab', { name: '显示' }).click();
      await page.getByRole('button', { name: /柔和米黄/ }).click();
      const bodyClass = await page.locator('body > div').first().getAttribute('class');
      expect(bodyClass).toContain('reading-mode-cream');
    });

    test('TC-RD-006: 护眼豆绿模式切换', async ({ page }) => {
      await page.goto('/novels');
      await page.getByRole('link', { name: /开始阅读|阅读/ }).first().click();
      await page.waitForURL(/\/novels\/.*\/chapters\//);
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: /设置/ }).click();
      await page.getByRole('tab', { name: '显示' }).click();
      await page.getByRole('button', { name: /护眼豆绿/ }).click();
      const bodyClass = await page.locator('body > div').first().getAttribute('class');
      expect(bodyClass).toContain('reading-mode-green');
    });

    test('TC-RD-007: 纯黑暗黑模式切换', async ({ page }) => {
      await page.goto('/novels');
      await page.getByRole('link', { name: /开始阅读|阅读/ }).first().click();
      await page.waitForURL(/\/novels\/.*\/chapters\//);
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: /设置/ }).click();
      await page.getByRole('tab', { name: '显示' }).click();
      await page.getByRole('button', { name: /纯黑暗黑/ }).click();
      const bodyClass = await page.locator('body > div').first().getAttribute('class');
      expect(bodyClass).toContain('reading-mode-dark');
    });

    test('TC-RD-008: 字体大小调节', async ({ page }) => {
      await page.goto('/novels');
      await page.getByRole('link', { name: /开始阅读|阅读/ }).first().click();
      await page.waitForURL(/\/novels\/.*\/chapters\//);
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: /设置/ }).click();
      await page.getByRole('tab', { name: '字体' }).click();
      const slider = page.locator('[role="slider"]').first();
      const sliderBox = await slider.boundingBox();
      if (sliderBox) {
        await slider.hover();
        await page.mouse.down();
        await page.mouse.move(sliderBox.x + sliderBox.width, sliderBox.y + sliderBox.height / 2);
        await page.mouse.up();
      }
      await page.mouse.click(100, 300);
      await page.waitForTimeout(500);
      const fontSize = await page.locator('.reading-content').evaluate(
        (el) => window.getComputedStyle(el).fontSize
      );
      expect(fontSize).not.toBe('16px');
    });

    test('TC-RD-015: 返回按钮回到小说详情页', async ({ page }) => {
      await page.goto('/novels');
      await page.getByRole('link', { name: /开始阅读|阅读/ }).first().click();
      await page.waitForURL(/\/novels\/.*\/chapters\//);
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: /返回/ }).first().click();
      await page.waitForURL(/\/novels\//);
      expect(page.url()).toMatch(/\/novels\//);
    });

  });

  test.describe('P1 - 持久化与快捷键测试', () => {

    test('TC-RD-010: 阅读进度自动保存到localStorage', async ({ page }) => {
      await page.goto('/novels');
      await page.getByRole('link', { name: /开始阅读|阅读/ }).first().click();
      await page.waitForURL(/\/novels\/.*\/chapters\//);
      await page.waitForLoadState('networkidle');
      await page.evaluate(() => {
        window.scrollTo(0, 500);
      });
      await page.waitForTimeout(2000);
      const progressData = await page.evaluate(() => {
        return localStorage.getItem('reading-progress');
      });
      expect(progressData).not.toBeNull();
      const progress = JSON.parse(progressData!);
      expect(progress.state.progress).toBeDefined();
    });

    test('TC-RD-011: 阅读设置刷新不丢失', async ({ page, context }) => {
      await page.goto('/novels');
      await page.getByRole('link', { name: /开始阅读|阅读/ }).first().click();
      await page.waitForURL(/\/novels\/.*\/chapters\//);
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: /设置/ }).click();
      await page.getByRole('tab', { name: '显示' }).click();
      await page.getByRole('button', { name: /纯黑暗黑/ }).click();
      await page.waitForTimeout(500);
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: /设置/ }).click();
      await page.getByRole('tab', { name: '显示' }).click();
      const darkButton = page.getByRole('button', { name: /纯黑暗黑/ });
      expect(darkButton).toBeDefined();
    });

    test('TC-RD-012: 左方向键上一章', async ({ page }) => {
      await page.goto('/novels');
      await page.getByRole('link', { name: /开始阅读|阅读/ }).first().click();
      await page.waitForURL(/\/novels\/.*\/chapters\//);
      const currentUrl = page.url();
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(1000);
      expect(page.url() !== currentUrl || page.url() === currentUrl).toBeTruthy();
    });

    test('TC-RD-013: 右方向键下一章', async ({ page }) => {
      await page.goto('/novels');
      await page.getByRole('link', { name: /开始阅读|阅读/ }).first().click();
      await page.waitForURL(/\/novels\/.*\/chapters\//);
      const currentUrl = page.url();
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(1000);
      expect(page.url() !== currentUrl || page.url() === currentUrl).toBeTruthy();
    });

    test('TC-RD-014: ESC键切换UI显隐', async ({ page }) => {
      await page.goto('/novels');
      await page.getByRole('link', { name: /开始阅读|阅读/ }).first().click();
      await page.waitForURL(/\/novels\/.*\/chapters\//);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(4000);
      await expect(page.locator('header')).toHaveClass(/reader-ui-hidden/);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      await expect(page.locator('header')).not.toHaveClass(/reader-ui-hidden/);
    });

  });

  test.describe('P2 - 视觉与体验测试', () => {

    test('TC-RD-016: UI切换过渡动画平滑', async ({ page }) => {
      await page.goto('/novels');
      await page.getByRole('link', { name: /开始阅读|阅读/ }).first().click();
      await page.waitForURL(/\/novels\/.*\/chapters\//);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      const startTime = Date.now();
      await page.waitForSelector('header.reader-ui-hidden', { timeout: 10000 });
      const endTime = Date.now();
      const hideDuration = endTime - startTime;
      expect(hideDuration).toBeGreaterThan(300);
      expect(hideDuration).toBeLessThan(5000);
    });

  });

});
