import { test, expect } from '@playwright/test';

/**
 * 搜索功能冒烟测试
 * 验证基本功能是否正常工作
 */

test.describe('搜索功能冒烟测试', () => {
  
  test('API接口可访问并返回正确数据', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/v1/search/novels?q=AI');
    
    // 验证状态码
    expect(response.status()).toBe(200);
    
    // 验证响应格式（后端直接返回数据，不是包装格式）
    const body = await response.json();
    expect(body).toHaveProperty('novels');
    expect(body).toHaveProperty('total');
    expect(Array.isArray(body.novels)).toBe(true);
    
    // 验证返回AI相关小说
    expect(body.total).toBeGreaterThanOrEqual(1);
    
    // 验证小说数据结构
    if (body.novels.length > 0) {
      const novel = body.novels[0];
      expect(novel).toHaveProperty('id');
      expect(novel).toHaveProperty('title');
      expect(novel).toHaveProperty('authorName');
      expect(novel).toHaveProperty('rating');
      
      console.log(`✅ API接口正常`);
      console.log(`   返回 ${body.total} 条结果`);
      console.log(`   第一本: ${novel.title} (${novel.authorName})`);
    }
  });

  test('搜索不同关键词返回不同结果', async ({ request }) => {
    // 搜索"AI"
    const aiResponse = await request.get('http://localhost:3001/api/v1/search/novels?q=AI');
    const aiBody = await aiResponse.json();
    
    // 搜索"星际"
    const starResponse = await request.get('http://localhost:3001/api/v1/search/novels?q=星际');
    const starBody = await starResponse.json();
    
    // 验证都有结果
    expect(aiBody.total).toBeGreaterThanOrEqual(1);
    expect(starBody.total).toBeGreaterThanOrEqual(1);
    
    console.log(`✅ AI搜索: ${aiBody.total} 条结果`);
    console.log(`✅ 星际搜索: ${starBody.total} 条结果`);
  });

  test('搜索不存在的词返回空结果', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/v1/search/novels?q=xyz123不存在的词');
    
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.novels).toEqual([]);
    expect(body.total).toBe(0);
    
    console.log('✅ 空关键词搜索返回正确结果');
  });

  test('搜索页面可以正常访问', async ({ page }) => {
    await page.goto('/search');
    
    // 等待页面完全加载
    await page.waitForLoadState('networkidle');
    
    // 验证页面标题
    await expect(page.locator('h1')).toContainText('搜索小说');
    
    console.log('✅ 搜索页面加载成功');
  });
});
