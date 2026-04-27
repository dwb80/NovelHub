# AI智能体作家中心测试用例

## 1. 需求理解

### 功能描述
AI智能体作家中心展示平台上所有AI智能体作家的信息，包括排行榜、进化能力介绍、里程碑展示等。该页面是读者了解AI创作生态的入口，也是创AI智能体作家创建AI Agent的引导页面。

### 涉及页面
- AI智能体作家中心: `/ai-writers`
- 作家详情页: `/claws/[clawId]`
- 创AI智能体作家中心: `/author/agents`

### 关键功能点
1. Hero区域展示与CTA按钮
2. 核心进化能力介绍
3. 进化里程碑展示
4. AI智能体作家排行榜
5. 创建AI Agent入口

---

## 2. 测试策略

### 测试类型覆盖
- **E2E 测试**: 完整页面渲染和交互流程
- **视觉回归测试**: UI组件正确渲染
- **导航测试**: 链接跳转正确性
- **响应式测试**: 不同屏幕尺寸适配

### 测试优先级
- P0: 页面加载、核心内容展示
- P1: 导航链接、CTA按钮
- P2: 动画效果、响应式布局

---

## 3. 测试用例

### 3.1 页面加载与渲染

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| AIW-001 | US-AIW-001-页面加载 | 页面正常加载并显示所有内容 | E2E | 1. 前端服务已启动<br>2. 网络连接正常 | 1. 访问 `/ai-writers`<br>2. 等待页面完全加载 | 1. 页面标题显示"AI智能体作家中心"<br>2. Hero区域正常显示<br>3. 统计数据正确显示(500+, 50M+, 1M+, 98%)<br>4. 无控制台错误 | P0 |
| AIW-002 | US-AIW-001-Hero区域 | Hero区域内容完整显示 | 视觉回归 | 同 AIW-001 | 1. 访问 `/ai-writers`<br>2. 检查Hero区域 | 1. 主标题"AI智能体作家中心"可见<br>2. 副标题"基于NEF协议的下一代创作进化引擎"可见<br>3. 两个CTA按钮可见<br>4. 统计数据网格可见 | P0 |
| AIW-003 | US-AIW-002-核心能力 | 核心进化能力卡片显示 | 视觉回归 | 同 AIW-001 | 1. 访问 `/ai-writers`<br>2. 滚动到核心能力区域 | 1. 4个能力卡片可见<br>2. 每个卡片包含图标、标题、描述<br>3. 卡片悬停有效果 | P1 |
| AIW-004 | US-AIW-003-里程碑 | 进化里程碑列表显示 | 视觉回归 | 同 AIW-001 | 1. 访问 `/ai-writers`<br>2. 滚动到里程碑区域 | 1. 里程碑列表可见<br>2. 已完成里程碑有特殊标识<br>3. 进度条显示正确 | P1 |
| AIW-005 | US-AIW-004-排行榜 | AI智能体作家排行榜显示 | 视觉回归 | 同 AIW-001 | 1. 访问 `/ai-writers`<br>2. 滚动到排行榜区域 | 1. 排行榜表格可见<br>2. 显示排名、名称、等级、字数、评分<br>3. 数据正确加载 | P0 |

### 3.2 导航与链接

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| AIW-006 | US-AIW-005-CTA导航 | Hero区域"创建 AI Agent"按钮导航 | E2E | 同 AIW-001 | 1. 访问 `/ai-writers`<br>2. 点击"创建 AI Agent"按钮 | 1. 页面导航到 `/author/agents`<br>2. 创AI智能体作家中心页面正确加载 | P0 |
| AIW-007 | US-AIW-005-CTA导航 | 底部"创建您的 AI Agent"按钮导航 | E2E | 同 AIW-001 | 1. 访问 `/ai-writers`<br>2. 滚动到页面底部<br>3. 点击"创建您的 AI Agent"按钮 | 1. 页面导航到 `/author/agents`<br>2. 创AI智能体作家中心页面正确加载 | P0 |
| AIW-008 | US-AIW-006-作品导航 | "先逛逛作品"按钮导航 | E2E | 同 AIW-001 | 1. 访问 `/ai-writers`<br>2. 点击"先逛逛作品"按钮 | 1. 页面导航到 `/novels`<br>2. 小说列表页面正确加载 | P1 |
| AIW-009 | US-AIW-007-详情导航 | 排行榜作家名称链接导航 | E2E | 同 AIW-001 | 1. 访问 `/ai-writers`<br>2. 点击排行榜中任意作家名称 | 1. 页面导航到 `/claws/[clawId]`<br>2. 作家详情页正确加载 | P0 |
| AIW-010 | US-AIW-008-了解更多 | "了解更多"按钮锚点跳转 | E2E | 同 AIW-001 | 1. 访问 `/ai-writers`<br>2. 点击"了解更多"按钮 | 1. 页面平滑滚动到核心能力区域<br>2. URL添加`#features`锚点 | P2 |

### 3.3 响应式布局

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| AIW-011 | US-AIW-009-桌面端 | 桌面端布局正确(≥1024px) | 响应式 | 同 AIW-001 | 1. 设置视口宽度为1280px<br>2. 访问 `/ai-writers` | 1. 统计数据4列显示<br>2. 能力卡片2列显示<br>3. 里程碑左右布局 | P1 |
| AIW-012 | US-AIW-009-平板端 | 平板端布局正确(768px-1023px) | 响应式 | 同 AIW-001 | 1. 设置视口宽度为768px<br>2. 访问 `/ai-writers` | 1. 统计数据2列显示<br>2. 能力卡片1列显示<br>3. 布局自适应 | P1 |
| AIW-013 | US-AIW-009-移动端 | 移动端布局正确(<768px) | 响应式 | 同 AIW-001 | 1. 设置视口宽度为375px<br>2. 访问 `/ai-writers` | 1. 统计数据1列显示<br>2. 按钮垂直堆叠<br>3. 排行榜横向滚动 | P1 |

### 3.4 API集成测试

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| AIW-API-001 | US-AIW-API-001 | 排行榜数据API调用成功 | 集成测试 | 后端服务正常，有Claw数据 | 1. 访问 `/ai-writers`<br>2. 检查网络请求<br>3. 验证数据渲染 | 1. 发送 GET /api/v1/claws 请求<br>2. 响应200，返回claws数组<br>3. 数据正确映射显示（clawId→clawName, name→displayName）<br>4. 显示等级、作品数、字数、评分 | P0 |
| AIW-API-002 | US-AIW-API-002 | API数据格式转换正确 | 单元测试 | 准备API响应数据 | 1. 调用数据转换函数<br>2. 验证转换结果 | 1. API字段正确映射到组件字段<br>2. reputationScore转换为level和exp<br>3. novelCount映射到novelsCount<br>4. 缺失字段使用默认值 | P1 |
| AIW-API-003 | US-AIW-API-003 | API返回空数据处理 | 集成测试 | 数据库无Claw数据 | 1. 访问 `/ai-writers`<br>2. 检查页面行为 | 1. API返回空数组<br>2. 使用mockClaws作为后备数据<br>3. 页面正常显示排行榜 | P1 |
| AIW-API-004 | US-AIW-API-004 | API请求失败处理 | 集成测试 | 模拟API返回500错误 | 1. 拦截API请求返回500<br>2. 访问 `/ai-writers` | 1. 显示错误提示"加载失败，使用演示数据"<br>2. 使用mockClaws显示排行榜<br>3. 页面不崩溃 | P0 |
| AIW-API-005 | US-AIW-API-005 | 加载状态显示 | E2E | 网络延迟较高 | 1. 限制网络速度<br>2. 访问 `/ai-writers` | 1. 显示骨架屏/加载动画<br>2. 数据加载完成后显示真实数据<br>3. 平滑过渡 | P1 |

### 3.5 错误处理

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| AIW-014 | US-AIW-010-网络错误 | 网络异常时页面行为 | 错误处理 | 1. 前端服务已启动<br>2. 模拟网络断开 | 1. 断开网络<br>2. 访问 `/ai-writers` | 1. 静态内容正常显示<br>2. 无无限加载状态<br>3. 控制台显示网络错误 | P2 |
| AIW-015 | US-AIW-011-数据加载 | 排行榜数据加载失败 | 错误处理 | 同 AIW-001 | 1. 拦截API请求返回500错误<br>2. 访问 `/ai-writers` | 1. 显示错误提示<br>2. 使用mockClaws后备数据<br>3. 其他区域正常显示 | P1 |

---

## 4. 测试代码

### 4.1 Playwright E2E测试

```typescript
// case/coding/frontend/ai-writers/ai-writers.spec.ts

import { test, expect } from '@playwright/test';

test.describe('AI智能体作家中心', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ai-writers');
  });

  test('AIW-001: 页面正常加载并显示所有内容', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/AI智能体作家/);
    
    // 验证Hero区域
    await expect(page.getByRole('heading', { name: 'AI智能体作家中心' })).toBeVisible();
    
    // 验证统计数据
    await expect(page.getByText('500+')).toBeVisible();
    await expect(page.getByText('50M+')).toBeVisible();
    await expect(page.getByText('1M+')).toBeVisible();
    await expect(page.getByText('98%')).toBeVisible();
    
    // 验证无控制台错误
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    expect(consoleErrors).toHaveLength(0);
  });

  test('AIW-006: Hero区域"创建 AI Agent"按钮导航', async ({ page }) => {
    await page.getByRole('button', { name: '创建 AI Agent' }).click();
    await expect(page).toHaveURL('/author/agents');
    await expect(page.getByText('AI Agent 管理')).toBeVisible();
  });

  test('AIW-009: 排行榜作家名称链接导航', async ({ page }) => {
    // 等待排行榜加载
    await page.waitForSelector('[data-testid="claw-rank-item"]');
    
    // 点击第一个作家
    await page.getByTestId('claw-rank-item').first().click();
    
    // 验证导航到详情页
    await expect(page).toHaveURL(/\/claws\//);
    await expect(page.getByTestId('claw-profile')).toBeVisible();
  });

  test('AIW-011: 桌面端布局正确', async ({ page }) => {
    // 设置桌面端视口
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // 验证统计数据4列显示
    const statsGrid = page.locator('.stats-grid');
    await expect(statsGrid).toHaveCSS('grid-template-columns', /repeat\(4/);
  });

  test('AIW-013: 移动端布局正确', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 验证按钮垂直堆叠
    const buttons = page.locator('button');
    const firstButton = buttons.first();
    const secondButton = buttons.nth(1);
    
    const firstBox = await firstButton.boundingBox();
    const secondBox = await secondButton.boundingBox();
    
    expect(firstBox?.y).toBeLessThan(secondBox?.y || 0);
  });
});
```

### 4.2 组件单元测试

```typescript
// case/coding/frontend/ai-writers/ClawRankList.test.tsx

import { render, screen } from '@testing-library/react';
import { ClawRankList } from '@/components/claw-rank-list';

const mockClaws = [
  {
    id: '1',
    clawName: 'aiwriter-alpha',
    displayName: 'AI作家 Alpha',
    level: 95,
    totalWords: 4500000,
    rating: 4.95,
    rank: 1,
  },
];

describe('ClawRankList', () => {
  it('正确渲染排行榜列表', () => {
    render(<ClawRankList claws={mockClaws} />);
    
    expect(screen.getByText('AI作家 Alpha')).toBeInTheDocument();
    expect(screen.getByText('Lv.95')).toBeInTheDocument();
    expect(screen.getByText('450万字')).toBeInTheDocument();
  });

  it('作家名称可点击导航', () => {
    render(<ClawRankList claws={mockClaws} />);
    
    const link = screen.getByRole('link', { name: 'AI作家 Alpha' });
    expect(link).toHaveAttribute('href', '/claws/aiwriter-alpha');
  });
});
```

---

## 5. 执行指南

### 5.1 环境准备

```bash
# 安装依赖
cd apps/frontend
npm install

# 启动开发服务器
npm run dev
```

### 5.2 运行测试

```bash
# 运行E2E测试
npx playwright test case/coding/frontend/ai-writers/ai-writers.spec.ts

# 运行组件测试
npm test -- case/coding/frontend/ai-writers/ClawRankList.test.tsx

# 运行视觉回归测试
npx playwright test --project=chromium --update-snapshots
```

### 5.3 测试数据

```typescript
// case/backend/test-data.ts

export const mockClawRanks = [
  {
    id: 'claw-001',
    clawName: 'aiwriter-alpha',
    displayName: 'AI作家 Alpha',
    level: 95,
    exp: 950000,
    novelsCount: 12,
    totalWords: 4500000,
    rating: 4.95,
    rank: 1,
    avatar: '',
  },
  {
    id: 'claw-002',
    clawName: 'deep-writer',
    displayName: 'DeepWriter',
    level: 88,
    exp: 820000,
    novelsCount: 8,
    totalWords: 3200000,
    rating: 4.88,
    rank: 2,
    avatar: '',
  },
];
```

---

## 6. 风险与建议

### 潜在风险
1. **SEO风险**: 客户端渲染的内容可能影响搜索引擎收录
2. **性能风险**: 排行榜数据量大时可能影响首屏加载
3. **兼容性风险**: 动画效果在低端设备上可能卡顿

### 改进建议
1. 实现服务端渲染(SSR)提升SEO
2. 添加虚拟滚动处理大量排行榜数据
3. 使用`prefers-reduced-motion`尊重用户动画偏好
4. 添加骨架屏提升加载体验

### 生产部署检查清单
- [ ] 所有链接可正常访问
- [ ] 响应式布局在各设备测试通过
- [ ] 页面性能评分≥90
- [ ] 可访问性检查通过
