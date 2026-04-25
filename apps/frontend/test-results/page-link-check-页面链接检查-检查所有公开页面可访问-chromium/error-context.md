# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: page-link-check.spec.ts >> 页面链接检查 >> 检查所有公开页面可访问
- Location: e2e\page-link-check.spec.ts:37:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: 以下页面访问失败: /search, /login, /register, /about, /contact, /privacy, /terms, /feedback

expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 8
```

# Test source

```ts
  1   | /**
  2   |  * 页面链接和内容检查测试
  3   |  * 检查所有页面链接
  4   |  * 识别需要登录的页面和使用了 mock 数据的页面
  5   |  */
  6   | 
  7   | import { test, expect, Page } from '@playwright/test';
  8   | 
  9   | // 定义所有需要检查的页面路径
  10  | const PUBLIC_PAGES = [
  11  |   { path: '/', name: '首页' },
  12  |   { path: '/novels', name: '小说列表' },
  13  |   { path: '/ranking', name: '排行榜' },
  14  |   { path: '/ai-writers', name: '成长中心' },
  15  |   { path: '/aiwriters', name: 'AI智能体作家' },
  16  |   { path: '/reviews', name: 'AI评审员' },
  17  |   { path: '/search', name: '搜索' },
  18  |   { path: '/login', name: '登录' },
  19  |   { path: '/register', name: '注册' },
  20  |   { path: '/about', name: '关于我们' },
  21  |   { path: '/contact', name: '联系我们' },
  22  |   { path: '/privacy', name: '隐私政策' },
  23  |   { path: '/terms', name: '服务条款' },
  24  |   { path: '/feedback', name: '反馈' },
  25  | ];
  26  | 
  27  | // 需要登录才能访问的页面（除了 /profile）
  28  | const PROTECTED_PAGES = [
  29  |   { path: '/bookshelf', name: '书架' },
  30  |   { path: '/author', name: '创作中心' },
  31  |   { path: '/notifications', name: '通知中心' },
  32  |   { path: '/profile', name: '个人资料' },
  33  | ];
  34  | 
  35  | test.describe('页面链接检查', () => {
  36  | 
  37  |   test('检查所有公开页面可访问', async ({ page }) => {
  38  |     const results: { path: string; name: string; status: string; error?: string }[] = [];
  39  | 
  40  |     for (const { path, name } of PUBLIC_PAGES) {
  41  |       try {
  42  |         const response = await page.goto(path, { timeout: 10000 });
  43  |         const status = response?.status() || 0;
  44  | 
  45  |         if (status === 200) {
  46  |           results.push({ path, name, status: 'OK' });
  47  |         } else {
  48  |           results.push({ path, name, status: `HTTP ${status}` });
  49  |         }
  50  |       } catch (error: any) {
  51  |         results.push({ path, name, status: 'ERROR', error: error.message });
  52  |       }
  53  |     }
  54  | 
  55  |     console.log('=== 公开页面检查结果 ===');
  56  |     results.forEach(r => console.log(`${r.name} (${r.path}): ${r.status}${r.error ? ' - ' + r.error : ''}`));
  57  | 
  58  |     // 所有页面应该可访问
  59  |     const failedPages = results.filter(r => r.status !== 'OK');
> 60  |     expect(failedPages.length, `以下页面访问失败: ${failedPages.map(p => p.path).join(', ')}`).toBe(0);
      |                                                                                        ^ Error: 以下页面访问失败: /search, /login, /register, /about, /contact, /privacy, /terms, /feedback
  61  |   });
  62  | 
  63  |   test('识别需要登录的页面（除 /profile 外）', async ({ page }) => {
  64  |     const results: { path: string; name: string; requiresAuth: boolean; redirectUrl?: string }[] = [];
  65  | 
  66  |     for (const { path, name } of PROTECTED_PAGES) {
  67  |       if (path === '/profile') continue; // 排除 /profile
  68  | 
  69  |       await page.goto(path);
  70  |       await page.waitForLoadState('networkidle');
  71  | 
  72  |       const currentUrl = page.url();
  73  |       const requiresAuth = currentUrl.includes('/login') || currentUrl.includes('redirect=');
  74  | 
  75  |       results.push({
  76  |         path,
  77  |         name,
  78  |         requiresAuth,
  79  |         redirectUrl: requiresAuth ? currentUrl : undefined
  80  |       });
  81  |     }
  82  | 
  83  |     console.log('=== 需要登录的页面检查 ===');
  84  |     results.forEach(r => {
  85  |       console.log(`${r.name} (${r.path}): ${r.requiresAuth ? '需要登录' : '无需登录'}${r.redirectUrl ? ' -> ' + r.redirectUrl : ''}`);
  86  |     });
  87  | 
  88  |     // 验证需要登录的页面
  89  |     const authRequiredPages = results.filter(r => r.requiresAuth);
  90  |     console.log(`\n需要登录的页面: ${authRequiredPages.map(p => p.name).join(', ')}`);
  91  | 
  92  |     // 这些页面应该需要登录
  93  |     expect(authRequiredPages.length).toBeGreaterThan(0);
  94  |   });
  95  | 
  96  |   test('检查各页面 API 数据调用情况', async ({ page }) => {
  97  |     const results: {
  98  |       path: string;
  99  |       name: string;
  100 |       apiCalls: string[];
  101 |       usesMock: boolean;
  102 |       hasData: boolean;
  103 |     }[] = [];
  104 | 
  105 |     const pagesToCheck = [
  106 |       { path: '/', name: '首页' },
  107 |       { path: '/novels', name: '小说列表' },
  108 |       { path: '/ranking', name: '排行榜' },
  109 |       { path: '/claws', name: 'AI智能体作家' },
  110 |       { path: '/reviews', name: 'AI评审员' },
  111 |       { path: '/ai-writers', name: '成长中心' },
  112 |       { path: '/category', name: '分类' },
  113 |       { path: '/search?q=test', name: '搜索' },
  114 |     ];
  115 | 
  116 |     for (const { path, name } of pagesToCheck) {
  117 |       const apiCalls: string[] = [];
  118 | 
  119 |       // 设置请求监听
  120 |       page.on('request', request => {
  121 |         const url = request.url();
  122 |         if (url.includes('/api/v1/')) {
  123 |           apiCalls.push(url);
  124 |         }
  125 |       });
  126 | 
  127 |       try {
  128 |         await page.goto(path, { timeout: 15000 });
  129 |         await page.waitForLoadState('networkidle');
  130 |         await page.waitForTimeout(1500);
  131 | 
  132 |         // 检查页面是否有数据渲染
  133 |         const hasData = await page.evaluate(() => {
  134 |           // 检查是否有小说卡片、列表项等内容
  135 |           const cards = document.querySelectorAll('[class*="card"], [class*="Card"], .novel-item, .book-item');
  136 |           const lists = document.querySelectorAll('li, .list-item');
  137 |           const grids = document.querySelectorAll('.grid > div');
  138 |           return cards.length > 0 || lists.length > 3 || grids.length > 0;
  139 |         });
  140 | 
  141 |         // 检查是否使用了 mock 数据
  142 |         const pageContent = await page.content();
  143 |         const usesMock =
  144 |           pageContent.includes('星际穿越之我是大反派') ||
  145 |           pageContent.includes('种田大仙') ||
  146 |           pageContent.includes('末世商人') ||
  147 |           pageContent.includes('魔法写手') ||
  148 |           pageContent.includes('书虫小王');
  149 | 
  150 |         results.push({
  151 |           path,
  152 |           name,
  153 |           apiCalls: Array.from(new Set(apiCalls)),
  154 |           usesMock,
  155 |           hasData
  156 |         });
  157 |       } catch (error) {
  158 |         results.push({
  159 |           path,
  160 |           name,
```