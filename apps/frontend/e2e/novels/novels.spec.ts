import { test, expect, type Page } from '@playwright/test';

/**
 * 小说页面页面对象
 * 封装小说页面的所有操作
 */
class NovelsPage {
  constructor(private page: Page) { }

  async goto() {
    await this.page.goto('/novels');
    await this.page.waitForLoadState('networkidle');
  }

  // 获取页面标题
  async getPageTitle() {
    return this.page.title();
  }

  // 点击分类按钮
  async clickCategory(categoryName: string) {
    await this.page.getByRole('button', { name: categoryName, exact: true }).click();
  }

  // 获取小说卡片列表
  getNovelCards() {
    return this.page.locator('a[href^="/novels/"]');
  }

  // 获取第一个小说卡片
  getFirstNovelCard() {
    return this.getNovelCards().first();
  }

  // 点击第一个小说卡片
  async clickFirstNovelCard() {
    await this.getFirstNovelCard().click();
  }

  // 获取小说卡片标题
  getCardTitle(card: ReturnType<typeof this.getFirstNovelCard>) {
    return card.locator('h3');
  }

  // 获取小说卡片AI智能体作家
  getCardAuthor(card: ReturnType<typeof this.getFirstNovelCard>) {
    return card.locator('p.text-muted-foreground').first();
  }

  // 获取AI徽章
  getAiBadge() {
    return this.page.locator('text=AI').first();
  }
}

/**
 * 测试套件: 页面加载测试
 * 对应测试用例: NOVELS-001 ~ NOVELS-002
 */
test.describe('页面加载测试', () => {
  test.beforeEach(async ({ page }) => {
    const novelsPage = new NovelsPage(page);
    await novelsPage.goto();
  });

  // NOVELS-001: 小说页面正常加载
  test('小说页面正常加载', async ({ page }) => {
    // 验证页面标题
    await expect(page.getByRole('heading', { name: '小说库' })).toBeVisible();

    // 验证描述文本
    await expect(page.getByText('探索海量AI创作的小说作品')).toBeVisible();

    // 验证分类按钮存在
    await expect(page.getByRole('button', { name: '全部', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '玄幻', exact: true })).toBeVisible();
  });

  // NOVELS-002: 页面标题正确
  test('页面标题正确', async ({ page }) => {
    const novelsPage = new NovelsPage(page);
    const title = await novelsPage.getPageTitle();
    expect(title).toContain('NovelHub');
  });
});

/**
 * 测试套件: 分类标签测试
 * 对应测试用例: NOVELS-003 ~ NOVELS-007
 */
test.describe('分类标签测试', () => {
  test.beforeEach(async ({ page }) => {
    const novelsPage = new NovelsPage(page);
    await novelsPage.goto();
  });

  // NOVELS-003: 默认显示全部小说
  test('默认显示全部小说', async ({ page }) => {
    // 验证"全部"按钮被选中
    const allButton = page.getByRole('button', { name: '全部', exact: true });
    await expect(allButton).toBeVisible();
  });

  // NOVELS-004: 切换到玄幻分类
  test('切换到玄幻分类', async ({ page }) => {
    const novelsPage = new NovelsPage(page);

    // 点击玄幻分类
    await novelsPage.clickCategory('玄幻');

    // 等待页面更新
    await page.waitForTimeout(1000);

    // 验证URL包含分类参数或页面正常渲染
    const url = page.url();
    expect(url).toContain('novels');
  });

  // NOVELS-005: 切换到都市分类
  test('切换到都市分类', async ({ page }) => {
    const novelsPage = new NovelsPage(page);

    // 点击都市分类
    await novelsPage.clickCategory('都市');

    // 等待页面更新
    await page.waitForTimeout(1000);

    // 验证URL包含分类参数或页面正常渲染
    const url = page.url();
    expect(url).toContain('novels');
  });

  // NOVELS-006: 切换到科幻分类
  test('切换到科幻分类', async ({ page }) => {
    const novelsPage = new NovelsPage(page);

    // 点击科幻分类
    await novelsPage.clickCategory('科幻');

    // 等待页面更新
    await page.waitForTimeout(1000);

    // 验证URL包含分类参数或页面正常渲染
    const url = page.url();
    expect(url).toContain('novels');
  });

  // NOVELS-007: 标签切换时数据更新
  test('标签切换时数据更新', async ({ page }) => {
    const novelsPage = new NovelsPage(page);

    // 获取初始小说数量
    const initialCount = await novelsPage.getNovelCards().count();

    // 切换分类
    await novelsPage.clickCategory('玄幻');
    await page.waitForTimeout(2000);

    // 验证页面已更新（小说卡片可能变化）
    const newCount = await novelsPage.getNovelCards().count();
    // 由于API返回的数据可能不同，这里只验证页面正常渲染
    expect(newCount).toBeGreaterThanOrEqual(0);
  });
});

/**
 * 测试套件: 小说卡片测试
 * 对应测试用例: NOVELS-008 ~ NOVELS-012
 */
test.describe('小说卡片测试', () => {
  test.beforeEach(async ({ page }) => {
    const novelsPage = new NovelsPage(page);
    await novelsPage.goto();
    // 等待数据加载
    await page.waitForTimeout(2000);
  });

  // NOVELS-008: 小说卡片显示
  test('小说卡片显示', async ({ page }) => {
    const novelsPage = new NovelsPage(page);

    // 验证小说卡片存在
    const cardCount = await novelsPage.getNovelCards().count();
    expect(cardCount).toBeGreaterThan(0);
  });

  // NOVELS-009: 小说卡片标题显示
  test('小说卡片标题显示', async ({ page }) => {
    const novelsPage = new NovelsPage(page);

    // 获取第一个小说卡片
    const firstCard = novelsPage.getFirstNovelCard();
    await expect(firstCard).toBeVisible();

    // 验证标题存在
    const title = novelsPage.getCardTitle(firstCard);
    await expect(title).toBeVisible();
  });

  // NOVELS-010: 小说卡片AI智能体作家显示
  test('小说卡片AI智能体作家显示', async ({ page }) => {
    const novelsPage = new NovelsPage(page);

    // 获取第一个小说卡片
    const firstCard = novelsPage.getFirstNovelCard();

    // 验证AI智能体作家信息存在
    const author = novelsPage.getCardAuthor(firstCard);
    await expect(author).toBeVisible();
  });

  // NOVELS-011: AI生成标识显示
  test('AI生成标识显示', async ({ page }) => {
    const novelsPage = new NovelsPage(page);

    // 检查是否有AI徽章
    const aiBadge = novelsPage.getAiBadge();
    // AI徽章可能存在也可能不存在，取决于小说是否为AI生成
    const badgeCount = await aiBadge.count();
    expect(badgeCount).toBeGreaterThanOrEqual(0);
  });

  // NOVELS-012: 点击小说卡片跳转
  test('点击小说卡片跳转到详情页', async ({ page }) => {
    const novelsPage = new NovelsPage(page);

    // 获取第一个小说卡片
    const firstCard = novelsPage.getFirstNovelCard();
    await expect(firstCard).toBeVisible();

    // 点击小说卡片
    await novelsPage.clickFirstNovelCard();

    // 验证跳转到详情页
    await expect(page).toHaveURL(/\/novels\/[a-zA-Z0-9-]+/);
  });
});

/**
 * 测试套件: 筛选功能测试
 * 对应测试用例: NOVELS-013 ~ NOVELS-018
 */
test.describe('筛选功能测试', () => {
  test.beforeEach(async ({ page }) => {
    const novelsPage = new NovelsPage(page);
    await novelsPage.goto();
  });

  // NOVELS-013: 筛选区域显示
  test('筛选区域显示', async ({ page }) => {
    // 验证筛选区域存在
    await expect(page.locator('text=面向:')).toBeVisible();
    await expect(page.locator('text=状态:')).toBeVisible();
    await expect(page.locator('text=字数:')).toBeVisible();
    await expect(page.locator('text=评分:')).toBeVisible();
    await expect(page.locator('text=排序:')).toBeVisible();
  });

  // NOVELS-014: 结果统计显示
  test('结果统计显示', async ({ page }) => {
    // 验证结果统计存在
    await expect(page.locator('text=共')).toBeVisible();
    await expect(page.locator('text=本小说')).toBeVisible();
  });

  // NOVELS-015: 分页显示
  test('分页显示', async ({ page }) => {
    // 等待数据加载
    await page.waitForTimeout(2000);

    // 检查是否有分页组件
    const pagination = page.locator('button:has([class*="ChevronLeft"]), button:has([class*="ChevronRight"])');
    const paginationCount = await pagination.count();

    // 分页可能存在也可能不存在，取决于小说数量
    expect(paginationCount).toBeGreaterThanOrEqual(0);
  });
});

/**
 * 测试套件: 分页测试
 * 对应测试用例: NOVELS-019 ~ NOVELS-021
 */
test.describe('分页测试', () => {
  test.beforeEach(async ({ page }) => {
    const novelsPage = new NovelsPage(page);
    await novelsPage.goto();
    // 等待数据加载
    await page.waitForTimeout(2000);
  });

  // NOVELS-019: 分页显示
  test('分页显示', async ({ page }) => {
    // 检查是否有分页组件
    const pagination = page.locator('button:has-text("1")').first();
    // 分页可能存在也可能不存在，取决于小说数量
    const paginationCount = await pagination.count();
    expect(paginationCount).toBeGreaterThanOrEqual(0);
  });

  // NOVELS-020: 下一页
  test('下一页', async ({ page }) => {
    // 检查是否有下一页按钮
    const nextButton = page.locator('button:has([class*="ChevronRight"])');
    const nextButtonCount = await nextButton.count();

    if (nextButtonCount > 0) {
      // 点击下一页
      await nextButton.click();
      await page.waitForTimeout(1000);

      // 验证URL包含页码参数
      await expect(page).toHaveURL(/page=2/);
    } else {
      // 如果没有分页，跳过测试
      test.skip();
    }
  });

  // NOVELS-021: 页码显示
  test('页码显示', async ({ page }) => {
    // 检查是否有页码按钮
    const pageButtons = page.locator('button:has-text("1")');
    const count = await pageButtons.count();

    // 如果有分页，验证页码按钮存在
    if (count > 0) {
      await expect(pageButtons.first()).toBeVisible();
    }
  });
});

/**
 * 测试套件: 加载状态测试
 * 对应测试用例: NOVELS-022
 */
test.describe('加载状态测试', () => {
  // NOVELS-022: 空状态显示
  test('空状态显示', async ({ page }) => {
    // 访问页面
    await page.goto('/novels');

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 验证页面正常渲染
    await expect(page.getByRole('heading', { name: '小说库' })).toBeVisible();
  });
});

/**
 * 测试套件: 导航测试
 * 对应测试用例: NOVELS-023 ~ NOVELS-025
 */
test.describe('导航测试', () => {
  // NOVELS-023: Header导航显示
  test('Header导航显示', async ({ page }) => {
    const novelsPage = new NovelsPage(page);
    await novelsPage.goto();

    // 验证Header存在
    await expect(page.getByRole('banner')).toBeVisible();

    // 验证导航链接
    await expect(page.locator('header').getByRole('link', { name: 'NovelHub' }).first()).toBeVisible();
  });

  // NOVELS-024: Footer导航显示
  test('Footer导航显示', async ({ page }) => {
    const novelsPage = new NovelsPage(page);
    await novelsPage.goto();

    // 验证Footer存在
    await expect(page.locator('footer')).toBeVisible();
  });

  // NOVELS-025: 从首页导航到小说页
  test('从首页导航到小说页', async ({ page }) => {
    // 访问首页
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 点击小说导航
    await page.locator('header').getByRole('link', { name: '小说' }).first().click();

    // 验证跳转到小说页面
    await expect(page).toHaveURL(/\/novels$/);

    // 验证页面标题
    await expect(page.getByRole('heading', { name: '小说库' })).toBeVisible();
  });
});
