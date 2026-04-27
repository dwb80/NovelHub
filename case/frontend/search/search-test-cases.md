# 搜索功能测试用例

## 1. 需求理解

### 1.1 功能概述
搜索功能允许用户通过关键词搜索小说，支持按小说标题、AI智能体作家名、描述、标签等多维度搜索。

### 1.2 涉及技术组件
- **前端**: Next.js 14 App Router, React Query, Tailwind CSS
- **后端**: NestJS, Prisma ORM, PostgreSQL
- **API端点**: `GET /api/v1/search/novels?q={keyword}`
- **响应格式**: 直接返回 `{novels: [], total: number}` (非包装格式)

---

## 2. 测试策略

本次测试覆盖以下类型：
- **E2E测试**: 使用Playwright测试完整搜索流程
- **集成测试**: 前后端API交互测试
- **契约测试**: API响应格式验证
- **负例测试**: 错误处理和边界情况

---

## 3. 测试用例

### 3.1 正例测试

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| TC-SEARCH-001 | US-SEARCH-001-基础搜索 | 搜索关键词"AI"返回相关小说 | E2E | 数据库已填充测试数据 | 1. 访问/search?q=ai<br>2. 等待结果加载 | 1. 返回3本AI相关小说<br>2. 显示"找到 3 个结果"<br>3. 每本小说显示标题、AI智能体作家、评分 | P0 |
| TC-SEARCH-002 | US-SEARCH-001-基础搜索 | 搜索关键词"星际"返回相关小说 | E2E | 数据库已填充测试数据 | 1. 访问/search?q=星际<br>2. 等待结果加载 | 1. 返回1本星际相关小说<br>2. 显示"星际穿越之我是大反派" | P0 |
| TC-SEARCH-003 | US-SEARCH-001-基础搜索 | 搜索关键词"修仙"返回相关小说 | E2E | 数据库已填充测试数据 | 1. 访问/search?q=修仙<br>2. 等待结果加载 | 1. 返回2本修仙相关小说<br>2. 包含"修仙从种田开始"和"数据修仙" | P0 |
| TC-SEARCH-004 | US-SEARCH-002-AI智能体作家搜索 | 搜索AI智能体作家名"星际作家" | E2E | 数据库已填充测试数据 | 1. 访问/search?q=星际作家<br>2. 等待结果加载 | 1. 返回该AI智能体作家的小说<br>2. 显示"星际穿越之我是大反派" | P0 |
| TC-SEARCH-005 | US-SEARCH-003-标签搜索 | 搜索标签"系统" | E2E | 数据库已填充测试数据 | 1. 访问/search?q=系统<br>2. 等待结果加载 | 1. 返回包含"系统"标签的小说<br>2. 至少返回4本小说 | P0 |
| TC-SEARCH-006 | US-SEARCH-004-描述搜索 | 搜索描述中的关键词"程序员" | E2E | 数据库已填充测试数据 | 1. 访问/search?q=程序员<br>2. 等待结果加载 | 1. 返回"算法之王"和"虚拟现实：代码世界" | P0 |

### 3.2 负例测试

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| TC-SEARCH-101 | US-SEARCH-005-空结果处理 | 搜索不存在的关键词 | E2E | 数据库已填充测试数据 | 1. 访问/search?q=不存在的词<br>2. 等待结果加载 | 1. 显示"没有找到相关小说"<br>2. 页面无错误 | P1 |
| TC-SEARCH-102 | US-SEARCH-006-特殊字符处理 | 搜索包含特殊字符的关键词 | E2E | 数据库已填充测试数据 | 1. 访问/search?q=<script><br>2. 等待结果加载 | 1. 无XSS漏洞<br>2. 正常返回结果或空结果 | P1 |
| TC-SEARCH-103 | US-SEARCH-007-超长关键词 | 搜索超长关键词(>100字符) | E2E | 数据库已填充测试数据 | 1. 访问/search?q=超长关键词...<br>2. 等待结果加载 | 1. 正常处理，不崩溃<br>2. 返回空结果或截断搜索 | P2 |
| TC-SEARCH-104 | US-SEARCH-008-SQL注入防护 | 尝试SQL注入攻击 | 集成 | 后端服务运行中 | 1. 发送GET /api/v1/search/novels?q=' OR '1'='1 | 1. 返回400或正常搜索结果<br>2. 不暴露数据库错误 | P0 |

### 3.3 边界测试

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| TC-SEARCH-201 | US-SEARCH-009-分页测试 | 搜索结果分页显示 | E2E | 数据库有大量测试数据 | 1. 搜索返回多页结果<br>2. 点击下一页 | 1. 正确显示分页控件<br>2. 页面切换正常 | P2 |
| TC-SEARCH-202 | US-SEARCH-010-性能测试 | 搜索响应时间测试 | 性能 | 数据库已填充测试数据 | 1. 发送搜索请求<br>2. 测量响应时间 | 1. 响应时间<500ms<br>2. 页面渲染<1s | P1 |
| TC-SEARCH-203 | US-SEARCH-011-并发搜索 | 多用户同时搜索 | 性能 | 数据库已填充测试数据 | 1. 模拟10个并发搜索请求 | 1. 所有请求正常返回<br>2. 无数据库连接池耗尽 | P2 |

### 3.4 集成测试

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| TC-SEARCH-301 | API-GET-/api/v1/search/novels | 后端API正常返回 | 集成 | 后端服务运行中 | 1. 发送GET /api/v1/search/novels?q=AI | 1. HTTP 200<br>2. 直接返回数据（非包装格式）<br>3. 包含novels数组和total字段 | P0 |
| TC-SEARCH-302 | API-GET-/api/v1/search/novels | 后端API参数验证 | 集成 | 后端服务运行中 | 1. 发送GET /api/v1/search/novels(无q参数) | 1. HTTP 400<br>2. 返回错误信息 | P1 |
| TC-SEARCH-303 | API-Schema验证 | 响应数据格式验证 | 契约 | 后端服务运行中 | 1. 发送搜索请求<br>2. 验证响应Schema | 1. 返回格式: {novels: [], total: number}<br>2. 所有必需字段存在 | P0 |

### 3.5 封面显示测试

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| TC-SEARCH-401 | US-SEARCH-002-搜索结果展示 | 搜索结果显示小说封面 | E2E | 数据库已填充测试数据(含封面) | 1. 访问/search?q=AI<br>2. 查看搜索结果卡片 | 1. 每本小说显示封面图片<br>2. 图片加载正常无破损<br>3. 无封面时显示默认图标 | P0 |
| TC-SEARCH-402 | US-SEARCH-002-搜索结果展示 | 封面图片加载失败处理 | E2E | 数据库已填充测试数据 | 1. 访问/search?q=AI<br>2. 模拟图片加载失败 | 1. 显示默认占位图标<br>2. 不影响其他内容显示 | P1 |

---

## 4. 测试代码

### 4.1 Playwright E2E测试

**文件路径**: `case/coding/search/search.e2e.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('搜索功能 E2E测试', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/search');
  });

  test('TC-SEARCH-001: 搜索关键词"AI"返回相关小说', async ({ page }) => {
    // 输入搜索关键词
    await page.fill('input[type="search"]', 'AI');
    await page.click('button:has-text("搜索")');
    
    // 等待结果加载
    await page.waitForSelector('.search-results', { timeout: 5000 });
    
    // 验证结果
    const resultsText = await page.textContent('text=/找到.*个结果/');
    expect(resultsText).toMatch(/找到/);
    
    // 验证返回AI相关小说
    const novelTitles = await page.locator('.novel-title').allTextContents();
    const aiNovels = novelTitles.filter(title => 
      title.includes('AI') || title.includes('智能') || title.includes('数据')
    );
    expect(aiNovels.length).toBeGreaterThanOrEqual(1);
  });

  test('TC-SEARCH-002: 搜索关键词"星际"返回相关小说', async ({ page }) => {
    await page.fill('input[type="search"]', '星际');
    await page.click('button:has-text("搜索")');
    
    await page.waitForSelector('.search-results', { timeout: 5000 });
    
    const novelTitles = await page.locator('.novel-title').allTextContents();
    expect(novelTitles).toContain('星际穿越之我是大反派');
  });

  test('TC-SEARCH-101: 搜索不存在的关键词显示空结果', async ({ page }) => {
    await page.fill('input[type="search"]', '不存在的词xyz123');
    await page.click('button:has-text("搜索")');
    
    await page.waitForTimeout(1000);
    
    const emptyText = await page.textContent('text=没有找到相关小说');
    expect(emptyText).toContain('没有找到相关小说');
  });

  test('TC-SEARCH-102: 搜索特殊字符无XSS漏洞', async ({ page }) => {
    await page.fill('input[type="search"]', '<script>alert("xss")</script>');
    await page.click('button:has-text("搜索")');
    
    await page.waitForTimeout(1000);
    
    // 验证页面没有执行脚本
    const hasAlert = await page.evaluate(() => {
      return (window as any).alertTriggered;
    });
    expect(hasAlert).toBeFalsy();
  });

  test('TC-SEARCH-202: 搜索响应时间测试', async ({ page }) => {
    const startTime = Date.now();
    
    await page.fill('input[type="search"]', '科幻');
    await page.click('button:has-text("搜索")');
    
    await page.waitForSelector('.search-results', { timeout: 5000 });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    expect(responseTime).toBeLessThan(2000);
  });
});
```

### 4.2 后端API集成测试

**文件路径**: `case/coding/search/search-api.integration.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('搜索API集成测试', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('TC-SEARCH-301: 后端API正常返回', async () => {
    const response = await request(app.getHttpServer())
      .get('/search/novels?q=AI')
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('total');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('TC-SEARCH-302: 后端API参数验证', async () => {
    await request(app.getHttpServer())
      .get('/search/novels')
      .expect(400);
  });

  it('TC-SEARCH-303: 响应数据格式验证', async () => {
    const response = await request(app.getHttpServer())
      .get('/search/novels?q=AI')
      .expect(200);

    const novel = response.body.data[0];
    expect(novel).toHaveProperty('id');
    expect(novel).toHaveProperty('title');
    expect(novel).toHaveProperty('authorName');
    expect(novel).toHaveProperty('rating');
    expect(novel).toHaveProperty('wordCount');
  });

  it('TC-SEARCH-104: SQL注入防护测试', async () => {
    const response = await request(app.getHttpServer())
      .get('/search/novels?q=\' OR \'1\'=\'1')
      .expect(200);

    // 应该返回正常搜索结果或空结果，而不是所有数据
    expect(response.body.data.length).toBeLessThan(100);
  });
});
```

---

## 5. 执行指南

### 5.1 环境准备

```bash
# 1. 确保PostgreSQL运行
pg_ctl -D ./pgsql/data start

# 2. 运行数据库迁移
cd apps/backend
npm run db:migrate:dev

# 3. 填充测试数据
npm run db:seed:dev

# 4. 启动后端服务
npm run dev

# 5. 启动前端服务
cd apps/frontend
npm run dev
```

### 5.2 运行测试

```bash
# 运行Playwright E2E测试
cd case/coding/search
npx playwright test search.e2e.spec.ts

# 运行后端集成测试
cd apps/backend
npm run test search-api.integration.spec.ts

# 运行所有搜索相关测试
npm run test -- --testNamePattern="search"
```

### 5.3 环境变量

```env
# .env.development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/novelhub_dev"
```

---

## 6. 风险与建议

### 6.1 潜在风险

1. **性能风险**: 当小说数据量增大时，全文搜索可能变慢
   - 建议: 添加数据库索引，考虑使用Elasticsearch

2. **安全风险**: 搜索关键词未充分过滤可能导致XSS
   - 建议: 前端和后端都进行输入验证和转义

3. **数据一致性**: 搜索缓存可能导致数据不一致
   - 建议: 设置合理的缓存过期时间

### 6.2 覆盖率建议

- 代码覆盖率目标: >80%
- 分支覆盖率目标: >70%
- 关键路径必须100%覆盖

### 6.3 生产部署注意事项

1. 确保数据库索引已创建
2. 配置适当的连接池大小
3. 启用查询日志监控慢查询
4. 设置搜索频率限制防止滥用
