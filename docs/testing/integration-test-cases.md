# NovelHub 集成测试用例

**版本**: v1.0  
**更新日期**: 2026-04-12

---

## 测试概述

### 测试目标

验证 NovelHub 各模块之间的接口集成、数据流转和协作行为。

### 测试范围

| 集成点 | 测试重点 | 优先级 |
|--------|----------|--------|
| 用户-书架 | 用户与书架数据关联 | P0 |
| 小说-章节 | 小说与章节生命周期 | P0 |
| 书架-阅读器 | 阅读进度同步 | P0 |
| 评论-通知 | 评论触发通知 | P1 |
| 搜索-索引 | 搜索与数据索引 | P1 |
| 支付-订单 | 支付流程完整性 | P0 |

### 测试策略

- **自底向上**: 先测试底层服务集成，再测试上层业务集成
- **接口契约**: 验证服务间接口契约一致性
- **数据一致性**: 验证跨服务数据一致性
- **故障场景**: 测试依赖服务故障时的降级处理

---

## 1. 用户与书架集成测试

### TC-INT-001: 用户注册自动创建默认书架

**测试目标**: 验证用户注册时自动创建书架

**涉及服务**:
- User Service
- Bookshelf Service

**测试步骤**:

```typescript
describe('用户注册与书架创建集成', () => {
  it('用户注册时应自动创建默认书架', async () => {
    // 1. 调用用户注册接口
    const registerResponse = await request(app)
      .post('/api/users/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test@123456'
      });
    
    expect(registerResponse.status).toBe(201);
    const userId = registerResponse.body.data.id;
    
    // 2. 验证书架服务收到创建消息
    await waitForMessage('bookshelf.create', 5000);
    
    // 3. 查询用户书架
    const bookshelfResponse = await request(app)
      .get(`/api/bookshelf/user/${userId}`)
      .set('Authorization', `Bearer ${registerResponse.body.data.token}`);
    
    expect(bookshelfResponse.status).toBe(200);
    expect(bookshelfResponse.body.data).toMatchObject({
      userId: userId,
      name: '我的书架',
      novelCount: 0,
      totalWords: 0
    });
  });
});
```

**预期结果**:
- ✅ 用户注册成功
- ✅ 书架服务收到创建消息
- ✅ 默认书架创建成功
- ✅ 书架与用户正确关联

---

### TC-INT-002: 用户删除级联删除书架数据

**测试目标**: 验证用户删除时级联删除书架

**测试步骤**:

```typescript
describe('用户删除级联操作', () => {
  it('删除用户时应级联删除书架数据', async () => {
    // 1. 创建测试用户
    const user = await createTestUser();
    const bookshelf = await createTestBookshelf(user.id);
    await addNovelToBookshelf(bookshelf.id, 'novel-1');
    
    // 2. 删除用户
    await request(app)
      .delete(`/api/users/${user.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);
    
    // 3. 验证书架数据已删除
    const bookshelfCheck = await bookshelfRepository.findById(bookshelf.id);
    expect(bookshelfCheck).toBeNull();
    
    // 4. 验证书架小说关联已删除
    const items = await bookshelfItemRepository.findByBookshelfId(bookshelf.id);
    expect(items).toHaveLength(0);
  });
});
```

---

## 2. 小说与章节集成测试

### TC-INT-003: 小说发布时章节状态同步

**测试目标**: 验证小说发布时章节状态正确同步

**涉及服务**:
- Novel Service
- Chapter Service
- Search Service

**测试步骤**:

```typescript
describe('小说发布集成', () => {
  it('发布小说时应同步更新章节状态和搜索索引', async () => {
    // 1. 创建草稿小说和章节
    const novel = await createDraftNovel({
      title: '测试小说',
      status: 'draft'
    });
    const chapters = await Promise.all([
      createChapter({ novelId: novel.id, status: 'draft', order: 1 }),
      createChapter({ novelId: novel.id, status: 'draft', order: 2 }),
      createChapter({ novelId: novel.id, status: 'draft', order: 3 })
    ]);
    
    // 2. 发布小说
    const publishResponse = await request(app)
      .post(`/api/novels/${novel.id}/publish`)
      .set('Authorization', `Bearer ${authorToken}`);
    
    expect(publishResponse.status).toBe(200);
    
    // 3. 验证章节状态更新
    await Promise.all(chapters.map(async (chapter) => {
      const updated = await chapterRepository.findById(chapter.id);
      expect(updated.status).toBe('published');
    }));
    
    // 4. 验证搜索索引更新
    await waitForMessage('search.index', 3000);
    const searchResult = await searchService.search(novel.title);
    expect(searchResult.hits).toContainEqual(
      expect.objectContaining({ id: novel.id })
    );
  });
});
```

---

### TC-INT-004: 章节发布触发小说字数更新

**测试目标**: 验证章节发布时小说字数统计更新

**测试步骤**:

```typescript
describe('章节发布与字数统计', () => {
  it('发布章节时应更新小说总字数', async () => {
    // 1. 创建已发布小说
    const novel = await createPublishedNovel();
    const initialWordCount = novel.wordCount;
    
    // 2. 创建并发布新章节
    const chapterContent = 'a'.repeat(5000); // 5000字
    const chapter = await createChapter({
      novelId: novel.id,
      content: chapterContent,
      wordCount: 5000
    });
    
    await request(app)
      .post(`/api/chapters/${chapter.id}/publish`)
      .set('Authorization', `Bearer ${authorToken}`)
      .expect(200);
    
    // 3. 验证小说字数更新
    const updatedNovel = await novelRepository.findById(novel.id);
    expect(updatedNovel.wordCount).toBe(initialWordCount + 5000);
    expect(updatedNovel.chapterCount).toBe(novel.chapterCount + 1);
    expect(updatedNovel.lastUpdateAt).toBeAfter(novel.lastUpdateAt);
  });
});
```

---

## 3. 书架与阅读器集成测试

### TC-INT-005: 阅读进度实时同步

**测试目标**: 验证阅读进度在多设备间同步

**涉及服务**:
- Bookshelf Service
- Reader Service
- WebSocket Service

**测试步骤**:

```typescript
describe('阅读进度同步', () => {
  it('阅读进度应实时同步到书架', async () => {
    // 1. 用户登录并加入书架
    const user = await createTestUser();
    const novel = await createPublishedNovel();
    const bookshelfItem = await addNovelToUserBookshelf(user.id, novel.id);
    
    // 2. 模拟阅读器上报进度
    const progressData = {
      novelId: novel.id,
      chapterId: 'chapter-1',
      position: 1500,
      percent: 45.5
    };
    
    const progressResponse = await request(app)
      .post('/api/reader/progress')
      .set('Authorization', `Bearer ${user.token}`)
      .send(progressData);
    
    expect(progressResponse.status).toBe(200);
    
    // 3. 验证书架进度更新
    const updatedItem = await bookshelfRepository.findItemById(bookshelfItem.id);
    expect(updatedItem.readingProgress).toEqual({
      chapterId: progressData.chapterId,
      position: progressData.position,
      percent: progressData.percent,
      updatedAt: expect.any(Date)
    });
    
    // 4. 验证WebSocket通知
    const wsMessage = await waitForWebSocketMessage('progress.update', 2000);
    expect(wsMessage).toMatchObject({
      userId: user.id,
      novelId: novel.id,
      progress: progressData
    });
  });
});
```

---

### TC-INT-006: 跨设备阅读进度一致性

**测试目标**: 验证跨设备阅读进度一致性

**测试步骤**:

```typescript
describe('跨设备进度一致性', () => {
  it('不同设备应读取到相同的阅读进度', async () => {
    // 1. 设备A上报进度
    const deviceA = await createDeviceSession(user.id, 'device-a');
    await request(app)
      .post('/api/reader/progress')
      .set('Authorization', `Bearer ${deviceA.token}`)
      .send({
        novelId: novel.id,
        chapterId: 'chapter-5',
        position: 2000,
        percent: 60
      });
    
    // 2. 设备B查询进度
    const deviceB = await createDeviceSession(user.id, 'device-b');
    const progressResponse = await request(app)
      .get(`/api/bookshelf/progress/${novel.id}`)
      .set('Authorization', `Bearer ${deviceB.token}`);
    
    expect(progressResponse.status).toBe(200);
    expect(progressResponse.body.data).toMatchObject({
      chapterId: 'chapter-5',
      position: 2000,
      percent: 60
    });
    
    // 3. 验证缓存一致性
    const cacheKey = `progress:${user.id}:${novel.id}`;
    const cachedProgress = await redis.get(cacheKey);
    expect(JSON.parse(cachedProgress)).toMatchObject({
      chapterId: 'chapter-5',
      position: 2000
    });
  });
});
```

---

## 4. 评论与通知集成测试

### TC-INT-007: 评论触发通知

**测试目标**: 验证评论时正确触发通知

**涉及服务**:
- Comment Service
- Notification Service
- User Service

**测试步骤**:

```typescript
describe('评论通知集成', () => {
  it('评论应触发相关通知', async () => {
    // 1. 创建小说和作者
    const author = await createTestUser();
    const novel = await createPublishedNovel(author.id);
    const commenter = await createTestUser();
    
    // 2. 发表评论
    const commentResponse = await request(app)
      .post(`/api/novels/${novel.id}/comments`)
      .set('Authorization', `Bearer ${commenter.token}`)
      .send({
        content: '写得真好！',
        rating: 5
      });
    
    expect(commentResponse.status).toBe(201);
    
    // 3. 验证作者收到通知
    await waitForMessage('notification.send', 3000);
    const notifications = await notificationRepository.findByUserId(author.id);
    expect(notifications).toContainEqual(
      expect.objectContaining({
        type: 'novel.commented',
        content: expect.stringContaining(commenter.username),
        read: false
      })
    );
    
    // 4. 验证消息推送
    const pushMessage = await waitForPushNotification(author.id, 2000);
    expect(pushMessage.title).toContain('新评论');
  });
});
```

---

### TC-INT-008: 回复评论触发通知

**测试目标**: 验证回复评论时触发通知

**测试步骤**:

```typescript
describe('评论回复通知', () => {
  it('回复评论时应通知原评论作者', async () => {
    // 1. 创建原评论
    const originalCommenter = await createTestUser();
    const comment = await createComment({
      novelId: novel.id,
      userId: originalCommenter.id,
      content: '原评论'
    });
    
    // 2. 回复评论
    const replier = await createTestUser();
    await request(app)
      .post(`/api/comments/${comment.id}/replies`)
      .set('Authorization', `Bearer ${replier.token}`)
      .send({ content: '回复内容' })
      .expect(201);
    
    // 3. 验证原评论者收到通知
    const notifications = await notificationRepository.findByUserId(originalCommenter.id);
    const replyNotification = notifications.find(n => n.type === 'comment.replied');
    expect(replyNotification).toMatchObject({
      senderId: replier.id,
      content: expect.stringContaining('回复了你的评论')
    });
  });
});
```

---

## 5. 搜索与索引集成测试

### TC-INT-009: 小说创建触发索引更新

**测试目标**: 验证小说创建时搜索索引更新

**涉及服务**:
- Novel Service
- Search Service
- Message Queue

**测试步骤**:

```typescript
describe('搜索索引集成', () => {
  it('创建小说时应更新搜索索引', async () => {
    // 1. 创建小说
    const novel = await createPublishedNovel({
      title: '修仙传奇之测试',
      summary: '这是一本修仙小说',
      tags: ['修仙', '热血'],
      category: '仙侠'
    });
    
    // 2. 等待索引更新
    await waitForMessage('search.index', 5000);
    
    // 3. 验证可被搜索到
    await retry(async () => {
      const results = await searchService.search('修仙传奇');
      expect(results.hits).toContainEqual(
        expect.objectContaining({
          id: novel.id,
          title: novel.title
        })
      );
    }, { retries: 5, delay: 1000 });
    
    // 4. 验证标签搜索
    const tagResults = await searchService.searchByTag('修仙');
    expect(tagResults.hits.map(h => h.id)).toContain(novel.id);
  });
});
```

---

### TC-INT-010: 小说删除触发索引删除

**测试目标**: 验证小说删除时搜索索引删除

**测试步骤**:

```typescript
describe('索引删除集成', () => {
  it('删除小说时应从搜索索引移除', async () => {
    // 1. 创建并索引小说
    const novel = await createPublishedNovel({ title: '待删除小说' });
    await waitForMessage('search.index', 3000);
    
    // 2. 验证已索引
    let results = await searchService.search('待删除小说');
    expect(results.hits).toHaveLength(1);
    
    // 3. 删除小说
    await request(app)
      .delete(`/api/novels/${novel.id}`)
      .set('Authorization', `Bearer ${authorToken}`)
      .expect(204);
    
    // 4. 等待索引删除
    await waitForMessage('search.delete', 3000);
    
    // 5. 验证已移除
    await retry(async () => {
      results = await searchService.search('待删除小说');
      expect(results.hits).toHaveLength(0);
    }, { retries: 5, delay: 1000 });
  });
});
```

---

## 6. 支付与订单集成测试

### TC-INT-011: VIP章节购买流程

**测试目标**: 验证VIP章节购买完整流程

**涉及服务**:
- Order Service
- Payment Service
- Chapter Service
- User Service

**测试步骤**:

```typescript
describe('VIP章节购买集成', () => {
  it('购买VIP章节应完成完整支付流程', async () => {
    // 1. 准备测试数据
    const user = await createTestUser({ balance: 100 });
    const novel = await createPublishedNovel();
    const chapter = await createVIPChapter({
      novelId: novel.id,
      price: 10,
      wordCount: 3000
    });
    
    // 2. 创建订单
    const orderResponse = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        type: 'chapter',
        itemId: chapter.id,
        paymentMethod: 'balance'
      });
    
    expect(orderResponse.status).toBe(201);
    const orderId = orderResponse.body.data.id;
    
    // 3. 支付订单
    const payResponse = await request(app)
      .post(`/api/orders/${orderId}/pay`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    
    expect(payResponse.body.data.status).toBe('completed');
    
    // 4. 验证余额扣减
    const updatedUser = await userRepository.findById(user.id);
    expect(updatedUser.balance).toBe(90); // 100 - 10
    
    // 5. 验证章节解锁
    const hasAccess = await chapterService.checkAccess(user.id, chapter.id);
    expect(hasAccess).toBe(true);
    
    // 6. 验证订单记录
    const order = await orderRepository.findById(orderId);
    expect(order).toMatchObject({
      status: 'completed',
      paidAt: expect.any(Date),
      transactionId: expect.any(String)
    });
  });
});
```

---

### TC-INT-012: 支付失败回滚

**测试目标**: 验证支付失败时的数据一致性

**测试步骤**:

```typescript
describe('支付失败回滚', () => {
  it('支付失败时应回滚所有操作', async () => {
    // 1. 准备数据（余额不足）
    const user = await createTestUser({ balance: 5 });
    const chapter = await createVIPChapter({ price: 10 });
    
    // 2. 创建订单
    const orderResponse = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        type: 'chapter',
        itemId: chapter.id,
        paymentMethod: 'balance'
      });
    
    const orderId = orderResponse.body.data.id;
    
    // 3. 尝试支付（应失败）
    const payResponse = await request(app)
      .post(`/api/orders/${orderId}/pay`)
      .set('Authorization', `Bearer ${user.token}`);
    
    expect(payResponse.status).toBe(400);
    expect(payResponse.body.message).toContain('余额不足');
    
    // 4. 验证数据一致性
    const order = await orderRepository.findById(orderId);
    expect(order.status).toBe('pending');
    
    const updatedUser = await userRepository.findById(user.id);
    expect(updatedUser.balance).toBe(5); // 余额未变
    
    const hasAccess = await chapterService.checkAccess(user.id, chapter.id);
    expect(hasAccess).toBe(false); // 未解锁
  });
});
```

---

## 7. 缓存一致性测试

### TC-INT-013: 缓存更新一致性

**测试目标**: 验证缓存与数据库一致性

**涉及服务**:
- Novel Service
- Redis Cache

**测试步骤**:

```typescript
describe('缓存一致性', () => {
  it('数据更新时应同步更新缓存', async () => {
    // 1. 创建小说并缓存
    const novel = await createPublishedNovel({ title: '原标题' });
    
    // 首次查询，写入缓存
    await request(app)
      .get(`/api/novels/${novel.id}`)
      .expect(200);
    
    const cacheKey = `novel:${novel.id}`;
    const cached = await redis.get(cacheKey);
    expect(JSON.parse(cached).title).toBe('原标题');
    
    // 2. 更新小说
    await request(app)
      .put(`/api/novels/${novel.id}`)
      .set('Authorization', `Bearer ${authorToken}`)
      .send({ title: '新标题' })
      .expect(200);
    
    // 3. 验证缓存已更新或删除
    await waitFor(100); // 等待缓存更新
    const updatedCached = await redis.get(cacheKey);
    expect(updatedCached).toBeNull(); // 缓存已删除，下次查询重新加载
    
    // 4. 重新查询验证
    const response = await request(app)
      .get(`/api/novels/${novel.id}`)
      .expect(200);
    
    expect(response.body.data.title).toBe('新标题');
  });
});
```

---

## 8. 故障场景测试

### TC-INT-014: 服务降级测试

**测试目标**: 验证依赖服务故障时的降级处理

**测试步骤**:

```typescript
describe('服务降级', () => {
  it('搜索服务故障时应返回数据库查询结果', async () => {
    // 1. 模拟搜索服务故障
    await mockServiceDown('search-service');
    
    // 2. 执行搜索
    const response = await request(app)
      .get('/api/search?q=修仙')
      .expect(200);
    
    // 3. 验证降级响应
    expect(response.body.data).toBeDefined();
    expect(response.body.meta.fallback).toBe(true);
    expect(response.body.data.results).toBeDefined();
  });
  
  it('通知服务故障时不应影响评论功能', async () => {
    // 1. 模拟通知服务故障
    await mockServiceDown('notification-service');
    
    // 2. 发表评论
    const response = await request(app)
      .post(`/api/novels/${novel.id}/comments`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ content: '测试评论' });
    
    // 3. 验证评论成功
    expect(response.status).toBe(201);
    
    // 4. 验证通知进入死信队列
    const dlqMessage = await checkDeadLetterQueue('notification.send');
    expect(dlqMessage).toBeDefined();
  });
});
```

---

### TC-INT-015: 分布式事务一致性

**测试目标**: 验证分布式事务数据一致性

**测试步骤**:

```typescript
describe('分布式事务', () => {
  it('转账操作应保持数据一致性', async () => {
    // 1. 准备两个用户
    const userA = await createTestUser({ balance: 100 });
    const userB = await createTestUser({ balance: 50 });
    
    // 2. 执行转账
    const transferResponse = await request(app)
      .post('/api/transfers')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({
        toUserId: userB.id,
        amount: 30
      });
    
    expect(transferResponse.status).toBe(200);
    
    // 3. 验证双方余额
    const updatedA = await userRepository.findById(userA.id);
    const updatedB = await userRepository.findById(userB.id);
    
    expect(updatedA.balance).toBe(70);
    expect(updatedB.balance).toBe(80);
    
    // 4. 验证转账记录
    const transfer = await transferRepository.findById(transferResponse.body.data.id);
    expect(transfer).toMatchObject({
      fromUserId: userA.id,
      toUserId: userB.id,
      amount: 30,
      status: 'completed'
    });
    
    // 5. 验证总额守恒
    const totalBefore = 100 + 50;
    const totalAfter = updatedA.balance + updatedB.balance;
    expect(totalAfter).toBe(totalBefore);
  });
});
```

---

## 9. 测试工具与辅助函数

```typescript
// tests/integration/helpers.ts

/**
 * 等待消息队列消息
 */
export async function waitForMessage(
  queueName: string, 
  timeout: number = 5000
): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for message on ${queueName}`));
    }, timeout);
    
    messageQueue.subscribe(queueName, (message) => {
      clearTimeout(timer);
      resolve(message);
    });
  });
}

/**
 * 等待WebSocket消息
 */
export async function waitForWebSocketMessage(
  event: string,
  timeout: number = 5000
): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for WebSocket event ${event}`));
    }, timeout);
    
    wsClient.on(event, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

/**
 * 重试工具
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { retries: number; delay: number }
): Promise<T> {
  let lastError;
  
  for (let i = 0; i < options.retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      await sleep(options.delay);
    }
  }
  
  throw lastError;
}

/**
 * 模拟服务故障
 */
export async function mockServiceDown(serviceName: string): Promise<void> {
  await nock(`http://${serviceName}`)
    .persist()
    .reply(503, { error: 'Service Unavailable' });
}

/**
 * 清理测试数据
 */
export async function cleanupTestData(): Promise<void> {
  await Promise.all([
    novelRepository.deleteAllTestData(),
    userRepository.deleteAllTestData(),
    chapterRepository.deleteAllTestData(),
    redis.flushdb()
  ]);
}
```

---

## 10. 测试配置

```typescript
// tests/integration/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/integration/**/*.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/integration/setup.ts'],
  globalSetup: '<rootDir>/tests/integration/global-setup.ts',
  globalTeardown: '<rootDir>/tests/integration/global-teardown.ts',
  testTimeout: 30000,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

---

**编制**: 测试团队  
**更新**: 2026-04-12
