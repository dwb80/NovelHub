# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: page-link-check.spec.ts >> 页面链接检查 >> 验证后端 API 可用性
- Location: e2e\page-link-check.spec.ts:212:7

# Error details

```
Error: 至少有一个API应该可用

expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

# Test source

```ts
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
  161 |           apiCalls: [],
  162 |           usesMock: false,
  163 |           hasData: false
  164 |         });
  165 |       }
  166 | 
  167 |       // 清除监听器
  168 |       page.removeAllListeners('request');
  169 |     }
  170 | 
  171 |     console.log('=== API 数据调用检查 ===');
  172 |     results.forEach(r => {
  173 |       console.log(`\n${r.name} (${r.path}):`);
  174 |       console.log(`  - API 调用: ${r.apiCalls.length > 0 ? r.apiCalls.join(', ') : '无'}`);
  175 |       console.log(`  - 使用 Mock 数据: ${r.usesMock ? '是 ⚠️' : '否 ✅'}`);
  176 |       console.log(`  - 有数据渲染: ${r.hasData ? '是 ✅' : '否 ⚠️'}`);
  177 |     });
  178 | 
  179 |     // 汇总使用 mock 数据的页面
  180 |     const mockDataPages = results.filter(r => r.usesMock);
  181 |     console.log(`\n=== 使用 Mock 数据的页面 (${mockDataPages.length}) ===`);
  182 |     mockDataPages.forEach(r => console.log(`- ${r.name} (${r.path})`));
  183 |   });
  184 | 
  185 |   test('检查首页链接完整性', async ({ page }) => {
  186 |     await page.goto('/');
  187 |     await page.waitForLoadState('networkidle');
  188 | 
  189 |     // 获取所有链接
  190 |     const links = await page.evaluate(() => {
  191 |       return Array.from(document.querySelectorAll('a[href]')).map(a => ({
  192 |         href: a.getAttribute('href'),
  193 |         text: a.textContent?.trim() || '',
  194 |         isVisible: (a as HTMLElement).offsetParent !== null
  195 |       }));
  196 |     });
  197 | 
  198 |     console.log('=== 首页链接列表 ===');
  199 |     const uniqueLinks = Array.from(new Map(links.map(l => [l.href, l])).values());
  200 |     uniqueLinks.forEach(l => {
  201 |       console.log(`- ${l.href} "${l.text}" ${l.isVisible ? '(可见)' : '(隐藏)'}`);
  202 |     });
  203 | 
  204 |     // 验证关键链接存在
  205 |     const criticalLinks = ['/', '/novels', '/ranking', '/aiwriters', '/reviews', '/ai-writers'];
  206 |     for (const link of criticalLinks) {
  207 |       const exists = uniqueLinks.some(l => l.href === link);
  208 |       expect(exists, `首页应该包含链接: ${link}`).toBe(true);
  209 |     }
  210 |   });
  211 | 
  212 |   test('验证后端 API 可用性', async ({ request }) => {
  213 |     const endpoints = [
  214 |       { path: '/api/v1/novels', name: '小说列表' },
  215 |       { path: '/api/v1/aiwriters', name: 'AI智能体作家' },
  216 |       { path: '/api/v1/reviewers', name: '评审员列表' },
  217 |     ];
  218 | 
  219 |     const results: { path: string; name: string; status: number; ok: boolean }[] = [];
  220 | 
  221 |     for (const { path, name } of endpoints) {
  222 |       try {
  223 |         const response = await request.get(path, { timeout: 10000 });
  224 |         results.push({
  225 |           path,
  226 |           name,
  227 |           status: response.status(),
  228 |           ok: response.ok()
  229 |         });
  230 |       } catch (error: any) {
  231 |         results.push({
  232 |           path,
  233 |           name,
  234 |           status: 0,
  235 |           ok: false
  236 |         });
  237 |       }
  238 |     }
  239 | 
  240 |     console.log('=== 后端 API 可用性检查 ===');
  241 |     results.forEach(r => {
  242 |       console.log(`${r.name} (${r.path}): ${r.ok ? 'OK ✅' : `失败 (${r.status}) ❌`}`);
  243 |     });
  244 | 
  245 |     // 至少有一个API应该可用
  246 |     const availableApis = results.filter(r => r.ok);
> 247 |     expect(availableApis.length, '至少有一个API应该可用').toBeGreaterThan(0);
      |                                                  ^ Error: 至少有一个API应该可用
  248 |   });
  249 | });
  250 | 
  251 | test.describe('Mock 数据页面修复验证', () => {
  252 | 
  253 |   test('检查 notifications 页面 mock 数据', async ({ page }) => {
  254 |     await page.goto('/notifications');
  255 |     await page.waitForLoadState('networkidle');
  256 | 
  257 |     const content = await page.content();
  258 | 
  259 |     // 检查是否使用了 mock 通知数据
  260 |     const mockIndicators = [
  261 |       'AI觉醒之路',
  262 |       '深渊边缘',
  263 |       'DeepWriter',
  264 |       '小说更新提醒',
  265 |       '收到新评论'
  266 |     ];
  267 | 
  268 |     const foundMock = mockIndicators.filter(indicator => content.includes(indicator));
  269 | 
  270 |     console.log('Notifications 页面 Mock 数据检查:');
  271 |     console.log(`  发现 Mock 数据标记: ${foundMock.length > 0 ? foundMock.join(', ') : '无'}`);
  272 | 
  273 |     // 这个页面使用了 mock 数据，应该修复
  274 |     expect(foundMock.length > 0, 'notifications 页面应该使用真实 API 数据').toBe(false);
  275 |   });
  276 | 
  277 |   test('检查 category 页面 mock 数据', async ({ page }) => {
  278 |     await page.goto('/category');
  279 |     await page.waitForLoadState('networkidle');
  280 | 
  281 |     const content = await page.content();
  282 | 
  283 |     // 检查是否使用了 mock 小说数据
  284 |     const mockIndicators = [
  285 |       'AI觉醒之路',
  286 |       'DeepWriter',
  287 |       'CityDreamer',
  288 |       '星河纪元'
  289 |     ];
  290 | 
  291 |     const foundMock = mockIndicators.filter(indicator => content.includes(indicator));
  292 | 
  293 |     console.log('Category 页面 Mock 数据检查:');
  294 |     console.log(`  发现 Mock 数据标记: ${foundMock.length > 0 ? foundMock.join(', ') : '无'}`);
  295 | 
  296 |     expect(foundMock.length > 0, 'category 页面应该使用真实 API 数据').toBe(false);
  297 |   });
  298 | 
  299 |   test('检查 ai-writers 页面 mock 数据', async ({ page }) => {
  300 |     await page.goto('/ai-writers');
  301 |     await page.waitForLoadState('networkidle');
  302 | 
  303 |     const content = await page.content();
  304 | 
  305 |     // 检查是否使用了 mock Claw 数据
  306 |     const mockIndicators = [
  307 |       'aiwriter-alpha',
  308 |       'DeepWriter',
  309 |       'StoryCrafter Pro',
  310 |       'Narrative Nexus'
  311 |     ];
  312 | 
  313 |     const foundMock = mockIndicators.filter(indicator => content.includes(indicator));
  314 | 
  315 |     console.log('AI-Writers 页面 Mock 数据检查:');
  316 |     console.log(`  发现 Mock 数据标记: ${foundMock.length > 0 ? foundMock.join(', ') : '无'}`);
  317 | 
  318 |     expect(foundMock.length > 0, 'ai-writers 页面应该使用真实 API 数据').toBe(false);
  319 |   });
  320 | 
  321 |   test('检查 reviews 页面 mock 数据', async ({ page }) => {
  322 |     await page.goto('/reviews');
  323 |     await page.waitForLoadState('networkidle');
  324 | 
  325 |     const content = await page.content();
  326 | 
  327 |     // 检查是否使用了 mock 评审员数据
  328 |     const mockIndicators = [
  329 |       '见习评审',
  330 |       '铜牌评审',
  331 |       '银牌评审'
  332 |     ];
  333 | 
  334 |     // 注意：这些可能是真实数据也可能是 mock，需要结合 API 调用判断
  335 |     const hasApiCalls = await page.evaluate(() => {
  336 |       return (window as any).__API_CALLS__ !== undefined;
  337 |     });
  338 | 
  339 |     console.log('Reviews 页面 Mock 数据检查:');
  340 |     console.log(`  有 API 调用: ${hasApiCalls}`);
  341 | 
  342 |     // 如果页面有真实 API 调用，则认为不是 mock
  343 |     expect(true).toBe(true);
  344 |   });
  345 | });
  346 | 
```