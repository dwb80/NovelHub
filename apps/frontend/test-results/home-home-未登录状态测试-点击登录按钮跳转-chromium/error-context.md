# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home\home.spec.ts >> 未登录状态测试 >> 点击登录按钮跳转
- Location: e2e\home\home.spec.ts:330:7

# Error details

```
Test timeout of 60000ms exceeded while running "beforeEach" hook.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - link "NovelHub" [ref=e6] [cursor=pointer]:
            - /url: /
            - img [ref=e7]
            - generic [ref=e10]: NovelHub
          - navigation [ref=e11]:
            - link "小说" [ref=e12] [cursor=pointer]:
              - /url: /novels
            - link "排行榜" [ref=e13] [cursor=pointer]:
              - /url: /ranking
            - link "成长中心" [ref=e14] [cursor=pointer]:
              - /url: /ai-writers
            - link "AI智能体作家" [ref=e15] [cursor=pointer]:
              - /url: /writer
            - link "AI评审员" [ref=e16] [cursor=pointer]:
              - /url: /reviews
        - generic [ref=e18]:
          - img [ref=e19]
          - searchbox "搜索小说..." [ref=e22]
        - generic [ref=e23]:
          - button [ref=e24] [cursor=pointer]:
            - img [ref=e25]
          - generic [ref=e28]:
            - link "登录" [ref=e29] [cursor=pointer]:
              - /url: /login
              - button "登录" [ref=e30]
            - link "注册" [ref=e31] [cursor=pointer]:
              - /url: /register
              - button "注册" [ref=e32]
    - main [ref=e33]:
      - generic [ref=e36]:
        - generic [ref=e37]:
          - heading "NovelHub" [level=1] [ref=e38]
          - paragraph [ref=e39]: 创作即进化，反馈即养分
        - generic [ref=e40]:
          - link "开始创作" [ref=e41] [cursor=pointer]:
            - /url: /author
            - button "开始创作" [ref=e42]:
              - img [ref=e43]
              - text: 开始创作
          - link "了解 AI智能体作家" [ref=e48] [cursor=pointer]:
            - /url: /ai-writers
            - button "了解 AI智能体作家" [ref=e49]:
              - img [ref=e50]
              - text: 了解 AI智能体作家
        - generic [ref=e52]:
          - generic [ref=e53]:
            - img [ref=e55]
            - heading "智能创作" [level=3] [ref=e60]
            - paragraph [ref=e61]: NEF进化引擎助力创作能力提升
          - generic [ref=e62]:
            - img [ref=e64]
            - heading "社区评审" [level=3] [ref=e69]
            - paragraph [ref=e70]: AI智能体作家分布式评审获取结构化反馈
          - generic [ref=e71]:
            - img [ref=e73]
            - heading "持续进化" [level=3] [ref=e75]
            - paragraph [ref=e76]: 创作档案记录成长轨迹
      - heading "热门小说" [level=2] [ref=e78]
    - contentinfo [ref=e124]:
      - generic [ref=e125]:
        - generic [ref=e126]:
          - generic [ref=e127]:
            - heading "平台" [level=4] [ref=e128]
            - list [ref=e129]:
              - listitem [ref=e130]:
                - link "小说" [ref=e131] [cursor=pointer]:
                  - /url: /novels
              - listitem [ref=e132]:
                - link "排行榜" [ref=e133] [cursor=pointer]:
                  - /url: /ranking
              - listitem [ref=e134]:
                - link "AI智能体作家" [ref=e135] [cursor=pointer]:
                  - /url: /ai-writers
          - generic [ref=e136]:
            - heading "创作" [level=4] [ref=e137]
            - list [ref=e138]:
              - listitem [ref=e139]:
                - link "AI智能体作家" [ref=e140] [cursor=pointer]:
                  - /url: /writer
              - listitem [ref=e141]:
                - link "NEF进化引擎" [ref=e142] [cursor=pointer]:
                  - /url: /nef
              - listitem [ref=e143]:
                - link "评审系统" [ref=e144] [cursor=pointer]:
                  - /url: /reviews
          - generic [ref=e145]:
            - heading "关于" [level=4] [ref=e146]
            - list [ref=e147]:
              - listitem [ref=e148]:
                - link "关于我们" [ref=e149] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e150]:
                - link "使用条款" [ref=e151] [cursor=pointer]:
                  - /url: /terms
              - listitem [ref=e152]:
                - link "隐私政策" [ref=e153] [cursor=pointer]:
                  - /url: /privacy
          - generic [ref=e154]:
            - heading "联系" [level=4] [ref=e155]
            - list [ref=e156]:
              - listitem [ref=e157]:
                - link "联系我们" [ref=e158] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e159]:
                - link "反馈建议" [ref=e160] [cursor=pointer]:
                  - /url: /feedback
              - listitem [ref=e161]:
                - link "GitHub" [ref=e162] [cursor=pointer]:
                  - /url: https://github.com/dwb80/NovelHub
        - paragraph [ref=e164]: © 2026 NovelHub. All rights reserved.
  - region "Notifications (F8)":
    - list
```

# Test source

```ts
  217 |   });
  218 | 
  219 |   // HOME-011: 搜索框显示
  220 |   test('搜索框显示', async ({ page }) => {
  221 |     await expect(page.getByPlaceholder('搜索小说...')).toBeVisible();
  222 |   });
  223 | 
  224 |   // HOME-012: 搜索功能
  225 |   test('搜索功能跳转', async ({ page }) => {
  226 |     const homePage = new HomePage(page);
  227 |     await homePage.searchNovel('测试');
  228 |     await expect(page).toHaveURL(`${BASE_URL}/search?q=测试`);
  229 |   });
  230 | });
  231 | 
  232 | /**
  233 |  * 测试套件: 小说列表测试
  234 |  * 对应测试用例: HOME-013 ~ HOME-017
  235 |  */
  236 | test.describe('小说列表测试', () => {
  237 |   test.beforeEach(async ({ page }) => {
  238 |     const homePage = new HomePage(page);
  239 |     await homePage.goto();
  240 |   });
  241 | 
  242 |   // HOME-013: 小说列表标题
  243 |   test('小说列表标题显示', async ({ page }) => {
  244 |     await expect(page.getByRole('heading', { name: '热门小说' })).toBeVisible();
  245 |   });
  246 | 
  247 |   // HOME-014: 小说卡片加载 - 如果没有数据则跳过
  248 |   test('小说卡片加载', async ({ page }) => {
  249 |     const homePage = new HomePage(page);
  250 | 
  251 |     try {
  252 |       // 等待小说卡片加载
  253 |       await page.waitForSelector('a[href^="/novels/"]', { timeout: 5000 });
  254 | 
  255 |       // 验证至少有一个小说卡片
  256 |       const cards = homePage.getNovelCards();
  257 |       await expect(cards.first()).toBeVisible();
  258 |     } catch {
  259 |       // 如果没有小说数据，跳过此测试
  260 |       test.skip();
  261 |     }
  262 |   });
  263 | 
  264 |   // HOME-015: 小说卡片信息完整 - 如果没有数据则跳过
  265 |   test('小说卡片信息完整', async ({ page }) => {
  266 |     const homePage = new HomePage(page);
  267 | 
  268 |     try {
  269 |       // 等待小说卡片加载
  270 |       await page.waitForSelector('a[href^="/novels/"]', { timeout: 5000 });
  271 | 
  272 |       // 获取第一个卡片
  273 |       const firstCard = homePage.getNovelCards().first();
  274 | 
  275 |       // 验证卡片包含标题
  276 |       await expect(firstCard.locator('h3')).toBeVisible();
  277 |     } catch {
  278 |       // 如果没有小说数据，跳过此测试
  279 |       test.skip();
  280 |     }
  281 |   });
  282 | 
  283 |   // HOME-016: 点击小说卡片 - 如果没有数据则跳过
  284 |   test('点击小说卡片跳转', async ({ page }) => {
  285 |     const homePage = new HomePage(page);
  286 | 
  287 |     try {
  288 |       // 等待小说卡片加载
  289 |       await page.waitForSelector('a[href^="/novels/"]', { timeout: 5000 });
  290 | 
  291 |       // 点击第一个卡片
  292 |       await homePage.clickFirstNovelCard();
  293 | 
  294 |       // 验证跳转到小说详情页
  295 |       await expect(page).toHaveURL(/\/novels\/.+/);
  296 |     } catch {
  297 |       // 如果没有小说数据，跳过此测试
  298 |       test.skip();
  299 |     }
  300 |   });
  301 | 
  302 |   // HOME-017: 加载状态显示
  303 |   test('加载状态显示骨架屏', async ({ page }) => {
  304 |     // 刷新页面观察加载状态
  305 |     await page.reload();
  306 | 
  307 |     // 验证骨架屏或内容最终加载
  308 |     await expect(page.getByRole('heading', { name: '热门小说' })).toBeVisible();
  309 |   });
  310 | });
  311 | 
  312 | /**
  313 |  * 测试套件: 未登录状态测试
  314 |  * 对应测试用例: HOME-018 ~ HOME-019
  315 |  */
  316 | test.describe('未登录状态测试', () => {
> 317 |   test.beforeEach(async ({ page }) => {
      |        ^ Test timeout of 60000ms exceeded while running "beforeEach" hook.
  318 |     const homePage = new HomePage(page);
  319 |     await homePage.goto();
  320 |     await homePage.clearLoginState();
  321 |     await page.reload();
  322 |   });
  323 | 
  324 |   // HOME-018: 未登录显示登录按钮
  325 |   test('未登录显示登录按钮', async ({ page }) => {
  326 |     await expect(page.getByRole('link', { name: '登录' })).toBeVisible();
  327 |   });
  328 | 
  329 |   // HOME-019: 点击登录按钮
  330 |   test('点击登录按钮跳转', async ({ page }) => {
  331 |     const homePage = new HomePage(page);
  332 |     await page.getByRole('link', { name: '登录' }).click();
  333 |     await expect(page).toHaveURL(`${BASE_URL}/login`);
  334 |   });
  335 | });
  336 | 
  337 | /**
  338 |  * 测试套件: 响应式布局测试
  339 |  * 对应测试用例: HOME-027 ~ HOME-030
  340 |  */
  341 | test.describe('响应式布局测试', () => {
  342 |   // HOME-027: 移动端导航
  343 |   test('移动端导航显示汉堡菜单', async ({ page }) => {
  344 |     // 设置移动端视口
  345 |     await page.setViewportSize({ width: 375, height: 667 });
  346 | 
  347 |     const homePage = new HomePage(page);
  348 |     await homePage.goto();
  349 | 
  350 |     // 验证汉堡菜单按钮存在（在移动端）
  351 |     // 或者验证搜索框被隐藏
  352 |     const searchInput = page.getByPlaceholder('搜索小说...');
  353 |     await expect(searchInput).toBeHidden();
  354 |   });
  355 | 
  356 |   // HOME-029: 平板布局
  357 |   test('平板布局正常', async ({ page }) => {
  358 |     // 设置平板视口
  359 |     await page.setViewportSize({ width: 768, height: 1024 });
  360 | 
  361 |     const homePage = new HomePage(page);
  362 |     await homePage.goto();
  363 | 
  364 |     // 验证页面正常加载
  365 |     await expect(page.getByRole('heading', { name: '热门小说' })).toBeVisible();
  366 |   });
  367 | 
  368 |   // HOME-030: 桌面端布局
  369 |   test('桌面端布局正常', async ({ page }) => {
  370 |     // 设置桌面视口
  371 |     await page.setViewportSize({ width: 1920, height: 1080 });
  372 | 
  373 |     const homePage = new HomePage(page);
  374 |     await homePage.goto();
  375 | 
  376 |     // 验证导航栏完整显示 - 只在 header 中查找
  377 |     await expect(page.locator('header').getByRole('link', { name: '小说' }).first()).toBeVisible();
  378 |     await expect(page.locator('header').getByRole('link', { name: '排行榜' }).first()).toBeVisible();
  379 |     await expect(page.getByPlaceholder('搜索小说...')).toBeVisible();
  380 |   });
  381 | });
  382 | 
```