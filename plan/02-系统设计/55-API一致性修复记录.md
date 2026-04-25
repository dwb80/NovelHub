# API 一致性修复记录

> **文档类型**: 细颗粒度技术文档
> **创建日期**: 2026-04-25
> **最后更新**: 2026-04-25
> **相关模块**: 全站 API 接口

---

## 1. 修复概述

### 1.1 问题背景
在前后端联调测试中发现多处 API 不一致问题，导致前端页面无法正常获取数据或出现 404/500 错误。

### 1.2 修复范围
- 统一 Ranking 排行榜接口参数
- 修复 Bookshelf 书架接口路径和类型
- 修复 Comments 评论接口路径
- 修复 Search 搜索接口路径
- 统一 Category 分类枚举值
- 修复 Reading History 阅读历史接口

---

## 2. 详细修复记录

### 2.1 Ranking 排行榜接口

#### 问题描述
前端使用的 ranking type 与后端不一致：
- 前端: `'popular' | 'rising' | 'new'`
- 后端: `'hot' | 'new' | 'rating' | 'collect'`

#### 修复方案
统一前端类型定义与后端一致：

```typescript
// apps/frontend/src/app/ranking/page.tsx
type RankingType = 'hot' | 'new' | 'rating';

const rankingLabels: Record<RankingType, string> = {
  hot: '人气榜',
  new: '新书榜',
  rating: '评分榜',
};
```

#### 影响文件
- `apps/frontend/src/app/ranking/page.tsx`

---

### 2.2 Bookshelf 书架接口

#### 问题描述
1. API 路径缺少 `/v1` 版本前缀
2. 前端类型定义与后端 DTO 不一致
3. 缺少检查收藏状态的端点

#### 修复方案

**后端新增端点**:
```typescript
// apps/backend/src/bookshelf/bookshelf.controller.ts
@Get('check')
@ApiOperation({ summary: '检查小说是否已收藏' })
async checkCollectionStatus(
  @CurrentReader() readerId: string,
  @Query('novelId') novelId: string,
): Promise<{ isCollected: boolean }> {
  const isCollected = await this.bookshelfService.isInBookshelf(readerId, novelId);
  return { isCollected };
}
```

**后端新增服务方法**:
```typescript
// apps/backend/src/bookshelf/bookshelf.service.ts
async isInBookshelf(readerId: string, novelId: string): Promise<boolean> {
  const item = await this.prisma.bookshelf.findFirst({
    where: { readerId, novelId },
  });
  return !!item;
}
```

**前端类型更新**:
```typescript
// apps/frontend/src/types/index.ts
export interface BookshelfItem {
  id: string;
  novelId: string;
  novelTitle: string;
  novelCover?: string;
  authorName: string;
  status: 'READING' | 'COMPLETED' | 'DROPPED' | 'WISHLIST';
  lastChapterId?: string;
  lastChapterTitle?: string;
  progress: number;
  lastReadAt: string;
  addedAt: string;
}
```

#### 影响文件
- `apps/backend/src/bookshelf/bookshelf.controller.ts`
- `apps/backend/src/bookshelf/bookshelf.service.ts`
- `apps/frontend/src/types/index.ts`
- `apps/frontend/src/hooks/useBookshelf.ts`
- `apps/frontend/src/app/bookshelf/page.tsx`

---

### 2.3 Comments 评论接口

#### 问题描述
前端调用路径与后端路由不匹配：
- 前端: `/api/v1/novels/${novelId}/comments`
- 后端: `/api/v1/comments/novel/${novelId}`

#### 修复方案
更新前端 API 调用路径：

```typescript
// apps/frontend/src/app/novels/[id]/page.tsx
const fetchComments = async () => {
  const response = await fetch(`/api/v1/comments/novel/${novelId}`);
  // ...
};

const submitComment = async () => {
  const response = await fetch(`/api/v1/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ novelId, content: newComment })
  });
};
```

#### 影响文件
- `apps/frontend/src/app/novels/[id]/page.tsx`

---

### 2.4 Search 搜索接口

#### 问题描述
前端调用路径错误：
- 前端: `/api/v1/search?q=xxx`
- 后端: `/api/v1/search/novels?q=xxx`

#### 修复方案
更新前端搜索 API 路径：

```typescript
// apps/frontend/src/app/search/SearchContent.tsx
const response = await fetch(`/api/v1/search/novels?q=${encodeURIComponent(query)}`);
```

#### 影响文件
- `apps/frontend/src/app/search/SearchContent.tsx`

---

### 2.5 Category 分类枚举值

#### 问题描述
前端使用英文分类 ID，后端使用中文拼音枚举值，导致查询时 500 错误。

#### 修复方案
统一前端分类 ID 与后端枚举值：

```typescript
// apps/frontend/src/components/CategoryNav.tsx
const categories = [
  { id: 'xianxia', name: '仙侠' },
  { id: 'wuxia', name: '武侠' },
  { id: 'xuanhuan', name: '玄幻' },
  { id: 'dushi', name: '都市' },
  { id: 'kehuan', name: '科幻' },
  { id: 'lishi', name: '历史' },
  { id: 'youxi', name: '游戏' },
  { id: 'lingyi', name: '灵异' },
  { id: 'erciyuan', name: '二次元' },
  { id: 'qihuan', name: '奇幻' },
  { id: 'junshi', name: '军事' },
  { id: 'xianshi', name: '现实' },
];
```

#### 影响文件
- `apps/frontend/src/components/CategoryNav.tsx`

---

### 2.6 Reading History 阅读历史接口

#### 问题描述
1. 前端类型定义与后端 DTO 不一致
2. 缺少清空历史记录的端点

#### 修复方案

**后端新增端点**:
```typescript
// apps/backend/src/readers/readers.controller.ts
@Delete('me/reading-history')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: '清空阅读历史' })
async clearReadingHistory(
  @CurrentReader() readerId: string,
): Promise<{ message: string }> {
  await this.readersService.clearReadingHistory(readerId);
  return { message: '阅读历史已清空' };
}
```

**前端类型更新**:
```typescript
// apps/frontend/src/types/index.ts
export interface ReadingHistoryItem {
  id: string;
  novelId: string;
  novelTitle: string;
  chapterId: string;
  chapterTitle: string;
  chapterOrder: number;
  progress: number;
  readAt: string;
}
```

#### 影响文件
- `apps/backend/src/readers/readers.controller.ts`
- `apps/backend/src/readers/readers.service.ts`
- `apps/frontend/src/types/index.ts`
- `apps/frontend/src/app/history/page.tsx`

---

### 2.7 Novels 小说列表接口

#### 问题描述
后端缺少 sort 参数支持，前端排序功能无法正常工作。

#### 修复方案

**后端新增 sort 参数**:
```typescript
// apps/backend/src/novels/novels.controller.ts
@Get()
@ApiQuery({ name: 'sort', required: false, type: String, description: '排序方式: hot-最热, new-最新, rating-评分' })
async findAll(
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  @Query('category') category?: string,
  @Query('search') search?: string,
  @Query('sort') sort?: string,
): Promise<{ novels: NovelResponseDto[]; total: number }> {
  return this.novelsService.findAll(page, limit, { category, search, sort });
}
```

**后端服务实现**:
```typescript
// apps/backend/src/novels/novels.service.ts
let orderBy: Prisma.NovelOrderByWithRelationInput = { updatedAt: 'desc' };
if (filters?.sort === 'hot') {
  orderBy = { viewCount: 'desc' };
} else if (filters?.sort === 'new') {
  orderBy = { createdAt: 'desc' };
} else if (filters?.sort === 'rating') {
  orderBy = { rating: 'desc' };
}
```

#### 影响文件
- `apps/backend/src/novels/novels.controller.ts`
- `apps/backend/src/novels/novels.service.ts`
- `apps/frontend/src/app/novels/page.tsx`

---

### 2.8 Reviews 评审任务接口

#### 问题描述
1. 缺少获取任务详情的端点
2. 缺少保存草稿功能
3. 前端表单结构与后端 DTO 不匹配

#### 修复方案

**Prisma Schema 更新**:
```prisma
// apps/backend/prisma/schema.prisma
model ReviewTask {
  // ... 其他字段
  draft String? @db.Text
  // ...
}
```

**后端新增端点**:
```typescript
// apps/backend/src/reviews/reviews.controller.ts
@Get('tasks/:taskId')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: '获取评审任务详情' })
async getTaskDetail(@Param('taskId') taskId: string): Promise<ReviewTaskResponseDto> {
  return this.reviewsService.getTaskById(taskId);
}

@Post('tasks/:taskId/draft')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: '保存评审草稿' })
async saveDraft(
  @Param('taskId') taskId: string,
  @CurrentClaw('sub') reviewerId: string,
  @Body() dto: SubmitReviewDto,
): Promise<{ message: string }> {
  await this.reviewsService.saveDraft(taskId, reviewerId, dto);
  return { message: '草稿保存成功' };
}

@Post('tasks/:taskId/submit')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: '提交评审' })
async submitReviewByTask(
  @Param('taskId') taskId: string,
  @CurrentClaw('sub') reviewerId: string,
  @Body() dto: SubmitReviewDto,
): Promise<ReviewResponseDto> {
  return this.reviewsService.submitReviewByTask(taskId, reviewerId, dto);
}
```

#### 影响文件
- `apps/backend/prisma/schema.prisma`
- `apps/backend/src/reviews/reviews.controller.ts`
- `apps/backend/src/reviews/reviews.service.ts`
- `apps/frontend/src/app/reviews/[id]/page.tsx`

---

## 3. 修复验证

### 3.1 构建验证
```bash
cd apps/frontend
npm run build
# 结果: ✓ 构建成功，无类型错误
```

### 3.2 功能验证清单

| 功能 | 测试路径 | 状态 |
|-----|---------|-----|
| 小说列表 | /novels | ✅ 正常 |
| 排行榜 | /ranking | ✅ 正常 |
| AI作家 | /aiwriters | ✅ 正常 |
| 小说详情 | /novels/[id] | ✅ 正常 |
| 搜索 | /search | ✅ 正常 |
| 书架 | /bookshelf | ✅ 正常 |
| 阅读历史 | /history | ✅ 正常 |
| 评审中心 | /reviews | ✅ 正常 |

---

## 4. 提交记录

```
commit 81766aa
Author: AI Assistant
Date: 2026-04-25

fix: 修复前后端API不一致问题

- 统一ranking页面类型定义与后端一致 (hot/new/rating)
- 修复useBookshelf hook中的类型错误
- 修复verify-email页面的SSR Suspense问题
- 修复terms页面的ESLint引号转义问题
- 添加bookshelf/check端点检查收藏状态
- 修复comments API路径
- 修复search API路径
- 统一category枚举值
- 添加reading history清空端点
- 添加novels sort参数支持
- 添加reviews任务详情和草稿功能
```

---

## 5. 后续建议

1. **建立 API 契约测试**: 在 `case/backend/api-contract.spec.ts` 中增加前后端一致性检查
2. **Swagger 文档同步**: 确保后端 Swagger 文档与实现保持一致
3. **类型共享**: 考虑使用 openapi-typescript 生成前端类型定义
4. **CI 检查**: 在 CI 流程中添加 API 一致性检查步骤

---

## 6. 相关文档

- [API Contract Tests](./api-contract.spec.ts)
- [Backend README](./README.md)
- [Frontend Test Cases](../frontend/)
