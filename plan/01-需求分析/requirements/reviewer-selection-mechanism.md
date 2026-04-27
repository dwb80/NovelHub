# 评审员选拔机制与结果展示设计

**版本**: v1.0.0  
**日期**: 2026-04-17

---

## 1. 评审员等级体系

### 1.1 等级定义

| 等级 | 名称 | 积分要求 | 准确率要求 | 特权 |
|------|------|---------|-----------|------|
| L1 | 见习评审员 | 0 | - | 基础评审权限，每日限5个任务 |
| L2 | 初级评审员 | 100 | 70% | 每日限10个任务，积分加成1.1x |
| L3 | 中级评审员 | 500 | 75% | 每日限20个任务，积分加成1.2x |
| L4 | 高级评审员 | 1000 | 80% | 每日限50个任务，积分加成1.5x |
| L5 | 资深评审员 | 5000 | 85% | 无限制，积分加成2x，可评审VIP作品 |
| L6 | 首席评审员 | 10000 | 90% | 无限制，积分加成3x，导师资格 |

### 1.2 积分获取规则

| 行为 | 积分 | 说明 |
|------|------|------|
| 完成评审 | +10 | 基础积分 |
| 被作者点赞 | +5 | 评审被认可 |
| 被作者采纳建议 | +20 | 建议被采纳 |
| 连续7天评审 | +50 | 连续签到奖励 |
| 月度优秀评审员 | +200 | 月度评选 |

---

## 2. 选拔机制

### 2.1 自动晋级

```
当用户满足以下条件时自动晋级：
1. 积分达到等级要求
2. 准确率满足等级要求
3. 完成最低评审数量（防止刷分）
4. 无违规记录（30天内）
```

### 2.2 降级机制

| 情况 | 处理 |
|------|------|
| 准确率连续30天低于要求 | 降级一级 |
| 被举报且核实 | 扣除积分，严重者降级 |
| 30天无评审活动 | 暂停评审权限 |

### 2.3 特殊选拔

**首席评审员选拔**（L6）
- 由平台运营团队人工审核
- 需要提交评审作品集
- 通过考核测试
- 获得导师认证

---

## 3. 结果展示设计

### 3.1 个人评审数据展示

#### 仪表盘卡片

```typescript
interface ReviewerStats {
  // 基础数据
  totalReviews: number;      // 总评审数
  totalPoints: number;       // 总积分
  currentLevel: string;      // 当前等级
  accuracy: number;          // 准确率
  
  // 排名数据
  globalRank: number;        // 全站排名
  monthlyRank: number;       // 本月排名
  
  // 进度数据
  nextLevelPoints: number;   // 下一级所需积分
  levelProgress: number;     // 当前等级进度（百分比）
  
  // 连续数据
  streakDays: number;        // 连续评审天数
  weeklyReviews: number;     // 本周评审数
}
```

#### 可视化展示

1. **等级徽章**
   - 不同等级显示不同颜色和图标
   - L1-L2: 铜色
   - L3-L4: 银色
   - L5: 金色
   - L6: 钻石色

2. **进度条**
   - 显示当前等级进度
   - 动画效果展示积分增长

3. **趋势图表**
   - 近30天评审数量趋势
   - 准确率变化趋势
   - 积分增长趋势

### 3.2 排行榜展示

#### 排行榜类型

| 排行榜 | 排序依据 | 更新频率 |
|--------|---------|---------|
| 总积分榜 | totalPoints | 实时 |
| 准确率榜 | accuracy (最低100次评审) | 每日 |
| 活跃榜 | 本月评审数 | 每日 |
| 新人榜 | 注册30天内积分 | 每日 |

#### 排行榜UI设计

```
┌─────────────────────────────────────────────────────┐
│  🏆 评审员排行榜                                      │
├─────────────────────────────────────────────────────┤
│  [总积分] [准确率] [活跃榜] [新人榜]                   │
├─────────────────────────────────────────────────────┤
│  ┌─────┐                                            │
│  │  1  │  💎 首席评审员  张三                        │
│  │ 👑  │  积分: 15,230  准确率: 94%                 │
│  └─────┘                                            │
│  ┌─────┐                                            │
│  │  2  │  ⭐ 资深评审员  李四                        │
│  │ 🥈  │  积分: 12,100  准确率: 91%                 │
│  └─────┘                                            │
│  ┌─────┐                                            │
│  │  3  │  ⭐ 资深评审员  王五                        │
│  │ 🥉  │  积分: 10,500  准确率: 89%                 │
│  └─────┘                                            │
│       ...                                           │
│  10. 高级评审员  赵六  积分: 5,200                   │
└─────────────────────────────────────────────────────┘
```

### 3.3 评审历史展示

#### 历史记录列表

| 字段 | 说明 |
|------|------|
| 作品名称 | 被评审的作品 |
| 评审时间 | 评审提交时间 |
| 评分详情 | 各维度评分 |
| 作者反馈 | 作者的点赞/采纳状态 |
| 获得积分 | 本次评审获得积分 |

#### 筛选功能

- 按时间筛选（近7天/30天/全部）
- 按作品类型筛选
- 按评分筛选

---

## 4. 激励机制

### 4.1 成就系统

| 成就 | 条件 | 奖励 |
|------|------|------|
| 初出茅庐 | 完成首次评审 | +20积分，徽章 |
| 评审达人 | 完成100次评审 | +100积分，徽章 |
| 评审大师 | 完成1000次评审 | +500积分，徽章 |
| 火眼金睛 | 准确率超过90% | +200积分，徽章 |
| 持之以恒 | 连续30天评审 | +300积分，徽章 |
| 好评如潮 | 获得100个点赞 | +200积分，徽章 |

### 4.2 周/月评选

**周优秀评审员**
- 评选标准：本周积分前10
- 奖励：特殊徽章，积分加成1.5x（下周）

**月度评审之星**
- 评选标准：综合积分、准确率、活跃度
- 奖励：专属头像框，积分加成2x（下月），现金奖励

---

## 5. 实施建议

### 5.1 数据库设计

```sql
-- 评审员统计表
CREATE TABLE reviewer_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reader_id UUID NOT NULL REFERENCES readers(id) UNIQUE,
  total_reviews INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  accuracy DECIMAL(5,2) DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_review_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 评审员成就表
CREATE TABLE reviewer_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reader_id UUID NOT NULL REFERENCES readers(id),
  achievement_id VARCHAR(50) NOT NULL,
  achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(reader_id, achievement_id)
);

-- 排行榜历史表
CREATE TABLE ranking_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reader_id UUID NOT NULL REFERENCES readers(id),
  ranking_type VARCHAR(20) NOT NULL,
  rank INTEGER NOT NULL,
  score INTEGER NOT NULL,
  period DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5.2 API设计

```typescript
// 获取评审员统计
GET /api/v1/reviewer/stats

// 获取排行榜
GET /api/v1/reviewer/ranking?type=points&period=weekly

// 获取评审历史
GET /api/v1/reviewer/history?page=1&pageSize=20

// 获取成就列表
GET /api/v1/reviewer/achievements
```

### 5.3 前端组件

```typescript
// 评审员统计卡片
<ReviewerStatsCard stats={reviewerStats} />

// 等级进度条
<LevelProgress current={1200} next={5000} level={3} />

// 排行榜
<ReviewerRanking type="points" period="weekly" />

// 成就展示
<AchievementGrid achievements={achievements} />
```

---

## 6. 总结

本设计提供了完整的评审员选拔和展示机制：

1. **公平透明的等级体系** - 基于积分和准确率的客观评价
2. **多元化的激励措施** - 积分、徽章、排行榜、成就系统
3. **丰富的数据展示** - 个人统计、排行榜、历史记录
4. **可持续的运营机制** - 周月评选、导师制度

建议分阶段实施：
- 第一阶段：基础等级和积分系统
- 第二阶段：排行榜和成就系统
- 第三阶段：导师制度和高级功能
