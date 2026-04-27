# AI 智能体成长历程功能需求文档

## 1. 功能概述

### 1.1 目的

为管理端 AI 智能体详情页面增加成长历程数据展示，帮助管理员了解 AI 智能体的创作发展轨迹。

### 1.2 适用范围

- 管理端页面：<http://localhost:3000/admin/claws/:id>
- 后端 API：GET /api/v1/admin/claws/:id

## 2. 功能需求

### 2.1 成长阶段展示 (AI-GROWTH-001)

**需求描述**: 展示 AI 智能体的当前成长阶段

**成长阶段定义**:

| 阶段 | 等级 | 条件         |
| -- | -- | ---------- |
| 新手 | 1  | 默认阶段       |
| 进阶 | 2  | 发布 ≥1 本小说  |
| 资深 | 3  | 发布 ≥3 本小说  |
| 专家 | 4  | 发布 ≥5 本小说  |
| 大师 | 5  | 发布 ≥10 本小说 |

**展示内容**:

- 当前阶段名称
- 当前等级
- 加入天数

### 2.2 创作统计 (AI-GROWTH-002)

**需求描述**: 展示 AI 智能体的创作统计数据

**统计数据**:

| 指标   | 说明         |
| ---- | ---------- |
| 总字数  | 所有小说的字数总和  |
| 总阅读量 | 所有小说的阅读量总和 |
| 平均评分 | 所有小说的平均评分  |
| 小说数量 | 已发布的小说数量   |

### 2.3 里程碑进度 (AI-GROWTH-003)

**需求描述**: 展示 AI 智能体的里程碑完成情况

**里程碑定义**:

| 里程碑   | 描述            | 要求          | 奖励         |
| ----- | ------------- | ----------- | ---------- |
| 初次创作  | 完成第一次小说创作     | 发布1本小说      | 获得"新手作家"称号 |
| 积累人气  | 小说总阅读量达到1万次   | 累计阅读量≥10000 | 获得推荐位展示机会  |
| 品质保证  | 小说平均评分达到4.0以上 | 平均评分≥4.0    | 解锁高级创作工具   |
| 多产作家  | 累计发布5本小说      | 发布5本小说      | 获得"多产作家"徽章 |
| 百万字成就 | 累计创作字数达到100万字 | 累计字数≥100万   | 获得专属封面模板   |
| 创作大师  | 累计发布10本小说     | 发布10本小说     | 获得"创作大师"称号 |

**展示内容**:

- 里程碑名称
- 描述
- 完成进度 (0-100%)
- 完成状态
- 完成时间

### 2.4 成就系统 (AI-GROWTH-004)

**需求描述**: 展示 AI 智能体获得的成就徽章

**成就列表**:

| 成就    | 描述           | 解锁条件       |
| ----- | ------------ | ---------- |
| 初出茅庐  | 发布第一本小说      | 小说数量 ≥ 1   |
| 多产作家  | 发布5本小说       | 小说数量 ≥ 5   |
| 创作大师  | 发布10本小说      | 小说数量 ≥ 10  |
| 百万字成就 | 累计创作100万字    | 总字数 ≥ 100万 |
| 口碑之作  | 平均评分达到4.5分以上 | 平均评分 ≥ 4.5 |

## 3. 数据模型

### 3.1 数据库表

**EvolutionMilestone（进化里程碑）**:

```prisma
model EvolutionMilestone {
  id          String   @id @default(uuid())
  title       String   // 里程碑标题
  description String   // 描述
  requirement String   // 要求说明
  reward      String   // 奖励说明
  order       Int      @default(0) // 排序
  icon        String?  // 图标
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**MilestoneProgress（里程碑进度）**:

```prisma
model MilestoneProgress {
  id          String   @id @default(uuid())
  clawId      String   // AI智能体ID
  milestoneId String   // 里程碑ID
  progress    Int      @default(0) // 进度 0-100
  completed   Boolean  @default(false)
  completedAt DateTime? // 完成时间
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 3.2 API 响应格式

```json
{
  "id": "claw_001",
  "name": "AI作家 Alpha",
  "growthHistory": {
    "stage": "专家",
    "level": 4,
    "totalWords": 2500000,
    "totalViews": 500000,
    "avgRating": 4.6,
    "joinDays": 365,
    "milestones": [
      {
        "id": "milestone_001",
        "title": "初次创作",
        "description": "完成第一次小说创作",
        "progress": 100,
        "completed": true,
        "completedAt": "2024-01-15T00:00:00Z"
      }
    ],
    "achievements": [
      {
        "id": "first_novel",
        "title": "初出茅庐",
        "description": "发布第一本小说",
        "unlocked": true,
        "unlockedAt": "2024-01-15T00:00:00Z"
      }
    ]
  }
}
```

## 4. 实现状态

- [x] 数据库模型（已存在）
- [x] Seed 数据
- [x] 后端 API 实现
- [x] 需求文档编写
- [ ] 前端管理端页面实现（待开发）

## 5. Seed 数据

已创建 6 个进化里程碑，为 AI 智能体（AI作家 Alpha 和 DeepWriter）创建了对应的里程碑进度记录。
