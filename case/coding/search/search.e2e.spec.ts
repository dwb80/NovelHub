import { test, expect } from '@playwright/test';

/**
 * 搜索功能 E2E 测试
 * 
 * 测试范围:
 * - 基础搜索功能
 * - 搜索结果展示
 * - 空结果处理
 * - 安全性测试
 * - 性能测试
 * 
 * 前置条件:
 * - 后端服务运行在 http://localhost:3001
 * - 前端服务运行在 http://localhost:3000
 * - 数据库已填充测试数据 (npm run db:seed:dev)
 */

test.describe('搜索功能 E2E测试', () => {
  
  test.beforeEach(async ({ page }) => {
    // 访问搜索页面
    await page.goto('http://localhost:3000/search');
    
    // 等待页面加载完成
    await page.waitForSelector('input[type="search"]', { timeout: 10000 });
  });

  /**
   * TC-SEARCH-001: 搜索关键词"AI"返回相关小说
   * 
   * 对应需求: US-SEARCH-001-基础搜索
   * 优先级: P0
   */
  test('TC-SEARCH-001: 搜索关键词"AI"返回相关小说', async ({ page }) => {
    // 输入搜索关键词
    await page.fill('input[type="search"]', 'AI');
    await page.click('button:has-text("搜索")');
    
    // 等待结果加载
    await page.waitForSelector('text=/找到.*个结果/', { timeout: 5000 });
    
    // 验证结果显示
    const resultsText = await page.textContent('text=/找到.*个结果/');
    expect(resultsText).toMatch(/找到/);
    
    // 验证返回AI相关小说
    const novelTitles = await page.locator('h3.font-semibold').allTextContents();
    const aiNovels = novelTitles.filter(title => 
      title.includes('AI') || title.includes('智能') || title.includes('数据')
    );
    expect(aiNovels.length).toBeGreaterThanOrEqual(1);
    
    console.log(`✅ 搜索"AI"返回 ${novelTitles.length} 本小说`);
  });

  /**
   * TC-SEARCH-002: 搜索关键词"星际"返回相关小说
   * 
   * 对应需求: US-SEARCH-001-基础搜索
   * 优先级: P0
   */
  test('TC-SEARCH-002: 搜索关键词"星际"返回相关小说', async ({ page }) => {
    await page.fill('input[type="search"]', '星际');
    await page.click('button:has-text("搜索")');
    
    // 等待结果加载
    await page.waitForSelector('text=/找到.*个结果/', { timeout: 5000 });
    
    // 验证返回星际穿越小说
    const novelTitles = await page.locator('h3.font-semibold').allTextContents();
    expect(novelTitles).toContain('星际穿越之我是大反派');
    
    console.log('✅ 搜索"星际"成功返回"星际穿越之我是大反派"');
  });

  /**
   * TC-SEARCH-003: 搜索关键词"修仙"返回相关小说
   * 
   * 对应需求: US-SEARCH-001-基础搜索
   * 优先级: P0
   */
  test('TC-SEARCH-003: 搜索关键词"修仙"返回相关小说', async ({ page }) => {
    await page.fill('input[type="search"]', '修仙');
    await page.click('button:has-text("搜索")');
    
    // 等待结果加载
    await page.waitForSelector('text=/找到.*个结果/', { timeout: 5000 });
    
    // 验证返回修仙小说
    const novelTitles = await page.locator('h3.font-semibold').allTextContents();
    const xianxiaNovels = novelTitles.filter(title => 
      title.includes('修仙') || title.includes('种田')
    );
    expect(xianxiaNovels.length).toBeGreaterThanOrEqual(1);
    
    console.log(`✅ 搜索"修仙"返回 ${xianxiaNovels.length} 本相关小说`);
  });

  /**
   * TC-SEARCH-004: 搜索AI智能体作家名"星际作家"
   * 
   * 对应需求: US-SEARCH-002-AI智能体作家搜索
   * 优先级: P0
   */
  test('TC-SEARCH-004: 搜索AI智能体作家名"星际作家"', async ({ page }) => {
    await page.fill('input[type="search"]', '星际作家');
    await page.click('button:has-text("搜索")');
    
    // 等待结果加载
    await page.waitForSelector('text=/找到.*个结果/', { timeout: 5000 });
    
    // 验证返回该AI智能体作家的小说
    const authorNames = await page.locator('p.text-sm.text-muted-foreground.truncate').allTextContents();
    const hasAuthor = authorNames.some(name => name.includes('星际作家'));
    expect(hasAuthor).toBe(true);
    
    console.log('✅ 搜索AI智能体作家名"星际作家"成功');
  });

  /**
   * TC-SEARCH-005: 搜索标签"系统"
   * 
   * 对应需求: US-SEARCH-003-标签搜索
   * 优先级: P0
   */
  test('TC-SEARCH-005: 搜索标签"系统"', async ({ page }) => {
    await page.fill('input[type="search"]', '系统');
    await page.click('button:has-text("搜索")');
    
    // 等待结果加载
    await page.waitForSelector('text=/找到.*个结果/', { timeout: 5000 });
    
    // 验证返回包含系统标签的小说
    const resultsText = await page.textContent('text=/找到.*个结果/');
    const match = resultsText?.match(/找到 (\d+) 个结果/);
    const count = match ? parseInt(match[1]) : 0;
    expect(count).toBeGreaterThanOrEqual(1);
    
    console.log(`✅ 搜索"系统"返回 ${count} 本小说`);
  });

  /**
   * TC-SEARCH-006: 搜索描述中的关键词"程序员"
   * 
   * 对应需求: US-SEARCH-004-描述搜索
   * 优先级: P0
   */
  test('TC-SEARCH-006: 搜索描述中的关键词"程序员"', async ({ page }) => {
    await page.fill('input[type="search"]', '程序员');
    await page.click('button:has-text("搜索")');
    
    // 等待结果加载
    await page.waitForSelector('text=/找到.*个结果/', { timeout: 5000 });
    
    // 验证返回相关小说
    const novelTitles = await page.locator('h3.font-semibold').allTextContents();
    const coderNovels = novelTitles.filter(title => 
      title.includes('算法') || title.includes('虚拟') || title.includes('代码')
    );
    expect(coderNovels.length).toBeGreaterThanOrEqual(1);
    
    console.log(`✅ 搜索"程序员"返回 ${coderNovels.length} 本相关小说`);
  });

  /**
   * TC-SEARCH-101: 搜索不存在的关键词显示空结果
   * 
   * 对应需求: US-SEARCH-005-空结果处理
   * 优先级: P1
   */
  test('TC-SEARCH-101: 搜索不存在的关键词显示空结果', async ({ page }) => {
    await page.fill('input[type="search"]', '不存在的词xyz123456');
    await page.click('button:has-text("搜索")');
    
    // 等待结果加载
    await page.waitForTimeout(1000);
    
    // 验证显示空结果提示
    const emptyText = await page.textContent('text=没有找到相关小说');
    expect(emptyText).toContain('没有找到相关小说');
    
    console.log('✅ 空结果处理正确');
  });

  /**
   * TC-SEARCH-102: 搜索特殊字符无XSS漏洞
   * 
   * 对应需求: US-SEARCH-006-特殊字符处理
   * 优先级: P1
   */
  test('TC-SEARCH-102: 搜索特殊字符无XSS漏洞', async ({ page }) => {
    // 监听alert事件
    let alertTriggered = false;
    page.on('dialog', async dialog => {
      if (dialog.type() === 'alert') {
        alertTriggered = true;
      }
      await dialog.dismiss();
    });

    await page.fill('input[type="search"]', '<script>alert("xss")</script>');
    await page.click('button:has-text("搜索")');
    
    // 等待结果加载
    await page.waitForTimeout(1000);
    
    // 验证没有触发alert
    expect(alertTriggered).toBe(false);
    
    console.log('✅ XSS防护测试通过');
  });

  /**
   * TC-SEARCH-103: 搜索超长关键词处理
   * 
   * 对应需求: US-SEARCH-007-超长关键词
   * 优先级: P2
   */
  test('TC-SEARCH-103: 搜索超长关键词处理', async ({ page }) => {
    const longQuery = 'a'.repeat(200);
    await page.fill('input[type="search"]', longQuery);
    await page.click('button:has-text("搜索")');
    
    // 等待结果加载
    await page.waitForTimeout(1000);
    
    // 验证页面没有崩溃
    const pageTitle = await page.title();
    expect(pageTitle).toBeTruthy();
    
    console.log('✅ 超长关键词处理正确');
  });

  /**
   * TC-SEARCH-202: 搜索响应时间测试
   * 
   * 对应需求: US-SEARCH-010-性能测试
   * 优先级: P1
   */
  test('TC-SEARCH-202: 搜索响应时间测试', async ({ page }) => {
    const startTime = Date.now();
    
    await page.fill('input[type="search"]', '科幻');
    await page.click('button:has-text("搜索")');
    
    // 等待结果加载
    await page.waitForSelector('text=/找到.*个结果/', { timeout: 5000 });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // 验证响应时间小于2秒
    expect(responseTime).toBeLessThan(2000);
    
    console.log(`✅ 搜索响应时间: ${responseTime}ms`);
  });

  /**
   * TC-SEARCH-203: 支持回车键搜索
   * 
   * 对应需求: USAB-SEARCH-002
   * 优先级: P0
   */
  test('TC-SEARCH-203: 支持回车键搜索', async ({ page }) => {
    await page.fill('input[type="search"]', 'AI');
    await page.press('input[type="search"]', 'Enter');
    
    // 等待结果加载
    await page.waitForSelector('text=/找到.*个结果/', { timeout: 5000 });
    
    // 验证搜索结果
    const resultsText = await page.textContent('text=/找到.*个结果/');
    expect(resultsText).toMatch(/找到/);
    
    console.log('✅ 回车键搜索功能正常');
  });

  /**
   * TC-SEARCH-204: 搜索结果包含完整信息
   * 
   * 对应需求: US-SEARCH-002-搜索结果展示
   * 优先级: P0
   */
  test('TC-SEARCH-204: 搜索结果包含完整信息', async ({ page }) => {
    await page.fill('input[type="search"]', 'AI觉醒');
    await page.click('button:has-text("搜索")');
    
    // 等待结果加载
    await page.waitForSelector('h3.font-semibold', { timeout: 5000 });
    
    // 验证搜索结果包含完整信息
    const novelCard = page.locator('.hover\\:shadow-md').first();
    
    // 验证标题
    await expect(novelCard.locator('h3.font-semibold')).toBeVisible();
    
    // 验证AI智能体作家
    await expect(novelCard.locator('p.text-sm.text-muted-foreground.truncate')).toBeVisible();
    
    // 验证分类标签
    await expect(novelCard.locator('span.bg-secondary')).toBeVisible();
    
    // 验证简介
    await expect(novelCard.locator('p.line-clamp-2')).toBeVisible();
    
    // 验证统计数据（阅读量、章节数）
    await expect(novelCard.locator('text=/章/')).toBeVisible();
    
    console.log('✅ 搜索结果信息完整');
  });
});

/**
 * API 契约测试
 * 
 * 验证后端API响应格式符合预期
 */
test.describe('搜索API契约测试', () => {
  
  test('API响应格式验证', async ({ request }) => {
    const response = await request.get('http://localhost:3001/search/novels?q=AI');
    
    // 验证状态码
    expect(response.status()).toBe(200);
    
    // 验证响应体
    const body = await response.json();
    expect(body).toHaveProperty('code');
    expect(body).toHaveProperty('message');
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('novels');
    expect(body.data).toHaveProperty('total');
    expect(body.data).toHaveProperty('page');
    expect(body.data).toHaveProperty('limit');
    expect(Array.isArray(body.data.novels)).toBe(true);
    
    // 验证小说对象结构
    if (body.data.novels.length > 0) {
      const novel = body.data.novels[0];
      expect(novel).toHaveProperty('id');
      expect(novel).toHaveProperty('title');
      expect(novel).toHaveProperty('authorName');
      expect(novel).toHaveProperty('rating');
      expect(novel).toHaveProperty('wordCount');
    }
    
    console.log('✅ API响应格式验证通过');
  });

  test('API参数验证-空关键词', async ({ request }) => {
    const response = await request.get('http://localhost:3001/search/novels');
    
    // 验证返回400错误
    expect(response.status()).toBe(400);
    
    console.log('✅ API参数验证通过');
  });

  test('API SQL注入防护', async ({ request }) => {
    const response = await request.get('http://localhost:3001/search/novels?q=\' OR \'1\'=\'1');
    
    // 验证返回正常结果或空结果，而不是所有数据
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    // 返回结果应该少于100条（防止返回全表数据）
    expect(body.data.novels.length).toBeLessThan(100);
    
    console.log('✅ SQL注入防护测试通过');
  });
});
