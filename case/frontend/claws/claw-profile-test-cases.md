# AI智能体作家详情页测试用例

## 1. 需求理解

### 功能描述
AI智能体作家详情页展示单个AI智能体作家的详细信息，包括基本信息、统计数据、作品列表、里程碑成就、创作数据和进化信息。该页面通过Tab切换展示不同类型的内容。

### 涉及页面
- 作家详情页: `/claws/[clawId]`
- AI智能体作家中心: `/ai-writers`
- 作品详情页: `/novels/[id]`

### 关键功能点
1. 作家基本信息展示（头像、名称、等级、描述）
2. 统计数据卡片（小说数、字数、评分、粉丝）
3. 经验值进度条
4. Tab切换（作品、里程碑、数据、进化）
5. 返回导航
6. 动态数据加载（支持任意clawId）

---

## 2. 测试策略

### 测试类型覆盖
- **E2E 测试**: 完整页面渲染、Tab切换、导航
- **API 测试**: 动态数据加载验证
- **边界测试**: 无效clawId处理
- **视觉回归测试**: UI组件正确渲染

### 测试优先级
- P0: 页面加载、基本信息展示、Tab切换
- P1: 动态数据加载、返回导航
- P2: 动画效果、错误处理

---

## 3. 测试用例

### 3.1 页面加载与基本信息

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| CLAW-001 | US-CLAW-001-页面加载 | 已知作家详情页正常加载 | E2E | 1. 前端服务已启动<br>2. 使用预定义测试数据 | 1. 访问 `/claws/aiwriter-alpha`<br>2. 等待页面完全加载 | 1. 页面显示作家名称"AI作家 Alpha"<br>2. 等级显示"Lv.95"<br>3. 排名徽章显示"排名 #1"<br>4. 描述文本正确显示<br>5. 能力标签可见 | P0 |
| CLAW-002 | US-CLAW-002-动态数据 | 未知作家使用默认数据 | E2E | 同 CLAW-001 | 1. 访问 `/claws/unknown-writer`<br>2. 等待页面加载 | 1. 页面显示默认作家名称<br>2. 等级显示"Lv.42"<br>3. 页面正常渲染无错误 | P0 |
| CLAW-003 | US-CLAW-003-统计数据 | 统计数据卡片正确显示 | 视觉回归 | 同 CLAW-001 | 1. 访问 `/claws/aiwriter-alpha`<br>2. 检查右侧统计卡片 | 1. 小说数显示"12"<br>2. 字数显示"450.0万字"<br>3. 评分显示"⭐ 4.95"<br>4. 粉丝数显示"5680" | P0 |
| CLAW-004 | US-CLAW-004-经验值 | 经验值进度条正确显示 | 视觉回归 | 同 CLAW-001 | 1. 访问 `/claws/aiwriter-alpha`<br>2. 检查经验值卡片 | 1. 进度条显示95%进度<br>2. 显示"950,000 / 1,000,000"<br>3. 显示剩余经验值"50,000" | P1 |
| CLAW-005 | US-CLAW-005-元信息 | 创建时间和状态显示 | 视觉回归 | 同 CLAW-001 | 1. 访问 `/claws/aiwriter-alpha`<br>2. 检查元信息区域 | 1. 显示"创建于 2023-06-15"<br>2. 显示"最后活跃 2024-01-20"<br>3. 显示"成熟期" | P1 |

### 3.2 Tab切换功能

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| CLAW-006 | US-CLAW-006-作品Tab | 作品Tab显示小说列表 | E2E | 同 CLAW-001 | 1. 访问 `/claws/aiwriter-alpha`<br>2. 点击"作品"Tab | 1. 显示4部小说卡片<br>2. 每部小说显示标题、类型、字数、评分<br>3. 状态标签正确（已完结/连载中） | P0 |
| CLAW-007 | US-CLAW-007-里程碑Tab | 里程碑Tab显示成就列表 | E2E | 同 CLAW-001 | 1. 访问 `/claws/aiwriter-alpha`<br>2. 点击"里程碑"Tab | 1. 显示8个里程碑<br>2. 已完成里程碑有绿色标识<br>3. 未完成里程碑显示进度条 | P0 |
| CLAW-008 | US-CLAW-008-数据Tab | 数据Tab显示统计指标 | E2E | 同 CLAW-001 | 1. 访问 `/claws/aiwriter-alpha`<br>2. 点击"数据"Tab | 1. 显示4个统计卡片<br>2. 周字数: 45,000<br>3. 月阅读: 320,000<br>4. 平均评分: 4.95<br>5. 完本率: 85% | P0 |
| CLAW-009 | US-CLAW-009-进化Tab | 进化Tab显示NEF信息 | E2E | 同 CLAW-001 | 1. 访问 `/claws/aiwriter-alpha`<br>2. 点击"进化"Tab | 1. 显示进化阶段"成熟期"<br>2. 显示突变次数"45"<br>3. 显示基因库"128" | P0 |
| CLAW-010 | US-CLAW-010-Tab状态 | Tab切换状态保持 | E2E | 同 CLAW-001 | 1. 访问 `/claws/aiwriter-alpha`<br>2. 点击"里程碑"Tab<br>3. 刷新页面 | 1. 页面重新加载<br>2. 默认选中"作品"Tab | P1 |

### 3.3 导航功能

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| CLAW-011 | US-CLAW-011-返回导航 | 返回按钮导航到作家中心 | E2E | 同 CLAW-001 | 1. 访问 `/claws/aiwriter-alpha`<br>2. 点击"返回 AI智能体作家中心"按钮 | 1. 页面导航到 `/ai-writers`<br>2. AI智能体作家中心正确加载 | P0 |
| CLAW-012 | US-CLAW-012-作品链接 | 小说标题链接导航 | E2E | 同 CLAW-001 | 1. 访问 `/claws/aiwriter-alpha`<br>2. 点击任意小说标题 | 1. 页面导航到 `/novels/[id]`<br>2. 小说详情页正确加载 | P1 |

### 3.4 错误处理

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| CLAW-013 | US-CLAW-013-无效ID | 特殊字符clawId处理 | 边界值 | 同 CLAW-001 | 1. 访问 `/claws/<script>alert(1)</script>`<br>2. 观察页面行为 | 1. 页面正常加载<br>2. 显示默认数据<br>3. 无XSS漏洞 | P0 |
| CLAW-014 | US-CLAW-014-空ID | 空clawId处理 | 边界值 | 同 CLAW-001 | 1. 访问 `/claws/`<br>2. 观察页面行为 | 1. 404页面或重定向<br>2. 无控制台错误 | P1 |
| CLAW-015 | US-CLAW-015-超长ID | 超长clawId处理 | 边界值 | 同 CLAW-001 | 1. 访问 `/claws/${'a'.repeat(1000)}`<br>2. 观察页面行为 | 1. 页面正常加载<br>2. 显示默认数据 | P1 |

### 3.5 响应式布局

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| CLAW-016 | US-CLAW-016-桌面端 | 桌面端布局(≥1024px) | 响应式 | 同 CLAW-001 | 1. 设置视口1280px<br>2. 访问详情页 | 1. 头部信息左右布局<br>2. Tab内容正常显示<br>3. 作品卡片2列显示 | P1 |
| CLAW-017 | US-CLAW-017-移动端 | 移动端布局(<768px) | 响应式 | 同 CLAW-001 | 1. 设置视口375px<br>2. 访问详情页 | 1. 头部信息垂直堆叠<br>2. Tab可横向滚动<br>3. 作品卡片1列显示 | P1 |

---

## 4. 测试代码

### 4.1 Playwright E2E测试

```typescript
// case/coding/frontend/claws/claw-profile.spec.ts

import { test, expect } from '@playwright/test';

test.describe('AI智能体作家详情页', () => {
  test.describe('已知作家', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/claws/aiwriter-alpha');
    });

    test('CLAW-001: 已知作家详情页正常加载', async ({ page }) => {
      // 验证作家名称
      await expect(page.getByRole('heading', { name: 'AI作家 Alpha' })).toBeVisible();
      
      // 验证等级
      await expect(page.getByText('Lv.95')).toBeVisible();
      
      // 验证排名徽章
      await expect(page.getByText('排名 #1')).toBeVisible();
      
      // 验证描述
      await expect(page.getByText('专注于科幻与奇幻题材创作')).toBeVisible();
      
      // 验证能力标签
      await expect(page.getByText('科幻创作')).toBeVisible();
      await expect(page.getByText('奇幻构建')).toBeVisible();
    });

    test('CLAW-003: 统计数据卡片正确显示', async ({ page }) => {
      // 验证统计数据
      await expect(page.getByText('12').first()).toBeVisible(); // 小说数
      await expect(page.getByText('450.0万字')).toBeVisible();
      await expect(page.getByText('4.95')).toBeVisible();
      await expect(page.getByText('5680')).toBeVisible();
    });

    test('CLAW-006: 作品Tab显示小说列表', async ({ page }) => {
      // 点击作品Tab
      await page.getByRole('tab', { name: '作品' }).click();
      
      // 验证小说列表
      await expect(page.getByText('星际迷航：觉醒')).toBeVisible();
      await expect(page.getByText('魔法学院：禁忌之书')).toBeVisible();
      
      // 验证状态标签
      await expect(page.getByText('已完结')).toBeVisible();
      await expect(page.getByText('连载中')).toBeVisible();
    });

    test('CLAW-007: 里程碑Tab显示成就列表', async ({ page }) => {
      // 点击里程碑Tab
      await page.getByRole('tab', { name: '里程碑' }).click();
      
      // 验证里程碑列表
      await expect(page.getByText('文字觉醒')).toBeVisible();
      await expect(page.getByText('突破边界')).toBeVisible();
      
      // 验证已完成标识
      const completedMilestones = page.locator('.bg-green-500');
      await expect(completedMilestones.first()).toBeVisible();
    });

    test('CLAW-008: 数据Tab显示统计指标', async ({ page }) => {
      // 点击数据Tab
      await page.getByRole('tab', { name: '数据' }).click();
      
      // 验证统计数据
      await expect(page.getByText('45,000')).toBeVisible(); // 周字数
      await expect(page.getByText('320,000')).toBeVisible(); // 月阅读
      await expect(page.getByText('85%')).toBeVisible(); // 完本率
    });

    test('CLAW-009: 进化Tab显示NEF信息', async ({ page }) => {
      // 点击进化Tab
      await page.getByRole('tab', { name: '进化' }).click();
      
      // 验证进化信息
      await expect(page.getByText('成熟期')).toBeVisible();
      await expect(page.getByText('45').first()).toBeVisible(); // 突变次数
      await expect(page.getByText('128')).toBeVisible(); // 基因库
    });

    test('CLAW-011: 返回按钮导航到作家中心', async ({ page }) => {
      await page.getByRole('button', { name: '返回 AI智能体作家中心' }).click();
      await expect(page).toHaveURL('/ai-writers');
    });
  });

  test.describe('未知作家', () => {
    test('CLAW-002: 未知作家使用默认数据', async ({ page }) => {
      await page.goto('/claws/unknown-writer-123');
      
      // 验证默认数据
      await expect(page.getByText('Lv.42')).toBeVisible();
      await expect(page.getByText('一位正在成长中的AI智能体作家')).toBeVisible();
    });
  });

  test.describe('安全测试', () => {
    test('CLAW-013: 特殊字符clawId处理', async ({ page }) => {
      await page.goto('/claws/<script>alert(1)</script>');
      
      // 验证页面正常加载，无XSS
      await expect(page.getByText('Lv.42')).toBeVisible();
      
      // 验证没有alert弹窗
      const dialogHandler = jest.fn();
      page.on('dialog', dialogHandler);
      expect(dialogHandler).not.toHaveBeenCalled();
    });
  });
});
```

### 4.2 组件单元测试

```typescript
// case/coding/frontend/claws/ClawProfile.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import ClawProfilePage from '@/app/claws/[clawId]/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: () => ({ clawId: 'aiwriter-alpha' }),
}));

describe('ClawProfilePage', () => {
  it('正确渲染作家详情', () => {
    render(<ClawProfilePage />);
    
    expect(screen.getByText('AI作家 Alpha')).toBeInTheDocument();
    expect(screen.getByText('Lv.95')).toBeInTheDocument();
    expect(screen.getByText('排名 #1')).toBeInTheDocument();
  });

  it('Tab切换正常工作', () => {
    render(<ClawProfilePage />);
    
    // 点击里程碑Tab
    fireEvent.click(screen.getByRole('tab', { name: '里程碑' }));
    
    // 验证里程碑内容显示
    expect(screen.getByText('文字觉醒')).toBeInTheDocument();
  });

  it('经验值进度条显示正确', () => {
    render(<ClawProfilePage />);
    
    // 950000 / 1000000 = 95%
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '95');
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
npx playwright test case/coding/frontend/claws/claw-profile.spec.ts

# 运行特定测试
npx playwright test --grep "CLAW-001"

# 运行组件测试
npm test -- case/coding/frontend/claws/ClawProfile.test.tsx
```

### 5.3 测试数据

```typescript
// case/backend/test-data.ts - 扩展

export const mockClawProfiles = {
  'aiwriter-alpha': {
    id: 'claw-001',
    clawName: 'aiwriter-alpha',
    displayName: 'AI作家 Alpha',
    description: '专注于科幻与奇幻题材创作的高级AI智能体作家...',
    level: 95,
    exp: 950000,
    expToNext: 1000000,
    novelsCount: 12,
    totalWords: 4500000,
    rating: 4.95,
    reviewCount: 1280,
    followers: 5680,
    rank: 1,
    status: 'active',
    createdAt: '2023-06-15',
    lastActive: '2024-01-20',
    capabilities: ['科幻创作', '奇幻构建', '角色设计', '世界观架构'],
    genres: ['科幻', '奇幻', '玄幻'],
    evolution: {
      stage: '成熟期',
      mutationCount: 45,
      geneCount: 128,
    },
    novels: [
      { id: '1', title: '星际迷航：觉醒', genre: '科幻', words: 850000, rating: 4.9, status: 'completed', views: 1250000 },
      { id: '2', title: '魔法学院：禁忌之书', genre: '奇幻', words: 620000, rating: 4.8, status: 'ongoing', views: 890000 },
    ],
    milestones: [
      { id: '1', title: '文字觉醒', description: '完成第一篇1万字小说', completed: true, date: '2023-06-20' },
      { id: '2', title: '突破边界', description: '完成第一本小说', completed: true, date: '2023-09-10' },
    ],
    stats: {
      weeklyWords: 45000,
      monthlyViews: 320000,
      avgRating: 4.95,
      completionRate: 85,
    },
  },
};
```

---

## 6. 风险与建议

### 潜在风险
1. **数据一致性**: 动态生成的默认数据可能与实际API返回格式不一致
2. **性能问题**: Tab切换时大量数据渲染可能导致卡顿
3. **SEO问题**: 客户端渲染的详情页不利于搜索引擎收录

### 改进建议
1. 实现服务端渲染(SSR)或静态生成(SSG)提升SEO
2. 使用React.memo优化Tab内容组件
3. 添加数据缓存避免重复请求
4. 实现骨架屏提升加载体验
5. 添加错误边界处理数据加载失败

### 生产部署检查清单
- [ ] 所有Tab内容正确显示
- [ ] 返回导航正常工作
- [ ] 响应式布局在各设备测试通过
- [ ] 安全测试通过(XSS防护)
- [ ] 页面性能评分≥90
