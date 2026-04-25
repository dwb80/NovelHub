import { test, expect } from '@playwright/test';

/**
 * 首页一致性验证测试
 * 验证首页、导航栏、Footer是否与文档一致
 */

test.describe('首页一致性验证', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
  });

  test('Hero区域文案与文档一致', async ({ page }) => {
    // 验证品牌标题
    const heroSection = page.locator('section').filter({ has: page.locator('h1') }).first();
    const heroTitle = heroSection.locator('h1');
    await expect(heroTitle).toHaveText('NovelHub');

    // 验证标语
    const slogan = heroSection.locator('p').nth(0);
    await expect(slogan).toHaveText('创作即进化，反馈即养分');

    // 验证副标题
    const subtitle = heroSection.locator('p').nth(1);
    await expect(subtitle).toHaveText('AI驱动的分布式小说创作平台');
  });

  test('CTA按钮与文档一致', async ({ page }) => {
    // 验证"开始创作"按钮
    const startCreateBtn = page.locator('a:has-text("开始创作")');
    await expect(startCreateBtn).toBeVisible();
    await expect(startCreateBtn).toHaveAttribute('href', '/register');

    // 验证"了解AI作家"按钮
    const aiWritersBtn = page.locator('a:has-text("了解 AI智能体作家")');
    await expect(aiWritersBtn).toBeVisible();
    await expect(aiWritersBtn).toHaveAttribute('href', '/ai-writers');
  });

  test('导航栏包含所有文档要求的链接', async ({ page }) => {
    // 验证导航链接
    const navLinks = [
      { text: '小说', href: '/novels' },
      { text: '排行榜', href: '/ranking' },
      { text: 'AI智能体作家', href: '/claws' },
      { text: '成长中心', href: '/ai-writers' },
      { text: '评审系统', href: '/reviews' },
      { text: '登录', href: '/login' },
    ];

    for (const link of navLinks) {
      const navLink = page.locator(`nav a:has-text("${link.text}")`);
      await expect(navLink).toBeVisible();
      await expect(navLink).toHaveAttribute('href', link.href);
    }
  });

  test('搜索框组件存在', async ({ page }) => {
    const searchInput = page.locator('nav input[placeholder="搜索小说..."]');
    await expect(searchInput).toBeVisible();
    
    const searchButton = page.locator('nav button[type="submit"]');
    await expect(searchButton).toBeVisible();
  });

  test('特性卡片内容与文档一致', async ({ page }) => {
    // 验证三个特性卡片
    const features = [
      { icon: '✨', title: '智能创作', desc: 'AI辅助创作，激发无限灵感' },
      { icon: '👥', title: '社区评审', desc: '分布式评审，持续改进作品' },
      { icon: '⚡', title: '持续进化', desc: 'NEF引擎驱动，作品不断进化' },
    ];

    for (let i = 0; i < features.length; i++) {
      const card = page.locator('section:has(h2:has-text("平台特色")) .grid > div').nth(i);
      await expect(card.locator('h3')).toHaveText(features[i].title);
      await expect(card.locator('p')).toHaveText(features[i].desc);
    }
  });

  test('Footer四列导航结构完整', async ({ page }) => {
    // 验证平台列
    const platformColumn = page.locator('footer h3:has-text("平台")');
    await expect(platformColumn).toBeVisible();
    await expect(page.locator('footer h3:has-text("平台") + ul a[href="/novels"]')).toBeVisible();
    await expect(page.locator('footer h3:has-text("平台") + ul a[href="/ranking"]')).toBeVisible();
    await expect(page.locator('footer h3:has-text("平台") + ul a[href="/claws"]')).toBeVisible();

    // 验证创作列
    const createColumn = page.locator('footer h3:has-text("创作")');
    await expect(createColumn).toBeVisible();
    await expect(page.locator('footer h3:has-text("创作") + ul a[href="/author"]')).toBeVisible();
    await expect(page.locator('footer h3:has-text("创作") + ul a[href="/nef"]')).toBeVisible();
    await expect(page.locator('footer h3:has-text("创作") + ul a[href="/reviews"]')).toBeVisible();

    // 验证关于列
    const aboutColumn = page.locator('footer h3:has-text("关于")');
    await expect(aboutColumn).toBeVisible();
    await expect(page.locator('footer a[href="/about"]')).toBeVisible();
    await expect(page.locator('footer a[href="/terms"]')).toBeVisible();
    await expect(page.locator('footer a[href="/privacy"]')).toBeVisible();

    // 验证联系列
    const contactColumn = page.locator('footer h3:has-text("联系")');
    await expect(contactColumn).toBeVisible();
    await expect(page.locator('footer a[href="/contact"]')).toBeVisible();
    await expect(page.locator('footer a[href="/feedback"]')).toBeVisible();

    // 验证版权信息
    const copyright = page.locator('footer:has-text("© 2026 NovelHub")');
    await expect(copyright).toBeVisible();
  });

  test('所有导航链接可点击', async ({ page }) => {
    // 测试导航链接可点击
    const navLinks = page.locator('nav a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const link = navLinks.nth(i);
      await expect(link).toBeEnabled();
    }
  });

  test('搜索功能可交互', async ({ page }) => {
    const searchInput = page.locator('nav input[placeholder="搜索小说..."]');
    
    // 输入搜索词
    await searchInput.fill('测试小说');
    await expect(searchInput).toHaveValue('测试小说');
    
    // 提交搜索
    await searchInput.press('Enter');
    
    // 验证跳转到搜索页面
    await expect(page).toHaveURL(/.*search.*/);
  });
});
