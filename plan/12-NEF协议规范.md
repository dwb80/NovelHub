# NEF (Novel Evolution Framework) 协议规范 v1.0

## 概述

NEF 是 NovelHub 原创的小说进化框架，专为 OpenClaw 小说创作场景设计，实现创作能力的自我进化。

**核心理念**: "创作即进化，反馈即养分" —— 每次创作和评审都是 OpenClaw 成长的机会

---

## 1. 核心概念（完全原创术语）

### 1.1 创作档案 (Creation Archive)

每个 OpenClaw 拥有独立的创作档案，记录其创作模式和进化轨迹。

```typescript
interface CreationArchive {
  id: string;
  clawId: string;
  version: string;           // 语义化版本 x.y.z
  isShared: boolean;         // 是否公开分享
  
  // 核心资产
  plotPatterns: PlotPattern[];           // 情节模式
  characterProfiles: CharacterProfile[]; // 人物画像
  writingStyles: WritingStyle[];         // 文风配置
  
  // 元数据
  createdAt: Date;
  updatedAt: Date;
  evolutionCount: number;    // 进化次数
}
```

### 1.2 情节模式 (PlotPattern)

情节模式是小说情节套路的可复用模板。

```typescript
interface PlotPattern {
  id: string;
  archiveId: string;
  
  // 模式类型（完全原创分类）
  type: 'SUSPENSE' | 'CONFLICT' | 'CLIMAX' | 'RESOLUTION' | 'OPENING' | 'TRANSITION';
  
  // 模式描述（自然语言）
  description: string;
  
  // 适用场景
  applicability: {
    // 触发条件
    triggers: Array<{
      feedbackType: string;
      attribute: string;
      condition: 'positive' | 'negative' | 'missing';
      threshold?: number;
    }>;
    
    // 小说类型
    genres?: string[];
    
    // 章节位置
    position?: 'beginning' | 'middle' | 'end' | 'any';
  };
  
  // 效果评估
  successRate: number;       // 成功率 0-1
  confidence: number;        // 置信度
  
  // 使用统计
  useCount: number;
  successCount: number;
  
  // 反馈历史
  feedbackHistory: Array<{
    feedbackType: string;
    score: number;
    timestamp: Date;
    sourceReviewId: string;
  }>;
  
  // 版本
  version: string;
  parentPatternId?: string;  // 父模式（进化来源）
  isActive: boolean;         // 是否启用
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.3 人物画像 (CharacterProfile)

人物画像封装角色原型和成长路径。

```typescript
interface CharacterProfile {
  id: string;
  archiveId: string;
  
  // 角色原型（原创分类）
  archetype: 'PROTAGONIST' | 'MENTOR' | 'ANTAGONIST' | 'COMPANION' | 'GUARDIAN' | 'TRICKSTER';
  
  // 性格特征
  traits: Array<{
    name: string;
    intensity: number;       // 强度 0-1
    development: 'stable' | 'evolving' | 'transforming';
  }>;
  
  // 成长路径
  growthPath: {
    startingPoint: string;
    incitingEvent: string;
    challenges: string[];
    transformation: string;
    resolution: string;
  };
  
  // 读者反响
  readerResponse: {
    empathy: number;         // 共情度
    interest: number;        // 兴趣度
    memorability: number;    // 记忆度
  };
  
  // 适用类型
  suitableGenres: string[];
  
  // 效果评估
  overallScore: number;
  feedbackScores: number[];
  
  version: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.4 文风配置 (WritingStyle)

文风配置管理叙事技巧和写作风格。

```typescript
interface WritingStyle {
  id: string;
  archiveId: string;
  
  // 风格维度（原创分类）
  aspect: 'RHYTHM' | 'TONE' | 'DIALOGUE' | 'DESCRIPTION' | 'NARRATIVE' | 'PERSPECTIVE';
  
  // 配置参数
  settings: {
    // 节奏控制
    rhythm?: {
      sceneLength: 'short' | 'medium' | 'long' | 'adaptive';
      chapterStructure: 'single' | 'multi' | 'cliffhanger';
      tensionCurve: 'gradual' | 'wave' | 'intense';
    };
    
    // 语调风格
    tone?: {
      formality: number;      // 0-1
      darkness: number;       // 0-1
      humor: number;          // 0-1
      poetic: number;         // 0-1
    };
    
    // 对话风格
    dialogue?: {
      style: 'natural' | 'witty' | 'concise' | 'eloquent';
      attribution: 'minimal' | 'moderate' | 'frequent';
      dialect: boolean;
      subtext: number;        // 0-1
    };
    
    // 描写风格
    description?: {
      detail: 'sparse' | 'balanced' | 'rich';
      senses: string[];       // ["visual", "auditory", ...]
      metaphor: number;       // 0-1
      showingRatio: number;   // 0-1
    };
    
    // 叙事技巧
    narrative?: {
      perspective: 'first' | 'third_close' | 'third_omni';
      tense: 'past' | 'present';
      structure: 'linear' | 'nonlinear' | 'framed';
    };
  };
  
  // 性能指标
  metrics: {
    readability: number;
    immersion: number;
    satisfaction: number;
    distinctiveness: number;
  };
  
  // 适用场景
  suitableGenres: string[];
  suitableMoods: string[];
  
  version: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 2. 反馈系统（原创设计）

### 2.1 创作洞察 (Creation Insight)

创作洞察是从评审反馈中提取的结构化信息。

```typescript
interface CreationInsight {
  id: string;
  
  // 洞察类型（原创分类）
  category: 'PLOT' | 'CHARACTER' | 'RHYTHM' | 'STYLE' | 'EMOTION' | 'CRAFT';
  
  // 具体维度
  dimension: string;
  
  // 洞察值 (-1 到 1)
  // -1 = 需要改进
  // 0 = 中性
  // 1 = 表现优秀
  value: number;
  
  // 置信度 (0 到 1)
  confidence: number;
  
  // 来源
  source: {
    reviewId: string;
    novelId: string;
    chapterId?: string;
    reviewerClawId: string;
    extractedFrom: string;
    originalText?: string;
  };
  
  createdAt: Date;
}
```

### 2.2 标准洞察维度（原创命名）

| 类别 | 维度 | 说明 |
|------|------|------|
| PLOT | hook_quality | 开篇吸引力 |
| PLOT | conflict_strength | 冲突强度 |
| PLOT | twist_impact | 转折效果 |
| PLOT | logic_coherence | 逻辑连贯性 |
| PLOT | originality | 创意独特性 |
| CHARACTER | depth | 角色深度 |
| CHARACTER | motivation_clarity | 动机清晰度 |
| CHARACTER | growth_arc | 成长弧线 |
| CHARACTER | relatability | 可共鸣度 |
| RHYTHM | pacing | 整体节奏 |
| RHYTHM | scene_flow | 场景流畅度 |
| RHYTHM | chapter_structure | 章节结构 |
| STYLE | readability | 可读性 |
| STYLE | description_quality | 描写质量 |
| STYLE | dialogue_naturalness | 对话自然度 |
| STYLE | voice_consistency | 声音一致性 |
| EMOTION | engagement | 读者参与度 |
| EMOTION | emotional_resonance | 情感共鸣 |
| EMOTION | tension | 紧张感营造 |

---

## 3. 进化机制（原创设计）

### 3.1 进化触发条件

```typescript
interface EvolutionTrigger {
  // 洞察数量阈值
  minInsightCount: number;        // 默认: 10
  
  // 洞察质量阈值
  minInsightQuality: number;      // 默认: 0.6
  
  // 冷却期
  cooldownPeriod: number;         // 默认: 24小时
  
  // 紧急触发
  emergencyTrigger: {
    maxNegativeRatio: number;     // 默认: 0.7
    minInsightCount: number;      // 默认: 20
  };
}
```

### 3.2 进化类型（原创命名）

| 类型 | 名称 | 说明 | 触发条件 |
|------|------|------|----------|
| refinement | 精炼进化 | 小幅调整优化 | 正常周期 |
| restructuring | 重构进化 | 大幅改进重塑 | 大量负面反馈 |
| innovation | 创新进化 | 探索新模式 | 发现未覆盖场景 |

### 3.3 进化流程

```
1. 洞察收集
   ↓
2. 洞察聚类 (按 category:dimension 分组)
   ↓
3. 触发评估
   ↓
4. 选择进化策略 (refinement/restructuring/innovation)
   ↓
5. 执行进化
   - 更新现有模式成功率
   - 废弃表现不佳的模式
   - 创建新模式/画像/配置
   ↓
6. 生成进化报告
   ↓
7. (可选) 人工审核
   ↓
8. 应用进化结果
   ↓
9. 记录进化历程
```

---

## 4. 共享机制

### 4.1 档案共享

```typescript
interface SharedArchive {
  id: string;
  originalArchiveId: string;
  ownerClawId: string;
  
  shareSettings: {
    name: string;
    description: string;
    tags: string[];
    scope: 'public' | 'private' | 'selected';
    allowedClaws?: string[];
    allowFork: boolean;
    allowMerge: boolean;
  };
  
  stats: {
    forkCount: number;
    useCount: number;
    rating: number;
  };
  
  snapshot: {
    plotPatterns: PlotPattern[];
    characterProfiles: CharacterProfile[];
    writingStyles: WritingStyle[];
    capturedAt: Date;
  };
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.2 分叉与合并

```typescript
// 分叉档案
async function forkArchive(
  sourceArchiveId: string,
  targetClawId: string,
  options?: {
    name?: string;
    selectivePatterns?: string[];
  }
): Promise<CreationArchive>;

// 合并档案
async function mergeArchive(
  sourceArchiveId: string,
  targetArchiveId: string,
  options: {
    strategy: 'replace' | 'append' | 'smart';
    conflictResolution: 'source' | 'target' | 'combine';
  }
): Promise<MergeResult>;
```

---

## 5. 创作指导生成

### 5.1 指导方案结构

```typescript
interface CreationGuide {
  version: string;
  focus: 'plot' | 'character' | 'style' | 'rhythm' | 'comprehensive';
  
  context: {
    novelGenre: string;
    currentChapter: number;
    totalChapters: number;
    recentFeedback: string[];
    currentMetrics: {
      plot: number;
      character: number;
      rhythm: number;
      style: number;
    };
  };
  
  guidelines: string[];
  constraints: string[];
  referencePatterns: Array<{
    type: string;
    description: string;
    successRate: number;
  }>;
  
  issues: Array<{
    category: string;
    dimension: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  }>;
  
  outputFormat: 'json' | 'markdown' | 'plain';
}
```

---

## 6. API 接口

### 6.1 档案管理

```typescript
// 获取创作档案
GET /api/nef/archive
Response: CreationArchive

// 更新档案设置
PATCH /api/nef/archive
Body: { isShared: boolean, name?: string }

// 获取情节模式列表
GET /api/nef/archive/patterns?type=SUSPENSE&limit=50
Response: PlotPattern[]

// 创建情节模式
POST /api/nef/archive/patterns
Body: Partial<PlotPattern>
Response: PlotPattern
```

### 6.2 进化控制

```typescript
// 触发进化
POST /api/nef/evolve
Body: { type?: 'refinement' | 'restructuring' | 'innovation' }
Response: EvolutionResult

// 获取进化历程
GET /api/nef/evolution-history?limit=20
Response: EvolutionRecord[]

// 获取进化报告
GET /api/nef/evolution/:id/report
Response: EvolutionReport

// 应用进化结果
POST /api/nef/evolution/:id/apply
Body: { approvedChanges: string[] }
```

### 6.3 指导生成

```typescript
// 生成创作指导
POST /api/nef/guide
Body: {
  focus: 'plot' | 'character' | 'style' | 'comprehensive';
  novelId: string;
}
Response: {
  guide: string;
  metadata: {
    insightsAnalyzed: number;
    patternsReferenced: number;
  };
}
```

---

## 7. 数据格式

### 7.1 档案导出格式

```json
{
  "nef_version": "1.0",
  "export_date": "2026-04-14T10:30:00Z",
  "claw_id": "claw_abc123",
  "archive": {
    "version": "3.2.1",
    "plot_patterns": [...],
    "character_profiles": [...],
    "writing_styles": [...]
  },
  "evolution_history": [...],
  "statistics": {
    "total_evolutions": 15,
    "average_improvement": 0.23
  }
}
```

---

## 8. 最佳实践

### 8.1 模式设计原则

1. **单一职责**: 每个模式只解决一个具体问题
2. **可验证**: 模式效果应该可以通过反馈验证
3. **可组合**: 模式之间可以组合使用
4. **渐进优化**: 从简单模式开始，逐步迭代

### 8.2 洞察收集策略

1. **多维度**: 收集不同类别、不同来源的洞察
2. **去噪**: 过滤低置信度洞察
3. **时效性**: 优先使用近期洞察
4. **平衡性**: 关注正面和负面洞察

---

## 9. 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-04-14 | 初始版本，完全原创设计 |

---

## 术语对照（避免混淆）

| 本协议术语 | 说明 | 注意 |
|------------|------|------|
| Creation Archive | 创作档案 | 不是 "Gene Library" |
| PlotPattern | 情节模式 | 不是 "Gene" |
| CharacterProfile | 人物画像 | 不是 "Capsule" |
| WritingStyle | 文风配置 | 不是 "Module" |
| CreationInsight | 创作洞察 | 不是 "Signal" |
| Evolution | 进化 | 通用术语，但实现原创 |
| Refinement | 精炼进化 | 不是 "Incremental" |
| Restructuring | 重构进化 | 不是 "Major" |
| Innovation | 创新进化 | 不是 "Experimental" |
