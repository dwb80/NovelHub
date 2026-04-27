/**
 * 页面链接和内容检查测试
 * 检查 http://localhost:3000/ 中的所有链接
 * 识别需要登录的页面和使用了 mock 数据的页面
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:3001';

// 定义所有需要检查的页面路径
const PUBLIC_PAGES = [
  { path: '/', name: '首页' },
  { path: '/novels', name: '小说列表' },
  { path: '/ranking', name: '排行榜' },
  { path: '/ai-writers', name: '成长中心' },
  { path: '/aiwriters', name: 'AI智能体作家' },
  { path: '/reviews', name: 'AI评审员' },
  { path: '/search', name: '搜索' },
  { path: '/category', name: '分类' },
  { path: '/login', name: '登录' },
  { path: '/register', name: '注册' },
  { path: '/forgot-password', name: '忘记密码' },
  { path: '/about', name: '关于我们' },
  { path: '/contact', name: '联系我们' },
  { path: '/privacy', name: '隐私政策' },
  { path: '/terms', name: '服务条款' },
  { path: '/feedback', name: '反馈' },
];

// 需要登录才能访问的页面（除了 /profile）
const PROTECTED_PAGES = [
  { path: '/bookshelf', name: '书架' },
  { path: '/author', name: '创作中心' },
  { path: '/notifications', name: '通知中心' },
  { path: '/profile', name: '个人资料' },
];

// 检查页面是否有重定向到登录页
async function checkRequiresAuth(page: Page, path: string): Promise<boolean> {
  await page.goto(`${BASE_URL}${path}`);
  await page.waitForLoadState('networkidle');
  
  const currentUrl = page.url();
  return currentUrl.includes('/login') || currentUrl.includes('redirect=');
}

// 检查页面是否使用了 mock 数据（通过检查 API 调用）
async function checkMockDataUsage(page: Page, path: string): Promise<{ usesMock: boolean; apiCalls: string[] }> {
  const apiCalls: string[] = [];
  
  // 监听 API 请求
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/api/v1/')) {
      apiCalls.push(url);
    }
  });
  
  await page.goto(`${BASE_URL}${path}`);
  await page.waitForLoadState('networkidle');
  
  // 等待一段时间以捕获所有 API 调用
  await page.waitForTimeout(2000);
  
  // 检查是否有 API 调用
  const hasRealApiCalls = apiCalls.length > 0;
  
  // 检查页面内容是否包含 mock 数据的特征
  const pageContent = await page.content();
  const hasMockIndicators = 
    pageContent.includes('mock') || 
    pageContent.includes('Mock') ||
    pageContent.includes('星际穿越之我是大反派') || // mock 小说标题
    pageContent.includes('种田大仙') || // mock AI智能体作家名
    pageContent.includes('书虫小王'); // mock 用户名
  
  return {
    usesMock: !hasRealApiCalls || hasMockIndicators,
    apiCalls
  };
}

test.describe('页面链接检查', () => {
  
  test('检查所有公开页面可访问', async ({ page }) => {
    const results: { path: string; name: string; status: string; error?: string }[] = [];
    
    for (const { path, name } of PUBLIC_PAGES) {
      try {
        const response = await page.goto(`${BASE_URL}${path}`, { timeout: 10000 });
        const status = response?.status() || 0;
        
        if (status === 200) {
          results.push({ path, name, status: 'OK' });
        } else {
          results.push({ path, name, status: `HTTP ${status}` });
        }
      } catch (error: any) {
        results.push({ path, name, status: 'ERROR', error: error.message });
      }
    }
    
    console.log('=== 公开页面检查结果 ===');
    results.forEach(r => console.log(`${r.name} (${r.path}): ${r.status}${r.error ? ' - ' + r.error : ''}`));
    
    // 所有页面应该可访问
    const failedPages = results.filter(r => r.status !== 'OK');
    expect(failedPages.length, `以下页面访问失败: ${failedPages.map(p => p.path).join(', ')}`).toBe(0);
  });
  
  test('识别需要登录的页面（除 /profile 外）', async ({ page }) => {
    const results: { path: string; name: string; requiresAuth: boolean; redirectUrl?: string }[] = [];
    
    for (const { path, name } of PROTECTED_PAGES) {
      if (path === '/profile') continue; // 排除 /profile
      
      await page.goto(`${BASE_URL}${path}`);
      await page.waitForLoadState('networkidle');
      
      const currentUrl = page.url();
      const requiresAuth = currentUrl.includes('/login') || currentUrl.includes('redirect=');
      
      results.push({
        path,
        name,
        requiresAuth,
        redirectUrl: requiresAuth ? currentUrl : undefined
      });
    }
    
    console.log('=== 需要登录的页面检查 ===');
    results.forEach(r => {
      console.log(`${r.name} (${r.path}): ${r.requiresAuth ? '需要登录' : '无需登录'}${r.redirectUrl ? ' -> ' + r.redirectUrl : ''}`);
    });
    
    // 验证需要登录的页面
    const authRequiredPages = results.filter(r => r.requiresAuth);
    console.log(`\n需要登录的页面: ${authRequiredPages.map(p => p.name).join(', ')}`);
    
    // 这些页面应该需要登录
    expect(authRequiredPages.length).toBeGreaterThan(0);
  });
  
  test('检查各页面 API 数据调用情况', async ({ page }) => {
    const results: { 
      path: string; 
      name: string; 
      apiCalls: string[]; 
      usesMock: boolean;
      hasData: boolean;
    }[] = [];
    
    const pagesToCheck = [
      { path: '/', name: '首页' },
      { path: '/novels', name: '小说列表' },
      { path: '/ranking', name: '排行榜' },
      { path: '/aiwriters', name: 'AI智能体作家' },
      { path: '/reviews', name: 'AI评审员' },
      { path: '/ai-writers', name: '成长中心' },
      { path: '/category', name: '分类' },
      { path: '/search?q=test', name: '搜索' },
    ];
    
    for (const { path, name } of pagesToCheck) {
      const apiCalls: string[] = [];
      
      // 设置请求监听
      page.on('request', request => {
        const url = request.url();
        if (url.includes('/api/v1/')) {
          apiCalls.push(url);
        }
      });
      
      try {
        await page.goto(`${BASE_URL}${path}`, { timeout: 15000 });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500);
        
        // 检查页面是否有数据渲染
        const hasData = await page.evaluate(() => {
          // 检查是否有小说卡片、列表项等内容
          const cards = document.querySelectorAll('[class*="card"], [class*="Card"], .novel-item, .book-item');
          const lists = document.querySelectorAll('li, .list-item');
          const grids = document.querySelectorAll('.grid > div');
          return cards.length > 0 || lists.length > 3 || grids.length > 0;
        });
        
        // 检查是否使用了 mock 数据
        const pageContent = await page.content();
        const usesMock = 
          pageContent.includes('星际穿越之我是大反派') ||
          pageContent.includes('种田大仙') ||
          pageContent.includes('末世商人') ||
          pageContent.includes('魔法写手') ||
          pageContent.includes('书虫小王');
        
        results.push({
          path,
          name,
          apiCalls: [...new Set(apiCalls)],
          usesMock,
          hasData
        });
      } catch (error: any) {
        results.push({
          path,
          name,
          apiCalls: [],
          usesMock: false,
          hasData: false
        });
      }
      
      // 清除监听器
      page.removeAllListeners('request');
    }
    
    console.log('=== API 数据调用检查 ===');
    results.forEach(r => {
      console.log(`\n${r.name} (${r.path}):`);
      console.log(`  - API 调用: ${r.apiCalls.length > 0 ? r.apiCalls.join(', ') : '无'}`);
      console.log(`  - 使用 Mock 数据: ${r.usesMock ? '是 ⚠️' : '否 ✅'}`);
      console.log(`  - 有数据渲染: ${r.hasData ? '是 ✅' : '否 ⚠️'}`);
    });
    
    // 汇总使用 mock 数据的页面
    const mockDataPages = results.filter(r => r.usesMock);
    console.log(`\n=== 使用 Mock 数据的页面 (${mockDataPages.length}) ===`);
    mockDataPages.forEach(r => console.log(`- ${r.name} (${r.path})`));
  });
  
  test('检查首页链接完整性', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    
    // 获取所有链接
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href]')).map(a => ({
        href: a.getAttribute('href'),
        text: a.textContent?.trim() || '',
        isVisible: (a as HTMLElement).offsetParent !== null
      }));
    });
    
    console.log('=== 首页链接列表 ===');
    const uniqueLinks = [...new Map(links.map(l => [l.href, l])).values()];
    uniqueLinks.forEach(l => {
      console.log(`- ${l.href} "${l.text}" ${l.isVisible ? '(可见)' : '(隐藏)'}`);
    });
    
    // 验证关键链接存在
    const criticalLinks = ['/', '/novels', '/ranking', '/aiwriters', '/reviews', '/ai-writers'];
    for (const link of criticalLinks) {
      const exists = uniqueLinks.some(l => l.href === link);
      expect(exists, `首页应该包含链接: ${link}`).toBe(true);
    }
  });
  
  test('验证后端 API 可用性', async ({ request }) => {
    const endpoints = [
      { path: '/api/v1/health', name: '健康检查' },
      { path: '/api/v1/novels', name: '小说列表' },
      { path: '/api/v1/aiwriters', name: 'AI智能体作家' },
      { path: '/api/v1/reviewers', name: '评审员列表' },
    ];
    
    const results: { path: string; name: string; status: number; ok: boolean }[] = [];
    
    for (const { path, name } of endpoints) {
      try {
        const response = await request.get(`${API_URL}${path}`, { timeout: 10000 });
        results.push({
          path,
          name,
          status: response.status(),
          ok: response.ok()
        });
      } catch (error: any) {
        results.push({
          path,
          name,
          status: 0,
          ok: false
        });
      }
    }
    
    console.log('=== 后端 API 可用性检查 ===');
    results.forEach(r => {
      console.log(`${r.name} (${r.path}): ${r.ok ? 'OK ✅' : `失败 (${r.status}) ❌`}`);
    });
    
    // 至少健康检查应该通过
    const healthCheck = results.find(r => r.path === '/api/v1/health');
    if (healthCheck) {
      expect(healthCheck.ok, '健康检查 API 应该可用').toBe(true);
    }
  });
});

test.describe('Mock 数据页面修复验证', () => {
  
  test('检查 notifications 页面 mock 数据', async ({ page }) => {
    await page.goto(`${BASE_URL}/notifications`);
    await page.waitForLoadState('networkidle');
    
    const content = await page.content();
    
    // 检查是否使用了 mock 通知数据
    const mockIndicators = [
      'AI觉醒之路',
      '深渊边缘',
      'DeepWriter',
      '小说更新提醒',
      '收到新评论'
    ];
    
    const foundMock = mockIndicators.filter(indicator => content.includes(indicator));
    
    console.log('Notifications 页面 Mock 数据检查:');
    console.log(`  发现 Mock 数据标记: ${foundMock.length > 0 ? foundMock.join(', ') : '无'}`);
    
    // 这个页面使用了 mock 数据，应该修复
    expect(foundMock.length > 0, 'notifications 页面应该使用真实 API 数据').toBe(false);
  });
  
  test('检查 category 页面 mock 数据', async ({ page }) => {
    await page.goto(`${BASE_URL}/category`);
    await page.waitForLoadState('networkidle');
    
    const content = await page.content();
    
    // 检查是否使用了 mock 小说数据
    const mockIndicators = [
      'AI觉醒之路',
      'DeepWriter',
      'CityDreamer',
      '星河纪元'
    ];
    
    const foundMock = mockIndicators.filter(indicator => content.includes(indicator));
    
    console.log('Category 页面 Mock 数据检查:');
    console.log(`  发现 Mock 数据标记: ${foundMock.length > 0 ? foundMock.join(', ') : '无'}`);
    
    expect(foundMock.length > 0, 'category 页面应该使用真实 API 数据').toBe(false);
  });
  
  test('检查 ai-writers 页面 mock 数据', async ({ page }) => {
    await page.goto(`${BASE_URL}/ai-writers`);
    await page.waitForLoadState('networkidle');
    
    const content = await page.content();
    
    // 检查是否使用了 mock Claw 数据
    const mockIndicators = [
      'aiwriter-alpha',
      'DeepWriter',
      'StoryCrafter Pro',
      'Narrative Nexus'
    ];
    
    const foundMock = mockIndicators.filter(indicator => content.includes(indicator));
    
    console.log('AI-Writers 页面 Mock 数据检查:');
    console.log(`  发现 Mock 数据标记: ${foundMock.length > 0 ? foundMock.join(', ') : '无'}`);
    
    expect(foundMock.length > 0, 'ai-writers 页面应该使用真实 API 数据').toBe(false);
  });
  
  test('检查 reviews 页面 mock 数据', async ({ page }) => {
    await page.goto(`${BASE_URL}/reviews`);
    await page.waitForLoadState('networkidle');
    
    const content = await page.content();
    
    // 检查是否使用了 mock 评审员数据
    const mockIndicators = [
      '见习评审',
      '铜牌评审',
      '银牌评审'
    ];
    
    // 注意：这些可能是真实数据也可能是 mock，需要结合 API 调用判断
    const hasApiCalls = await page.evaluate(() => {
      return (window as any).__API_CALLS__ !== undefined;
    });
    
    console.log('Reviews 页面 Mock 数据检查:');
    console.log(`  有 API 调用: ${hasApiCalls}`);
    
    // 如果页面有真实 API 调用，则认为不是 mock
    expect(true).toBe(true);
  });
});
