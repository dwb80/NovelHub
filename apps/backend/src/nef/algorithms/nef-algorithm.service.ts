import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * NEF (NovelHub Evolution Framework) 算法服务
 * 
 * 核心算法体系：
 * 1. 质量评分算法 (Quality Score Algorithm)
 * 2. 进化指数算法 (Evolution Index Algorithm)
 * 3. 反馈权重算法 (Feedback Weight Algorithm)
 * 4. 改进建议算法 (Suggestion Algorithm)
 */

export interface NefMetrics {
  qualityScore: number;        // 质量评分 (0-10)
  evolutionIndex: number;      // 进化指数 (0-100)
  feedbackScore: number;       // 反馈评分 (0-10)
  innovationScore: number;     // 创新评分 (0-10)
  consistencyScore: number;    // 一致性评分 (0-10)
}

export interface EvolutionFactors {
  chapterCount: number;        // 章节数量
  evolutionCount: number;      // 进化次数
  patternCount: number;        // 情节模式数量
  profileCount: number;        // 角色原型数量
  avgRating: number;           // 平均评分
  viewCount: number;           // 阅读次数
  reviewCount: number;         // 评审次数
  daysSinceCreation: number;   // 创建天数
}

@Injectable()
export class NefAlgorithmService {
  constructor(private prisma: PrismaService) {}

  /**
   * 计算完整的 NEF 指标
   */
  async calculateNefMetrics(clawId: string): Promise<NefMetrics> {
    const factors = await this.collectEvolutionFactors(clawId);
    
    return {
      qualityScore: this.calculateQualityScore(factors),
      evolutionIndex: this.calculateEvolutionIndex(factors),
      feedbackScore: this.calculateFeedbackScore(factors),
      innovationScore: this.calculateInnovationScore(factors),
      consistencyScore: this.calculateConsistencyScore(factors),
    };
  }

  /**
   * 收集进化因子数据
   */
  private async collectEvolutionFactors(clawId: string): Promise<EvolutionFactors> {
    const [
      novels,
      archive,
      evolutionHistory,
      reviews,
      claw,
    ] = await Promise.all([
      this.prisma.novel.findMany({
        where: { authorId: clawId },
        include: { chapters: true },
      }),
      this.prisma.creationArchive.findUnique({
        where: { clawId },
        include: {
          plotPatterns: true,
          characterProfiles: true,
        },
      }),
      this.prisma.evolutionHistory.findMany({
        where: {
          archive: { clawId },
        },
      }),
      this.prisma.review.findMany({
        where: { reviewerId: clawId },
      }),
      this.prisma.claw.findUnique({
        where: { id: clawId },
      }),
    ]);

    const chapterCount = novels.reduce((sum, n) => sum + n.chapters.length, 0);
    const totalRating = novels.reduce((sum, n) => sum + n.rating * n.ratingCount, 0);
    const totalRatingCount = novels.reduce((sum, n) => sum + n.ratingCount, 0);
    const avgRating = totalRatingCount > 0 ? totalRating / totalRatingCount : 0;
    const viewCount = novels.reduce((sum, n) => sum + n.viewCount, 0);

    const createdAt = claw?.createdAt || new Date();
    const daysSinceCreation = Math.max(1, Math.floor(
      (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    ));

    return {
      chapterCount,
      evolutionCount: evolutionHistory.length,
      patternCount: archive?.plotPatterns.length || 0,
      profileCount: archive?.characterProfiles.length || 0,
      avgRating,
      viewCount,
      reviewCount: reviews.length,
      daysSinceCreation,
    };
  }

  /**
   * 质量评分算法
   * 
   * 公式: QS = (AR × 0.4) + (EC × 0.2) + (RC × 0.2) + (VC × 0.2)
   * 
   * AR: 平均评分 (Average Rating) - 0-10
   * EC: 进化覆盖度 (Evolution Coverage) - 基于进化次数
   * RC: 评审覆盖率 (Review Coverage) - 基于评审参与度
   * VC: 读者验证 (Viewer Confirmation) - 基于阅读量
   */
  private calculateQualityScore(factors: EvolutionFactors): number {
    // 平均评分 (40%)
    const avgRatingScore = Math.min(10, factors.avgRating);

    // 进化覆盖度 (20%)
    // 每5个章节应该至少有1次进化
    const expectedEvolutions = Math.max(1, Math.floor(factors.chapterCount / 5));
    const evolutionCoverage = Math.min(1, factors.evolutionCount / expectedEvolutions);
    const evolutionScore = evolutionCoverage * 10;

    // 评审覆盖率 (20%)
    // 参与评审越多，质量意识越强
    const reviewScore = Math.min(10, factors.reviewCount / 10);

    // 读者验证 (20%)
    // 阅读量反映内容受欢迎程度
    const viewScore = Math.min(10, factors.viewCount / 100);

    const qualityScore = (
      avgRatingScore * 0.4 +
      evolutionScore * 0.2 +
      reviewScore * 0.2 +
      viewScore * 0.2
    );

    return Math.round(qualityScore * 10) / 10;
  }

  /**
   * 进化指数算法
   * 
   * 公式: EI = (E × 15) + (P × 10) + (C × 5) + (A × 2) + (D × 0.1)
   * 
   * E: 进化次数
   * P: 情节模式数
   * C: 角色原型数
   * A: 活跃度 (章节数 + 评审数)
   * D: 活跃天数
   */
  private calculateEvolutionIndex(factors: EvolutionFactors): number {
    const evolutionPoints = factors.evolutionCount * 15;
    const patternPoints = factors.patternCount * 10;
    const profilePoints = factors.profileCount * 5;
    const activityPoints = (factors.chapterCount + factors.reviewCount) * 2;
    const longevityPoints = Math.min(50, factors.daysSinceCreation * 0.1);

    const evolutionIndex = Math.min(100,
      evolutionPoints + patternPoints + profilePoints + activityPoints + longevityPoints
    );

    return Math.round(evolutionIndex);
  }

  /**
   * 反馈评分算法
   * 
   * 基于读者反馈和评审反馈的综合评分
   */
  private calculateFeedbackScore(factors: EvolutionFactors): number {
    // 基础分 5.0
    let score = 5.0;

    // 平均评分影响 (±3分)
    score += (factors.avgRating - 5) * 0.6;

    // 阅读量正向影响 (+2分)
    score += Math.min(2, factors.viewCount / 500);

    // 进化响应度 (+1分)
    if (factors.evolutionCount > 0) {
      score += Math.min(1, factors.evolutionCount / 10);
    }

    return Math.round(Math.max(0, Math.min(10, score)) * 10) / 10;
  }

  /**
   * 创新评分算法
   * 
   * 基于情节模式和角色原型的独特性
   */
  private calculateInnovationScore(factors: EvolutionFactors): number {
    // 基础创新分
    let score = 5.0;

    // 情节模式多样性 (+2分)
    const patternDiversity = Math.min(2, factors.patternCount / 5);
    score += patternDiversity;

    // 角色原型多样性 (+2分)
    const profileDiversity = Math.min(2, factors.profileCount / 3);
    score += profileDiversity;

    // 进化频率创新 (+1分)
    const evolutionRate = factors.chapterCount > 0 
      ? factors.evolutionCount / factors.chapterCount 
      : 0;
    score += Math.min(1, evolutionRate);

    return Math.round(Math.min(10, score) * 10) / 10;
  }

  /**
   * 一致性评分算法
   * 
   * 基于创作稳定性和持续性的评分
   */
  private calculateConsistencyScore(factors: EvolutionFactors): number {
    if (factors.daysSinceCreation < 1) return 5.0;

    // 日均章节产出
    const dailyOutput = factors.chapterCount / factors.daysSinceCreation;
    
    // 理想产出: 每3天1章
    const consistency = Math.min(1, dailyOutput / 0.33);

    // 基础分 + 一致性加分
    let score = 5.0 + consistency * 5;

    // 长期创作奖励
    if (factors.daysSinceCreation > 30) {
      score += 0.5;
    }
    if (factors.daysSinceCreation > 90) {
      score += 0.5;
    }

    return Math.round(Math.min(10, score) * 10) / 10;
  }

  /**
   * 生成改进建议
   */
  async generateSuggestions(clawId: string): Promise<string[]> {
    const factors = await this.collectEvolutionFactors(clawId);
    const suggestions: string[] = [];

    // 基于质量评分的建议
    if (factors.avgRating < 6) {
      suggestions.push('建议增加章节评审次数，提升内容质量');
    }

    // 基于进化指数的建议
    if (factors.evolutionCount < 3) {
      suggestions.push('尝试使用NEF进化引擎优化更多章节');
    }

    // 基于情节模式的建议
    if (factors.patternCount < 3) {
      suggestions.push('创建更多情节模式，丰富故事结构');
    }

    // 基于角色原型的建议
    if (factors.profileCount < 2) {
      suggestions.push('定义角色原型，提升人物刻画深度');
    }

    // 基于阅读量的建议
    if (factors.viewCount < 100) {
      suggestions.push('增加作品曝光，吸引更多读者');
    }

    // 基于活跃度的建议
    if (factors.chapterCount < 5) {
      suggestions.push('保持创作节奏，定期发布新章节');
    }

    return suggestions.length > 0 ? suggestions : ['继续保持良好的创作状态！'];
  }

  /**
   * 计算平台整体统计
   */
  async calculatePlatformStats(): Promise<{
    totalEvolutions: number;
    avgQualityScore: number;
    avgEvolutionIndex: number;
    totalFeedbackCount: number;
    pendingSuggestions: number;
  }> {
    const [
      totalEvolutions,
      allClaws,
    ] = await Promise.all([
      this.prisma.evolutionHistory.count(),
      this.prisma.claw.findMany({
        where: { isActive: true },
      }),
    ]);

    let totalQualityScore = 0;
    let totalEvolutionIndex = 0;
    let validClawCount = 0;

    for (const claw of allClaws) {
      try {
        const metrics = await this.calculateNefMetrics(claw.id);
        totalQualityScore += metrics.qualityScore;
        totalEvolutionIndex += metrics.evolutionIndex;
        validClawCount++;
      } catch (e) {
        // 跳过计算失败的Claw
      }
    }

    const avgQualityScore = validClawCount > 0 
      ? Math.round((totalQualityScore / validClawCount) * 10) / 10 
      : 7.5;
    
    const avgEvolutionIndex = validClawCount > 0 
      ? Math.round(totalEvolutionIndex / validClawCount) 
      : 50;

    // 估算反馈数: 每次进化平均产生3-5条反馈
    const totalFeedbackCount = totalEvolutions * 4;

    // 待处理建议: 基于活跃Claw数量估算
    const pendingSuggestions = Math.max(0, allClaws.length * 2 - totalEvolutions);

    return {
      totalEvolutions,
      avgQualityScore,
      avgEvolutionIndex,
      totalFeedbackCount,
      pendingSuggestions,
    };
  }
}
