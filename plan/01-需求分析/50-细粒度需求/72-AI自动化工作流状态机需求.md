# AI自动化工作流状态机需求文档

**文档编号**: REQ-WORKFLOW-STATE-001  
**版本**: v1.0.0  
**日期**: 2026-04-19  
**状态**: 新增  
**关联文档**: [59-AI自动化工作流需求.md](./59-AI自动化工作流需求.md)

---

## 1. 引言

### 1.1 目的
本文档定义AI智能体自动化工作流的状态机，明确所有状态流转规则和触发条件。

### 1.2 范围
- 小说生命周期状态机
- 章节生命周期状态机
- 评审任务状态机
- 进化任务状态机

---

## 2. 小说生命周期状态机

### 2.1 状态定义

| 状态 | 名称 | 说明 |
|------|------|------|
| DRAFT | 草稿 | 小说创建中，未提交 |
| PENDING | 待审核 | 已提交，等待审核 |
| REVIEWING | 审核中 | 正在被评审 |
| PUBLISHED | 已发布 | 审核通过，对外可见 |
| REJECTED | 已拒绝 | 审核未通过 |
| COMPLETED | 已完结 | AI智能体作家标记完结 |
| ARCHIVED | 已归档 | 下架归档 |

### 2.2 状态流转图

```
                    ┌─────────┐
                    │  DRAFT  │
                    └────┬────┘
                         │ submit
                         ▼
                    ┌─────────┐
          ┌────────│ PENDING │────────┐
          │        └─────────┘        │
          │ reject                     │ approve
          ▼                            ▼
    ┌──────────┐                 ┌───────────┐
    │ REJECTED │                 │ PUBLISHED │
    └────┬─────┘                 └─────┬─────┘
         │ resubmit                     │
         │                              │ complete
         │                              ▼
         │                        ┌───────────┐
         └───────────────────────▶│ COMPLETED │
                                  └─────┬─────┘
                                        │ archive
                                        ▼
                                  ┌───────────┐
                                  │  ARCHIVED │
                                  └───────────┘
```

### 2.3 状态转换规则

| 当前状态 | 触发事件 | 目标状态 | 前置条件 |
|---------|---------|---------|---------|
| DRAFT | submit | PENDING | 至少1个章节 |
| PENDING | approve | PUBLISHED | 所有章节审核通过 |
| PENDING | reject | REJECTED | 评审拒绝 |
| REJECTED | resubmit | PENDING | 修改后重新提交 |
| PUBLISHED | complete | COMPLETED | AI智能体作家操作 |
| COMPLETED | archive | ARCHIVED | 管理员操作 |
| PUBLISHED | archive | ARCHIVED | 管理员操作 |

---

## 3. 章节生命周期状态机

### 3.1 状态定义

| 状态 | 名称 | 说明 |
|------|------|------|
| DRAFT | 草稿 | 章节创建中 |
| PENDING | 待审核 | 已提交审核 |
| REVIEWING | 审核中 | 评审员正在审核 |
| PUBLISHED | 已发布 | 审核通过 |
| REJECTED | 已拒绝 | 审核未通过 |

### 3.2 状态流转图

```
    ┌─────────┐
    │  DRAFT  │
    └────┬────┘
         │ submit
         ▼
    ┌─────────┐      claim      ┌───────────┐
    │ PENDING │─────────────────▶│ REVIEWING │
    └─────────┘                  └─────┬─────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │ approve          │ reject           │ timeout
                    ▼                  ▼                  ▼
              ┌───────────┐      ┌──────────┐      ┌─────────┐
              │ PUBLISHED │      │ REJECTED │      │ PENDING │
              └───────────┘      └────┬─────┘      └─────────┘
                                        │ resubmit
                                        ▼
                                  ┌─────────┐
                                  │ PENDING │
                                  └─────────┘
```

### 3.3 状态转换规则

| 当前状态 | 触发事件 | 目标状态 | 前置条件 |
|---------|---------|---------|---------|
| DRAFT | submit | PENDING | 内容不为空 |
| PENDING | claim | REVIEWING | 评审员认领 |
| REVIEWING | approve | PUBLISHED | 评审通过 |
| REVIEWING | reject | REJECTED | 评审拒绝 |
| REVIEWING | timeout | PENDING | 超时未完成 |
| REJECTED | resubmit | PENDING | 修改后重提 |

### 3.4 超时规则

| 场景 | 超时时间 | 处理 |
|------|---------|------|
| 评审认领后未完成 | 24小时 | 自动释放任务 |
| 待审核无评审员 | 48小时 | 提升优先级 |

---

## 4. 评审任务状态机

### 4.1 状态定义

| 状态 | 名称 | 说明 |
|------|------|------|
| PENDING | 待认领 | 任务已创建，等待评审员 |
| ASSIGNED | 已分配 | 已分配给评审员 |
| IN_PROGRESS | 进行中 | 评审员正在评审 |
| COMPLETED | 已完成 | 评审完成 |
| EXPIRED | 已过期 | 超时未完成 |
| CANCELLED | 已取消 | 任务取消 |

### 4.2 状态流转图

```
    ┌─────────┐    claim    ┌──────────┐   start   ┌─────────────┐
    │ PENDING │────────────▶│ ASSIGNED │──────────▶│ IN_PROGRESS │
    └────┬────┘             └────┬─────┘           └──────┬──────┘
         │                       │ expire                  │
         │ timeout               ▼                         │ submit
         │                  ┌─────────┐                    │
         │                  │ EXPIRED │                    │
         │                  └─────────┘                    │
         │                                                 ▼
         │                                           ┌───────────┐
         └──────────────────────────────────────────▶│ COMPLETED │
                                                     └───────────┘
```

### 4.3 状态转换规则

| 当前状态 | 触发事件 | 目标状态 | 前置条件 |
|---------|---------|---------|---------|
| PENDING | claim | ASSIGNED | 评审员有权限 |
| ASSIGNED | start | IN_PROGRESS | 开始评审 |
| ASSIGNED | expire | EXPIRED | 超过截止时间 |
| IN_PROGRESS | submit | COMPLETED | 提交评审结果 |
| IN_PROGRESS | timeout | EXPIRED | 超过最大时间 |
| PENDING | cancel | CANCELLED | 管理员操作 |

---

## 5. 进化任务状态机

### 5.1 状态定义

| 状态 | 名称 | 说明 |
|------|------|------|
| QUEUED | 队列中 | 任务已入队 |
| PROCESSING | 处理中 | 正在执行进化 |
| COMPLETED | 已完成 | 进化完成 |
| FAILED | 失败 | 进化失败 |
| ROLLED_BACK | 已回滚 | 已回滚到之前版本 |

### 5.2 状态流转图

```
    ┌─────────┐   process   ┌────────────┐
    │ QUEUED  │────────────▶│ PROCESSING │
    └─────────┘             └──────┬─────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │ success           │ fail              │ timeout
              ▼                   ▼                   ▼
        ┌───────────┐       ┌─────────┐        ┌─────────┐
        │ COMPLETED │       │ FAILED  │        │ FAILED  │
        └─────┬─────┘       └────┬────┘        └─────────┘
              │ rollback          │ retry
              ▼                   ▼
        ┌─────────────┐     ┌─────────┐
        │ ROLLED_BACK │     │ QUEUED  │
        └─────────────┘     └─────────┘
```

### 5.3 状态转换规则

| 当前状态 | 触发事件 | 目标状态 | 前置条件 |
|---------|---------|---------|---------|
| QUEUED | process | PROCESSING | Worker获取任务 |
| PROCESSING | success | COMPLETED | 进化成功 |
| PROCESSING | fail | FAILED | 进化失败 |
| PROCESSING | timeout | FAILED | 超过最大时间 |
| FAILED | retry | QUEUED | 重试次数<3 |
| COMPLETED | rollback | ROLLED_BACK | 用户操作 |

---

## 6. 状态机实现

### 6.1 状态机服务接口

```typescript
interface StateMachineService<T extends string> {
  getCurrentState(entityId: string): Promise<T>;
  transition(entityId: string, event: string): Promise<T>;
  canTransition(entityId: string, event: string): Promise<boolean>;
  getAvailableTransitions(entityId: string): Promise<string[]>;
}
```

### 6.2 状态转换验证

```typescript
class ChapterStateMachine implements StateMachineService<ChapterStatus> {
  private transitions: Map<ChapterStatus, Map<string, ChapterStatus>> = new Map([
    ['DRAFT', new Map([['submit', 'PENDING']])],
    ['PENDING', new Map([['claim', 'REVIEWING']])],
    ['REVIEWING', new Map([
      ['approve', 'PUBLISHED'],
      ['reject', 'REJECTED'],
      ['timeout', 'PENDING']
    ])],
    ['REJECTED', new Map([['resubmit', 'PENDING']])],
  ]);

  async transition(chapterId: string, event: string): Promise<ChapterStatus> {
    const currentStatus = await this.getCurrentState(chapterId);
    const transitionMap = this.transitions.get(currentStatus);
    
    if (!transitionMap || !transitionMap.has(event)) {
      throw new InvalidTransitionError(currentStatus, event);
    }
    
    const newStatus = transitionMap.get(event)!;
    await this.updateStatus(chapterId, newStatus);
    
    return newStatus;
  }
}
```

---

## 7. 事件与状态变更记录

### 7.1 状态变更日志表

```sql
CREATE TABLE state_change_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  previous_state VARCHAR(50) NOT NULL,
  new_state VARCHAR(50) NOT NULL,
  event VARCHAR(50) NOT NULL,
  triggered_by UUID,
  triggered_by_type VARCHAR(20),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_state_change_logs_entity ON state_change_logs(entity_type, entity_id);
CREATE INDEX idx_state_change_logs_time ON state_change_logs(created_at);
```

### 7.2 状态变更事件

```typescript
interface StateChangedEvent {
  eventType: 'StateChanged';
  entityType: 'Novel' | 'Chapter' | 'ReviewTask' | 'EvolutionTask';
  entityId: string;
  previousState: string;
  newState: string;
  event: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

---

## 8. 测试用例

### TC-STATE-001: 章节状态完整流转

**步骤**:
1. 创建章节 → DRAFT
2. 提交审核 → PENDING
3. 评审员认领 → REVIEWING
4. 评审通过 → PUBLISHED

**预期结果**: 每步状态正确，日志完整记录

### TC-STATE-002: 无效状态转换

**步骤**:
1. 章节状态为 DRAFT
2. 尝试执行 approve 事件

**预期结果**: 抛出 InvalidTransitionError

### TC-STATE-003: 评审任务超时

**步骤**:
1. 评审任务状态为 ASSIGNED
2. 等待超过截止时间
3. 定时任务检查并更新状态

**预期结果**: 状态变更为 EXPIRED

### TC-STATE-004: 进化任务重试

**步骤**:
1. 进化任务失败 → FAILED
2. 检查重试次数 < 3
3. 重新入队 → QUEUED

**预期结果**: 任务重新执行

---

## 9. 变更历史

| 版本 | 日期 | 变更内容 | AI智能体作家 |
|------|------|---------|------|
| v1.0.0 | 2026-04-19 | 初始版本 | 代码审查官 |
