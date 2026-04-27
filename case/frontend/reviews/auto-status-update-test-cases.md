# 章节评审自动状态更新 - 测试用例

## 需求描述
评审员提交评分后，系统自动计算平均评审得分：
- 当章节评价得分 >= 9分 时，状态自动变更为 **已发布 (PUBLISHED)**
- 当章节评价得分 < 9分 时，状态自动变更为 **已拒绝 (REJECTED)**，等待作者修改章节内容后重新提交评审

---

## 测试用例列表

### TC-001: 高分评审自动发布章节
| 项目 | 内容 |
|------|------|
| **测试用例ID** | TC-001 |
| **对应需求** | 评审得分>=9分自动发布 |
| **测试描述** | 验证当评审员提交9分及以上评分时，章节状态自动变为PUBLISHED |
| **测试类型** | 集成测试 |
| **前置条件** | 1. 存在待评审章节，状态为REVIEWING<br>2. 评审员已领取评审任务 |
| **测试步骤** | 1. 调用POST /api/v1/reviews/submit提交评审<br>2. overallScore设置为9或10<br>3. 查询章节状态 |
| **预期结果** | 1. 评审提交成功，返回201<br>2. 章节状态变为PUBLISHED<br>3. publishedAt字段被设置为当前时间 |
| **优先级** | P0 |

### TC-002: 低分评审自动拒绝章节
| 项目 | 内容 |
|------|------|
| **测试用例ID** | TC-002 |
| **对应需求** | 评审得分<9分自动拒绝 |
| **测试描述** | 验证当评审员提交低于9分的评分时，章节状态自动变为REJECTED |
| **测试类型** | 集成测试 |
| **前置条件** | 1. 存在待评审章节，状态为REVIEWING<br>2. 评审员已领取评审任务 |
| **测试步骤** | 1. 调用POST /api/v1/reviews/submit提交评审<br>2. overallScore设置为1-8之间的值<br>3. 查询章节状态 |
| **预期结果** | 1. 评审提交成功，返回201<br>2. 章节状态变为REJECTED<br>3. publishedAt字段为null |
| **优先级** | P0 |

### TC-003: 边界值测试 - 刚好9分
| 项目 | 内容 |
|------|------|
| **测试用例ID** | TC-003 |
| **对应需求** | 边界值>=9分判断 |
| **测试描述** | 验证当评审得分刚好为9分时，章节状态变为PUBLISHED |
| **测试类型** | 边界值测试 |
| **前置条件** | 1. 存在待评审章节，状态为REVIEWING<br>2. 评审员已领取评审任务 |
| **测试步骤** | 1. 提交overallScore=9的评审<br>2. 查询章节状态 |
| **预期结果** | 章节状态为PUBLISHED |
| **优先级** | P1 |

### TC-004: 边界值测试 - 刚好8分
| 项目 | 内容 |
|------|------|
| **测试用例ID** | TC-004 |
| **对应需求** | 边界值<9分判断 |
| **测试描述** | 验证当评审得分刚好为8分时，章节状态变为REJECTED |
| **测试类型** | 边界值测试 |
| **前置条件** | 1. 存在待评审章节，状态为REVIEWING<br>2. 评审员已领取评审任务 |
| **测试步骤** | 1. 提交overallScore=8的评审<br>2. 查询章节状态 |
| **预期结果** | 章节状态为REJECTED |
| **优先级** | P1 |

### TC-005: 被拒绝章节重新提交评审
| 项目 | 内容 |
|------|------|
| **测试用例ID** | TC-005 |
| **对应需求** | 拒绝后重新提交流程 |
| **测试描述** | 验证被拒绝的章节在作者修改后可以重新进入评审流程 |
| **测试类型** | E2E测试 |
| **前置条件** | 1. 章节已被拒绝，状态为REJECTED<br>2. 作者已修改章节内容 |
| **测试步骤** | 1. 作者提交章节重新审核<br>2. 创建新的评审任务<br>3. 新评审员提交高分评审<br>4. 查询章节状态 |
| **预期结果** | 1. 新评审任务创建成功<br>2. 章节状态变为REVIEWING<br>3. 新评审提交后状态变为PUBLISHED |
| **优先级** | P1 |

### TC-006: 前端状态显示验证
| 项目 | 内容 |
|------|------|
| **测试用例ID** | TC-006 |
| **对应需求** | 前端展示章节状态 |
| **测试描述** | 验证评审记录页面正确显示章节状态标签 |
| **测试类型** | UI测试 |
| **前置条件** | 1. 存在已完成的评审记录<br>2. 章节状态为PUBLISHED或REJECTED |
| **测试步骤** | 1. 访问/reviews页面<br>2. 查看评审记录列表<br>3. 检查状态标签显示 |
| **预期结果** | 1. 列表显示章节状态标签<br>2. PUBLISHED显示绿色"已发布"标签<br>3. REJECTED显示红色"已拒绝"标签 |
| **优先级** | P1 |

### TC-007: 并发评审测试
| 项目 | 内容 |
|------|------|
| **测试用例ID** | TC-007 |
| **对应需求** | 多评审员同时评审同一章节 |
| **测试描述** | 验证多个评审员同时提交评审时的状态处理 |
| **测试类型** | 并发测试 |
| **前置条件** | 1. 章节有待处理评审任务<br>2. 多个评审员同时领取任务 |
| **测试步骤** | 1. 评审员A提交高分评审<br>2. 同时评审员B提交低分评审<br>3. 检查章节最终状态 |
| **预期结果** | 1. 只有一个评审成功提交<br>2. 第二个提交返回冲突错误<br>3. 章节状态根据第一个成功的评审确定 |
| **优先级** | P2 |

---

## 测试代码示例

### 后端集成测试代码

```typescript
// case/coding/reviews/auto-status-update.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('章节评审自动状态更新 (Chapter Review Auto Status Update)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let reviewerApiKey: string;
  let chapterId: string;
  let taskId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();

    // 创建测试数据
    reviewerApiKey = 'test_reviewer_api_key';
    chapterId = 'test_chapter_id';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('TC-001: 高分评审自动发布章节', () => {
    it('应该将章节状态更新为PUBLISHED当评分>=9', async () => {
      // 1. 提交高分评审
      const submitResponse = await request(app.getHttpServer())
        .post('/api/v1/reviews/submit')
        .set('X-API-Key', reviewerApiKey)
        .send({
          taskId: taskId,
          overallScore: 9,
          overallComment: '非常优秀的章节',
          insights: []
        });

      expect(submitResponse.status).toBe(201);
      expect(submitResponse.body.overallScore).toBe(9);

      // 2. 验证章节状态
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId }
      });

      expect(chapter.status).toBe('PUBLISHED');
      expect(chapter.publishedAt).not.toBeNull();
    });
  });

  describe('TC-002: 低分评审自动拒绝章节', () => {
    it('应该将章节状态更新为REJECTED当评分<9', async () => {
      // 1. 提交低分评审
      const submitResponse = await request(app.getHttpServer())
        .post('/api/v1/reviews/submit')
        .set('X-API-Key', reviewerApiKey)
        .send({
          taskId: taskId,
          overallScore: 7,
          overallComment: '需要改进',
          insights: []
        });

      expect(submitResponse.status).toBe(201);

      // 2. 验证章节状态
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId }
      });

      expect(chapter.status).toBe('REJECTED');
      expect(chapter.publishedAt).toBeNull();
    });
  });

  describe('TC-003 & TC-004: 边界值测试', () => {
    it('9分应该发布', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/reviews/submit')
        .set('X-API-Key', reviewerApiKey)
        .send({ taskId: taskId, overallScore: 9 });

      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId }
      });
      expect(chapter.status).toBe('PUBLISHED');
    });

    it('8分应该拒绝', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/reviews/submit')
        .set('X-API-Key', reviewerApiKey)
        .send({ taskId: taskId, overallScore: 8 });

      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId }
      });
      expect(chapter.status).toBe('REJECTED');
    });
  });
});
```

### Playwright E2E测试代码

```typescript
// case/coding/reviews/auto-status-update.e2e.spec.ts
import { test, expect } from '@playwright/test';

test.describe('章节评审自动状态更新 E2E', () => {
  test('TC-006: 前端状态显示验证', async ({ page }) => {
    // 1. 访问评审记录页面
    await page.goto('http://localhost:3000/reviews');
    
    // 2. 等待页面加载
    await page.waitForSelector('[data-testid="review-list"]');
    
    // 3. 验证已发布状态显示
    const publishedBadge = page.locator('[data-testid="chapter-status"]').filter({ hasText: '已发布' });
    await expect(publishedBadge).toHaveClass(/bg-green-100/);
    
    // 4. 验证已拒绝状态显示
    const rejectedBadge = page.locator('[data-testid="chapter-status"]').filter({ hasText: '已拒绝' });
    await expect(rejectedBadge).toHaveClass(/bg-red-100/);
  });

  test('完整评审流程 - 高分', async ({ page }) => {
    // 1. 登录为评审员
    await page.goto('http://localhost:3000/aiwriters');
    
    // 2. 领取评审任务
    await page.click('[data-testid="claim-task-btn"]');
    
    // 3. 提交高分评审
    await page.fill('[name="overallScore"]', '9');
    await page.fill('[name="overallComment"]', '优秀章节');
    await page.click('[data-testid="submit-review-btn"]');
    
    // 4. 验证跳转和状态
    await page.waitForURL('**/reviews');
    const statusBadge = page.locator('[data-testid="chapter-status"]').first();
    await expect(statusBadge).toHaveText('已发布');
  });
});
```

---

## 状态流转图

```
┌─────────┐    作者提交    ┌──────────┐    评审员领取    ┌───────────┐
│  DRAFT  │ ────────────> │ PENDING  │ ──────────────> │ REVIEWING │
└─────────┘               └──────────┘                 └─────┬─────┘
                                                             │
                           ┌─────────────────────────────────┘
                           │ 评审员提交评分
                           │
              ┌────────────┴────────────┐
              │                         │
        >=9分 │                         │ <9分
              ▼                         ▼
        ┌──────────┐              ┌──────────┐
        │PUBLISHED │              │ REJECTED │
        └──────────┘              └────┬─────┘
                                       │
                                       │ 作者修改后重新提交
                                       ▼
                                  ┌──────────┐
                                  │ PENDING  │
                                  └──────────┘
```

---

## 执行指南

### 环境准备
```bash
# 1. 确保后端服务运行
cd apps/backend
npm run start:dev

# 2. 确保前端服务运行
cd apps/frontend
npm run dev

# 3. 确保数据库有测试数据
npx prisma db seed
```

### 运行测试
```bash
# 后端集成测试
cd apps/backend
npm test -- reviews/auto-status-update.spec.ts

# E2E测试
cd case/coding
npx playwright test reviews/auto-status-update.e2e.spec.ts
```

---

## 风险与建议

### 潜在风险
1. **并发冲突**：多个评审员同时提交时可能导致状态不一致
2. **事务失败**：章节状态更新失败但评审已创建
3. **作者体验**：被拒绝后重新提交流程需要明确引导

### 改进建议
1. 添加乐观锁防止并发问题
2. 实现异步消息队列处理状态更新
3. 前端添加状态变更通知和引导
4. 考虑多评审员评分取平均值的机制
