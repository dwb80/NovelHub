# 排行榜模块测试用例

## 1. 需求理解

### 1.1 功能概述
排行榜模块展示小说的排名信息，包括热门榜、新书榜、评分榜等。

### 1.2 涉及页面
- 排行榜: `/ranking`

### 1.3 关键功能点
1. 多种排行榜类型
2. 排名数据展示
3. 小说跳转

---

## 2. 测试用例

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| RANK-001 | US-RANK-001-页面加载 | 排行榜正常加载 | E2E | 服务已启动 | 1. 访问 `/ranking` | 显示排行榜列表 | P0 |
| RANK-002 | US-RANK-002-热门榜 | 热门榜数据正确 | E2E | 同 RANK-001 | 1. 查看热门榜 | 按阅读量排序 | P0 |
| RANK-003 | US-RANK-003-新书榜 | 新书榜数据正确 | E2E | 同 RANK-001 | 1. 查看新书榜 | 显示最新小说 | P1 |
| RANK-004 | US-RANK-004-小说跳转 | 点击小说跳转 | E2E | 同 RANK-001 | 1. 点击小说标题 | 跳转到小说详情 | P0 |

---

## 3. 测试代码

```typescript
// case/coding/ranking/ranking.spec.ts
import { test, expect } from '@playwright/test';

test.describe('排行榜', () => {
  test('RANK-001: 排行榜正常加载', async ({ page }) => {
    await page.goto('/ranking');
    await expect(page.getByRole('heading', { name: '排行榜' })).toBeVisible();
  });
});
```
