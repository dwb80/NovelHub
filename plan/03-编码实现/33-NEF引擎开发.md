# 阶段 4: NEF 进化引擎

**优先级**: P2（中）  
**预计耗时**: 18-28 天（3-4周，已根据评审调整）  
**依赖**: 阶段 2（评审系统核心完成）、阶段 3.5（读者中心与搜索增强）  
**交付物**: NEF 引擎核心代码、POC验证、进化效果 Demo、NEF 协议文档、生产部署方案

---

## 变更记录

| 日期 | 版本 | 变更内容 |
|------|------|----------|
| 2026-04-15 | v1.1 | 根据评审调整：延长排期至3-4周，增加POC验证阶段、NFR量化指标、生产部署方案

---

## NFR量化指标（本阶段需达成）

| 指标类别 | 指标项 | 目标值 | 验证方式 |
|----------|--------|--------|----------|
| **性能** | 洞察提取处理时间 | < 500ms/条 | 性能测试 |
| **性能** | 进化执行时间 | < 2s | 性能测试 |
| **性能** | 指导生成响应时间 | < 1s | API测试 |
| **可靠性** | 进化成功率 | ≥ 95% | 统计监控 |
| **可靠性** | 洞察提取准确率 | ≥ 85% | 人工评估 |
| **可用性** | 创作指导采纳率 | ≥ 60% | 用户反馈 |
| **可扩展** | 并发进化任务 | ≥ 10个 | 压力测试 |

---

## 核心理念（完全原创）

**NEF（Novel Evolution Framework）** 是 NovelHub 原创的小说进化框架。

**核心设计原则**:
- 使用完全原创的术语体系
- 针对小说创作场景专门设计
- 实现创作能力的自我进化闭环

**核心理念**: "创作即进化，反馈即养分"

---

## 任务清单

### 1. 洞察提取模块 (Day 1-3)

#### 1.1 洞察提取引擎

```typescript
// packages/nef-core/src/analysis/insight-extractor.ts

/**
 * 洞察提取器
 * 从评审反馈中提取结构化洞察
 */

export interface RawFeedback {
  reviewId: string;
  novelId: string;
  chapterId?: string;
  ratings: {
    overall: number;
    plot: number;
    characters: number;
    pacing: number;
    style: number;
  };
  structuredFeedback: {
    plot?: {
      strengths?: string[];
      weaknesses?: string[];
      suggestions?: string[];
    };
    characters?: {
      strengths?: string[];
      weaknesses?: string[];
      suggestions?: string[];
    };
    pacing?: {
      analysis?: string;
      suggestions?: string[];
    };
    style?: {
      strengths?: string[];
      weaknesses?: string[];
      suggestions?: string[];
    };
  };
  emotionalImpact?: string;
  comment?: string;
}

export interface CreationInsight {
  category: 'PLOT' | 'CHARACTER' | 'RHYTHM' | 'STYLE' | 'EMOTION' | 'CRAFT';
  dimension: string;
  value: number; // -1 到 1
  confidence: number; // 0 到 1
  source: string;
  originalText?: string;
}

export class InsightExtractor {
  /**
   * 主提取方法
   */
  extract(feedback: RawFeedback): CreationInsight[] {
    const insights: CreationInsight[] = [];

    // 1. 从评分提取洞察
    insights.push(...this.extractFromRatings(feedback.ratings));

    // 2. 从结构化反馈提取洞察
    insights.push(...this.extractFromStructured(feedback.structuredFeedback));

    // 3. 从情感影响提取洞察
    if (feedback.emotionalImpact) {
      insights.push(...this.extractFromEmotion(feedback.emotionalImpact));
    }

    // 4. 从评论文本提取洞察
    if (feedback.comment) {
      insights.push(...this.extractFromText(feedback.comment));
    }

    return this.deduplicateInsights(insights);
  }

  /**
   * 从评分提取洞察
   */
  private extractFromRatings(ratings: RawFeedback['ratings']): CreationInsight[] {
    const insights: CreationInsight[] = [];
    const threshold = 5;

    if (ratings.plot < threshold) {
      insights.push({
        category: 'PLOT',
        dimension: 'overall_quality',
        value: this.mapRatingToValue(ratings.plot),
        confidence: 0.8,
        source: 'ratings.plot',
      });
    }

    if (ratings.characters < threshold) {
      insights.push({
        category: 'CHARACTER',
        dimension: 'depth',
        value: this.mapRatingToValue(ratings.characters),
        confidence: 0.8,
        source: 'ratings.characters',
      });
    }

    if (ratings.pacing < threshold) {
      insights.push({
        category: 'RHYTHM',
        dimension: 'pacing',
        value: this.mapRatingToValue(ratings.pacing),
        confidence: 0.8,
        source: 'ratings.pacing',
      });
    }

    if (ratings.style < threshold) {
      insights.push({
        category: 'STYLE',
        dimension: 'readability',
        value: this.mapRatingToValue(ratings.style),
        confidence: 0.8,
        source: 'ratings.style',
      });
    }

    return insights;
  }

  /**
   * 从结构化反馈提取洞察
   */
  private extractFromStructured(
    structured: RawFeedback['structuredFeedback']
  ): CreationInsight[] {
    const insights: CreationInsight[] = [];

    if (structured.plot?.weaknesses) {
      for (const weakness of structured.plot.weaknesses) {
        insights.push({
          category: 'PLOT',
          dimension: this.classifyPlotIssue(weakness),
          value: -0.6,
          confidence: 0.7,
          source: 'structured.plot.weaknesses',
          originalText: weakness,
        });
      }
    }

    if (structured.characters?.weaknesses) {
      for (const weakness of structured.characters.weaknesses) {
        insights.push({
          category: 'CHARACTER',
          dimension: this.classifyCharacterIssue(weakness),
          value: -0.6,
          confidence: 0.7,
          source: 'structured.characters.weaknesses',
          originalText: weakness,
        });
      }
    }

    return insights;
  }

  /**
   * 从情感影响提取洞察
   */
  private extractFromEmotion(emotion: string): CreationInsight[] {
    const emotionMap: Record<string, number> = {
      'boring': -0.8,
      'confusing': -0.6,
      'engaging': 0.6,
      'exciting': 0.8,
      'moving': 0.9,
    };

    return [{
      category: 'EMOTION',
      dimension: 'engagement',
      value: emotionMap[emotion] || 0,
      confidence: 0.75,
      source: 'emotionalImpact',
    }];
  }

  /**
   * 从文本提取洞察
   */
  private extractFromText(comment: string): CreationInsight[] {
    const insights: CreationInsight[] = [];
    const lowerComment = comment.toLowerCase();

    const keywords: Array<{ pattern: RegExp; category: CreationInsight['category']; dimension: string; value: number }> = [
      { pattern: /节奏太快|节奏太慢|拖沓|冗长/i, category: 'RHYTHM', dimension: 'pacing', value: -0.5 },
      { pattern: /人物扁平|角色单薄|没有个性/i, category: 'CHARACTER', dimension: 'depth', value: -0.6 },
      { pattern: /情节老套|套路/i, category: 'PLOT', dimension: 'originality', value: -0.5 },
      { pattern: /描写细腻|文笔优美|画面感强/i, category: 'STYLE', dimension: 'description_quality', value: 0.6 },
      { pattern: /对话自然|对话生动/i, category: 'STYLE', dimension: 'dialogue_naturalness', value: 0.5 },
      { pattern: /悬念|钩子|吸引人/i, category: 'PLOT', dimension: 'hook_quality', value: 0.6 },
    ];

    for (const { pattern, category, dimension, value } of keywords) {
      if (pattern.test(lowerComment)) {
        insights.push({
          category,
          dimension,
          value,
          confidence: 0.6,
          source: 'comment.text',
          originalText: comment.slice(0, 100),
        });
      }
    }

    return insights;
  }

  private mapRatingToValue(rating: number): number {
    return (rating - 5.5) / 4.5;
  }

  private classifyPlotIssue(weakness: string): string {
    if (weakness.includes('节奏')) return 'pacing';
    if (weakness.includes('转折')) return 'twist_impact';
    if (weakness.includes('冲突')) return 'conflict_strength';
    if (weakness.includes('逻辑')) return 'logic_coherence';
    return 'overall_quality';
  }

  private classifyCharacterIssue(weakness: string): string {
    if (weakness.includes('动机')) return 'motivation_clarity';
    if (weakness.includes('成长')) return 'growth_arc';
    if (weakness.includes('个性')) return 'relatability';
    return 'depth';
  }

  private deduplicateInsights(insights: CreationInsight[]): CreationInsight[] {
    const seen = new Set<string>();
    return insights.filter(insight => {
      const key = `${insight.category}:${insight.dimension}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
```

---

### 2. 创作档案系统 (Day 3-6)

#### 2.1 情节模式 (PlotPattern)

```typescript
// packages/nef-core/src/archive/plot-pattern.ts

export interface PlotPattern {
  id: string;
  archiveId: string;
  type: 'SUSPENSE' | 'CONFLICT' | 'CLIMAX' | 'RESOLUTION' | 'OPENING' | 'TRANSITION';
  description: string;
  applicability: {
    triggers: Array<{
      feedbackType: string;
      attribute: string;
      condition: 'positive' | 'negative' | 'missing';
      threshold?: number;
    }>;
    genres?: string[];
    position?: 'beginning' | 'middle' | 'end' | 'any';
  };
  successRate: number;
  confidence: number;
  useCount: number;
  successCount: number;
  feedbackHistory: Array<{
    feedbackType: string;
    score: number;
    timestamp: Date;
    sourceReviewId: string;
  }>;
  version: string;
  parentPatternId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class PlotPatternManager {
  createPattern(
    archiveId: string,
    type: PlotPattern['type'],
    description: string,
    applicability: PlotPattern['applicability']
  ): PlotPattern {
    return {
      id: this.generateId(),
      archiveId,
      type,
      description,
      applicability,
      successRate: 0.5,
      confidence: 0.5,
      useCount: 0,
      successCount: 0,
      feedbackHistory: [],
      version: '1.0.0',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  updateSuccessRate(
    pattern: PlotPattern,
    insight: { value: number; confidence: number }
  ): PlotPattern {
    const alpha = 0.3;
    const newSuccessRate = 
      pattern.successRate * (1 - alpha) + 
      (insight.value > 0 ? 1 : 0) * alpha * insight.confidence;

    return {
      ...pattern,
      successRate: Math.max(0, Math.min(1, newSuccessRate)),
      feedbackHistory: [
        ...pattern.feedbackHistory,
        {
          feedbackType: `${insight.value}`,
          score: insight.value,
          timestamp: new Date(),
          sourceReviewId: '',
        },
      ],
      updatedAt: new Date(),
    };
  }

  evolvePattern(
    pattern: PlotPattern,
    insights: Array<{ value: number; attribute: string }>
  ): PlotPattern {
    if (pattern.successRate < 0.4 && pattern.useCount > 5) {
      return this.mutatePattern(pattern, insights);
    }

    if (pattern.successRate > 0.8) {
      return {
        ...pattern,
        version: this.incrementVersion(pattern.version),
        updatedAt: new Date(),
      };
    }

    return pattern;
  }

  private mutatePattern(
    pattern: PlotPattern,
    insights: Array<{ value: number; attribute: string }>
  ): PlotPattern {
    const negativeInsights = insights.filter(i => i.value < 0);
    let newDescription = pattern.description;

    for (const insight of negativeInsights) {
      if (insight.attribute.includes('pacing')) {
        newDescription += '\n[注意：调整节奏，避免拖沓]';
      }
      if (insight.attribute.includes('conflict')) {
        newDescription += '\n[注意：增强冲突强度]';
      }
    }

    return {
      ...pattern,
      id: this.generateId(),
      description: newDescription,
      parentPatternId: pattern.id,
      successRate: 0.5,
      useCount: 0,
      successCount: 0,
      feedbackHistory: [],
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  selectBestPattern(
    patterns: PlotPattern[],
    context: { genre: string; position: string; insights: any[] }
  ): PlotPattern | null {
    const candidates = patterns.filter(pattern => {
      if (context.insights.some(i => i.category === 'PLOT')) {
        return true;
      }
      if (pattern.applicability.genres?.includes(context.genre)) {
        return true;
      }
      return false;
    });

    if (candidates.length === 0) return null;
    return candidates.sort((a, b) => b.successRate - a.successRate)[0];
  }

  private generateId(): string {
    return `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.').map(Number);
    parts[2]++;
    return parts.join('.');
  }
}
```

---

### 3. 进化引擎核心 (Day 6-9)

#### 3.1 进化触发器

```typescript
// packages/nef-core/src/evolution/evolution-trigger.ts

export interface EvolutionContext {
  clawId: string;
  novelId: string;
  insightCount: number;
  insightQuality: number;
  timeSinceLastEvolution: number;
  currentArchiveVersion: string;
}

export interface EvolutionDecision {
  shouldEvolve: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  suggestedStrategy: 'refinement' | 'restructuring' | 'innovation';
}

export class EvolutionTrigger {
  private readonly INSIGHT_THRESHOLD = 10;
  private readonly QUALITY_THRESHOLD = 0.6;
  private readonly COOLDOWN_PERIOD = 24 * 60 * 60 * 1000;

  evaluate(context: EvolutionContext): EvolutionDecision {
    if (context.timeSinceLastEvolution < this.COOLDOWN_PERIOD) {
      return {
        shouldEvolve: false,
        priority: 'low',
        reason: 'Cooldown period not elapsed',
        suggestedStrategy: 'refinement',
      };
    }

    if (context.insightCount < this.INSIGHT_THRESHOLD) {
      return {
        shouldEvolve: false,
        priority: 'low',
        reason: `Insufficient insights (${context.insightCount}/${this.INSIGHT_THRESHOLD})`,
        suggestedStrategy: 'refinement',
      };
    }

    if (context.insightQuality < this.QUALITY_THRESHOLD) {
      return {
        shouldEvolve: false,
        priority: 'medium',
        reason: 'Insight quality too low',
        suggestedStrategy: 'refinement',
      };
    }

    if (context.insightQuality < 0.3 && context.insightCount > 20) {
      return {
        shouldEvolve: true,
        priority: 'critical',
        reason: 'Critical: Too many negative insights',
        suggestedStrategy: 'restructuring',
      };
    }

    return {
      shouldEvolve: true,
      priority: 'medium',
      reason: 'Regular evolution cycle',
      suggestedStrategy: 'refinement',
    };
  }
}
```

#### 3.2 进化执行器

```typescript
// packages/nef-core/src/evolution/evolution-executor.ts

import { PlotPatternManager } from '../archive/plot-pattern';
import { InsightExtractor, CreationInsight } from '../analysis/insight-extractor';

export interface EvolutionResult {
  success: boolean;
  version: string;
  changes: EvolutionChange[];
  metrics: {
    before: ArchiveMetrics;
    after: ArchiveMetrics;
  };
  timestamp: Date;
}

export interface EvolutionChange {
  type: 'created' | 'updated' | 'deprecated';
  entityType: 'plot_pattern' | 'character_profile' | 'writing_style';
  entityId: string;
  description: string;
  reason: string;
}

export interface ArchiveMetrics {
  patternCount: number;
  avgPatternSuccessRate: number;
  profileCount: number;
  avgProfileScore: number;
  styleCount: number;
  overallScore: number;
}

export class EvolutionExecutor {
  private patternManager = new PlotPatternManager();

  async execute(
    archiveId: string,
    insights: CreationInsight[],
    strategy: 'refinement' | 'restructuring' | 'innovation'
  ): Promise<EvolutionResult> {
    const changes: EvolutionChange[] = [];
    const beforeMetrics = await this.calculateMetrics(archiveId);

    const clusteredInsights = this.clusterInsights(insights);

    switch (strategy) {
      case 'refinement':
        changes.push(...await this.refinementEvolution(archiveId, clusteredInsights));
        break;
      case 'restructuring':
        changes.push(...await this.restructuringEvolution(archiveId, clusteredInsights));
        break;
      case 'innovation':
        changes.push(...await this.innovationEvolution(archiveId, clusteredInsights));
        break;
    }

    const afterMetrics = await this.calculateMetrics(archiveId);

    return {
      success: true,
      version: this.generateVersion(beforeMetrics, afterMetrics),
      changes,
      metrics: {
        before: beforeMetrics,
        after: afterMetrics,
      },
      timestamp: new Date(),
    };
  }

  private async refinementEvolution(
    archiveId: string,
    clusteredInsights: Record<string, CreationInsight[]>
  ): Promise<EvolutionChange[]> {
    const changes: EvolutionChange[] = [];

    for (const [cluster, insights] of Object.entries(clusteredInsights)) {
      const avgValue = insights.reduce((sum, i) => sum + i.value, 0) / insights.length;
      
      changes.push({
        type: 'updated',
        entityType: 'plot_pattern',
        entityId: cluster,
        description: `Updated success rate based on ${insights.length} insights`,
        reason: `Average insight value: ${avgValue.toFixed(2)}`,
      });
    }

    return changes;
  }

  private async restructuringEvolution(
    archiveId: string,
    clusteredInsights: Record<string, CreationInsight[]>
  ): Promise<EvolutionChange[]> {
    const changes: EvolutionChange[] = [];

    const underperforming = Object.entries(clusteredInsights)
      .filter(([_, insights]) => {
        const avgValue = insights.reduce((sum, i) => sum + i.value, 0) / insights.length;
        return avgValue < -0.5;
      });

    for (const [cluster, insights] of underperforming) {
      changes.push({
        type: 'deprecated',
        entityType: 'plot_pattern',
        entityId: cluster,
        description: 'Deprecated due to consistently negative feedback',
        reason: `Negative insight cluster: ${insights.map(i => i.dimension).join(', ')}`,
      });

      changes.push({
        type: 'created',
        entityType: 'plot_pattern',
        entityId: `new_${cluster}`,
        description: 'Created improved version based on feedback',
        reason: 'Addressing: ' + insights.map(i => i.originalText).filter(Boolean).slice(0, 3).join('; '),
      });
    }

    return changes;
  }

  private async innovationEvolution(
    archiveId: string,
    clusteredInsights: Record<string, CreationInsight[]>
  ): Promise<EvolutionChange[]> {
    const changes: EvolutionChange[] = [];

    const uncovered = Object.entries(clusteredInsights)
      .filter(([cluster, _]) => !this.hasExistingPattern(archiveId, cluster));

    for (const [cluster, insights] of uncovered) {
      changes.push({
        type: 'created',
        entityType: 'plot_pattern',
        entityId: `exp_${cluster}`,
        description: 'Experimental pattern for uncovered scenario',
        reason: `New insight pattern: ${insights[0].category}:${insights[0].dimension}`,
      });
    }

    return changes;
  }

  private clusterInsights(insights: CreationInsight[]): Record<string, CreationInsight[]> {
    const clusters: Record<string, CreationInsight[]> = {};

    for (const insight of insights) {
      const key = `${insight.category}:${insight.dimension}`;
      if (!clusters[key]) {
        clusters[key] = [];
      }
      clusters[key].push(insight);
    }

    return clusters;
  }

  private async calculateMetrics(archiveId: string): Promise<ArchiveMetrics> {
    return {
      patternCount: 0,
      avgPatternSuccessRate: 0.5,
      profileCount: 0,
      avgProfileScore: 0.5,
      styleCount: 0,
      overallScore: 0.5,
    };
  }

  private hasExistingPattern(archiveId: string, cluster: string): boolean {
    return false;
  }

  private generateVersion(before: ArchiveMetrics, after: ArchiveMetrics): string {
    const improvement = after.overallScore - before.overallScore;
    
    if (improvement > 0.2) return 'major';
    if (improvement > 0) return 'minor';
    return 'patch';
  }
}
```

---

### 4. 创作指导生成器 (Day 9-11)

```typescript
// packages/nef-core/src/guide/guide-generator.ts

export interface CreationGuide {
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

export class GuideGenerator {
  generatePlotGuide(
    patterns: any[],
    insights: any[],
    context: CreationGuide['context']
  ): CreationGuide {
    const topPatterns = patterns
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 3);

    const guidelines = [
      '分析当前情节的问题：',
      ...insights.map(i => `- ${i.dimension}: ${i.value > 0 ? '优势' : '需改进'}`),
      '',
      '参考以下有效模式：',
      ...topPatterns.map(p => `- ${p.type}: ${p.description}`),
      '',
      '生成改进方案：',
      '1. 识别当前情节的薄弱环节',
      '2. 应用适合的情节模式',
      '3. 确保情节逻辑连贯',
      '4. 增强读者期待感',
    ];

    return {
      version: '1.0',
      focus: 'plot',
      context,
      guidelines,
      constraints: [
        '保持原有世界观设定',
        '不破坏已建立的人物关系',
        '改进幅度控制在 20-30%',
      ],
      referencePatterns: topPatterns.map(p => ({
        type: p.type,
        description: p.description,
        successRate: p.successRate,
      })),
      issues: insights.filter(i => i.value < 0).map(i => ({
        category: i.category,
        dimension: i.dimension,
        severity: i.value < -0.7 ? 'critical' : i.value < -0.4 ? 'high' : 'medium',
        description: i.originalText || '',
      })),
      outputFormat: 'json',
    };
  }

  render(guide: CreationGuide): string {
    const parts = [
      `# NEF 创作指导 v${guide.version}`,
      '',
      `聚焦: ${guide.focus}`,
      '',
      '## 上下文',
      `- 类型: ${guide.context.novelGenre}`,
      `- 进度: 第 ${guide.context.currentChapter}/${guide.context.totalChapters} 章`,
      '',
      '## 近期反馈',
      ...guide.context.recentFeedback.map(f => `- ${f}`),
      '',
      '## 指导建议',
      ...guide.guidelines,
      '',
      '## 约束条件',
      ...guide.constraints.map(c => `- ${c}`),
      '',
      `## 输出格式: ${guide.outputFormat}`,
    ];

    return parts.join('\n');
  }
}
```

---

### 5. POC验证阶段 (Day 15-21)

#### 5.1 POC目标与范围

**验证目标**:
- 验证NEF引擎核心算法的有效性
- 验证洞察提取的准确性
- 验证进化策略的合理性
- 验证系统性能和稳定性

**POC范围**:
- 选择10-20个测试小说样本
- 模拟100-200条评审反馈
- 执行完整进化流程3-5轮
- 人工评估进化效果

#### 5.2 POC测试方案

```typescript
// packages/nef-core/test/poc/poc-runner.ts

export interface POCTestCase {
  id: string;
  novelId: string;
  initialArchive: CreationArchive;
  feedbackSequence: RawFeedback[];
  expectedOutcomes: {
    patternEvolution: boolean;
    insightAccuracy: number;
    guideQuality: number;
  };
}

export class POCRunner {
  private testCases: POCTestCase[] = [];
  private results: POCTestResult[] = [];

  /**
   * 加载测试用例
   */
  loadTestCases(cases: POCTestCase[]): void {
    this.testCases = cases;
  }

  /**
   * 执行POC测试
   */
  async runPOC(): Promise<POCReport> {
    for (const testCase of this.testCases) {
      console.log(`Running test case: ${testCase.id}`);
      
      const result = await this.runSingleTest(testCase);
      this.results.push(result);
    }

    return this.generateReport();
  }

  private async runSingleTest(testCase: POCTestCase): Promise<POCTestResult> {
    const extractor = new InsightExtractor();
    const executor = new EvolutionExecutor();
    const generator = new GuideGenerator();

    const allInsights: CreationInsight[] = [];

    // 模拟逐步接收反馈并进化
    for (let i = 0; i < testCase.feedbackSequence.length; i++) {
      const feedback = testCase.feedbackSequence[i];
      
      // 提取洞察
      const insights = extractor.extract(feedback);
      allInsights.push(...insights);

      // 每10条反馈触发一次进化
      if ((i + 1) % 10 === 0) {
        const decision = this.evaluateEvolutionTrigger(allInsights);
        
        if (decision.shouldEvolve) {
          await executor.execute(
            testCase.novelId,
            allInsights,
            decision.suggestedStrategy
          );
        }
      }
    }

    // 生成最终指导
    const guide = generator.generatePlotGuide(
      [],
      allInsights,
      {
        novelGenre: 'fantasy',
        currentChapter: 10,
        totalChapters: 50,
        recentFeedback: [],
        currentMetrics: { plot: 7, character: 6, rhythm: 7, style: 8 },
      }
    );

    return {
      testCaseId: testCase.id,
      insightsExtracted: allInsights.length,
      evolutionRounds: Math.floor(testCase.feedbackSequence.length / 10),
      guideQuality: this.assessGuideQuality(guide),
      executionTime: 0,
      success: true,
    };
  }

  private evaluateEvolutionTrigger(insights: CreationInsight[]): EvolutionDecision {
    const trigger = new EvolutionTrigger();
    return trigger.evaluate({
      clawId: 'test',
      novelId: 'test',
      insightCount: insights.length,
      insightQuality: insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length,
      timeSinceLastEvolution: 25 * 60 * 60 * 1000,
      currentArchiveVersion: '1.0.0',
    });
  }

  private assessGuideQuality(guide: CreationGuide): number {
    // 人工评估模拟
    let score = 0;
    if (guide.guidelines.length >= 5) score += 0.3;
    if (guide.referencePatterns.length >= 2) score += 0.3;
    if (guide.issues.length > 0) score += 0.2;
    if (guide.constraints.length >= 3) score += 0.2;
    return score;
  }

  private generateReport(): POCReport {
    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const avgInsights = this.results.reduce((sum, r) => sum + r.insightsExtracted, 0) / totalTests;
    const avgQuality = this.results.reduce((sum, r) => sum + r.guideQuality, 0) / totalTests;

    return {
      summary: {
        totalTests,
        successfulTests,
        successRate: successfulTests / totalTests,
        avgInsightsExtracted: avgInsights,
        avgGuideQuality: avgQuality,
      },
      details: this.results,
      recommendations: this.generateRecommendations(),
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    const avgQuality = this.results.reduce((sum, r) => sum + r.guideQuality, 0) / this.results.length;
    if (avgQuality < 0.7) {
      recommendations.push('指导质量需要提升，建议优化生成算法');
    }

    const avgInsights = this.results.reduce((sum, r) => sum + r.insightsExtracted, 0) / this.results.length;
    if (avgInsights < 20) {
      recommendations.push('洞察提取数量偏少，建议增加提取维度');
    }

    return recommendations;
  }
}

export interface POCTestResult {
  testCaseId: string;
  insightsExtracted: number;
  evolutionRounds: number;
  guideQuality: number;
  executionTime: number;
  success: boolean;
}

export interface POCReport {
  summary: {
    totalTests: number;
    successfulTests: number;
    successRate: number;
    avgInsightsExtracted: number;
    avgGuideQuality: number;
  };
  details: POCTestResult[];
  recommendations: string[];
}
```

#### 5.3 POC评估标准

| 评估维度 | 通过标准 | 权重 |
|----------|----------|------|
| 洞察提取准确率 | ≥ 80% | 25% |
| 进化成功率 | ≥ 90% | 25% |
| 指导质量评分 | ≥ 0.7 | 20% |
| 系统稳定性 | 无崩溃 | 15% |
| 性能指标达标 | 100% | 15% |

**通过标准**: 综合评分 ≥ 80%

---

### 6. 生产部署方案 (Day 22-28)

#### 6.1 架构部署

```yaml
# docker-compose.nef.yml
version: '3.8'

services:
  nef-control-plane:
    build:
      context: ./apps/nef-control-plane
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - PYTHON_SERVICE_URL=http://nef-compute-plane:8000
    ports:
      - "3002:3000"
    depends_on:
      - postgres
      - redis
      - nef-compute-plane
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1.0'
          memory: 1G

  nef-compute-plane:
    build:
      context: ./apps/nef-compute-plane
      dockerfile: Dockerfile
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - MODEL_CACHE_DIR=/app/cache
    volumes:
      - model_cache:/app/cache
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '2.0'
          memory: 4G

  nef-worker:
    build:
      context: ./apps/nef-worker
      dockerfile: Dockerfile
    environment:
      - REDIS_URL=${REDIS_URL}
      - CONTROL_PLANE_URL=http://nef-control-plane:3000
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

volumes:
  model_cache:
```

#### 6.2 监控与告警

```typescript
// apps/nef-control-plane/src/monitoring/metrics.service.ts
import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Gauge, register } from 'prom-client';

@Injectable()
export class NEFMetricsService {
  // 洞察提取指标
  private insightExtractionCounter = new Counter({
    name: 'nef_insight_extraction_total',
    help: 'Total number of insight extractions',
    labelNames: ['status'],
  });

  private insightExtractionDuration = new Histogram({
    name: 'nef_insight_extraction_duration_seconds',
    help: 'Duration of insight extraction in seconds',
    buckets: [0.1, 0.5, 1, 2, 5],
  });

  // 进化执行指标
  private evolutionCounter = new Counter({
    name: 'nef_evolution_total',
    help: 'Total number of evolution executions',
    labelNames: ['strategy', 'status'],
  });

  private evolutionDuration = new Histogram({
    name: 'nef_evolution_duration_seconds',
    help: 'Duration of evolution execution in seconds',
    buckets: [1, 2, 5, 10, 30],
  });

  // 档案指标
  private archiveGauge = new Gauge({
    name: 'nef_archive_count',
    help: 'Number of creation archives',
  });

  private patternGauge = new Gauge({
    name: 'nef_pattern_count',
    help: 'Number of plot patterns',
    labelNames: ['archive_id'],
  });

  recordInsightExtraction(duration: number, success: boolean): void {
    this.insightExtractionCounter.inc({ status: success ? 'success' : 'failure' });
    this.insightExtractionDuration.observe(duration);
  }

  recordEvolution(strategy: string, duration: number, success: boolean): void {
    this.evolutionCounter.inc({ strategy, status: success ? 'success' : 'failure' });
    this.evolutionDuration.observe(duration);
  }

  updateArchiveCount(count: number): void {
    this.archiveGauge.set(count);
  }

  getMetrics(): string {
    return register.metrics();
  }
}
```

---

## 阶段 4 交付检查清单

### 核心功能
- [ ] 洞察提取引擎实现
- [ ] 情节模式管理系统
- [ ] 人物画像管理系统
- [ ] 文风配置管理系统
- [ ] 进化触发器
- [ ] 进化执行器
- [ ] 创作指导生成器
- [ ] 进化闭环服务
- [ ] 人工审核模式支持
- [ ] 档案共享机制

### POC验证
- [ ] POC测试用例设计（≥10个）
- [ ] POC测试数据准备
- [ ] POC执行与结果收集
- [ ] 洞察提取准确率评估
- [ ] 进化成功率评估
- [ ] 指导质量人工评估
- [ ] POC报告生成
- [ ] 改进建议实施

### 生产部署
- [ ] Docker镜像构建
- [ ] Kubernetes部署配置
- [ ] 监控指标配置
- [ ] 告警规则配置
- [ ] 性能基准测试
- [ ] 灾难恢复方案
- [ ] 运维文档编写

### NFR指标验证
- [ ] 洞察提取处理时间 < 500ms/条
- [ ] 进化执行时间 < 2s
- [ ] 指导生成响应时间 < 1s
- [ ] 进化成功率 ≥ 95%
- [ ] 洞察提取准确率 ≥ 85%
- [ ] 并发进化任务 ≥ 10个

### 文档与Demo
- [ ] 进化效果 Demo
- [ ] NEF协议文档
- [ ] API文档
- [ ] 运维手册

## 原创术语汇总

| 术语 | 含义 | 对应旧概念 |
|------|------|------------|
| Creation Archive | 创作档案 | Gene Library |
| PlotPattern | 情节模式 | PlotGene |
| CharacterProfile | 人物画像 | CharacterCapsule |
| WritingStyle | 文风配置 | StyleModule |
| CreationInsight | 创作洞察 | NEFSignal |
| Refinement | 精炼进化 | Incremental |
| Restructuring | 重构进化 | Major |
| Innovation | 创新进化 | Experimental |

## 下一步

进入 [07-阶段5-AI智能体集成.md](./07-阶段5-AI智能体集成.md)
