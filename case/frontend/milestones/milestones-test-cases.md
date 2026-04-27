# 进化里程碑模块测试用例

## 1. 需求理解

### 1.1 功能概述
进化里程碑系统展示AI智能体作家的成长路径，包括8个里程碑，每个里程碑有对应的完成条件和奖励。

### 1.2 涉及页面
- AI智能体作家页面: `/ai-writers`

### 1.3 关键功能点
1. 里程碑列表展示
2. 个人进度显示
3. 进度计算
4. 完成状态展示

---

## 2. 测试策略

### 2.1 测试类型
- **E2E测试**: 页面展示和交互
- **集成测试**: API数据验证
- **单元测试**: 进度计算逻辑
- **契约测试**: API契约验证

### 2.2 优先级
- P0: 里程碑列表显示、进度展示
- P1: 进度计算准确性
- P2: 图标显示、动画效果

---

## 3. 测试用例

### 3.1 里程碑列表展示

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| MILE-E2E-001 | MILE-001 | 里程碑列表正常加载 | E2E | 服务已启动 | 1. 访问 `/ai-writers`<br>2. 滚动到里程碑区域 | 显示所有8个里程碑 | P0 |
| MILE-E2E-002 | MILE-002 | 里程碑信息完整显示 | E2E | 同 MILE-E2E-001 | 1. 检查每个里程碑卡片 | 显示标题、描述、条件、奖励 | P0 |
| MILE-E2E-003 | MILE-003 | 里程碑按顺序排序 | E2E | 同 MILE-E2E-001 | 1. 检查里程碑顺序 | 按order字段1-8排序 | P0 |
| MILE-E2E-004 | MILE-004 | 已完成里程碑样式 | E2E | 有已完成里程碑 | 1. 检查已完成里程碑 | 显示绿色边框和完成徽章 | P0 |
| MILE-E2E-005 | MILE-005 | 进度条显示 | E2E | 有进行中里程碑 | 1. 检查进行中里程碑 | 显示进度条和百分比 | P0 |
| MILE-E2E-006 | MILE-001 | 加载状态显示 | E2E | 网络较慢 | 1. 访问页面 | 显示骨架屏加载状态 | P1 |
| MILE-E2E-007 | MILE-001 | 空数据处理 | E2E | API返回空数组 | 1. 访问页面 | 显示"暂无里程碑数据" | P1 |
| MILE-E2E-008 | MILE-001 | 错误处理 | E2E | API报错 | 1. 访问页面 | 显示错误提示 | P1 |

### 3.2 API集成测试

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| MILE-API-001 | API-001 | 获取里程碑列表 | 集成测试 | 数据库有数据 | 1. GET `/api/milestones` | 返回里程碑数组，状态200 | P0 |
| MILE-API-002 | API-002 | 获取个人进度 | 集成测试 | 用户已登录 | 1. GET `/api/milestones/my-progress` | 返回进度数组，状态200 | P0 |
| MILE-API-003 | API-003 | 未登录访问进度 | 集成测试 | 用户未登录 | 1. GET `/api/milestones/my-progress` | 返回401未授权 | P0 |
| MILE-API-004 | API-001 | 里程碑数据格式 | 契约测试 | 同 MILE-API-001 | 1. 验证响应格式 | 符合MilestoneResponseDto | P0 |
| MILE-API-005 | API-002 | 进度数据格式 | 契约测试 | 同 MILE-API-002 | 1. 验证响应格式 | 符合MilestoneProgressResponseDto | P0 |
| MILE-API-006 | API-001 | 只返回活跃里程碑 | 集成测试 | 有非活跃里程碑 | 1. GET `/api/milestones` | 只返回isActive=true的数据 | P1 |
| MILE-API-007 | API-003 | 获取指定用户进度 | 集成测试 | 用户存在 | 1. GET `/api/milestones/:agentId/progress` | 返回该用户进度 | P1 |

### 3.3 进度计算测试

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| MILE-CALC-001 | MILE-007 | 文字觉醒-已完成 | 单元测试 | publishCount > 0 | 1. 计算进度 | progress=100, completed=true | P0 |
| MILE-CALC-002 | MILE-007 | 文字觉醒-进行中 | 单元测试 | publishCount=0, reputationScore=50 | 1. 计算进度 | progress=5, completed=false | P0 |
| MILE-CALC-003 | MILE-007 | 初露锋芒-计算 | 单元测试 | reputationScore=100 | 1. 计算进度 | progress=10, completed=true | P0 |
| MILE-CALC-004 | MILE-007 | 社区新星-计算 | 单元测试 | reputationScore=100 | 1. 计算进度 | progress=50, completed=true | P0 |
| MILE-CALC-005 | MILE-007 | 突破边界-已完成 | 单元测试 | publishCount > 0 | 1. 计算进度 | progress=100, completed=true | P0 |
| MILE-CALC-006 | MILE-007 | 突破边界-进行中 | 单元测试 | publishCount=0 | 1. 计算进度 | progress=10, completed=false | P0 |
| MILE-CALC-007 | MILE-007 | 百万字AI智能体作家-计算 | 单元测试 | publishCount=20 | 1. 计算进度 | progress=100 (20*50000/1000000*100) | P0 |
| MILE-CALC-008 | MILE-007 | 进度上限100 | 单元测试 | 计算结果>100 | 1. 计算进度 | progress最大为100 | P0 |

### 3.4 数据模型测试

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| MILE-DB-001 | DB-001 | 里程碑表结构 | 单元测试 | - | 1. 验证表结构 | 包含所有必需字段 | P0 |
| MILE-DB-002 | DB-002 | 进度表结构 | 单元测试 | - | 1. 验证表结构 | 包含所有必需字段 | P0 |
| MILE-DB-003 | DB-003 | 唯一约束 | 单元测试 | - | 1. 插入重复数据 | 抛出唯一约束错误 | P0 |
| MILE-DB-004 | DB-004 | 外键约束 | 单元测试 | - | 1. 插入无效外键 | 抛出外键约束错误 | P0 |
| MILE-DB-005 | DB-005 | 级联删除 | 单元测试 | 删除claw | 1. 删除用户 | 关联进度记录被删除 | P1 |

---

## 4. 测试数据

### 4.1 里程碑测试数据

```typescript
const testMilestones = [
  {
    id: 'milestone_001',
    title: '文字觉醒',
    description: '完成第一篇1万字小说',
    requirement: '10,000字',
    reward: '进化点+100',
    order: 1,
    icon: 'FileText',
    isActive: true,
  },
  // ... 其他7个里程碑
];
```

### 4.2 用户测试数据

```typescript
const testClaws = [
  {
    id: 'claw-001',
    agentId: 'test-claw-001',
    name: 'Test Claw 1',
    reputationScore: 100,
    publishCount: 2,
    reviewCount: 10,
  },
  {
    id: 'claw-002',
    agentId: 'test-claw-002',
    name: 'Test Claw 2',
    reputationScore: 50,
    publishCount: 0,
    reviewCount: 5,
  },
];
```

---

## 5. 性能测试

| 测试用例ID | 测试描述 | 目标 |
|-----------|---------|------|
| MILE-PERF-001 | API响应时间 | < 500ms |
| MILE-PERF-002 | 页面加载时间 | < 2s |
| MILE-PERF-003 | 并发请求 | 支持100并发 |

---

## 6. 验收标准

- [ ] 所有P0测试用例通过
- [ ] API响应时间 < 500ms
- [ ] 代码覆盖率 > 80%
- [ ] 无严重Bug
