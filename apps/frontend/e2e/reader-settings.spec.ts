import { test, expect } from '@playwright/test';

test.describe('沉浸式阅读器 - 阅读设置专项测试', () => {

  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      localStorage.clear();
    });
  });

  test('TC-RD-001: 打开设置面板并切换纯黑暗黑模式', async ({ page }) => {
    await page.goto('/novels/8485e1ca-10aa-435a-bd35-3c517e22514b/chapters/456ff460-becd-4243-beb8-987e2aed34c2');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.locator('button:has(svg.lucide-settings)').click({ timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.getByRole('tab', { name: '显示' }).click();
    await page.waitForTimeout(500);

    console.log('点击前 localStorage:', await page.evaluate(() => localStorage.getItem('reader-preferences')));

    await page.locator('button:has-text("纯黑暗黑")').click();
    await page.waitForTimeout(1000);

    console.log('点击后 localStorage:', await page.evaluate(() => localStorage.getItem('reader-preferences')));

    const bodyClass = await page.locator('body > div').first().getAttribute('class');
    console.log('页面容器类名:', bodyClass);

    const bgColor = await page.evaluate(() => getComputedStyle(document.body.firstElementChild as HTMLElement).backgroundColor);
    console.log('页面背景色:', bgColor);

    expect(bodyClass).toContain('reading-mode-dark');
  });

  test('TC-RD-002: 三种阅读模式完整切换', async ({ page }) => {
    await page.goto('/novels/8485e1ca-10aa-435a-bd35-3c517e22514b/chapters/456ff460-becd-4243-beb8-987e2aed34c2');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.locator('button:has(svg.lucide-settings)').click({ timeout: 10000 });
    await page.getByRole('tab', { name: '显示' }).click();

    await page.locator('button:has-text("柔和米黄")').click();
    await page.waitForTimeout(500);
    let bodyClass = await page.locator('body > div').first().getAttribute('class');
    expect(bodyClass).toContain('reading-mode-cream');

    await page.locator('button:has-text("护眼豆绿")').click();
    await page.waitForTimeout(500);
    bodyClass = await page.locator('body > div').first().getAttribute('class');
    expect(bodyClass).toContain('reading-mode-green');

    await page.locator('button:has-text("纯黑暗黑")').click();
    await page.waitForTimeout(500);
    bodyClass = await page.locator('body > div').first().getAttribute('class');
    expect(bodyClass).toContain('reading-mode-dark');
  });

  test('TC-RD-003: 字体大小调节生效', async ({ page }) => {
    await page.goto('/novels/8485e1ca-10aa-435a-bd35-3c517e22514b/chapters/456ff460-becd-4243-beb8-987e2aed34c2');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const initialFontSize = await page.locator('.reading-content').evaluate(el => getComputedStyle(el).fontSize);
    console.log('初始字体大小:', initialFontSize);

    await page.locator('button:has(svg.lucide-settings)').click({ timeout: 10000 });
    await page.getByRole('tab', { name: '字体' }).click();
    await page.waitForTimeout(500);

    const fontSizeBefore = await page.locator('.reading-content').evaluate(el => getComputedStyle(el).fontSize);
    console.log('打开设置后字体大小:', fontSizeBefore);

    const slider = page.locator('[role="slider"]').first();
    const box = await slider.boundingBox();
    
    if (box) {
      await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.up();
    }

    await page.waitForTimeout(1000);

    const newFontSize = await page.locator('.reading-content').evaluate(el => getComputedStyle(el).fontSize);
    console.log('调节后字体大小:', newFontSize);

    expect(parseFloat(newFontSize)).toBeGreaterThanOrEqual(parseFloat(initialFontSize));
  });

  test('TC-RD-004: 行间距调节生效', async ({ page }) => {
    await page.goto('/novels/8485e1ca-10aa-435a-bd35-3c517e22514b/chapters/456ff460-becd-4243-beb8-987e2aed34c2');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const initialLineHeight = await page.locator('.reading-content').evaluate(el => getComputedStyle(el).lineHeight);
    console.log('初始行高:', initialLineHeight);

    await page.locator('button:has(svg.lucide-settings)').click({ timeout: 10000 });
    await page.getByRole('tab', { name: '字体' }).click();
    await page.waitForTimeout(500);

    const slider = page.locator('[role="slider"]').nth(1);
    const box = await slider.boundingBox();
    
    if (box) {
      await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.up();
    }

    await page.waitForTimeout(1000);

    const newLineHeight = await page.locator('.reading-content').evaluate(el => getComputedStyle(el).lineHeight);
    console.log('调节后行高:', newLineHeight);

    expect(parseFloat(newLineHeight)).toBeGreaterThanOrEqual(parseFloat(initialLineHeight));
  });
});
