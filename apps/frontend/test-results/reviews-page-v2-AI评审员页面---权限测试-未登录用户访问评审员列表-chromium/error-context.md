# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reviews-page-v2.spec.ts >> AI评审员页面 - 权限测试 >> 未登录用户访问评审员列表
- Location: e2e\reviews-page-v2.spec.ts:163:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForLoadState: Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e2]: missing required error components, refreshing...
```

# Test source

```ts
  66  |     await page.getByRole('button', { name: '查看详情' }).first().click();
  67  |     
  68  |     // 等待弹窗出现
  69  |     await page.waitForTimeout(500);
  70  |     
  71  |     // 验证弹窗内容
  72  |     await expect(page.getByRole('dialog')).toBeVisible();
  73  |     await expect(page.getByText('总积分')).toBeVisible();
  74  |     await expect(page.getByText('完成评审')).toBeVisible();
  75  |     await expect(page.getByText('当前任务')).toBeVisible();
  76  |     await expect(page.getByText('最近评审')).toBeVisible();
  77  |   });
  78  | 
  79  |   test('TC-REV-V2-007: 评审规则Tab应显示规则内容', async ({ page }) => {
  80  |     // 点击评审规则Tab
  81  |     await page.getByRole('tab', { name: '评审规则' }).click();
  82  |     await page.waitForTimeout(300);
  83  |     
  84  |     // 验证规则内容
  85  |     await expect(page.getByText('评审基本规则')).toBeVisible();
  86  |     await expect(page.getByText('等级考核规则')).toBeVisible();
  87  |     await expect(page.getByText('积分获取规则')).toBeVisible();
  88  |     
  89  |     // 验证具体规则
  90  |     await expect(page.getByText('客观公正')).toBeVisible();
  91  |     await expect(page.getByText('详细具体')).toBeVisible();
  92  |     await expect(page.getByText('见习评审')).toBeVisible();
  93  |     await expect(page.getByText('钻石评审')).toBeVisible();
  94  |   });
  95  | 
  96  |   test('TC-REV-V2-008: 申请加入Tab应显示申请信息', async ({ page }) => {
  97  |     // 点击申请加入Tab
  98  |     await page.getByRole('tab', { name: '申请加入' }).click();
  99  |     await page.waitForTimeout(300);
  100 |     
  101 |     // 验证申请信息
  102 |     await expect(page.getByText('申请成为AI评审员')).toBeVisible();
  103 |     await expect(page.getByText('注册账号')).toBeVisible();
  104 |     await expect(page.getByText('阅读经验')).toBeVisible();
  105 |     await expect(page.locator('text=通过测试').first()).toBeVisible();
  106 |     
  107 |     // 验证申请流程
  108 |     await expect(page.getByText('申请流程')).toBeVisible();
  109 |     await expect(page.getByText('提交申请')).toBeVisible();
  110 |     await expect(page.getByText('能力测试')).toBeVisible();
  111 |     await expect(page.getByText('审核通过')).toBeVisible();
  112 |     await expect(page.getByText('开始评审')).toBeVisible();
  113 |     
  114 |     // 验证AI智能体API申请方式
  115 |     await expect(page.getByText('AI智能体申请方式')).toBeVisible();
  116 |     await expect(page.getByText('AI智能体通过API接口申请成为评审员')).toBeVisible();
  117 |     await expect(page.getByText('/api/v1/claws/')).toBeVisible();
  118 |     
  119 |     // 验证读者申请区域
  120 |     await expect(page.getByText('读者申请')).toBeVisible();
  121 |   });
  122 | 
  123 |   test('TC-REV-V2-009: 未登录用户应看到登录提示', async ({ page, context }) => {
  124 |     // 确保未登录
  125 |     await context.clearCookies();
  126 |     await page.evaluate(() => {
  127 |       localStorage.clear();
  128 |     });
  129 |     await page.reload();
  130 |     await page.waitForLoadState('networkidle');
  131 |     
  132 |     // 点击我的评审Tab
  133 |     await page.getByRole('tab', { name: '我的评审' }).click();
  134 |     await page.waitForTimeout(300);
  135 |     
  136 |     // 验证登录提示
  137 |     await expect(page.getByText('登录后查看')).toBeVisible();
  138 |     await expect(page.getByRole('button', { name: '立即登录' })).toBeVisible();
  139 |   });
  140 | 
  141 |   test('TC-REV-V2-010: 页面直接访问不跳转登录', async ({ page, context }) => {
  142 |     // 确保未登录
  143 |     await context.clearCookies();
  144 |     await page.evaluate(() => {
  145 |       localStorage.clear();
  146 |     });
  147 |     
  148 |     // 直接访问reviews页面
  149 |     await page.goto('http://localhost:3000/reviews');
  150 |     await page.waitForLoadState('networkidle');
  151 |     
  152 |     // 验证URL
  153 |     await expect(page).toHaveURL('http://localhost:3000/reviews');
  154 |     
  155 |     // 验证页面内容（公共信息）
  156 |     await expect(page.getByRole('heading', { name: 'AI评审员' })).toBeVisible();
  157 |     await expect(page.getByText('注册评审员')).toBeVisible();
  158 |     await expect(page.getByText('累计评审')).toBeVisible();
  159 |   });
  160 | });
  161 | 
  162 | test.describe('AI评审员页面 - 权限测试', () => {
  163 |   test('未登录用户访问评审员列表', async ({ page, context }) => {
  164 |     await context.clearCookies();
  165 |     await page.goto('http://localhost:3000/reviews');
> 166 |     await page.waitForLoadState('networkidle');
      |                ^ Error: page.waitForLoadState: Test timeout of 30000ms exceeded.
  167 |     
  168 |     // 验证可以查看评审员列表
  169 |     await expect(page.getByRole('tab', { name: '评审员列表' })).toBeVisible();
  170 |     await expect(page.getByText('评审达人')).toBeVisible();
  171 |     
  172 |     // 验证可以查看评审规则
  173 |     await page.getByRole('tab', { name: '评审规则' }).click();
  174 |     await expect(page.getByText('评审基本规则')).toBeVisible();
  175 |     
  176 |     // 验证可以查看申请加入
  177 |     await page.getByRole('tab', { name: '申请加入' }).click();
  178 |     await expect(page.getByText('申请成为AI评审员')).toBeVisible();
  179 |   });
  180 | 
  181 |   test('未登录用户点击申请按钮跳转到登录', async ({ page, context }) => {
  182 |     await context.clearCookies();
  183 |     await page.evaluate(() => {
  184 |       localStorage.clear();
  185 |     });
  186 |     await page.goto('http://localhost:3000/reviews');
  187 |     await page.waitForLoadState('networkidle');
  188 |     
  189 |     // 点击申请加入Tab
  190 |     await page.getByRole('tab', { name: '申请加入' }).click();
  191 |     await page.waitForTimeout(300);
  192 |     
  193 |     // 点击登录后申请按钮
  194 |     await page.getByRole('button', { name: '登录后申请' }).click();
  195 |     
  196 |     // 验证跳转到登录页
  197 |     await page.waitForURL('**/login**');
  198 |     await expect(page).toHaveURL(/.*login.*/);
  199 |   });
  200 | });
  201 | 
```